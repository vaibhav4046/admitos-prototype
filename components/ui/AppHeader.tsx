/**
 * AppHeader — top-of-page nav bar for the admissions surface.
 *
 * Deliberately presentational only:
 *
 *   - Takes the current user as a prop (or null for signed-out).
 *   - Takes the nav items as a prop so the admissions layout and
 *     the counsellor layout can pass different lists.
 *   - Accepts an `onSignOut` callback — the caller wires it to the
 *     actual `/api/admissions/auth/signout` POST. This component
 *     never imports `@/lib/supabase` or `@/lib/auth` so it can be
 *     rendered in a story, a test, or a Storybook-like preview
 *     without dragging the server runtime in.
 *
 * **Wellbeing rule:** do NOT reuse this component inside
 * `app/(wellbeing)/`. The wellbeing surface is deliberately calm
 * and minimal — no nav bar, no sign-out button, no user name
 * glitter. If you ever need a header on a wellbeing page, build
 * a separate primitive in components/adie/ instead of extending
 * this one. Cross-surface reuse is the first step toward leaking
 * admissions chrome into a mental-health surface.
 *
 * Accessibility:
 *   - Renders a real `<header>` with role="banner".
 *   - Nav items are a `<nav aria-label="Main">` list.
 *   - Active item gets `aria-current="page"`.
 */

"use client";

import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/ui/cn";
import { Button } from "./Button";

export interface AppHeaderUser {
  displayName: string;
  email: string;
  /** Two-letter initials for the avatar circle. Computed by the caller. */
  initials: string;
}

export interface AppHeaderNavItem {
  label: string;
  href: string;
  /** Match strategy — if true, any path starting with `href` counts as active. */
  matchPrefix?: boolean;
}

export interface AppHeaderProps {
  /** Brand/logo area label — usually "AdmitOS" or the tenant name. */
  brand: string;
  /** Path the brand link points to (usually "/dashboard"). */
  brandHref?: string;
  /** Nav items to show in the centre. */
  nav: readonly AppHeaderNavItem[];
  /** Current pathname, used to mark the active nav item. */
  currentPath: string;
  /** Signed-in user, or null for the signed-out state. */
  user: AppHeaderUser | null;
  /** Called when the user clicks "Sign out". Caller is responsible for the POST. */
  onSignOut?: () => void;
  className?: string;
}

function isActive(path: string, item: AppHeaderNavItem): boolean {
  if (item.matchPrefix) {
    return path === item.href || path.startsWith(`${item.href}/`);
  }
  return path === item.href;
}

export function AppHeader({
  brand,
  brandHref = "/dashboard",
  nav,
  currentPath,
  user,
  onSignOut,
  className,
}: AppHeaderProps) {
  return (
    <header
      role="banner"
      className={cn(
        "sticky top-0 z-40 w-full border-b border-slate-200 bg-white/90 backdrop-blur",
        className
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Link
          href={brandHref}
          className="inline-flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
          aria-label={`${brand} home`}
        >
          <span
            aria-hidden="true"
            className="grid h-8 w-8 place-items-center rounded-lg bg-slate-900 text-sm font-semibold text-white shadow-card transition-transform duration-200 ease-out group-hover:scale-105"
          >
            A
          </span>
          <span className="text-sm font-semibold tracking-tight text-slate-900">
            {brand}
          </span>
        </Link>

        <nav aria-label="Main" className="hidden flex-1 sm:block">
          <ul className="flex items-center gap-1">
            {nav.map((item) => {
              const active = isActive(currentPath, item);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2",
                      active
                        ? "bg-slate-900 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {user ? (
            <UserMenu user={user} onSignOut={onSignOut} />
          ) : (
            <Link
              href="/signin"
              className="rounded-md text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

/**
 * Tiny inline user chip — avatar circle + name + a sign-out button.
 * Exported only for testing; the production surface uses `AppHeader`.
 */
export function UserMenu({
  user,
  onSignOut,
}: {
  user: AppHeaderUser;
  onSignOut?: () => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="hidden text-right sm:block">
        <div className="text-xs font-semibold text-slate-900">
          {user.displayName}
        </div>
        <div className="text-[0.7rem] leading-tight text-slate-500">
          {user.email}
        </div>
      </div>
      <div
        aria-hidden="true"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white ring-2 ring-white shadow-card"
      >
        {user.initials}
      </div>
      {onSignOut ? (
        <Button variant="ghost" size="sm" onClick={onSignOut}>
          Sign out
        </Button>
      ) : null}
    </div>
  );
}
