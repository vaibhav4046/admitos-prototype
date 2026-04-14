/**
 * tests/lib/role-route-acl.test.ts
 *
 * Pins `ROLE_ROUTE_ACL` from `src/services/auth/types.ts`. This map is the
 * second-to-last line of defence in UniOffer's permission model:
 *
 *   1. `middleware.ts`    — physical namespace isolation (admissions
 *                            API can't read wellbeing tables ever).
 *   2. `ROLE_ROUTE_ACL`   — which *roles* are allowed into a given
 *                            route group. This file.
 *   3. `requireRole(...)` — per-route extra role gating for sensitive
 *                            actions (e.g. counsellor-only endpoints).
 *   4. Supabase RLS       — the DB layer final check.
 *
 * If anyone silently expands the wellbeing allow-list to include
 * counsellors, the whole "Adie chat is student-only and no counsellor
 * ever reads raw messages" promise breaks. This test is the
 * exact-string tripwire that catches that kind of change in review.
 */

import { describe, expect, it } from "vitest";

import { ROLE_ROUTE_ACL, type UserRole } from "@/services/auth/types";

const ALL_ROLES: readonly UserRole[] = [
  "student",
  "parent",
  "counsellor",
  "admin",
] as const;

describe("ROLE_ROUTE_ACL", () => {
  it("covers exactly the three route groups we ship", () => {
    expect(Object.keys(ROLE_ROUTE_ACL).sort()).toEqual([
      "admin",
      "admissions",
      "wellbeing",
    ]);
  });

  it("admissions is readable by every role (student, parent, counsellor, admin)", () => {
    const allowed = ROLE_ROUTE_ACL.admissions;
    for (const role of ALL_ROLES) {
      expect(allowed).toContain(role);
    }
  });

  it("wellbeing is student-only — this is a load-bearing invariant", () => {
    // If this test fails because someone added a role to the wellbeing
    // allow-list, STOP. Do not silently update the test. The wellbeing
    // surface is student-only by charter; counsellors read aggregated
    // signals via a separate admin surface, never the raw chat. Any
    // change here needs an explicit Thread 4 decision.
    expect([...ROLE_ROUTE_ACL.wellbeing]).toEqual(["student"]);
  });

  it("wellbeing does NOT include counsellor, admin, or parent", () => {
    // Triple-checked because the consequence of a regression here is
    // leaking mental-health chat into the admissions surface.
    const allowed = ROLE_ROUTE_ACL.wellbeing;
    expect(allowed).not.toContain("counsellor");
    expect(allowed).not.toContain("admin");
    expect(allowed).not.toContain("parent");
  });

  it("admin is counsellor + admin only — no students or parents", () => {
    const allowed = ROLE_ROUTE_ACL.admin;
    expect(allowed).toContain("counsellor");
    expect(allowed).toContain("admin");
    expect(allowed).not.toContain("student");
    expect(allowed).not.toContain("parent");
  });

  it("every role referenced is a member of the UserRole union", () => {
    for (const group of Object.values(ROLE_ROUTE_ACL)) {
      for (const role of group) {
        expect(ALL_ROLES).toContain(role);
      }
    }
  });

  it("every route group has at least one allowed role", () => {
    // An empty allow-list would lock every user out of that group,
    // which is never what we want — if a surface is closed, it should
    // be removed from the map entirely, not silently emptied.
    for (const [group, allowed] of Object.entries(ROLE_ROUTE_ACL)) {
      expect(allowed.length, `group: ${group}`).toBeGreaterThan(0);
    }
  });

  it("every allow-list is free of duplicates", () => {
    for (const [group, allowed] of Object.entries(ROLE_ROUTE_ACL)) {
      expect(
        new Set(allowed).size,
        `group: ${group}`
      ).toBe(allowed.length);
    }
  });
});
