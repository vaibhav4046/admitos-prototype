/**
 * Pure nav-config helpers for the admissions surface.
 *
 * Extracted from `AdmissionsHeader.tsx` so the role-gating logic (who
 * sees the Counsellor link) can be unit-tested in a plain Node vitest
 * environment — no React render, no jsdom. The React component just
 * calls `navForRole()` and memoizes the result.
 *
 * ### Why a separate file
 *
 * `AdmissionsHeader.tsx` is marked `"use client"` and pulls in `next/
 * navigation` (`usePathname`, `useRouter`). Importing those from a
 * test file adds a jsdom dep we don't want in M1. Keeping the pure
 * parts in this sibling file gives us test coverage on the bits that
 * actually matter (which roles see which links) without the render
 * cost.
 */

import type { AppHeaderNavItem } from "@/components/ui";
import type { UserRole } from "@/services/auth/types";

/**
 * Base nav items every signed-in admissions user sees. In the same
 * order the header renders them left-to-right.
 */
export const ADMISSIONS_NAV_BASE: readonly AppHeaderNavItem[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "College Essay", href: "/cef", matchPrefix: true },
  { label: "Adie", href: "/adie", matchPrefix: true },
] as const;

/**
 * Extra nav items visible only to counsellor / admin roles. Students
 * and parents NEVER see these — the items also have their own
 * `requireRole(...)` gate on the server, this is just the UI hint.
 */
export const ADMISSIONS_NAV_COUNSELLOR: readonly AppHeaderNavItem[] = [
  { label: "Counsellor", href: "/counsellor", matchPrefix: true },
] as const;

/**
 * Compute the nav list for the given role. Signed-out callers pass
 * `null` and get the base list — the header uses this to render a
 * "Sign in" link instead of a user chip, but the nav items themselves
 * are the same so the layout doesn't jump on auth state changes.
 */
export function navForRole(
  role: UserRole | null
): readonly AppHeaderNavItem[] {
  if (role === "counsellor" || role === "admin") {
    return [...ADMISSIONS_NAV_BASE, ...ADMISSIONS_NAV_COUNSELLOR];
  }
  return ADMISSIONS_NAV_BASE;
}
