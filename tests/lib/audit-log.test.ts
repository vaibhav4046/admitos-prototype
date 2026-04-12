/**
 * tests/lib/audit-log.test.ts
 *
 * Locks the discipline around `logAuditEvent` and `auditedMutation`:
 *
 *   1. The row inserted into `audit_event` is shaped exactly the way
 *      the DB expects, with correct null handling for the three actor
 *      kinds (user / system / service).
 *   2. A Supabase error is surfaced as a thrown `audit_write_failed: ...`
 *      and mirrored to Sentry via captureError (so a rolled-back request
 *      still leaves a breadcrumb).
 *   3. `auditedMutation` runs the mutate function, writes the audit row,
 *      and returns the result in the happy path.
 *   4. If the audit write fails AND a rollback was provided, rollback is
 *      called with the mutation result and the audit error is rethrown.
 *   5. If the audit write fails AND rollback ALSO fails, the rollback
 *      failure is captured to Sentry with `stage: "rollback_failed"` and
 *      the ORIGINAL audit error is still the one that bubbles out.
 *   6. If the audit write fails and no rollback was provided, the audit
 *      error still bubbles out (the caller is now on the hook to reconcile).
 *
 * The Supabase client and observability layer are both mocked at the
 * module level so nothing actually hits the network.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

import { AUDIT_ACTION } from "@/services/audit";

// ---- mocks ----------------------------------------------------------------

const insertMock = vi.fn();
const fromMock = vi.fn().mockImplementation((_table: string) => ({
  insert: insertMock,
}));
const serviceClientMock = vi.fn().mockImplementation((_ns: string) => ({
  from: fromMock,
}));

vi.mock("@/db/supabase", () => ({
  serviceClient: (ns: string) => serviceClientMock(ns),
}));

const captureErrorMock = vi.fn();
vi.mock("@/lib/observability", () => ({
  captureError: (...args: unknown[]) => captureErrorMock(...args),
  addBreadcrumb: vi.fn(),
}));

// Import AFTER mocks are registered.
import { auditedMutation, logAuditEvent } from "@/services/audit/log";

const REQ_ID = "req_0123456789abcdef";

/**
 * Helper to satisfy `auditedMutation`'s
 * `(() => Promise<T>) & { rollback?: (result: T) => Promise<void> }`
 * intersection without vitest's Mock type confusing TypeScript.
 */
type MutateFn<T> = (() => Promise<T>) & {
  rollback?: (result: T) => Promise<void>;
};
const asMutate = <T>(fn: unknown): MutateFn<T> => fn as MutateFn<T>;

beforeEach(() => {
  insertMock.mockReset();
  fromMock.mockClear();
  serviceClientMock.mockClear();
  captureErrorMock.mockReset();
  // Default: Supabase insert succeeds
  insertMock.mockResolvedValue({ error: null });
});

describe("logAuditEvent", () => {
  it("maps a user actor to the correct row shape", async () => {
    await logAuditEvent({
      namespace: "admissions",
      actor: { kind: "user", userId: "user_123", role: "student" },
      action: AUDIT_ACTION.CEF_SUBMISSION_COMPLETED,
      summary: "CEF submission completed",
      target: { type: "cef_submission", id: "sub_abc" },
      requestId: REQ_ID,
      data: { step: "final" },
    });

    expect(serviceClientMock).toHaveBeenCalledWith("admissions");
    expect(fromMock).toHaveBeenCalledWith("audit_event");
    expect(insertMock).toHaveBeenCalledTimes(1);

    const row = insertMock.mock.calls[0]![0];
    expect(row).toEqual({
      namespace: "admissions",
      actor_kind: "user",
      actor_user_id: "user_123",
      actor_role: "student",
      actor_system_name: null,
      actor_service: null,
      action: "cef.submission_completed",
      summary: "CEF submission completed",
      target_type: "cef_submission",
      target_id: "sub_abc",
      request_id: REQ_ID,
      data: { step: "final" },
    });
  });

  it("maps a system actor with actor_user_id = null", async () => {
    await logAuditEvent({
      namespace: "admissions",
      actor: { kind: "system", systemName: "essay-worker" },
      action: AUDIT_ACTION.ESSAY_FEEDBACK_QUEUED,
      requestId: REQ_ID,
    });

    const row = insertMock.mock.calls[0]![0];
    expect(row.actor_kind).toBe("system");
    expect(row.actor_user_id).toBeNull();
    expect(row.actor_role).toBeNull();
    expect(row.actor_system_name).toBe("essay-worker");
    expect(row.actor_service).toBeNull();
    // Unspecified optionals collapse to null / empty-object defaults.
    expect(row.summary).toBeNull();
    expect(row.target_type).toBeNull();
    expect(row.target_id).toBeNull();
    expect(row.data).toEqual({});
  });

  it("maps a service actor to actor_service", async () => {
    await logAuditEvent({
      namespace: "commons_db",
      actor: { kind: "service", service: "stripe" },
      action: "billing.invoice_paid",
      requestId: REQ_ID,
    });

    const row = insertMock.mock.calls[0]![0];
    expect(row.actor_kind).toBe("service");
    expect(row.actor_service).toBe("stripe");
    expect(row.actor_user_id).toBeNull();
    expect(row.actor_role).toBeNull();
    expect(row.actor_system_name).toBeNull();
  });

  it("routes wellbeing events to the wellbeing service client", async () => {
    await logAuditEvent({
      namespace: "wellbeing",
      actor: { kind: "user", userId: "user_1", role: "student" },
      action: AUDIT_ACTION.ADIE_MESSAGE_SENT,
      // Deliberately NO body — only the length — to preserve isolation.
      data: { messageLength: 142 },
      requestId: REQ_ID,
    });

    expect(serviceClientMock).toHaveBeenCalledWith("wellbeing");
    const row = insertMock.mock.calls[0]![0];
    expect(row.namespace).toBe("wellbeing");
    // The row must not carry anything resembling a message body.
    const serialised = JSON.stringify(row);
    expect(serialised).not.toMatch(/body/i);
    expect(serialised).not.toMatch(/content/i);
  });

  it("throws audit_write_failed and captures the error when Supabase rejects", async () => {
    insertMock.mockResolvedValue({
      error: { message: "permission denied for relation audit_event" },
    });

    await expect(
      logAuditEvent({
        namespace: "admissions",
        actor: { kind: "user", userId: "user_123", role: "student" },
        action: AUDIT_ACTION.CEF_SUBMISSION_COMPLETED,
        requestId: REQ_ID,
      })
    ).rejects.toThrow(/audit_write_failed: permission denied/);

    expect(captureErrorMock).toHaveBeenCalledTimes(1);
    const [, ctx] = captureErrorMock.mock.calls[0]!;
    expect(ctx).toMatchObject({
      namespace: "admissions",
      requestId: REQ_ID,
    });
    // The captured extra must include the row we tried to insert, so an
    // operator can replay or reconcile after the fact.
    expect(ctx.extra).toHaveProperty("audit_row");
  });
});

