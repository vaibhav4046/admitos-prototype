/**
 * The PostHog wellbeing-event ban is the application-layer enforcement
 * of the "no wellbeing telemetry leaves the DB" rule. The middleware
 * and route-group separation are the structural enforcement; this
 * `throw`-on-banned-prefix is the safety net for the case where
 * somebody adds a `capture()` call from inside a wellbeing module.
 *
 * The test imports the source through a contained dynamic import so
 * that the env validator inside `lib/observability/posthog.ts` doesn't
 * blow up when running in CI without a real PostHog key — we only need
 * to exercise the prefix check, not the network client.
 */

import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/env", () => ({
  env: {
    APP_ENV: "test",
    NEXT_PUBLIC_POSTHOG_KEY: "phc_dummy",
    NEXT_PUBLIC_POSTHOG_HOST: "https://example.invalid",
  },
}));

describe("posthog capture() banned-event prefixes", () => {
  it.each([
    ["adie_message_sent"],
    ["wellbeing_session_started"],
    ["crisis_flag_raised"],
    ["mental_health_score_updated"],
  ])("rejects %s", async (event) => {
    const { capture } = await import("@/lib/observability/posthog");
    expect(() =>
      capture(event, { distinctId: "u_test", properties: {} })
    ).toThrow(/banned prefix/);
  });

  it.each([
    ["cef_step_saved"],
    ["essay_uploaded"],
    ["page_viewed"],
  ])("allows %s", async (event) => {
    const { capture } = await import("@/lib/observability/posthog");
    // It's allowed to throw at the network layer in this stub —
    // we only care that the prefix check passes.
    let prefixError: unknown = null;
    try {
      capture(event, { distinctId: "u_test", properties: {} });
    } catch (e) {
      if (/banned prefix/.test((e as Error).message)) prefixError = e;
    }
    expect(prefixError).toBeNull();
  });
});
