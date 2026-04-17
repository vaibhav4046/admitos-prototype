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

import { Card, CardBody, CardFooter, CardHeader, CardTitle } from "@/components/ui";

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
    <div
      className="relative isolate min-h-screen overflow-hidden"
      style={{ background: "var(--bg)", color: "var(--fg)" }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 50% at 20% 0%, rgba(100,238,133,0.10) 0%, rgba(100,238,133,0) 70%), radial-gradient(50% 40% at 80% 100%, rgba(124,58,237,0.12) 0%, rgba(124,58,237,0) 70%)",
        }}
      />

      <div className="mx-auto flex min-h-screen max-w-md flex-col items-stretch justify-center px-4 py-12">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="uo-brand-lockup inline-flex items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#64ee85] focus-visible:ring-offset-2"
            aria-label="UniOffer home"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/v2/unioffer-wordmark-on-navy.svg"
              alt="UniOffer"
              className="uo-brand-img-dark"
              style={{ height: 32, width: "auto" }}
              width={176}
              height={32}
              draggable={false}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/v2/unioffer-wordmark-greencat-dark.svg"
              alt="UniOffer"
              className="uo-brand-img-light"
              style={{ height: 32, width: "auto" }}
              width={176}
              height={32}
              draggable={false}
            />
          </Link>
          <p className="mt-3 text-sm" style={{ color: "var(--fg-muted)" }}>
            The decision-stage operating system for UK university applications.
          </p>
        </div>

        <Card className="w-full">
          <CardHeader className="px-6 pt-6" style={{ borderBottom: "none" }}>
            <CardTitle
              className="text-xl"
              style={{ fontFamily: "var(--font-serif)", fontWeight: 500 }}
            >
              Sign in to UniOffer
            </CardTitle>
            <p className="mt-2 text-sm" style={{ color: "var(--fg-muted)" }}>
              Use the Google account your counsellor invited you with, or
              enter your email for a one-time sign-in link.
            </p>
          </CardHeader>
          <CardBody className="px-6 pb-6 pt-2">
            <div
              role="status"
              aria-live="polite"
              className="mt-4 flex items-start gap-3 rounded-lg px-3 py-3 text-xs"
              style={{
                border: "1px solid var(--border)",
                background: "var(--bg-elevated)",
                color: "var(--fg-muted)",
              }}
            >
              <span
                aria-hidden="true"
                className="mt-1 inline-block h-2 w-2 shrink-0 rounded-full"
                style={{ background: "var(--brand-green)" }}
              />
              <p className="leading-relaxed">
                <span className="font-semibold" style={{ color: "var(--fg)" }}>
                  Preview mode.
                </span>{" "}
                Continue below to explore the demo workspace — Google
                OAuth lands in M1 Week 2.
              </p>
            </div>

            <div className="mt-6 space-y-3">
              <Link
                href="/dashboard"
                className="uo-btn-primary w-full justify-center"
                style={{ width: "100%" }}
              >
                Continue with Google
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.25}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Link>

              <div
                className="flex items-center gap-3 text-xs uppercase tracking-[0.14em]"
                style={{ color: "var(--fg-soft)" }}
              >
                <div
                  className="h-px flex-1"
                  style={{ background: "var(--border)" }}
                />
                or
                <div
                  className="h-px flex-1"
                  style={{ background: "var(--border)" }}
                />
              </div>

              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-[0.14em]"
                style={{ color: "var(--fg-soft)" }}
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="block w-full rounded-md px-3 py-2.5 text-sm transition-colors focus-visible:outline-none"
                style={{
                  border: "1px solid var(--border)",
                  background: "var(--bg-elevated)",
                  color: "var(--fg)",
                }}
              />
              <Link
                href="/dashboard"
                className="uo-app-btn-ghost justify-center"
                style={{ width: "100%", justifyContent: "center" }}
              >
                Email me a sign-in link
              </Link>
            </div>
          </CardBody>
          <CardFooter className="rounded-b-xl px-6 py-4">
            <p className="text-xs leading-relaxed" style={{ color: "var(--fg-soft)" }}>
              By signing in you agree to the UniOffer student privacy notice.
              The wellbeing space (
              <Link
                href="/adie"
                className="font-medium underline underline-offset-2"
                style={{ color: "var(--fg)" }}
              >
                Adie
              </Link>
              ) is governed by a{" "}
              <Link
                href="/adie/privacy"
                className="font-medium underline underline-offset-2"
                style={{ color: "var(--fg)" }}
              >
                separate privacy policy
              </Link>{" "}
              and never shares content with your admissions record.
            </p>
          </CardFooter>
        </Card>

        <p className="mt-6 text-center text-xs" style={{ color: "var(--fg-soft)" }}>
          Need help? Email{" "}
          <a
            href="mailto:hello@adropedu.com"
            className="font-medium underline underline-offset-2"
            style={{ color: "var(--fg)" }}
          >
            hello@adropedu.com
          </a>
          .
        </p>
      </div>
    </div>
  );
}
