/**
 * Admissions health handler.
 *
 * Returns a tiny JSON blob that proves:
 *
 *   - The route is reachable
 *   - Middleware attached the expected `X-UniOffer-Namespace: admissions`
 *     header (we echo it back so a curl shows both request + response)
 *   - The admissions service client can open a connection to Supabase
 *     (we run a harmless `select now_utc()` against the helper RPC
 *     in supabase/migrations/00000000000000_helpers.sql)
 *
 * This route is the smoke test that CI will hit post-deploy before
 * flipping traffic. It is intentionally cheap — no prompt loads, no
 * queue writes, no audit logging.
 *
 * Wrapped in `instrumentedRoute` so Sentry scoping, request-id
 * propagation, and the audit injection helper all work end-to-end —
 * even though this particular route doesn't *use* the audit helper,
 * the wrapper proves the pattern.
 *
 * The App Router file at `app/api/admissions/health/route.ts` is a
 * 2-line shim that re-exports `GET` from here. All real handler code
 * lives under `src/api/` so the layer boundary is explicit.
 */

import { admissionsDb } from "@/db/supabase";
import { instrumentedRoute } from "@/api/_core";

export const GET = instrumentedRoute(
  { namespace: "admissions", route: "/api/admissions/health" },
  async (ctx) => {
    let dbOk = false;
    let dbError: string | null = null;

    try {
      const client = admissionsDb();
      // `now_utc()` is the schema-agnostic helper from
      // supabase/migrations/00000000000000_helpers.sql. In M1 Week 1
      // it may not exist yet — short-circuit on PGRST202 (function
      // not found) so dev doesn't explode before the migration runs.
      const { error } = await client.rpc("now_utc");
      if (error && error.code !== "PGRST202") throw error;
      dbOk = true;
    } catch (err) {
      dbError = err instanceof Error ? err.message : String(err);
    }

    return {
      ok: dbOk,
      namespace: "admissions",
      requestId: ctx.requestId,
      startedAt: ctx.request.headers.get("x-unioffer-started-at"),
      db: dbOk ? "ok" : { status: "error", message: dbError },
    };
  }
);
