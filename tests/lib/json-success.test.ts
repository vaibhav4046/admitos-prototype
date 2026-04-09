/**
 * tests/lib/json-success.test.ts
 *
 * Locks the json-success contract: data is merged with requestId,
 * the request id header is set, Cache-Control is no-store, and
 * extra headers can be merged without overwriting the invariants.
 */

import { describe, expect, it } from "vitest";

import { jsonSuccess } from "@/lib/api";

const REQ_ID = "req_0123456789abcdef";

describe("jsonSuccess", () => {
  it("merges data with requestId in the body", async () => {
    const res = jsonSuccess(
      { status: "ok", count: 3 },
      { requestId: REQ_ID }
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body).toEqual({ status: "ok", count: 3, requestId: REQ_ID });
  });

  it("sets the request id header and no-store", () => {
    const res = jsonSuccess({ ok: true }, { requestId: REQ_ID });
    expect(res.headers.get("x-admitos-request-id")).toBe(REQ_ID);
    expect(res.headers.get("Cache-Control")).toBe("no-store");
  });

  it("respects an explicit status (e.g. 202)", () => {
    const res = jsonSuccess(
      { status: "queued" },
      { requestId: REQ_ID, status: 202 }
    );
    expect(res.status).toBe(202);
  });

  it("merges extra headers but never lets them clobber the request id", () => {
    const res = jsonSuccess(
      { ok: true },
      {
        requestId: REQ_ID,
        headers: { "x-extra": "value", "x-admitos-request-id": "spoofed" },
      }
    );
    // Standard headers win — the request id header is the primary
    // trace-id propagation channel and a caller must not be able to
    // overwrite it by passing the same key in `headers`. The same
    // discipline holds in error-envelope.ts.
    expect(res.headers.get("x-admitos-request-id")).toBe(REQ_ID);
    expect(res.headers.get("x-extra")).toBe("value");
  });
});
