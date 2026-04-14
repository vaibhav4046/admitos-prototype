/**
 * AuditEvent — the canonical record of every mutating action on the
 * UniOffer platform.
 *
 * Non-negotiable rules from Thread 4:
 *
 *   1. The `audit_event` table has NO update RLS. NO delete RLS.
 *      Append-only forever. A Postgres policy enforces this at the
 *      database layer; the helper in `src/services/audit/log.ts` enforces
 *      it at the application layer.
 *
 *   2. Every mutating API request MUST write an AuditEvent row
 *      atomically BEFORE the request returns its response. If the
 *      audit write fails, the entire request rolls back.
 *
 *   3. AuditEvents for wellbeing-schema actions live in the wellbeing
 *      schema's own audit_event table, NOT the admissions one. This
 *      preserves the physical isolation requirement.
 */

/** Actor that caused the audited action. */
export type AuditActor =
  | { kind: "user"; userId: string; role: UserRole }
  | { kind: "system"; systemName: string } // e.g. worker, cron
  | { kind: "service"; service: "supabase-edge" | "stripe" | "admin-cli" };

export type UserRole = "student" | "parent" | "counsellor" | "admin";

/** Namespace the audit event belongs to. Drives which table it's written to. */
export type AuditNamespace = "admissions" | "wellbeing" | "commons_db";

/** The shape of an AuditEvent row ready for insert. */
export interface AuditEventInput {
  namespace: AuditNamespace;
  actor: AuditActor;
  action: string;
  /** Optional: human-readable summary of what changed. */
  summary?: string;
  /** Optional: the resource type and id that was touched. */
  target?: { type: string; id: string };
  /** Optional: request id from middleware. Lets us correlate audit <-> trace. */
  requestId?: string;
  /** Arbitrary structured payload — will be stored as jsonb. Never PII-heavy. */
  data?: Record<string, unknown>;
}

/** The stable registry of action names. Keep sorted; additions are append-only. */
export const AUDIT_ACTION = {
  // Auth
  AUTH_SIGNED_UP: "auth.signed_up",
  AUTH_SIGNED_IN: "auth.signed_in",
  AUTH_SIGNED_OUT: "auth.signed_out",
  AUTH_ROLE_ASSIGNED: "auth.role_assigned",
  AUTH_GUARDIAN_VERIFIED: "auth.guardian_verified",

  // CEF wizard
  CEF_SUBMISSION_STARTED: "cef.submission_started",
  CEF_STEP_SAVED: "cef.step_saved",
  CEF_SUBMISSION_COMPLETED: "cef.submission_completed",

  // ARE / School Readiness
  ARE_COMPUTED: "are.computed",
  SCHOOL_READINESS_COMPUTED: "school_readiness.computed",

  // Essay (A5)
  ESSAY_UPLOADED: "essay.uploaded",
  ESSAY_FEEDBACK_QUEUED: "essay.feedback_queued",
  ESSAY_FEEDBACK_COUNSELLOR_APPROVED: "essay.feedback_counsellor_approved",
  ESSAY_FEEDBACK_COUNSELLOR_REJECTED: "essay.feedback_counsellor_rejected",

  // Wellbeing (Adie)
  ADIE_CONVERSATION_STARTED: "adie.conversation_started",
  ADIE_MESSAGE_SENT: "adie.message_sent",
  ADIE_CRISIS_FLAG_RAISED: "adie.crisis_flag_raised",

  // Consent / GDPR
  CONSENT_GRANTED: "consent.granted",
  CONSENT_WITHDRAWN: "consent.withdrawn",
  DSAR_EXPORT_REQUESTED: "dsar.export_requested",
  DSAR_DELETE_REQUESTED: "dsar.delete_requested",
} as const;

export type AuditAction = (typeof AUDIT_ACTION)[keyof typeof AUDIT_ACTION];
