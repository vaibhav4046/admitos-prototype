/**
 * Sentry wiring shell.
 *
 * This file intentionally does NOT call `Sentry.init`. That happens in
 * `sentry.server.config.ts` and `sentry.client.config.ts` at the root of
 * the repo — Next.js's Sentry wizard expects those files at those paths.
 *
 * What this module provides is a thin typed wrapper around the couple of
 * Sentry APIs we call from business logic (captureException, addBreadcrumb,
 * setUser) so that unit tests can mock a single import and we don't
 * sprinkle `@sentry/nextjs` imports across the whole tree.
 */

import "server-only";

import * as Sentry from "@sentry/nextjs";

export function captureError(
  error: unknown,
  context?: {
    // Accept the raw schema namespace used by `AuditNamespace` / the
    // per-schema service clients so callers don't have to remap
    // `"commons_db"` → `"commons"` at every call site. Sentry tags are
    // plain strings — no value in narrowing this further than the
    // actual set of schemas.
    namespace?: "admissions" | "wellbeing" | "commons_db";
    requestId?: string;
    userId?: string;
    extra?: Record<string, unknown>;
  }
) {
  try {
    Sentry.withScope((scope) => {
      if (context?.namespace) scope.setTag("namespace", context.namespace);
      if (context?.requestId) scope.setTag("request_id", context.requestId);
      if (context?.userId) scope.setUser({ id: context.userId });
      if (context?.extra) {
        for (const [k, v] of Object.entries(context.extra)) {
          scope.setExtra(k, v);
        }
      }
      Sentry.captureException(error);
    });
  } catch (e) {
    // Never let Sentry failures mask the original error.
    console.error("[sentry] captureError failed", e);
  }
}

export function addBreadcrumb(message: string, data?: Record<string, unknown>) {
  try {
    Sentry.addBreadcrumb({
      category: "unioffer",
      message,
      level: "info",
      data,
    });
  } catch {
    // same reason as above
  }
}
