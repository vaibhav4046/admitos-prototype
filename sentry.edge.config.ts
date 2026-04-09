/**
 * Sentry edge init.
 *
 * Loaded by Next.js inside the Edge runtime — middleware, edge route
 * handlers. The edge runtime is a much smaller V8 isolate so we keep
 * this config tiny: DSN, environment, sample rate, the wellbeing
 * scrub. No integrations, no instrumentation hooks.
 */

import * as Sentry from "@sentry/nextjs";

const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;
const env = process.env.APP_ENV ?? "development";

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  environment: env,
  tracesSampleRate: env === "production" ? 0.2 : 1.0,
  beforeSend(event) {
    const extra = event.extra ?? {};
    if ("wellbeing.content" in extra) {
      delete (extra as Record<string, unknown>)["wellbeing.content"];
    }
    return event;
  },
});
