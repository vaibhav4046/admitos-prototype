/**
 * PostHog wiring shell.
 *
 * PostHog receives PRODUCT events only. NEVER send wellbeing events here
 * — that data lives in the wellbeing schema and must not leave our DB.
 *
 * Examples of OK events: cef_step_completed, essay_uploaded, dashboard_viewed.
 * Examples of BANNED events: adie_message_sent, crisis_flag_raised,
 *   wellbeing_check_in_submitted.
 *
 * The `assertAllowedEvent` guard below enforces this at runtime so that
 * a mistake on a PR doesn't silently leak wellbeing telemetry to PostHog.
 */

import "server-only";

import { PostHog } from "posthog-node";

import { env } from "@/lib/env";

let _client: PostHog | null = null;

function client() {
  if (_client) return _client;
  _client = new PostHog(env.POSTHOG_API_KEY, {
    host: env.POSTHOG_HOST,
    flushAt: 20,
    flushInterval: 10_000,
  });
  return _client;
}

const BANNED_EVENT_PREFIXES = [
  "adie_",
  "wellbeing_",
  "crisis_",
  "mental_health_",
];

function assertAllowedEvent(event: string) {
  for (const bad of BANNED_EVENT_PREFIXES) {
    if (event.startsWith(bad)) {
      throw new Error(
        `PostHog event "${event}" starts with banned prefix "${bad}". Wellbeing telemetry MUST NOT leave the DB.`
      );
    }
  }
}

export function capture(
  event: string,
  props: {
    distinctId: string;
    properties?: Record<string, unknown>;
  }
) {
  assertAllowedEvent(event);
  try {
    client().capture({
      distinctId: props.distinctId,
      event,
      properties: props.properties,
    });
  } catch (e) {
    console.error("[posthog] capture failed", e);
  }
}

export async function shutdown() {
  if (_client) {
    await _client.shutdown();
    _client = null;
  }
}
