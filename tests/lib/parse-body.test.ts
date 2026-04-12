/**
 * tests/lib/parse-body.test.ts
 *
 * Locks the contract of `parseJsonBody`:
 *
 *   - Returns the parsed object on success
 *   - Returns a NextResponse with the standard envelope on failure
 *   - Treats invalid JSON the same as schema mismatch (no throw)
 */

import { describe, expect, it } from "vitest";
import { z } from "zod";
import { NextResponse } from "next/server";

import { parseJsonBody } from "@/api/_core";

const REQ_ID = "req_0123456789abcdef";

const Schema = z.object({
  name: z.string().min(1),
  count: z.number().int().min(0),
});

function fakeRequest(bodyText: string): Request {
  return new Request("https://example.test/api", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: bodyText,
  });
}

describe("parseJsonBody", () => {
  it("returns parsed data on a valid body", async () => {
    const result = await parseJsonBody(
      { request: fakeRequest('{"name":"alice","count":3}'), requestId: REQ_ID },
      Schema
    );
    expect(result).toEqual({ name: "alice", count: 3 });
  });

  it("returns a 400 NextResponse on schema mismatch", async () => {
    const result = await parseJsonBody(
      { request: fakeRequest('{"name":"","count":-1}'), requestId: REQ_ID },
      Schema
    );
    expect(result).toBeInstanceOf(NextResponse);
    const res = result as NextResponse;
    expect(res.status).toBe(400);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.error).toBe("invalid_body");
    expect(body.requestId).toBe(REQ_ID);
    expect(body.detail).toHaveProperty("fieldErrors");
  });

  it("returns a 400 NextResponse on invalid JSON without throwing", async () => {
    const result = await parseJsonBody(
      { request: fakeRequest("not json"), requestId: REQ_ID },
      Schema
    );
    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });
});
