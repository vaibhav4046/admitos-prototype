/**
 * tests/lib/queue-are-extraction.test.ts
 *
 * Tests for the new ARE computation and extraction queues:
 *   - Queue name registration
 *   - Schema mapping
 *   - Enqueue helpers produce correct job envelopes
 *   - ARE computation handler label classification
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// ── Queue name + schema tests (no mocks needed) ─────────────────────────

import {
  QUEUE,
  ALL_QUEUE_NAMES,
  QUEUE_SCHEMA,
} from "@/db/queues";

describe("QUEUE registry — new queues", () => {
  it("includes ARE_COMPUTATION and EXTRACTION", () => {
    expect(QUEUE.ARE_COMPUTATION).toBe("are_computation");
    expect(QUEUE.EXTRACTION).toBe("extraction");
  });

  it("ALL_QUEUE_NAMES includes the new queues", () => {
    expect(ALL_QUEUE_NAMES).toContain("are_computation");
    expect(ALL_QUEUE_NAMES).toContain("extraction");
  });

  it("new queues map to admissions schema", () => {
    expect(QUEUE_SCHEMA[QUEUE.ARE_COMPUTATION]).toBe("admissions");
    expect(QUEUE_SCHEMA[QUEUE.EXTRACTION]).toBe("admissions");
  });

  it("total queue count is now 6", () => {
    expect(ALL_QUEUE_NAMES).toHaveLength(6);
  });

  it("no duplicate queue names", () => {
    const unique = new Set(ALL_QUEUE_NAMES);
    expect(unique.size).toBe(ALL_QUEUE_NAMES.length);
  });

  it("every queue has a schema mapping", () => {
    for (const q of ALL_QUEUE_NAMES) {
      expect(QUEUE_SCHEMA[q]).toBeDefined();
      expect(["admissions", "wellbeing"]).toContain(QUEUE_SCHEMA[q]);
    }
  });
});

// ── Enqueue helper tests ────────────────────────────────────────────────

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
  enqueueAreComputation,
  enqueueExtraction,
} from "@/services/queues";

const REQ_ID = "req_0123456789abcdef";

beforeEach(() => {
  addMock.mockClear();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("enqueueAreComputation", () => {
  it("posts an are:compute job with correct envelope", async () => {
    await enqueueAreComputation(
      {
        userId: "user_1",
        schoolSlug: "harvard",
        cefVersion: 1,
      },
      { requestId: REQ_ID, cause: "test" }
    );

    expect(addMock).toHaveBeenCalledTimes(1);
    const [jobName, envelope, opts] = addMock.mock.calls[0]!;
    expect(jobName).toBe("are:compute");
    expect(envelope.payload).toEqual({
      userId: "user_1",
      schoolSlug: "harvard",
      cefVersion: 1,
    });
    expect(envelope.requestId).toBe(REQ_ID);
    expect(opts.attempts).toBe(3);
  });
});

describe("enqueueExtraction", () => {
  it("posts an extraction:run job with correct envelope", async () => {
    await enqueueExtraction(
      {
        sourceUrl: "https://reddit.com/r/ApplyingToCollege/abc",
        sourcePlatform: "reddit_a2c",
        sourceHash: "sha256_abc",
      },
      { requestId: REQ_ID, cause: "test" }
    );

    expect(addMock).toHaveBeenCalledTimes(1);
    const [jobName, envelope] = addMock.mock.calls[0]!;
    expect(jobName).toBe("extraction:run");
    expect(envelope.payload.sourcePlatform).toBe("reddit_a2c");
    expect(envelope.payload.sourceHash).toBe("sha256_abc");
  });
});
