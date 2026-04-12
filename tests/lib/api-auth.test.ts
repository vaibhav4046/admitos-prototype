/**
 * tests/lib/api-auth.test.ts
 *
 * Tests for the auth API handlers — /me endpoint.
 * Mocks getCurrentUser to simulate authenticated/unauthenticated states.
 */

import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/services/auth/server", async () => {
  const actual = await vi.importActual<typeof import("@/services/auth/server")>(
    "@/services/auth/server"
  );
  return {
    ...actual,
    getCurrentUser: vi.fn(),
  };
});

vi.mock("@/lib/observability", () => ({
  addBreadcrumb: vi.fn(),
  captureError: vi.fn(),
}));

vi.mock("@/services/audit/log", () => ({
  logAuditEvent: vi.fn().mockResolvedValue(undefined),
}));

import { getCurrentUser } from "@/services/auth/server";
import { GET } from "@/api/admissions/auth/me";

const mockGetCurrentUser = getCurrentUser as ReturnType<typeof vi.fn>;

function makeRequest(path: string): Request {
  return new Request(`https://app.test.local${path}`, {
    method: "GET",
    headers: {
      "x-admitos-request-id": "req_0123456789abcdef",
    },
  });
}

beforeEach(() => {
  mockGetCurrentUser.mockReset();
});

describe("GET /api/admissions/auth/me", () => {
  it("returns user data when authenticated", async () => {
    mockGetCurrentUser.mockResolvedValue({
      id: "user_1",
      email: "test@example.com",
      role: "student",
      studentId: null,
      emailVerified: true,
      lastSignInAt: "2026-04-10T12:00:00Z",
    });

    const res = await GET(makeRequest("/api/admissions/auth/me"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.id).toBe("user_1");
    expect(body.email).toBe("test@example.com");
    expect(body.role).toBe("student");
  });

  it("returns 401 when not authenticated", async () => {
    mockGetCurrentUser.mockResolvedValue(null);

    const res = await GET(makeRequest("/api/admissions/auth/me"));

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("not_authenticated");
  });

  it("includes requestId in response headers", async () => {
    mockGetCurrentUser.mockResolvedValue({
      id: "user_1",
      email: "test@example.com",
      role: "admin",
      studentId: null,
      emailVerified: true,
      lastSignInAt: null,
    });

    const res = await GET(makeRequest("/api/admissions/auth/me"));
    expect(res.headers.get("x-admitos-request-id")).toBeTruthy();
  });

  it("returns all expected fields for a counsellor", async () => {
    mockGetCurrentUser.mockResolvedValue({
      id: "user_2",
      email: "counsellor@admitos.dev",
      role: "counsellor",
      studentId: null,
      emailVerified: true,
      lastSignInAt: "2026-04-09T08:00:00Z",
    });

    const res = await GET(makeRequest("/api/admissions/auth/me"));
    const body = await res.json();

    expect(body).toMatchObject({
      id: "user_2",
      email: "counsellor@admitos.dev",
      role: "counsellor",
      emailVerified: true,
    });
  });
});
