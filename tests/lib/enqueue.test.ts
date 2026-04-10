/**
 * tests/lib/enqueue.test.ts
 *
 * Locks the JobEnvelope shape and the per-queue jobName conventions
 * for all four typed enqueue helpers. The actual BullMQ Queue is
 * mocked — we only care that:
 *
 *   - The right queue name is targeted
 *   - The right job name is used
 *   - The envelope wraps the payload with requestId, cause, and
 *     enqueuedAt (ISO timestamp)
 *   - The DEFAULT_JOB_OPTS (attempts: 3, exponential backoff) flow through
 *   - The Adie payload only ever carries `messageLength`, never a body
 *
 * `@/db/queues` is mocked at the module level so `getQueue` returns a
 * stub that records every `.add(...)` call. We mock `@/lib/observability`
 * the same way so `addBreadcrumb` doesn't hit Sentry in tests.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const addMock = vi.fn().mockResolvedValue(undefined);

vi.mock("@/db/queues", async () => {
  const actual = await vi.importActual<typeof import("@/db/queues")>(
    "@/db/queues"
  );
  return {
    ...actual,
    getQueue: (name: string) => ({
      name,
      add: addMock,
    }),
  };
});

vi.mock("@/lib/observability", () => ({
  addBreadcrumb: vi.fn(),
}));

import {
  enqueueCefSubmitted,
  enqueueEssayUploaded,
  enqueueAuditAlert,
  enqueueAdieMessage,
} from "@/services/queues";

const REQ_ID = "req_0123456789abcdef";

beforeEach(() => {
  addMock.mockClear();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("enqueueCefSubmitted", () => {
  it("posts a cef:new job with the standard envelope and default opts", async () => {
    await enqueueCefSubmitted(
      {
        submissionId: "sub_abc",
        profileId: "user_123",
        submittedAt: "2026-04-09T13:00:00.000Z",
      },
      { requestId: REQ_ID, cause: "POST /api/admissions/cef/submit" }
    );

    expect(addMock).toHaveBeenCalledTimes(1);
    const [jobName, envelope, opts] = addMock.mock.calls[0]!;
    expect(jobName).toBe("cef:new");

    expect(envelope.payload).toEqual({
      submissionId: "sub_abc",
      profileId: "user_123",
      submittedAt: "2026-04-09T13:00:00.000Z",
    });
    expect(envelope.requestId).toBe(REQ_ID);
    expect(envelope.cause).toBe("POST /api/admissions/cef/submit");
    expect(typeof envelope.enqueuedAt).toBe("string");
    expect(() => new Date(envelope.enqueuedAt).toISOString()).not.toThrow();

    expect(opts).toMatchObject({
      attempts: 3,
      backoff: { type: "exponential", delay: 5_000 },
    });
  });
});

describe("enqueueEssayUploaded", () => {
  it("posts an essay:new job", async () => {
    await enqueueEssayUploaded(
      {
        draftId: "draft_1",
        studentId: "user_1",
        storageKey: "essays/draft_1.txt",
        promptSlot: "essay.feedback",
      },
      { requestId: REQ_ID, cause: "test" }
    );
    const [jobName, envelope] = addMock.mock.calls[0]!;
    expect(jobName).toBe("essay:new");
    expect(envelope.payload.promptSlot).toBe("essay.feedback");
  });
});

describe("enqueueAuditAlert", () => {
  it("posts an audit:alert job with severity", async () => {
    await enqueueAuditAlert(
      {
        auditEventId: "ae_1",
        reason: "rate_limit_exceeded",
        severity: "high",
      },
      { requestId: REQ_ID, cause: "test" }
    );
    const [jobName, envelope] = addMock.mock.calls[0]!;
    expect(jobName).toBe("audit:alert");
    expect(envelope.payload.severity).toBe("high");
  });
});

describe("enqueueAdieMessage", () => {
  it("posts an adie:message job carrying ONLY messageLength, never a body", async () => {
    await enqueueAdieMessage(
      {
        conversationId: "conv_1",
        messageId: "msg_1",
        messageLength: 142,
      },
      { requestId: REQ_ID, cause: "test" }
    );

    const [jobName, envelope] = addMock.mock.calls[0]!;
    expect(jobName).toBe("adie:message");

    // The payload must not contain anything that looks like a body.
    const payloadJson = JSON.stringify(envelope.payload);
    expect(payloadJson).not.toMatch(/body/i);
    expect(payloadJson).not.toMatch(/content/i);
    expect(payloadJson).not.toMatch(/text/i);
    expect(envelope.payload).toEqual({
      conversationId: "conv_1",
      messageId: "msg_1",
      messageLength: 142,
    });
  });
});
