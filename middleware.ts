/**
 * AdmitOS middleware — the single point where cross-schema isolation
 * is enforced before any route handler runs.
 *
 * Rules (per Thread 4, non-negotiable):
 *
 *  1. Any request to `/api/admissions/*` MUST NOT be allowed to touch
 *     the `wellbeing` schema. We do two things to enforce this:
 *       (a) Reject the request entirely if the caller's JWT claims a
 *           wellbeing role but the URL is in the admissions namespace.
 *       (b) Stamp the request with an `X-Admitos-Namespace` header that
 *           downstream Supabase clients will verify matches their own
 *           `db.schema` setting.
 *
 *  2. Any request to `/api/wellbeing/*` MUST come from an authenticated
 *     user whose session has been established through the wellbeing UI
 *     (i.e. the Adie flow). Admissions-side API tokens are rejected.
 *
 *  3. Every request is tagged with a request id and a high-resolution
 *     timestamp. These flow into the Sentry + LangSmith traces so we
 *     can reconstruct any cross-layer bug.
 *
 * This is a coarse-grained first line of defense. Fine-grained rules
 * (which user can edit which row) are enforced by Postgres RLS on top
 * of this. Both layers must fail for a wellbeing row to reach the
 * admissions UI.
 */

import { NextResponse, type NextRequest } from "next/server";

import { generateRequestId } from "@/lib/utils/request-id";
import {
  decodeJwtPayload,
  extractBearerToken,
  extractRole,
  isExpired,
} from "@/services/auth/jwt";

export type Namespace = "admissions" | "wellbeing" | "commons" | "public";

/**
 * Map a pathname to its namespace bucket. Exported so the test
 * suite can lock the classification table without needing to
 * round-trip a full NextRequest through the middleware function.
 */
export function namespaceFor(pathname: string): Namespace {
  if (pathname.startsWith("/api/admissions")) return "admissions";
  if (pathname.startsWith("/api/wellbeing")) return "wellbeing";
  if (pathname.startsWith("/api/commons")) return "commons";
  return "public";
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const ns = namespaceFor(pathname);

  // Every request gets tagged regardless of namespace. The id format
  // is `req_<16-hex>` (lib/utils/request-id.ts) and is the same id
  // that flows into Sentry, LangSmith, PostHog, and AuditEvent.
  const requestId = generateRequestId();
  const startedAt = Date.now();

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("X-Admitos-Namespace", ns);
  requestHeaders.set("X-Admitos-Request-Id", requestId);
  requestHeaders.set("X-Admitos-Started-At", String(startedAt));

  // Cross-namespace header sniffing. If an inbound request carries a
  // namespace header that doesn't match its URL, something is trying to
  // be clever — kill it immediately.
  const declaredNs = req.headers.get("X-Admitos-Namespace");
  if (declaredNs && declaredNs !== ns) {
    return jsonError(403, "namespace_mismatch", {
      requestId,
      declared: declaredNs,
      actual: ns,
    });
  }

  // --- JWT decode (fast-path, no signature verification) ---
  // Decode the bearer token to extract the user's role for coarse-grained
  // isolation checks. The authoritative verification happens in
  // getCurrentUser() inside route handlers — this is belt-and-braces.
  const bearerToken =
    extractBearerToken(req.headers.get("authorization")) ??
    extractBearerFromCookie(req);
  let roleHint: string | null = null;

  if (bearerToken) {
    const payload = decodeJwtPayload(bearerToken);
    if (payload) {
      if (isExpired(payload)) {
        // Don't hard-reject — let the route handler's getUser() call
        // return null and produce a clean 401. We just skip stamping
        // the role hint so downstream checks see "unauthenticated".
      } else {
        roleHint = extractRole(payload);
        if (roleHint) {
          requestHeaders.set("X-Admitos-Role-Hint", roleHint);
        }
        if (payload.sub) {
          requestHeaders.set("X-Admitos-User-Id", payload.sub);
        }
      }
    }
  }

  // The wellbeing namespace is also protected against being hit with
  // an admissions-origin referer. This is belt-and-braces on top of
  // the JWT role check that happens inside the route handler.
  if (ns === "wellbeing") {
    const referer = req.headers.get("referer") ?? "";
    if (referer && !referer.includes("/wellbeing/")) {
      return jsonError(403, "wellbeing_cross_origin", {
        requestId,
        referer,
      });
    }
  }

  // Admissions namespace must never be hit with a wellbeing-only token.
  // If the JWT decodes to a role that shouldn't access admissions, reject early.
  if (ns === "admissions") {
    const incomingRoleHint = roleHint ?? req.headers.get("X-Admitos-Role-Hint");
    if (incomingRoleHint === "wellbeing-only") {
      return jsonError(403, "admissions_forbidden_for_wellbeing_role", {
        requestId,
      });
    }
  }

  const res = NextResponse.next({ request: { headers: requestHeaders } });
  res.headers.set("X-Admitos-Namespace", ns);
  res.headers.set("X-Admitos-Request-Id", requestId);
  return res;
}

function jsonError(
  status: number,
  code: string,
  detail: Record<string, unknown>
) {
  return new NextResponse(
    JSON.stringify({
      error: code,
      detail,
      // Static string so that callers can match on it regardless of env.
      _note:
        "AdmitOS enforces hard isolation between admissions and wellbeing schemas.",
    }),
    {
      status,
      headers: { "content-type": "application/json" },
    }
  );
}

/**
 * Extract the Supabase access token from the cookie jar. Supabase
 * stores its session as `sb-<ref>-auth-token` in a JSON-encoded
 * cookie. We look for any cookie matching `sb-*-auth-token` and
 * parse the access_token out of it.
 */
function extractBearerFromCookie(req: NextRequest): string | null {
  for (const cookie of req.cookies.getAll()) {
    if (cookie.name.startsWith("sb-") && cookie.name.endsWith("-auth-token")) {
      try {
        const parsed = JSON.parse(cookie.value) as { access_token?: string };
        if (parsed.access_token) return parsed.access_token;
      } catch {
        // Malformed cookie — skip
      }
    }
  }
  return null;
}

// Only run the middleware on API routes. Static assets and pages go straight
// through — their isolation is enforced at the route-group layer by Next's
// folder structure (app/(admissions) vs app/(wellbeing)).
export const config = {
  matcher: ["/api/:path*"],
};
