/**
 * /signin — sign-in landing page.
 *
 * This route deliberately lives OUTSIDE the `(admissions)` and
 * `(wellbeing)` route groups:
 *
 *   - A signed-out user has no surface affiliation yet. Putting
 *     `/signin` inside `(admissions)` would mean the admissions layout
 *     chrome (nav bar with a signed-out user chip) wraps the sign-in
 *     card, which is ugly and drags the PostHog provider in for what
 *     should be a completely cold render.
 *   - The sign-in page therefore renders only the root `<layout>` —
 *     no PostHog, no Sentry admissions scope tag, no AdmissionsHeader.
 *
 * ### Supabase OAuth wiring (TODO M1 Week 2)
 *
 * The Google / magic-link buttons below POST to
 * `/api/admissions/auth/signin`, which currently returns 501. When
 * the Supabase OAuth handshake is wired:
 *
 *   1. Google button → `supabase.auth.signInWithOAuth({ provider: "google" })`
 *      via the browser client. The redirect flow lands back here on
 *      `?next=...` and the route handler completes the exchange.
 *   2. Magic link button → `supabase.auth.signInWithOtp({ email })`.
 *      A cooldown + rate-limit check prevents abuse.
 *
 * Until then this page is a pure visual stub — clicking either button
 * gets a friendly "not yet wired" message from the server.
 *
 * ### Wellbeing firewall
 *
 * Nothing on this page imports from `lib/wellbeing/` or `components/adie/`.
 * The wellbeing surface has its own minimal sign-in experience wired
 * through its own route handler; we never let an admissions sign-in
 * flow drop a user straight into the wellbeing chat, because that
 * would leak admissions UX decisions (consent copy, nav chrome) onto
 * a safety-critical surface.
 */

import Link from "next/link";

import { Button, Card, CardBody, CardFooter, CardHeader, CardTitle } from "@/components/ui";

// We intentionally don't import the Supabase browser client yet — this
// page is a visual-only stub for M1 Week 1 and we don't want to bundle
// the full auth SDK until the real wiring lands next week.
//
// Because the real OAuth handshake isn't ready, every button is
// `disabled` and the card shows a banner explaining why. Once the
// Supabase OAuth flow lands (M1 Week 2), we'll drop the banner, remove
// the `disabled` attributes, and turn this into a client component
// that calls the browser Supabase client directly (which handles the
// CSRF + state param + redirect internally).

export const metadata = {
  title: "Sign in — UniOffer",
  description: "Sign in to continue your UniOffer admissions journey.",
};

export default function SignInPage() {
  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-slate-50">
      {/* Subtle background flourish — pure CSS, no images. Sits behind
          the card and is purely decorative (aria-hidden). The two
          radial gradients give the page a soft, optimistic feel without
          competing with the card content. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 50% at 20% 0%, rgba(99,102,241,0.10) 0%, rgba(99,102,241,0) 70%), radial-gradient(50% 40% at 80% 100%, rgba(14,165,166,0.08) 0%, rgba(14,165,166,0) 70%)",
        }}
      />

      <div className="mx-auto flex min-h-screen max-w-md flex-col items-stretch justify-center px-4 py-12">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
            aria-label="UniOffer home"
          >
            {/* Canonical V2 lockup — wordmark SVG carries the type.  */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/v2/unioffer-wordmark-greencat-dark.svg"
              alt="UniOffer"
              className="h-8 w-auto"
              width={176}
              height={32}
              draggable={false}
            />
          </Link>
          <p className="mt-3 text-sm text-slate-600">
            The decision-stage operating system for UK university applications.
          </p>
        </div>

        <Card className="w-full shadow-card">
          <CardHeader className="border-b-0 px-6 pt-6">
            <CardTitle className="text-xl">Sign in to UniOffer</CardTitle>
            <p className="mt-1 text-sm text-slate-600">
              Use the Google account your counsellor invited you with, or
              enter your email for a one-time sign-in link.
            </p>
          </CardHeader>
          <CardBody className="px-6 pb-6 pt-2">
            <div
              role="status"
              aria-live="polite"
              className="mt-4 flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-xs text-slate-700"
            >
              <span
                aria-hidden="true"
                className="mt-0.5 inline-block h-2 w-2 shrink-0 rounded-full bg-slate-900"
              />
              <p className="leading-relaxed">
                <span className="font-semibold">Preview mode.</span>{" "}
                Continue below to explore the demo workspace — Google
                OAuth lands in M1 Week 2.
              </p>
            </div>

            <div className="mt-6 space-y-3">
              <Link
                href="/app"
                className="inline-block w-full rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
              >
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  className="w-full"
                >
                  Continue with Google
                </Button>
              </Link>

              <div className="flex items-center gap-3 text-xs uppercase tracking-wider text-slate-400">
                <div className="h-px flex-1 bg-slate-200" />
                or
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <label
                htmlFor="email"
                className="block text-xs font-medium text-slate-700"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
              />
              <Link
                href="/app"
                className="inline-block w-full rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
              >
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  className="w-full"
                >
                  Email me a sign-in link
                </Button>
              </Link>
            </div>
          </CardBody>
          <CardFooter className="rounded-b-xl bg-slate-50 px-6 py-4">
            <p className="text-xs leading-relaxed text-slate-500">
              By signing in you agree to the UniOffer student privacy notice.
              The wellbeing space (
              <Link
                href="/adie"
                className="font-medium text-slate-700 underline decoration-slate-300 underline-offset-2 hover:text-slate-900 hover:decoration-slate-500"
              >
                Adie
              </Link>
              ) is governed by a{" "}
              <Link
                href="/adie/privacy"
                className="font-medium text-slate-700 underline decoration-slate-300 underline-offset-2 hover:text-slate-900 hover:decoration-slate-500"
              >
                separate privacy policy
              </Link>{" "}
              and never shares content with your admissions record.
            </p>
          </CardFooter>
        </Card>

        <p className="mt-6 text-center text-xs text-slate-500">
          Need help? Email{" "}
          <a
            href="mailto:hello@adropedu.com"
            className="font-medium text-slate-700 underline decoration-slate-300 underline-offset-2 hover:text-slate-900 hover:decoration-slate-500"
          >
            hello@adropedu.com
          </a>
          .
        </p>
      </div>
    </div>
  );
}