describe("auditedMutation", () => {
  it("runs the mutate function, writes the audit row, and returns the result", async () => {
    const mutateFn = vi.fn().mockResolvedValue({ submissionId: "sub_abc" });
    const mutate = asMutate<{ submissionId: string }>(mutateFn);

    const result = await auditedMutation(
      {
        namespace: "admissions",
        actor: { kind: "user", userId: "user_123", role: "student" },
        action: AUDIT_ACTION.CEF_SUBMISSION_COMPLETED,
        target: { type: "cef_submission", id: "sub_abc" },
        requestId: REQ_ID,
      },
      mutate
    );

    expect(mutateFn).toHaveBeenCalledTimes(1);
    expect(insertMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ submissionId: "sub_abc" });
  });

  it("calls rollback with the mutation result when the audit write fails", async () => {
    insertMock.mockResolvedValue({
      error: { message: "primary key violation" },
    });

    const rollback = vi.fn().mockResolvedValue(undefined);
    const mutate = asMutate<{ submissionId: string }>(
      Object.assign(
        vi.fn().mockResolvedValue({ submissionId: "sub_abc" }),
        { rollback }
      )
    );

    await expect(
      auditedMutation(
        {
          namespace: "admissions",
          actor: { kind: "user", userId: "user_123", role: "student" },
          action: AUDIT_ACTION.CEF_SUBMISSION_COMPLETED,
          requestId: REQ_ID,
        },
        mutate
      )
    ).rejects.toThrow(/audit_write_failed: primary key violation/);

    expect(rollback).toHaveBeenCalledWith({ submissionId: "sub_abc" });
  });

  it("still rethrows the original audit error if the rollback also fails", async () => {
    insertMock.mockResolvedValue({
      error: { message: "timeout" },
    });

    const rollback = vi.fn().mockRejectedValue(new Error("rollback_boom"));
    const mutate = asMutate<{ essayId: string }>(
      Object.assign(
        vi.fn().mockResolvedValue({ essayId: "draft_1" }),
        { rollback }
      )
    );

    await expect(
      auditedMutation(
        {
          namespace: "admissions",
          actor: { kind: "user", userId: "user_1", role: "student" },
          action: AUDIT_ACTION.ESSAY_UPLOADED,
          requestId: REQ_ID,
        },
        mutate
      )
    ).rejects.toThrow(/audit_write_failed: timeout/);

    // captureError called twice:
    //   1. from inside logAuditEvent (supabase error)
    //   2. from auditedMutation when the rollback throws
    expect(captureErrorMock).toHaveBeenCalledTimes(2);
    const rollbackCall = captureErrorMock.mock.calls[1]!;
    expect(rollbackCall[1]).toMatchObject({
      namespace: "admissions",
      requestId: REQ_ID,
      extra: expect.objectContaining({
        stage: "rollback_failed",
        original_audit_error: expect.stringMatching(/audit_write_failed: timeout/),
      }),
    });
  });

  it("bubbles the audit error when no rollback is provided", async () => {
    insertMock.mockResolvedValue({
      error: { message: "bad request" },
    });

    const mutate = asMutate<{ ok: true }>(
      vi.fn().mockResolvedValue({ ok: true })
    );

    await expect(
      auditedMutation(
        {
          namespace: "admissions",
          actor: { kind: "system", systemName: "cron" },
          action: AUDIT_ACTION.ARE_COMPUTED,
          requestId: REQ_ID,
        },
        mutate
      )
    ).rejects.toThrow(/audit_write_failed: bad request/);
  });

  it("does NOT call mutate again if the audit succeeded", async () => {
    const mutateFn = vi.fn().mockResolvedValue("ok");
    const mutate = asMutate<string>(mutateFn);
    await auditedMutation(
      {
        namespace: "commons_db",
        actor: { kind: "service", service: "admin-cli" },
        action: AUDIT_ACTION.DSAR_EXPORT_REQUESTED,
        requestId: REQ_ID,
      },
      mutate
    );
    expect(mutateFn).toHaveBeenCalledTimes(1);
  });
});
