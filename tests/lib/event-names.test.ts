/**
 * tests/lib/event-names.test.ts
 *
 * The PostHog event registry is the one place a product analytics
 * name is defined. Two things must be true forever:
 *
 *   1. No name matches the wellbeing ban list (`adie_*`, `wellbeing_*`,
 *      `crisis_*`, `mental_health_*`). Defense-in-depth: the PostHog
 *      wrapper throws on these at runtime, CI grep rejects them at
 *      build time, and this test rejects them at unit-test time.
 *   2. Names follow the `<surface>.<noun>.<verb>` convention (lowercase
 *      segments, each segment snake_case, at least two dots). A typo
 *      or a stray space here silently breaks PostHog funnel definitions
 *      because they key off literal strings — so we pin the shape.
 */

import { describe, expect, it } from "vitest";

import { EVENT, type EventName } from "@/lib/observability/event-names";

const BANNED_PREFIXES = ["adie_", "wellbeing_", "crisis_", "mental_health_"];

describe("EVENT registry", () => {
  const names = Object.values(EVENT) as EventName[];

  it("has at least one event (smoke)", () => {
    expect(names.length).toBeGreaterThan(0);
  });

  it("all event names are unique", () => {
    expect(new Set(names).size).toBe(names.length);
  });

  it("no event matches a wellbeing-banned prefix", () => {
    // This is the line-of-defence inside TS; the PostHog wrapper
    // enforces it at runtime and CI grep enforces it at build time.
    for (const name of names) {
      for (const prefix of BANNED_PREFIXES) {
        expect(name.startsWith(prefix)).toBe(false);
      }
    }
  });

  it("no event contains the substring 'adie', 'wellbeing', or 'crisis' anywhere", () => {
    // Stronger than just prefix checks — catches sneaky cases like
    // "user.adie_clicked" or "dashboard.crisis_button". If you need
    // to track wellbeing interactions, use the AuditEvent table,
    // never PostHog.
    for (const name of names) {
      expect(name).not.toMatch(/adie/i);
      expect(name).not.toMatch(/wellbeing/i);
      expect(name).not.toMatch(/crisis/i);
      expect(name).not.toMatch(/mental.?health/i);
    }
  });

  it("every name follows the <surface>.<noun>.<verb> convention", () => {
    // At least two dots, each segment is lowercase snake_case,
    // no leading/trailing whitespace, no empty segments.
    const shape = /^[a-z]+(_[a-z]+)*(\.[a-z]+(_[a-z]+)*){1,}$/;
    for (const name of names) {
      expect(name).toMatch(shape);
      // Must have at least 2 segments (one dot). Most events use 3
      // but `dashboard.viewed` is a legitimate 2-segment event.
      expect(name.split(".").length).toBeGreaterThanOrEqual(2);
    }
  });

  it("pins the required auth and CEF milestone events", () => {
    // These are referenced by PostHog funnels + the M1 activation
    // metric. Renaming them breaks dashboards. If you rename here,
    // rename in PostHog FIRST.
    expect(EVENT.AUTH_SIGNED_IN).toBe("auth.user.signed_in");
    expect(EVENT.AUTH_SIGNED_OUT).toBe("auth.user.signed_out");
    expect(EVENT.CEF_STEP_VIEWED).toBe("cef.step.viewed");
    expect(EVENT.CEF_STEP_COMPLETED).toBe("cef.step.completed");
    expect(EVENT.CEF_SUBMISSION_COMPLETED).toBe("cef.submission.completed");
  });
});
