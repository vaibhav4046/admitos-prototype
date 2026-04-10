/**
 * tests/lib/supabase-namespaces.test.ts
 *
 * Pins the physical isolation rules at the only place they're
 * declared: `lib/supabase/types.ts`. If you ever find yourself
 * deleting a test case here to make a feature work, STOP and
 * talk to Andy first — these rules are load-bearing for the
 * wellbeing boundary.
 *
 * The two invariants:
 *
 *   1. `wellbeing` route group can ONLY touch the `wellbeing` schema.
 *      No admissions, no commons_db — the wellbeing client never
 *      accidentally reaches into an admissions table and the
 *      admissions client never accidentally touches wellbeing.
 *
 *   2. `admissions` route group has NO access to `wellbeing` schema.
 *      It IS allowed to touch `commons_db` (that's where shared
 *      reference data like country codes lives).
 */

import { describe, expect, it } from "vitest";

import {
  ROUTE_GROUP_ALLOWED_SCHEMAS,
  SCHEMA_NAMESPACES,
} from "@/db/supabase";

describe("SCHEMA_NAMESPACES", () => {
  it("contains exactly the three V2 schemas in canonical order", () => {
    // Sorted check would let a reorder slide; we want the exact
    // declared order because that's what drives docs, tests, and
    // any downstream code that iterates.
    expect([...SCHEMA_NAMESPACES]).toEqual([
      "admissions",
      "wellbeing",
      "commons_db",
    ]);
  });

  it("does not accidentally include a public/internal/app schema", () => {
    // Anyone reintroducing `public` here should get flagged HARD —
    // the V2 spec explicitly bans it. Postgres's default `public`
    // schema stays empty of application tables.
    const banned = ["public", "internal", "app", "private", "default"];
    for (const name of banned) {
      expect(SCHEMA_NAMESPACES as readonly string[]).not.toContain(name);
    }
  });
});

describe("ROUTE_GROUP_ALLOWED_SCHEMAS", () => {
  it("wellbeing route group can ONLY touch the wellbeing schema", () => {
    // This is the defining rule of the whole M1 isolation story.
    // No commons_db leak, no accidental admissions read.
    expect(ROUTE_GROUP_ALLOWED_SCHEMAS.wellbeing).toEqual(["wellbeing"]);
  });

  it("admissions route group can touch admissions + commons_db but NOT wellbeing", () => {
    const allowed = ROUTE_GROUP_ALLOWED_SCHEMAS.admissions;
    expect(allowed).toContain("admissions");
    expect(allowed).toContain("commons_db");
    expect(allowed).not.toContain("wellbeing");
  });

  it("commons route group only touches commons_db", () => {
    expect(ROUTE_GROUP_ALLOWED_SCHEMAS.commons).toEqual(["commons_db"]);
  });

  it("covers all three route groups", () => {
    // If someone adds a new route group, this catches it —
    // they must also update middleware.ts isolation logic.
    expect(Object.keys(ROUTE_GROUP_ALLOWED_SCHEMAS).sort()).toEqual([
      "admissions",
      "commons",
      "wellbeing",
    ]);
  });

  it("every allowed schema across all route groups is a real SCHEMA_NAMESPACES value", () => {
    const legal = new Set<string>(SCHEMA_NAMESPACES);
    for (const [_group, allowed] of Object.entries(
      ROUTE_GROUP_ALLOWED_SCHEMAS
    )) {
      for (const schema of allowed) {
        expect(legal.has(schema)).toBe(true);
      }
    }
  });

  it("the wellbeing schema does NOT appear in the admissions allow-list", () => {
    // Belt-and-braces: redundant with the admissions test above but
    // it's the single most important invariant of the whole system.
    const admissionsAllowed = new Set<string>(
      ROUTE_GROUP_ALLOWED_SCHEMAS.admissions
    );
    expect(admissionsAllowed.has("wellbeing")).toBe(false);
  });
});
