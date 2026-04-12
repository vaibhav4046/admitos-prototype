/**
 * tests/components/nav-config.test.ts
 *
 * Pins the admissions nav gating. The Counsellor link is role-gated
 * at the server (`requireRole("counsellor" | "admin")` on the actual
 * route handlers) but it's also role-gated in the UI so that students
 * and parents don't see a tab they can't open. This test is the line
 * that enforces the UI gate.
 *
 * The helper lives in `components/admissions/nav-config.ts` as a pure
 * function specifically so it can be tested in a plain Node vitest
 * environment — no jsdom, no React render.
 */

import { describe, expect, it } from "vitest";

import {
  ADMISSIONS_NAV_BASE,
  ADMISSIONS_NAV_COUNSELLOR,
  navForRole,
} from "@/components/admissions/nav-config";

describe("ADMISSIONS_NAV_BASE", () => {
  it("contains exactly Dashboard / College Essay / Adie in order", () => {
    expect(ADMISSIONS_NAV_BASE.map((i) => i.label)).toEqual([
      "Dashboard",
      "College Essay",
      "Adie",
    ]);
  });

  it("uses matchPrefix for /cef and /adie (step sub-routes), but not for /dashboard", () => {
    const byHref = Object.fromEntries(
      ADMISSIONS_NAV_BASE.map((i) => [i.href, i])
    );
    expect(byHref["/dashboard"]?.matchPrefix).toBeFalsy();
    expect(byHref["/cef"]?.matchPrefix).toBe(true);
    expect(byHref["/adie"]?.matchPrefix).toBe(true);
  });

  it("points every link at an absolute admissions-surface path", () => {
    for (const item of ADMISSIONS_NAV_BASE) {
      expect(item.href.startsWith("/")).toBe(true);
      // No explicit wellbeing namespace leakage in the admissions nav.
      // `/adie` itself is the wellbeing cross-link and is expected.
      expect(item.href).not.toMatch(/\/wellbeing/);
    }
  });
});

describe("ADMISSIONS_NAV_COUNSELLOR", () => {
  it("contains the Counsellor link with matchPrefix", () => {
    expect(ADMISSIONS_NAV_COUNSELLOR).toEqual([
      { label: "Counsellor", href: "/counsellor", matchPrefix: true },
    ]);
  });
});

describe("navForRole", () => {
  it("returns just the base list for students", () => {
    expect(navForRole("student")).toEqual(ADMISSIONS_NAV_BASE);
  });

  it("returns just the base list for parents", () => {
    expect(navForRole("parent")).toEqual(ADMISSIONS_NAV_BASE);
  });

  it("returns just the base list for signed-out users (null)", () => {
    expect(navForRole(null)).toEqual(ADMISSIONS_NAV_BASE);
  });

  it("appends the counsellor link for counsellors", () => {
    const nav = navForRole("counsellor");
    expect(nav.map((i) => i.label)).toEqual([
      "Dashboard",
      "College Essay",
      "Adie",
      "Counsellor",
    ]);
  });

  it("appends the counsellor link for admins", () => {
    const nav = navForRole("admin");
    expect(nav.map((i) => i.label)).toEqual([
      "Dashboard",
      "College Essay",
      "Adie",
      "Counsellor",
    ]);
  });

  it("does not mutate the base arrays", () => {
    const before = [...ADMISSIONS_NAV_BASE];
    navForRole("counsellor");
    navForRole("admin");
    navForRole("student");
    expect([...ADMISSIONS_NAV_BASE]).toEqual(before);
  });

  it("never returns the Counsellor link for students or parents", () => {
    // This is the load-bearing assertion. If a regression adds the link
    // for non-counsellor roles, students will see a nav tab they can't
    // open — and the server will 403 them, which is confusing. The
    // server-side guard in `requireRole` is still the security boundary,
    // but the UX is supposed to never even show the link.
    for (const role of ["student", "parent"] as const) {
      const nav = navForRole(role);
      expect(nav.find((i) => i.label === "Counsellor")).toBeUndefined();
      expect(nav.find((i) => i.href === "/counsellor")).toBeUndefined();
    }
  });
});
