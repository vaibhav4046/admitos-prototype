/**
 * Admissions route group layout.
 *
 * Everything under `(admissions)` — the CEF wizard, counsellor dashboard,
 * essay feedback, ARE/School Readiness pages — gets this layout. It is
 * the one place admissions-scope providers are mounted:
 *
 *   - PostHog (product telemetry) — ALLOWED here, BANNED in `(wellbeing)`
 *   - Sentry scope tag `namespace=admissions`
 *   - Feature flag provider scoped to the student role
 *
 * For M1 we render the shared chrome (`<AdmissionsHeader>`) and the
 * children; provider wiring lands in a follow-up commit. The file MUST
 * exist so Next.js route group resolution treats it as its own layout
 * boundary, even when there is nothing interesting to provide yet.
 *
 * Why this is an async server component:
 *   - We call `getCurrentUser()` once at layout level and pass a
 *     pre-shaped user object into the client-side header wrapper. This
 *     keeps every page underneath from redundantly re-reading the
 *     Supabase session on its own.
 *   - `getCurrentUser()` returns `null` for signed-out requests (rather
 *     than throwing) so the layout can still render — the individual
 *     routes are responsible for calling `requireUser()` / `requireRole()`
 *     when they need to enforce auth. The layout just shows a signed-out
 *     header in that case.
 */

import type { ReactNode } from "react";

import { AdmissionsHeader } from "@/components/admissions";
import { getCurrentUser } from "@/services/auth/server";
import { displayNameFromEmail } from "@/lib/utils";

/**
 * Collapse a Supabase `AuthUser` into the minimum shape the header needs.
 *
 * We title-case the email local-part into a best-guess display name for
 * MVP — richer profile data (full name, avatar URL) is wired up once the
 * onboarding flow lands. Using `displayNameFromEmail` keeps the nav
 * header looking sensible for magic-link signups where we never
 * captured a name ("vaibhav.lalwani@x.com" → "Vaibhav Lalwani"), and
 * the helper is unit-tested in `tests/lib/format.test.ts` so future
 * changes to the derivation rule are pinned.
 */
function deriveHeaderUser(
  user: Awaited<ReturnType<typeof getCurrentUser>>
): React.ComponentProps<typeof AdmissionsHeader>["user"] {
  if (!user) return null;
  const displayName = displayNameFromEmail(user.email) || user.email;
  return {
    displayName,
    email: user.email,
    role: user.role,
  };
}

export default async function AdmissionsLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getCurrentUser();
  const headerUser = deriveHeaderUser(user);

  return (
    <div
      data-unioffer-namespace="admissions"
      // V3: bg/fg driven by --bg / --fg tokens (globals.css). When
      // ThemeInit sets data-theme='dark' on <html>, the admissions
      // dashboard automatically flips to Andy's canonical #0a3042.
      // The min-h-screen Tailwind utility stays — only the colour
      // anchors move to tokens.
      className="min-h-screen"
      style={{ background: "var(--bg)", color: "var(--fg)" }}
    >
      <AdmissionsHeader user={headerUser} />
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  );
}
