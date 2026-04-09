/**
 * tests/lib/middleware-namespace.test.ts
 *
 * Locks the namespace classification table. Cross-schema isolation
 * starts here — if `namespaceFor("/api/wellbeing/foo")` ever stops
 * returning "wellbeing", the entire defense-in-depth stack collapses.
 *
 * The middleware module imports from `next/server` which is fine in
 * vitest because we only call the pure helper, not the request-handling
 * function.
 */

import { describe, expect, it } from "vitest";

import { namespaceFor } from "../../middleware";

describe("namespaceFor", () => {
  const cases: Array<[string, ReturnType<typeof namespaceFor>]> = [
    ["/api/admissions/health", "admissions"],
    ["/api/admissions/cef/submit", "admissions"],
    ["/api/admissions/auth/signin", "admissions"],
    ["/api/wellbeing/health", "wellbeing"],
    ["/api/wellbeing/adie/message", "wellbeing"],
    ["/api/commons/schools", "commons"],
    ["/api/anything-else", "public"],
    ["/", "public"],
    ["/dashboard", "public"],
    ["/api/admissionsX/spoof", "admissions"], // prefix-match is intentional
  ];

  it.each(cases)("classifies %s as %s", (path, expected) => {
    expect(namespaceFor(path)).toBe(expected);
  });

  it("never returns admissions for a wellbeing path", () => {
    const wellbeingPaths = [
      "/api/wellbeing",
      "/api/wellbeing/",
      "/api/wellbeing/foo",
      "/api/wellbeing/foo/bar/baz",
    ];
    for (const p of wellbeingPaths) {
      expect(namespaceFor(p)).toBe("wellbeing");
    }
  });

  it("never returns wellbeing for an admissions path", () => {
    const admissionsPaths = [
      "/api/admissions",
      "/api/admissions/",
      "/api/admissions/foo",
      "/api/admissions/cef/submit",
    ];
    for (const p of admissionsPaths) {
      expect(namespaceFor(p)).toBe("admissions");
    }
  });
});
