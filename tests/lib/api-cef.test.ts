/**
 * tests/lib/api-cef.test.ts
 *
 * Tests for the CEF draft API handlers: GET, PUT (autosave), POST (submit).
 * Mocks auth, CSRF, rate-limit, and CEF service to isolate handler logic.
 */

import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/services/auth", async () => {
  const actual = await vi.importActual<typeof import("@/services/auth")>(
    "@/services/auth"
  );
  return {
    ...actual,
    requireUser: vi.fn(),
    getCurrentUser: vi.fn(),
  };
});

vi.mock("@/services/security/csrf", () => ({
  verifyCsrf: vi.fn().mockReturnValue({ ok: true }),
  methodRequiresCsrf: vi.fn().mockReturnValue(true),
}));

vi.mock("@/services/security/rate-limit", () => ({
  rateLimit: vi.fn().mockResolvedValue({ allowed: true, remaining: 59, resetMs: 60000 }),
}));

vi.mock("@/services/cef/cef", () => ({
  getDraft: vi.fn(),
  getLatestVersion: vi.fn(),
  autosaveDraftStep: vi.fn(),
  submitCef: vi.fn(),
  CefValidationError: class CefValidationError extends Error {
    missingSteps: string[];
    constructor(msg: string, steps: string[]) {
      super(msg);
      this.missingSteps = steps;
    }
  },
}));

vi.mock("@/services/queues", () => ({
  enqueueCefSubmitted: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/observability", () => ({
  addBreadcrumb: vi.fn(),
  captureError: vi.fn(),
}));

