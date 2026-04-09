/**
 * POST /api/admissions/auth/signout
 *
 * Placeholder sign-out endpoint. Like signin, this is wired now so
 * the front-end can develop against a stable contract while the real
 * Supabase session-clearing flow lands in M1 Week 2.
 *
 * Sign-out doesn't need a rate limit — there's no asymmetric work
 * an attacker could exploit — but it does need CSRF (otherwise
 * any cross-origin form submission could log someone out).
 */

import {
  instrumentedRoute,
  jsonCsrfFailure,
  jsonSuccess,
} from "@/lib/api";
import { verifyCsrf } from "@/lib/security/csrf";
import { log } from "@/lib/log";
import { AUDIT_ACTION } from "@/lib/audit";

export const POST = instrumentedRoute(
  { namespace: "admissions", route: "/api/admissions/auth/signout" },
  async (ctx) => {
    const csrf = verifyCsrf(ctx.request);
    if (!csrf.ok) {
      log.warn("auth.signout.csrf_failed", {
        requestId: ctx.requestId,
        reason: csrf.reason,
      });
      return jsonCsrfFailure(ctx.requestId, csrf.reason ?? "unknown");
    }

    // Audit row + INFO log are the only side effects right now;
    // the real cookie clearing happens once Supabase is wired.
    await ctx.audit({
      action: AUDIT_ACTION.AUTH_SIGNED_OUT,
      summary: "User signed out via /api/admissions/auth/signout",
    });

    log.info("auth.signout.success", { requestId: ctx.requestId });

    return jsonSuccess({ status: "ok" }, { requestId: ctx.requestId });
  }
);
