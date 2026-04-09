/**
 * tests/lib/rate-limit.test.ts
 *
 * The rate limiter is a small primitive but its failure modes are
 * security-relevant: a wrong fail-open could be excused, but a wrong
 * fail-closed (locking real users out) is a Sev-2. Cover the
 * happy path AND both failure modes.
 *
 * Redis is mocked with a stub that records the pipeline calls and
 * returns the desired card count. We don't need a real Redis.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const breadcrumbs: Array<{ event: string; fields: unknown }> = [];
let pipelineExecResult: unknown[] | null = null;
let shouldThrowOnConnect = false;

vi.mock("@/lib/queues/connection", () => {
  return {
    getRedisConnection: () => {
      if (shouldThrowOnConnect) throw new Error("redis_unreachable");
      return {
        multi: () => {
          const calls: string[] = [];
          const chain = {
            zremrangebyscore: () => {
              calls.push("zremrangebyscore");
              return chain;
            },
            zadd: () => {
              calls.push("zadd");
              return chain;
            },
            zcard: () => {
              calls.push("zcard");
              return chain;
            },
            pexpire: () => {
              calls.push("pexpire");
              return chain;
            },
            exec: async () => pipelineExecResult,
          };
          return chain;
        },
      };
    },
  };
});

vi.mock("@/lib/observability", () => ({
  addBreadcrumb: (event: string, fields: unknown) => {
    breadcrumbs.push({ event, fields });
  },
}));

import { rateLimit } from "@/lib/security/rate-limit";

describe("rateLimit", () => {
  beforeEach(() => {
    breadcrumbs.length = 0;
    pipelineExecResult = null;
    shouldThrowOnConnect = false;
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows the request when count is under the limit", async () => {
    pipelineExecResult = [
      [null, 0],
      [null, 1],
      [null, 3], // zcard → 3
      [null, 1],
    ];
    const result = await rateLimit({
      bucket: "test",
      key: "user:1",
      limit: 5,
      windowMs: 60_000,
    });
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
    expect(result.degraded).toBe(false);
  });

  it("denies the request when count exceeds the limit", async () => {
    pipelineExecResult = [
      [null, 0],
      [null, 1],
      [null, 6],
      [null, 1],
    ];
    const result = await rateLimit({
      bucket: "test",
      key: "user:1",
      limit: 5,
      windowMs: 60_000,
    });
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("fails open by default when Redis throws", async () => {
    shouldThrowOnConnect = true;
    const result = await rateLimit({
      bucket: "test",
      key: "user:1",
      limit: 5,
      windowMs: 60_000,
    });
    expect(result.allowed).toBe(true);
    expect(result.degraded).toBe(true);
    expect(breadcrumbs.length).toBe(1);
    expect(breadcrumbs[0].event).toBe("rate_limit.degraded");
  });

  it("fails closed when failClosed: true and Redis throws", async () => {
    shouldThrowOnConnect = true;
    const result = await rateLimit({
      bucket: "auth.password_reset",
      key: "ip:1.2.3.4",
      limit: 3,
      windowMs: 60_000,
      failClosed: true,
    });
    expect(result.allowed).toBe(false);
    expect(result.degraded).toBe(true);
  });

  it("treats a missing pipeline exec result as a Redis failure", async () => {
    pipelineExecResult = null;
    const result = await rateLimit({
      bucket: "test",
      key: "user:1",
      limit: 5,
      windowMs: 60_000,
    });
    expect(result.allowed).toBe(true);
    expect(result.degraded).toBe(true);
  });
});
