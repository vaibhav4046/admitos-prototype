/**
 * tests/lib/auth-jwt.test.ts
 *
 * Tests for the JWT decode + validate utilities. These are pure
 * functions that run without any Supabase or network dependency.
 */

import { describe, expect, it } from "vitest";

import {
  decodeJwtPayload,
  extractBearerToken,
  extractRole,
  isExpired,
} from "@/services/auth/jwt";

/** Build a fake JWT with a given payload. No real signature. */
function fakeJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const body = btoa(JSON.stringify(payload))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return `${header}.${body}.fake-signature`;
}

describe("decodeJwtPayload", () => {
  it("decodes a valid JWT payload", () => {
    const token = fakeJwt({ sub: "user-123", email: "test@example.com" });
    const payload = decodeJwtPayload(token);
    expect(payload).not.toBeNull();
    expect(payload!.sub).toBe("user-123");
    expect(payload!.email).toBe("test@example.com");
  });

  it("returns null for a non-JWT string", () => {
    expect(decodeJwtPayload("not-a-jwt")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(decodeJwtPayload("")).toBeNull();
  });

  it("returns null for malformed base64", () => {
    expect(decodeJwtPayload("a.!!!.c")).toBeNull();
  });
});

describe("extractRole", () => {
  it("reads role from app_metadata.role", () => {
    expect(
      extractRole({ sub: "u", app_metadata: { role: "student" } })
    ).toBe("student");
  });

  it("reads all four valid roles", () => {
    for (const role of ["student", "parent", "counsellor", "admin"] as const) {
      expect(
        extractRole({ sub: "u", app_metadata: { role } })
      ).toBe(role);
    }
  });

  it("falls back to top-level role field", () => {
    expect(extractRole({ sub: "u", role: "admin" })).toBe("admin");
  });

  it("returns null for unknown role", () => {
    expect(
      extractRole({ sub: "u", app_metadata: { role: "superuser" } })
    ).toBeNull();
  });

  it("returns null when no role is present", () => {
    expect(extractRole({ sub: "u" })).toBeNull();
  });
});

describe("isExpired", () => {
  it("returns false when exp is in the future", () => {
    const futureExp = Math.floor(Date.now() / 1000) + 3600;
    expect(isExpired({ sub: "u", exp: futureExp })).toBe(false);
  });

  it("returns true when exp is in the past", () => {
    const pastExp = Math.floor(Date.now() / 1000) - 3600;
    expect(isExpired({ sub: "u", exp: pastExp })).toBe(true);
  });

  it("returns false when no exp claim", () => {
    expect(isExpired({ sub: "u" })).toBe(false);
  });

  it("tolerates 30 seconds of clock skew", () => {
    // Token expired 20 seconds ago — within the 30s tolerance
    const recentExp = Math.floor(Date.now() / 1000) - 20;
    expect(isExpired({ sub: "u", exp: recentExp })).toBe(false);
  });

  it("rejects token expired more than 30 seconds ago", () => {
    const oldExp = Math.floor(Date.now() / 1000) - 60;
    expect(isExpired({ sub: "u", exp: oldExp })).toBe(true);
  });
});

describe("extractBearerToken", () => {
  it("extracts token from Bearer header", () => {
    expect(extractBearerToken("Bearer abc123")).toBe("abc123");
  });

  it("is case-insensitive for Bearer prefix", () => {
    expect(extractBearerToken("bearer abc123")).toBe("abc123");
    expect(extractBearerToken("BEARER abc123")).toBe("abc123");
  });

  it("returns null for null input", () => {
    expect(extractBearerToken(null)).toBeNull();
  });

  it("returns null for non-Bearer auth", () => {
    expect(extractBearerToken("Basic abc123")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(extractBearerToken("")).toBeNull();
  });

  it("handles tokens with special characters", () => {
    const token = "eyJhbGciOi.eyJzdWIiOi.signature_here-123";
    expect(extractBearerToken(`Bearer ${token}`)).toBe(token);
  });
});
