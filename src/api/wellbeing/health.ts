/**
 * Wellbeing health handler.
 *
 * Mirror of the admissions health handler, but against the wellbeing
 * service client. The middleware guard in `middleware.ts` already
 * checks that the referer starts with `/wellbeing/` for this path,
 * so if a request reaches this handler the isolation invariants are
 * already in place.
 *
 * We do NOT use PostHog, LangSmith, or any admissions-scope
 * observability in this handler. Sentry breadcrumbs are allowed via
 * the `instrumentedRoute` wrapper, and even those must not include
 * any user content (the `wellbeing.content` extra key is scrubbed
 * by the `beforeSend` hook in sentry.*.config.ts).
 *
 * The App Router file at `app/api/wellbeing/health/route.ts` is a
 * 2-line shim that re-exports `GET` from here.
 */

import { wellbeingDb } from "@/db/supabase";
import { instrumentedRoute } from "@/api/_core";

export const GET = instrumentedRoute(
  { namespace: "wellbeing", route: "/api/wellbeing/health" },
  async (ctx) => {
    let dbOk = false;
    let dbError: string | null = null;

    try {
      const client = wellbeingDb();
      const { error } = await client.rpc("now_utc");
      if (error && error.code !== "PGRST202") throw error;
      dbOk = true;
    } catch (err) {
      dbError = err instanceof Error ? err.message : String(err);
    }

    return {
      ok: dbOk,
      namespace: "wellbeing",
      requestId: ctx.requestId,
      startedAt: ctx.request.headers.get("x-unioffer-started-at"),
      db: dbOk ? "ok" : { status: "error", message: dbError },
    };
  }
);