vi.mock("@/services/audit/log", () => ({
  logAuditEvent: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/log", () => ({
  log: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import { requireUser, AuthError } from "@/services/auth";
import { verifyCsrf } from "@/services/security/csrf";
import { rateLimit } from "@/services/security/rate-limit";
import { getDraft, getLatestVersion, autosaveDraftStep, submitCef, CefValidationError } from "@/services/cef/cef";
import { GET, PUT, POST } from "@/api/admissions/cef/draft";

const mockRequireUser = requireUser as ReturnType<typeof vi.fn>;
const mockVerifyCsrf = verifyCsrf as ReturnType<typeof vi.fn>;
const mockRateLimit = rateLimit as ReturnType<typeof vi.fn>;
const mockGetDraft = getDraft as ReturnType<typeof vi.fn>;
const mockGetLatestVersion = getLatestVersion as ReturnType<typeof vi.fn>;
const mockAutosave = autosaveDraftStep as ReturnType<typeof vi.fn>;
const mockSubmitCef = submitCef as ReturnType<typeof vi.fn>;

const fakeUser = {
  id: "user_1",
  email: "test@example.com",
  role: "student" as const,
  studentId: null,
  emailVerified: true,
  lastSignInAt: "2026-04-10T12:00:00Z",
};

function makeRequest(path: string, init?: RequestInit): Request {
  return new Request(`https://app.test.local${path}`, {
    method: "GET",
    headers: { "x-admitos-request-id": "req_0123456789abcdef" },
    ...init,
  });
}

function makeJsonRequest(path: string, body: unknown, method = "PUT"): Request {
  return new Request(`https://app.test.local${path}`, {
    method,
    headers: {
      "x-admitos-request-id": "req_0123456789abcdef",
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  mockRequireUser.mockReset().mockResolvedValue(fakeUser);
  mockVerifyCsrf.mockReset().mockReturnValue({ ok: true });
  mockRateLimit.mockReset().mockResolvedValue({ allowed: true, remaining: 59, resetMs: 60000 });
  mockGetDraft.mockReset();
  mockGetLatestVersion.mockReset();
  mockAutosave.mockReset();
  mockSubmitCef.mockReset();
});

describe("GET /api/admissions/cef/draft", () => {
  it("returns draft steps for the authenticated user", async () => {
    mockGetLatestVersion.mockResolvedValue({ version: 1 });
    mockGetDraft.mockResolvedValue([
      { step: "profile", payload: { name: "Test" }, autosaved_at: "2026-04-10T12:00:00Z" },
      { step: "academics", payload: { gpa: 3.9 }, autosaved_at: "2026-04-10T12:01:00Z" },
    ]);

    const res = await GET(makeRequest("/api/admissions/cef/draft"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.version).toBe(1);
    expect(body.steps).toHaveLength(2);
    expect(body.steps[0].step).toBe("profile");
  });

  it("defaults to version 1 when no version exists", async () => {
    mockGetLatestVersion.mockResolvedValue(null);
    mockGetDraft.mockResolvedValue([]);

    const res = await GET(makeRequest("/api/admissions/cef/draft"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.version).toBe(1);
    expect(body.steps).toHaveLength(0);
  });

  it("returns 401 when not authenticated", async () => {
    mockRequireUser.mockRejectedValue(new AuthError("not_authenticated", 401));

    const res = await GET(makeRequest("/api/admissions/cef/draft"));
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("not_authenticated");
  });
});

describe("PUT /api/admissions/cef/draft", () => {
  it("autosaves a draft step", async () => {
    mockAutosave.mockResolvedValue({
      id: "draft_1",
      step: "profile",
      autosaved_at: "2026-04-10T12:05:00Z",
    });

    const res = await PUT(
      makeJsonRequest("/api/admissions/cef/draft", {
        version: 1,
        step: "profile",
        payload: { name: "Updated" },
      })
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.id).toBe("draft_1");
    expect(body.step).toBe("profile");
    expect(mockAutosave).toHaveBeenCalledWith({
      userId: "user_1",
      version: 1,
      step: "profile",
      payload: { name: "Updated" },
    });
  });

  it("rejects when CSRF fails", async () => {
    mockVerifyCsrf.mockReturnValue({ ok: false, reason: "token_missing" });

    const res = await PUT(
      makeJsonRequest("/api/admissions/cef/draft", {
        version: 1,
        step: "profile",
        payload: {},
      })
    );

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toBe("csrf_failed");
  });

  it("rejects when rate limited", async () => {
    mockRateLimit.mockResolvedValue({ allowed: false, remaining: 0, resetMs: 30000 });

    const res = await PUT(
      makeJsonRequest("/api/admissions/cef/draft", {
        version: 1,
        step: "profile",
        payload: {},
      })
    );

    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body.error).toBe("rate_limited");
  });
});

describe("POST /api/admissions/cef/draft", () => {
  it("submits a CEF and returns 202", async () => {
    mockSubmitCef.mockResolvedValue({
      versionId: "v_1",
      payloadHash: "sha256:abc123",
      submittedAt: "2026-04-10T12:10:00Z",
    });

    const res = await POST(
      makeJsonRequest(
        "/api/admissions/cef/draft",
        { version: 1 },
        "POST"
      )
    );
    const body = await res.json();

    expect(res.status).toBe(202);
    expect(body.status).toBe("submitted");
    expect(body.versionId).toBe("v_1");
    expect(body.payloadHash).toBe("sha256:abc123");
  });

  it("returns 422 when CEF is incomplete", async () => {
    mockSubmitCef.mockRejectedValue(
      new CefValidationError("Missing required steps", ["essays", "review"])
    );

    const res = await POST(
      makeJsonRequest(
        "/api/admissions/cef/draft",
        { version: 1 },
        "POST"
      )
    );
    const body = await res.json();

    expect(res.status).toBe(422);
    expect(body.error).toBe("cef_incomplete");
    expect(body.detail.missingSteps).toEqual(["essays", "review"]);
  });

  it("rejects when CSRF fails", async () => {
    mockVerifyCsrf.mockReturnValue({ ok: false, reason: "token_expired" });

    const res = await POST(
      makeJsonRequest(
        "/api/admissions/cef/draft",
        { version: 1 },
        "POST"
      )
    );

    expect(res.status).toBe(403);
  });

  it("rejects when rate limited", async () => {
    mockRateLimit.mockResolvedValue({ allowed: false, remaining: 0, resetMs: 45000 });

    const res = await POST(
      makeJsonRequest(
        "/api/admissions/cef/draft",
        { version: 1 },
        "POST"
      )
    );

    expect(res.status).toBe(429);
  });

  it("returns 401 when not authenticated", async () => {
    mockRequireUser.mockRejectedValue(new AuthError("not_authenticated", 401));

    const res = await POST(
      makeJsonRequest(
        "/api/admissions/cef/draft",
        { version: 1 },
        "POST"
      )
    );

    expect(res.status).toBe(401);
  });

  it("echoes request id in response header", async () => {
    mockSubmitCef.mockResolvedValue({
      versionId: "v_2",
      payloadHash: "sha256:def456",
      submittedAt: "2026-04-10T12:15:00Z",
    });

    const res = await POST(
      makeJsonRequest(
        "/api/admissions/cef/draft",
        { version: 1 },
        "POST"
      )
    );

    expect(res.headers.get("x-admitos-request-id")).toBeTruthy();
  });
});
