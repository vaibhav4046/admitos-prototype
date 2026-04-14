/**
 * Sentry server init.
 *
 * Loaded by Next.js automatically inside Node runtime route handlers,
 * RSCs, and middleware (with the `withSentryConfig` wrapper).
 *
 * Server-side init does the heavy lifting:
 *   - Higher trace sample rate than client (1.0 in dev, 0.2 in prod)
 *   - Tags every event with `app_env` and `service=unioffer-web`
 *   - Strips PII via the project-level scrubbing rules + a local
 *     `beforeSend` for the wellbeing isolation rule
 *
 * The wellbeing scrub here mirrors the one in `sentry.client.config.ts`
 * — defense in depth for the rule that no wellbeing content escapes
 * the database.
 */

import * as Sentry from "@sentry/nextjs";

const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;
const env = process.env.APP_ENV ?? "development";

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  environment: env,
  tracesSampleRate: env === "production" ? 0.2 : 1.0,
  initialScope: {
    tags: {
      service: "unioffer-web",
      app_env: env,
    },
  },
  beforeSend(event) {
    const extra = event.extra ?? {};
    if ("wellbeing.content" in extra) {
      delete (extra as Record<string, unknown>)["wellbeing.content"];
    }
    return event;
  },
});
