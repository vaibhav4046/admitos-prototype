/**
 * CSRF token issue + verify primitive.
 *
 * Next.js App Router + Supabase cookie auth means our session is a
 * cookie that the browser attaches to every cross-origin request. SameSite
 * lax/strict gives us most of what we need, but we still want a defence
 * in depth for state-changing routes (POST/PUT/PATCH/DELETE) — especially
 * the wellbeing surface, where the impact of a successful CSRF would be
 * disproportionately bad.
 *
 * ### Strategy: signed double-submit cookie
 *
 * - On GET, the server issues a token: random 32 bytes, base64url, signed
 *   with HMAC-SHA256(env.CSRF_SECRET).
 * - The token is set as a cookie (`__Host-csrf`, SameSite=Strict, Secure,
 *   HttpOnly=false so the JS can read it) AND mirrored into a meta tag
 *   on the document.
 * - On POST/PUT/PATCH/DELETE, the client echoes the cookie value into
 *   the `x-csrf-token` header. The server verifies that:
 *     1. both values are present
 *     2. they are byte-equal (constant-time compare)
 *     3. the HMAC verifies against CSRF_SECRET
 *     4. the embedded timestamp is within the TTL (default 1h)
 *
 * The `instrumentedRoute` HOF will call `verifyCsrf(request)` for
 * methods other than GET/HEAD/OPTIONS once Phase B wires it up — this
 * file is the primitive that wrapping uses.
 *
 * ### Why HMAC and not opaque random
 *
 * Opaque tokens require server-side storage (Redis SET with TTL). HMAC
 * is stateless: any instance of the app can verify a token issued by
 * any other instance, and we don't burn a round-trip on every state
 * change. The timestamp+signature approach is what Django, Rails, and
 * NextAuth all converge on for the same reason.
 */

import "server-only";

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

import { env } from "@/lib/env";

const TOKEN_VERSION = "v1";
const DEFAULT_TTL_MS = 60 * 60 * 1000; // 1 hour
const COOKIE_NAME = "__Host-csrf";
const HEADER_NAME = "x-csrf-token";

export interface CsrfToken {
  /** The full token string to put in the cookie and header. */
  token: string;
  /** Cookie name to set. */
  cookieName: string;
  /** Header name the client should echo back. */
  headerName: string;
  /** Cookie max-age in seconds. */
  maxAgeSeconds: number;
}

/**
 * Issue a fresh CSRF token. Call from any GET route that renders an
 * authenticated page. The returned `cookieName`/`token` should be set
 * via `cookies().set(...)` with `httpOnly: false, secure: true,
 * sameSite: "strict", path: "/"`.
 */
export function issueCsrfToken(opts: { ttlMs?: number } = {}): CsrfToken {
  const ttlMs = opts.ttlMs ?? DEFAULT_TTL_MS;
  const issuedAt = Date.now();
  const nonce = randomBytes(24).toString("base64url");
  const payload = `${TOKEN_VERSION}.${issuedAt}.${nonce}`;
  const sig = sign(payload);
  return {
    token: `${payload}.${sig}`,
    cookieName: COOKIE_NAME,
    headerName: HEADER_NAME,
    maxAgeSeconds: Math.floor(ttlMs / 1000),
  };
}

export type CsrfFailureReason =
  | "missing_cookie"
  | "missing_header"
  | "mismatch"
  | "malformed"
  | "bad_signature"
  | "expired";

export interface CsrfVerifyResult {
  ok: boolean;
  reason?: CsrfFailureReason;
}

/**
 * Verify the CSRF token on a state-changing request.
 *
 * The caller is responsible for *only* invoking this on methods that
 * mutate state — GET/HEAD/OPTIONS should pass through.
 */
export function verifyCsrf(
  request: Request,
  opts: { ttlMs?: number } = {}
): CsrfVerifyResult {
  const ttlMs = opts.ttlMs ?? DEFAULT_TTL_MS;

  const cookieValue = readCookie(request, COOKIE_NAME);
  if (!cookieValue) return { ok: false, reason: "missing_cookie" };

  const headerValue = request.headers.get(HEADER_NAME);
  if (!headerValue) return { ok: false, reason: "missing_header" };

  // Constant-time compare of cookie vs. header. Both must be the
  // same length for timingSafeEqual to work; if they aren't, fail
  // with mismatch (which is what we'd report anyway).
  const cookieBuf = Buffer.from(cookieValue);
  const headerBuf = Buffer.from(headerValue);
  if (cookieBuf.length !== headerBuf.length) {
    return { ok: false, reason: "mismatch" };
  }
  if (!timingSafeEqual(cookieBuf, headerBuf)) {
    return { ok: false, reason: "mismatch" };
  }

  // Now verify the signature on the (now-confirmed-equal) value.
  const parts = cookieValue.split(".");
  if (parts.length !== 4) return { ok: false, reason: "malformed" };
  const [version, issuedAtStr, nonce, sig] = parts;
  if (version !== TOKEN_VERSION) return { ok: false, reason: "malformed" };

  const expectedSig = sign(`${version}.${issuedAtStr}.${nonce}`);
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length) {
    return { ok: false, reason: "bad_signature" };
  }
  if (!timingSafeEqual(sigBuf, expectedBuf)) {
    return { ok: false, reason: "bad_signature" };
  }

  const issuedAt = Number(issuedAtStr);
  if (!Number.isFinite(issuedAt)) return { ok: false, reason: "malformed" };
  if (Date.now() - issuedAt > ttlMs) return { ok: false, reason: "expired" };

  return { ok: true };
}

/**
 * Methods that should be CSRF-checked. GET/HEAD/OPTIONS are
 * intentionally absent: they must not mutate state and so the token
 * is not relevant.
 */
export function methodRequiresCsrf(method: string): boolean {
  const m = method.toUpperCase();
  return m === "POST" || m === "PUT" || m === "PATCH" || m === "DELETE";
}

// ---------------------------------------------------------------------------
// internals
// ---------------------------------------------------------------------------

function sign(payload: string): string {
  // env.CSRF_SECRET is a Zod-required string in lib/env.ts. If it
  // were missing, importing this file would have already thrown at
  // boot — so a runtime check here would be redundant.
  return createHmac("sha256", env.CSRF_SECRET)
    .update(payload)
    .digest("base64url");
}

function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get("cookie");
  if (!header) return null;
  // We deliberately don't pull in a cookie parser dep — the format is
  // simple and getting it slightly wrong here would be a security bug,
  // so we keep it inline and obvious.
  const cookies = header.split(";").map((c) => c.trim());
  for (const c of cookies) {
    const idx = c.indexOf("=");
    if (idx === -1) continue;
    const k = c.slice(0, idx);
    if (k === name) {
      return decodeURIComponent(c.slice(idx + 1));
    }
  }
  return null;
}
