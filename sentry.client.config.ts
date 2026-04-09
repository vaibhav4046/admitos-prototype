/**
 * Sentry client init.
 *
 * Loaded by Next.js automatically on the browser side. Pulls the DSN
 * from `NEXT_PUBLIC_SENTRY_DSN` and the release/environment from the
 * standard Sentry env vars. We deliberately keep the client config
 * minimal — heavy lifting (request scoping, namespace tagging) lives
 * on the server side.
 *
 * ### Wellbeing rule
 *
 * Sentry IS allowed in the wellbeing route group, unlike PostHog. The
 * reason: errors must be visible regardless of the user surface. But
 * we MUST keep error payloads scrubbed of any chat content — the
 * `beforeSend` hook drops anything tagged with the `wellbeing.content`
 * extra key.
 */

import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  environment: process.env.NEXT_PUBLIC_APP_ENV ?? "development",
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,

  beforeSend(event) {
    // Drop any event whose extras include the `wellbeing.content` key.
    // No wellbeing user content ever leaves the DB, including via Sentry.
    const extra = event.extra ?? {};
    if ("wellbeing.content" in extra) {
      delete (extra as Record<string, unknown>)["wellbeing.content"];
    }
    return event;
  },
});
