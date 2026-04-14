/**
 * tests/lib/instrumented-route.test.ts
 *
 * `instrumentedRoute` is the chokepoint. If it ever stops attaching
 * the request id, hiding errors in production, or surfacing
 * AuthError correctly, half the safety story collapses. These tests
 * lock the behaviour down.
 *
 * Mocks:
 *   - @/services/auth → no current user (so audit() falls back to service actor)
 *   - @/services/audit/log → noop (we don't need to assert audit writes here)
 *   - @/lib/observability → captureError + addBreadcrumb both spy-able
 */

import { describe, expect, it, vi, beforeEach } from "vitest";

const captureErrorSpy = vi.fn();
const breadcrumbSpy = vi.fn();
const auditSpy = vi.fn();

vi.mock("@/lib/observability", () => ({
  captureError: (...a: unknown[]) => captureErrorSpy(...a),
  addBreadcrumb: (...a: unknown[]) => breadcrumbSpy(...a),
}));

vi.mock("@/services/audit/log", () => ({
  logAuditEvent: (...a: unknown[]) => auditSpy(...a),
}));

vi.mock("@/services/auth", async () => {
  class AuthError extends Error {
    status: 401 | 403;
    constructor(message: string, status: 401 | 403) {
      super(message);
      this.name = "AuthError";
      this.status = status;
    }
  }
  return {
    AuthError,
    getCurrentUser: async () => null,
  };
});

import { instrumentedRoute } from "@/api/_core/instrumented-route";
import { AuthError } from "@/services/auth";

function makeRequest(opts: { headers?: Record<string, string> } = {}): Request {
  return new Request("https://app.test/api/admissions/whatever", {
    method: "POST",
    headers: opts.headers,
  });
}

describe("instrumentedRoute", () => {
  beforeEach(() => {
    captureErrorSpy.mockReset();
    breadcrumbSpy.mockReset();
    auditSpy.mockReset();
  });

  it("returns the handler's value as JSON with request id headers", async () => {
    const handler = instrumentedRoute(
      { namespace: "admissions", route: "/test" },
      async () => ({ hello: "world" })
    );
    const res = await handler(makeRequest());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ hello: "world" });
    expect(res.headers.get("x-unioffer-request-id")).toMatch(/^req_[a-f0-9]{16}$/);
    expect(res.headers.get("Cache-Control")).toBe("no-store");
  });

  it("trusts a valid x-unioffer-request-id header", async () => {
    const handler = instrumentedRoute(
      { namespace: "admissions", route: "/test" },
      async (ctx) => ({ id: ctx.requestId })
    );
    const res = await handler(
      makeRequest({ headers: { "x-unioffer-request-id": "req_aaaaaaaaaaaaaaaa" } })
    );
    const body = await res.json();
    expect(body.id).toBe("req_aaaaaaaaaaaaaaaa");
  });

  it("ignores a malformed x-unioffer-request-id header", async () => {
    const handler = instrumentedRoute(
      { namespace: "admissions", route: "/test" },
      async (ctx) => ({ id: ctx.requestId })
    );
    const res = await handler(
      makeRequest({ headers: { "x-unioffer-request-id": "evil-string" } })
    );
    const body = await res.json();
    expect(body.id).toMatch(/^req_[a-f0-9]{16}$/);
    expect(body.id).not.toBe("evil-string");
  });

  it("turns AuthError into the right status without calling captureError", async () => {
    const handler = instrumentedRoute(
      { namespace: "admissions", route: "/test" },
      async () => {
        throw new AuthError("not_authenticated", 401);
      }
    );
    const res = await handler(makeRequest());
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("not_authenticated");
    expect(captureErrorSpy).not.toHaveBeenCalled();
  });

  it("turns thrown errors into a 500 + captures via Sentry", async () => {
    const handler = instrumentedRoute(
      { namespace: "admissions", route: "/test" },
      async () => {
        throw new Error("unexpected");
      }
    );
    const res = await handler(makeRequest());
    expect(res.status).toBe(500);
    expect(captureErrorSpy).toHaveBeenCalledTimes(1);
    const body = await res.json();
    expect(body.requestId).toMatch(/^req_[a-f0-9]{16}$/);
  });
});
