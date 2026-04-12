/**
 * JWT decode + validate for Supabase Auth tokens.
 *
 * Supabase Auth JWTs are standard RS256 JWTs with claims in the
 * payload. This module handles the decoding and structural validation
 * that the middleware needs to stamp the request with a role hint.
 *
 * IMPORTANT: This is NOT a full cryptographic verification — the
 * middleware uses this for fast-path rejection (stuffing the role hint
 * header). The actual security check happens server-side via
 * `supabase.auth.getUser()` in `getCurrentUser()`, which verifies
 * the token against the Supabase auth server.
 *
 * Why not verify the signature in the middleware? Next.js middleware
 * runs on the Edge Runtime, which doesn't have access to the
 * `node:crypto` module. We'd need the JWKS endpoint + a Web Crypto
 * verification, which adds latency on every request. Since
 * `getCurrentUser()` already does the authoritative check, the
 * middleware only needs to decode (not verify) to do coarse-grained
 * fast-path routing.
 */

import type { UserRole } from "./types";

export interface JwtPayload {
  sub: string;
  email?: string;
  role?: string;
  app_metadata?: {
    role?: string;
    student_id?: string;
  };
  exp?: number;
  iat?: number;
}

/**
 * Decode a JWT payload without verifying the signature.
 * Returns null if the token is malformed.
 */
export function decodeJwtPayload(token: string): JwtPayload | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  try {
    // JWT payload is the second segment, base64url-encoded.
    const payload = parts[1]!;
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded) as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * Extract the user role from a decoded JWT payload.
 * Supabase stores roles in `app_metadata.role`.
 */
export function extractRole(payload: JwtPayload): UserRole | null {
  const raw = payload.app_metadata?.role ?? payload.role;
  if (
    raw === "student" ||
    raw === "parent" ||
    raw === "counsellor" ||
    raw === "admin"
  ) {
    return raw;
  }
  return null;
}

/**
 * Check if a JWT payload has expired. Returns true if the token's
 * `exp` claim is in the past (with a 30-second clock skew tolerance).
 */
export function isExpired(payload: JwtPayload): boolean {
  if (!payload.exp) return false;
  const now = Math.floor(Date.now() / 1000);
  return payload.exp < now - 30;
}

/**
 * Extract the bearer token from an Authorization header value.
 * Returns null if the header is missing or malformed.
 */
export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader) return null;
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
}
