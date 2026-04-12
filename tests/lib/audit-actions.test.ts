/**
 * tests/lib/audit-actions.test.ts
 *
 * The AUDIT_ACTION registry is one of the few enums in the codebase
 * that the database FK depends on (the `audit_event.action` column
 * has a CHECK constraint that mirrors this list once the migration
 * lands). The test below pins:
 *
 *   - Every value uses the dotted lower-snake convention
 *   - Every value is unique (no two keys collide on the same string)
 *   - The required Auth + CEF + ESSAY + ADIE + DSAR keys exist
 *
 * If a future PR drops or renames a key, this fails before merge,
 * which is the cheapest place to catch it.
 */

import { describe, expect, it } from "vitest";

import { AUDIT_ACTION } from "@/services/audit";

describe("AUDIT_ACTION", () => {
  const entries = Object.entries(AUDIT_ACTION);

  it("uses dotted lower-snake values", () => {
    for (const [key, value] of entries) {
      expect(value, `${key} value`).toMatch(/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/);
    }
  });

  it("has unique values across all keys", () => {
    const values = entries.map(([, v]) => v);
    expect(new Set(values).size).toBe(values.length);
  });

  it("includes the required Auth keys", () => {
    expect(AUDIT_ACTION.AUTH_SIGNED_UP).toBe("auth.signed_up");
    expect(AUDIT_ACTION.AUTH_SIGNED_IN).toBe("auth.signed_in");
    expect(AUDIT_ACTION.AUTH_SIGNED_OUT).toBe("auth.signed_out");
  });

  it("includes the CEF lifecycle keys", () => {
    expect(AUDIT_ACTION.CEF_SUBMISSION_STARTED).toBe("cef.submission_started");
    expect(AUDIT_ACTION.CEF_STEP_SAVED).toBe("cef.step_saved");
    expect(AUDIT_ACTION.CEF_SUBMISSION_COMPLETED).toBe("cef.submission_completed");
  });

  it("includes the ESSAY lifecycle keys", () => {
    expect(AUDIT_ACTION.ESSAY_UPLOADED).toBe("essay.uploaded");
    expect(AUDIT_ACTION.ESSAY_FEEDBACK_QUEUED).toBe("essay.feedback_queued");
  });

  it("includes the wellbeing-namespaced keys", () => {
    expect(AUDIT_ACTION.ADIE_CONVERSATION_STARTED).toBe("adie.conversation_started");
    expect(AUDIT_ACTION.ADIE_MESSAGE_SENT).toBe("adie.message_sent");
    expect(AUDIT_ACTION.ADIE_CRISIS_FLAG_RAISED).toBe("adie.crisis_flag_raised");
  });

  it("includes the GDPR DSAR keys", () => {
    expect(AUDIT_ACTION.DSAR_EXPORT_REQUESTED).toBe("dsar.export_requested");
    expect(AUDIT_ACTION.DSAR_DELETE_REQUESTED).toBe("dsar.delete_requested");
  });
});
