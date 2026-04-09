/**
 * tests/lib/error-envelope.test.ts
 *
 * Locks the JSON shape and headers of the standard error envelope so
 * front-end can rely on `error` (machine code) + `requestId` always
 * being present, and so the `Cache-Control: no-store` + request id
 * header invariants don't drift.
 */

import { describe, expect, it } from "vitest";

import {
  jsonError,
  jsonValidationError,
  jsonRateLimited,
  jsonCsrfFailure,
} from "@/lib/api";

const REQ_ID = "req_0123456789abcdef";

async function readBody(res: Response): Promise<Record<string, unknown>> {
  return (await res.json()) as Record<string, unknown>;
}

describe("jsonError", () => {
  it("returns the requested status with the standard envelope shape", async () => {
    const res = jsonError({
      code: "thing_failed",
      message: "Thing failed.",
      detail: { which: "thing" },
      requestId: REQ_ID,
      status: 418,
    });

    expect(res.status).toBe(418);
    expect(res.headers.get("x-admitos-request-id")).toBe(REQ_ID);
    expect(res.headers.get("Cache-Control")).toBe("no-store");

    const body = await readBody(res);
    expect(body).toEqual({
      error: "thing_failed",
      message: "Thing failed.",
      detail: { which: "thing" },
      requestId: REQ_ID,
    });
  });

  it("merges optional headers without losing the request id", () => {
    const res = jsonError({
      code: "bad",
      requestId: REQ_ID,
      status: 400,
      headers: { "x-extra": "ok" },
    });

    expect(res.headers.get("x-admitos-request-id")).toBe(REQ_ID);
    expect(res.headers.get("x-extra")).toBe("ok");
  });
});

describe("jsonValidationError", () => {
  it("uses the invalid_body code and exposes flattened field errors", async () => {
    const res = jsonValidationError(REQ_ID, {
      submissionId: ["Required"],
    });

    expect(res.status).toBe(400);
    const body = await readBody(res);
    expect(body.error).toBe("invalid_body");
    expect(body.requestId).toBe(REQ_ID);
    expect(body.detail).toEqual({
      fieldErrors: { submissionId: ["Required"] },
    });
  });
});

describe("jsonRateLimited", () => {
  it("returns 429 with retry-after seconds rounded up", async () => {
    const res = jsonRateLimited(REQ_ID, 3500);
    expect(res.status).toBe(429);
    // 3500ms → ceil(3.5) = 4 seconds
    expect(res.headers.get("retry-after")).toBe("4");
    const body = await readBody(res);
    expect(body.error).toBe("rate_limited");
    expect(body.detail).toEqual({ retryAfterMs: 3500 });
  });
});

describe("jsonCsrfFailure", () => {
  it("returns 403 with the csrf_failed code and the reason in detail", async () => {
    const res = jsonCsrfFailure(REQ_ID, "missing_cookie");
    expect(res.status).toBe(403);
    const body = await readBody(res);
    expect(body.error).toBe("csrf_failed");
    expect(body.detail).toEqual({ reason: "missing_cookie" });
    expect(body.requestId).toBe(REQ_ID);
  });
});
