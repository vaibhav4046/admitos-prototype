/**
 * tests/lib/request-id.test.ts
 *
 * The format check is the security-relevant bit — without it, a
 * malicious client could inject log noise via the x-request-id
 * header. The "trust if it matches our format, else generate"
 * pattern is the same one CloudFlare and AWS use for their internal
 * trace ids.
 */

import { describe, expect, it } from "vitest";

import {
  generateRequestId,
  isValidRequestId,
  requestIdFromHeaders,
} from "@/lib/utils/request-id";

describe("generateRequestId", () => {
  it("matches the req_<16-hex> format", () => {
    const id = generateRequestId();
    expect(id).toMatch(/^req_[a-f0-9]{16}$/);
  });

  it("is unique on every call (overwhelming probability)", () => {
    const ids = new Set(Array.from({ length: 1000 }, () => generateRequestId()));
    expect(ids.size).toBe(1000);
  });
});

describe("isValidRequestId", () => {
  it.each([
    ["req_0123456789abcdef", true],
    ["req_ABCDEF0123456789", false], // we lowercase only
    ["REQ_0123456789abcdef", false],
    ["req_short", false],
    ["req_0123456789abcdef0", false], // 17 chars
    ["", false],
    ["not-even-trying", false],
  ])("%s → %s", (id, expected) => {
    expect(isValidRequestId(id)).toBe(expected);
  });
});

describe("requestIdFromHeaders", () => {
  it("returns the incoming id when valid", () => {
    const headers = new Headers({ "x-request-id": "req_0123456789abcdef" });
    expect(requestIdFromHeaders(headers)).toBe("req_0123456789abcdef");
  });

  it("generates a new id when the header is missing", () => {
    const headers = new Headers();
    expect(requestIdFromHeaders(headers)).toMatch(/^req_[a-f0-9]{16}$/);
  });

  it("ignores a malformed incoming id and generates a fresh one", () => {
    const headers = new Headers({ "x-request-id": "evil; DROP TABLE" });
    const id = requestIdFromHeaders(headers);
    expect(id).not.toBe("evil; DROP TABLE");
    expect(id).toMatch(/^req_[a-f0-9]{16}$/);
  });
});
