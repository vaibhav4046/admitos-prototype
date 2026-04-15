/**
 * Wellbeing route group layout.
 *
 * ### PHYSICAL ISOLATION — READ BEFORE EDITING
 *
 * Everything under `(wellbeing)` is considered PHI-adjacent and lives
 * under a different set of operational rules from the rest of the app:
 *
 *   1. NO PostHog. No product analytics. No client-side telemetry of
 *      any kind. The `capture()` helper in lib/observability/posthog.ts
 *      explicitly bans events that start with `adie_*`, `wellbeing_*`,
 *      `crisis_*`, or `mental_health_*` — a `throw` guards this even
 *      if someone forgets.
 *
 *   2. NO shared providers from `(admissions)`. This layout is a fresh
 *      provider boundary. The route-group pattern in Next.js App Router
 *      gives us that for free: `(admissions)/layout.tsx` and
 *      `(wellbeing)/layout.tsx` compose with the root layout but NOT
 *      with each other.
 *
 *   3. All API calls MUST go to `/api/wellbeing/*`. The middleware
 *      guard in `middleware.ts` rejects any wellbeing request whose
 *      `referer` header doesn't contain `/wellbeing/`.
 *
 *   4. Writes go to the `wellbeing` schema only, via
 *      `wellbeingDb()` in `lib/supabase/service-clients.ts`. Never mix
 *      schemas in a single mutation.
 *
 *   5. The styling is deliberately different (teal accent instead of
 *      indigo) so that even a screenshot makes clear which surface is
 *      which.
 */

import type { ReactNode } from "react";
import Link from "next/link";

export default function WellbeingLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Calm chrome — deliberately minimal. NO AdmissionsHeader, NO nav
  // bar with multiple destinations, NO PostHog provider, NO Sentry
  // admissions scope tag. The wellbeing surface is its own world; the
  // user got here on purpose, and the visual lack of "where do you
  // want to go next" is the point. The only escape hatch is the small
  // brand link in the top-left, which goes back to the admissions
  // index — and even that is styled to feel like a quiet exit, not a
  // call to action.
  return (
    <div
      data-unioffer-namespace="wellbeing"
      className="min-h-screen bg-gradient-to-b from-wellbeing-50 via-white to-white text-slate-900"
    >
      <header
        role="banner"
        className="border-b border-wellbeing-100/80 bg-white/60 backdrop-blur"
      >
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
          <Link
            href="/adie"
            className="inline-flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wellbeing-700 focus-visible:ring-offset-2"
            aria-label="Adie home"
          >
            <span
              aria-hidden="true"
              className="grid h-8 w-8 place-items-center rounded-full bg-wellbeing-500 text-sm font-semibold text-white"
            >
              A
            </span>
            <span className="text-base font-semibold tracking-tight text-wellbeing-900">
              Adie
            </span>
          </Link>
          <Link
            href="/app"
            className="rounded-md text-xs font-medium text-slate-500 underline-offset-2 transition-colors hover:text-slate-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wellbeing-700 focus-visible:ring-offset-2"
          >
            Back to admissions
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        {children}
      </main>
    </div>
  );
}
