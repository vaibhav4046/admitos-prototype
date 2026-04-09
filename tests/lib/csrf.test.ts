/**
 * tests/lib/csrf.test.ts
 *
 * Unit tests for the signed double-submit CSRF primitive.
 *
 * We mock `@/lib/env` to inject a stable CSRF_SECRET so the tests
 * don't depend on a real .env.local. The mock pattern matches what
 * `tests/lib/posthog.banned-events.test.ts` does.
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/lib/env", () => ({
  env: {
    CSRF_SECRET: "test-csrf-secret-must-be-at-least-32-chars-long",
    APP_ENV: "test",
  },
}));

import {
  issueCsrfToken,
  verifyCsrf,
  methodRequiresCsrf,
} from "@/lib/security/csrf";

function buildRequest(opts: {
  cookie?: string;
  header?: string;
  method?: string;
}): Request {
  const headers = new Headers();
  if (opts.cookie) headers.set("cookie", opts.cookie);
  if (opts.header) headers.set("x-csrf-token", opts.header);
  return new Request("https://app.test/api/whatever", {
    method: opts.method ?? "POST",
    headers,
  });
}

describe("methodRequiresCsrf", () => {
  it.each([
    ["POST", true],
    ["PUT", true],
    ["PATCH", true],
    ["DELETE", true],
    ["post", true], // case-insensitive
    ["GET", false],
    ["HEAD", false],
    ["OPTIONS", false],
  ])("%s → %s", (method, expected) => {
    expect(methodRequiresCsrf(method)).toBe(expected);
  });
});

describe("issueCsrfToken", () => {
  it("emits a token with the expected shape", () => {
    const t = issueCsrfToken();
    expect(t.cookieName).toBe("__Host-csrf");
    expect(t.headerName).toBe("x-csrf-token");
    expect(t.maxAgeSeconds).toBe(3600);
    // v1.<timestamp>.<nonce>.<sig>
    expect(t.token.split(".")).toHaveLength(4);
    expect(t.token.startsWith("v1.")).toBe(true);
  });

  it("emits unique tokens on every call", () => {
    const a = issueCsrfToken();
    const b = issueCsrfToken();
    expect(a.token).not.toEqual(b.token);
  });
});

describe("verifyCsrf", () => {
  it("accepts a freshly issued token echoed in cookie + header", () => {
    const { token } = issueCsrfToken();
    const req = buildRequest({
      cookie: `__Host-csrf=${encodeURIComponent(token)}; other=foo`,
      header: token,
    });
    const result = verifyCsrf(req);
    expect(result.ok).toBe(true);
    expect(result.reason).toBeUndefined();
  });

  it("rejects when the cookie is missing", () => {
    const { token } = issueCsrfToken();
    const req = buildRequest({ header: token });
    expect(verifyCsrf(req)).toEqual({ ok: false, reason: "missing_cookie" });
  });

  it("rejects when the header is missing", () => {
    const { token } = issueCsrfToken();
    const req = buildRequest({
      cookie: `__Host-csrf=${encodeURIComponent(token)}`,
    });
    expect(verifyCsrf(req)).toEqual({ ok: false, reason: "missing_header" });
  });

  it("rejects when cookie and header don't match", () => {
    const a = issueCsrfToken().token;
    const b = issueCsrfToken().token;
    const req = buildRequest({
      cookie: `__Host-csrf=${encodeURIComponent(a)}`,
      header: b,
    });
    expect(verifyCsrf(req).ok).toBe(false);
    expect(verifyCsrf(req).reason).toBe("mismatch");
  });

  it("rejects a malformed token", () => {
    const malformed = "not.even.close";
    const req = buildRequest({
      cookie: `__Host-csrf=${encodeURIComponent(malformed)}`,
      header: malformed,
    });
    expect(verifyCsrf(req).ok).toBe(false);
    expect(verifyCsrf(req).reason).toBe("malformed");
  });

  it("rejects a token whose signature has been tampered with", () => {
    const { token } = issueCsrfToken();
    const parts = token.split(".");
    // flip one char in the signature
    const tamperedSig = parts[3].slice(0, -1) + (parts[3].endsWith("A") ? "B" : "A");
    const tampered = `${parts[0]}.${parts[1]}.${parts[2]}.${tamperedSig}`;
    const req = buildRequest({
      cookie: `__Host-csrf=${encodeURIComponent(tampered)}`,
      header: tampered,
    });
    const result = verifyCsrf(req);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("bad_signature");
  });

  describe("expiry", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-04-09T12:00:00Z"));
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    it("rejects an expired token", () => {
      const { token } = issueCsrfToken({ ttlMs: 60_000 });
      // jump 2 minutes — well past the 60s TTL
      vi.setSystemTime(new Date("2026-04-09T12:02:00Z"));
      const req = buildRequest({
        cookie: `__Host-csrf=${encodeURIComponent(token)}`,
        header: token,
      });
      expect(verifyCsrf(req, { ttlMs: 60_000 }).reason).toBe("expired");
    });

    it("accepts a token within its TTL", () => {
      const { token } = issueCsrfToken({ ttlMs: 60_000 });
      vi.setSystemTime(new Date("2026-04-09T12:00:30Z"));
      const req = buildRequest({
        cookie: `__Host-csrf=${encodeURIComponent(token)}`,
        header: token,
      });
      expect(verifyCsrf(req, { ttlMs: 60_000 }).ok).toBe(true);
    });
  });
});
