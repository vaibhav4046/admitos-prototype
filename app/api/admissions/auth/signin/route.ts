/**
 * POST /api/admissions/auth/signin
 *
 * Placeholder sign-in endpoint. The real Supabase OAuth flow lands
 * in M1 Week 2 — this file exists now so we can:
 *
 *   1. Wire the rate limiter (5/min per IP, sliding window)
 *   2. Wire the CSRF check (signed double-submit)
 *   3. Demonstrate the `instrumentedRoute` chokepoint pattern
 *      end-to-end before the real flow lands, so when we add the
 *      OAuth callback we already know the surrounding plumbing works
 *
 * The handler currently always returns 501 with an "auth_pending"
 * envelope so the front-end can be developed against a deterministic
 * stub.
 */

import {
  instrumentedRoute,
  jsonCsrfFailure,
  jsonRateLimited,
  jsonSuccess,
} from "@/lib/api";
import { rateLimit } from "@/lib/security/rate-limit";
import { verifyCsrf } from "@/lib/security/csrf";
import { log } from "@/lib/log";

/**
 * Pull a best-effort client IP from the standard reverse-proxy
 * headers. Vercel sets `x-vercel-forwarded-for`; everywhere else
 * uses `x-forwarded-for`. We never trust either of these for
 * security decisions outside of rate-limiting (where the worst
 * case is "an attacker bursts past 5/min by spoofing").
 */
function clientIp(request: Request): string {
  return (
    request.headers.get("x-vercel-forwarded-for") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

export const POST = instrumentedRoute(
  { namespace: "admissions", route: "/api/admissions/auth/signin" },
  async (ctx) => {
    // 1. CSRF — incoming POST, fail loudly.
    const csrf = verifyCsrf(ctx.request);
    if (!csrf.ok) {
      log.warn("auth.signin.csrf_failed", {
        requestId: ctx.requestId,
        reason: csrf.reason,
      });
      return jsonCsrfFailure(ctx.requestId, csrf.reason ?? "unknown");
    }

    // 2. Rate limit — 5 requests per minute per IP. Fail-open is
    // fine here: if Redis is down, the worst case is a burst of
    // legit users get through. Account lockout is a separate
    // mechanism (lives in Supabase).
    const ip = clientIp(ctx.request);
    const limit = await rateLimit({
      bucket: "auth.signin",
      key: `ip:${ip}`,
      limit: 5,
      windowMs: 60_000,
    });
    if (!limit.allowed) {
      log.warn("auth.signin.rate_limited", {
        requestId: ctx.requestId,
        ip,
      });
      return jsonRateLimited(ctx.requestId, limit.resetMs);
    }

    // 3. Stub response — real Supabase OAuth lands in M1 Week 2.
    return jsonSuccess(
      {
        status: "auth_pending",
        message:
          "Sign-in flow is wired but the OAuth provider is not yet configured. Set GOOGLE_OAUTH_CLIENT_ID/SECRET and re-deploy.",
      },
      { requestId: ctx.requestId, status: 501 }
    );
  }
);
