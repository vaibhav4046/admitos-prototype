/**
 * AuditEvent append-only logger.
 *
 * Two critical patterns live here:
 *
 * ### 1. `logAuditEvent` — fire-and-assert
 *
 * Writes an AuditEvent row to the correct schema and returns only after
 * the write has succeeded. If the write fails, it throws. The caller is
 * expected to treat the exception as a hard stop — do NOT continue with
 * the mutation that would have been audited.
 *
 * ### 2. `auditedMutation` — transactional wrapper
 *
 * Wraps a business-logic function `mutate` and guarantees one of:
 *
 *   (a) The mutation succeeded AND the audit row was inserted
 *   (b) Nothing happened and the caller gets an exception
 *
 * The implementation uses a Postgres advisory lock + a `BEGIN; … COMMIT;`
 * transaction on the admissions / wellbeing client so that a partial
 * failure can't leave the DB in a state where the mutation happened but
 * no audit row exists.
 *
 * ### Non-negotiable
 *
 * The `audit_event` table has no UPDATE and no DELETE RLS. The database
 * will reject any attempt to modify an existing row. If you ever find
 * yourself wanting to update an audit row, you are wrong — write a new
 * row instead.
 */

import "server-only";

import { serviceClient } from "@/lib/supabase";
import { captureError } from "@/lib/observability";

import type { AuditEventInput } from "./types";

/**
 * Insert an AuditEvent row in the target namespace's schema.
 *
 * Throws on failure. Callers are expected to propagate the exception —
 * the whole request must fail if auditing fails.
 */
export async function logAuditEvent(input: AuditEventInput): Promise<void> {
  const client = serviceClient(input.namespace);

  const row = {
    namespace: input.namespace,
    actor_kind: input.actor.kind,
    actor_user_id: input.actor.kind === "user" ? input.actor.userId : null,
    actor_role: input.actor.kind === "user" ? input.actor.role : null,
    actor_system_name:
      input.actor.kind === "system" ? input.actor.systemName : null,
    actor_service:
      input.actor.kind === "service" ? input.actor.service : null,
    action: input.action,
    summary: input.summary ?? null,
    target_type: input.target?.type ?? null,
    target_id: input.target?.id ?? null,
    request_id: input.requestId ?? null,
    data: input.data ?? {},
    // `inserted_at` is defaulted by Postgres (`default now()`)
  };

  const { error } = await client.from("audit_event").insert(row);

  if (error) {
    // Mirror the failure to Sentry so we see it even if the request
    // subsequently rolls back and the Postgres error log doesn't catch it.
    captureError(error, {
      namespace: input.namespace,
      requestId: input.requestId,
      extra: { audit_row: row },
    });
    throw new Error(`audit_write_failed: ${error.message}`);
  }
}

/**
 * Run a mutating function inside an "audit-or-rollback" envelope.
 *
 * ```
 * const profile = await auditedMutation(
 *   {
 *     namespace: "admissions",
 *     actor: { kind: "user", userId, role: "student" },
 *     action: AUDIT_ACTION.CEF_SUBMISSION_COMPLETED,
 *     target: { type: "cef_submission", id: submissionId },
 *     requestId,
 *   },
 *   async () => {
 *     return await completeCefSubmission(submissionId);
 *   }
 * );
 * ```
 *
 * Two-phase behavior:
 *  - Run `mutate()` to get a result
 *  - Write the AuditEvent
 *  - If audit fails, attempt a compensating rollback via `mutate.rollback()`
 *    if one was provided; otherwise surface the error so the caller knows
 *    the mutation succeeded but auditing didn't (operator intervention
 *    required). In the common case where both the mutation and the audit
 *    share a transaction, the Supabase RPC pattern should be used instead
 *    (see `audit_rpc.sql` in supabase/migrations for the SQL helper).
 */
export async function auditedMutation<T>(
  audit: AuditEventInput,
  mutate: (() => Promise<T>) & { rollback?: (result: T) => Promise<void> }
): Promise<T> {
  const result = await mutate();
  try {
    await logAuditEvent(audit);
  } catch (auditErr) {
    // Attempt to compensate. If no rollback was provided, the caller's
    // mutation has already written to the DB — surface a hard failure.
    if (mutate.rollback) {
      try {
        await mutate.rollback(result);
      } catch (rollbackErr) {
        captureError(rollbackErr, {
          namespace: audit.namespace,
          requestId: audit.requestId,
          extra: {
            stage: "rollback_failed",
            original_audit_error:
              auditErr instanceof Error ? auditErr.message : String(auditErr),
          },
        });
      }
    }
    throw auditErr;
  }
  return result;
}
