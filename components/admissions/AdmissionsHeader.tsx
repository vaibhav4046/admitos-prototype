/**
 * AdmissionsHeader — client wrapper around the base `<AppHeader>` primitive
 * that configures it for the admissions surface (student / parent /
 * counsellor views).
 *
 * Why this file exists:
 *
 *   - `AppHeader` is deliberately presentational. It needs `currentPath`
 *     and a sign-out callback to function, neither of which a pure server
 *     layout can provide without client hooks.
 *   - This wrapper is the one place we call `usePathname()` and the one
 *     place we POST to `/api/admissions/auth/signout`. The admissions
 *     layout stays a simple server component that hands us a pre-shaped
 *     `user` prop (computed from `getCurrentUser()` on the server).
 *   - Keeping the nav config here (and not in `AppHeader`) means any
 *     future counsellor / parent specific layout can pass a different
 *     nav list to the same primitive without branching inside it.
 *
 * **Wellbeing invariant:** this component must NEVER be imported from
 * `app/(wellbeing)/`. The wellbeing surface has its own (much calmer)
 * chrome — see the doc comment on `components/ui/AppHeader.tsx`. If you
 * catch yourself typing `import { AdmissionsHeader }` inside a wellbeing
 * file, stop and ask why.
 */

"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";

import { AppHeader, type AppHeaderUser } from "@/components/ui";
import { initialsFor } from "@/lib/utils";

import { navForRole } from "./nav-config";

export interface AdmissionsHeaderUserInput {
  displayName: string;
  email: string;
  role: "student" | "parent" | "counsellor" | "admin";
}

export interface AdmissionsHeaderProps {
  /**
   * Minimum user shape needed to render the header. Pass `null` for a
   * signed-out render (which shows a "Sign in" link instead of the
   * user chip). The caller is responsible for computing `displayName`
   * from the Supabase user — usually `user_metadata.full_name` or the
   * email local-part.
   */
  user: AdmissionsHeaderUserInput | null;
  /** Tenant or product name shown in the brand slot. Defaults to "AdmitOS". */
  brand?: string;
}

export function AdmissionsHeader({
  user,
  brand = "AdmitOS",
}: AdmissionsHeaderProps) {
  const pathname = usePathname() ?? "/";
  const router = useRouter();

  // Pure role→nav derivation lives in ./nav-config so the nav shape
  // can be unit-tested without jsdom. The memo here just caches the
  // result across re-renders with the same role.
  const nav = React.useMemo(() => navForRole(user?.role ?? null), [user?.role]);

  const headerUser: AppHeaderUser | null = React.useMemo(() => {
    if (!user) return null;
    return {
      displayName: user.displayName,
      email: user.email,
      // Prefer the display name for initials; fall back to the email
      // local-part if displayName is just an email or a single token.
      initials: initialsFor(user.displayName || user.email),
    };
  }, [user]);

  const [signingOut, setSigningOut] = React.useState(false);

  const onSignOut = React.useCallback(async () => {
    // Double-click guard — /signout is idempotent on the server but we
    // don't want two nav transitions racing.
    if (signingOut) return;
    setSigningOut(true);
    try {
      await fetch("/api/admissions/auth/signout", {
        method: "POST",
        credentials: "same-origin",
      });
    } catch {
      // Intentionally swallow — we still want to navigate the user to the
      // sign-in screen even if the network call failed. The server will
      // re-challenge them on their next request.
    } finally {
      // `router.refresh()` clears the server-rendered user chip, then we
      // send them to /signin. Order matters: refresh first so the next
      // render already reflects the signed-out state.
      router.refresh();
      router.push("/signin");
    }
  }, [router, signingOut]);

  return (
    <AppHeader
      brand={brand}
      brandHref="/dashboard"
      nav={nav}
      currentPath={pathname}
      user={headerUser}
      onSignOut={user ? onSignOut : undefined}
    />
  );
}
