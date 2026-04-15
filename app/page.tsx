/**
 * / — UniOffer marketing landing page v1 (public root).
 *
 * Deliberately lives OUTSIDE `(admissions)` and `(wellbeing)`: the
 * marketing surface has its own chrome, fonts, and theme tokens and
 * must never pull PostHog/Sentry-scoped providers from either route
 * group. Only the root layout wraps it.
 *
 * Signed-in students land at /app (moved here from the old root in
 * the same commit) via `app/(admissions)/app/page.tsx`, so the
 * admissions dashboard is one Link away but never hydrates on the
 * marketing page.
 *
 * Andy's spec (v4 HTML comp at public/unioffer-landing.html) is
 * reproduced in JSX; interactive bits (theme, language picker,
 * cookie banner, coming-soon toast) live in LandingClient under
 * app/_landing/ (the underscore prefix keeps it out of the router).
 */

import type { Metadata } from "next";

import LandingClient from "./_landing/LandingClient";
import "./_landing/landing.css";

export const metadata: Metadata = {
  title: "UniOffer — AI-Powered Admissions",
  description:
    "More than offers, we spark futures. UniOffer is AI-powered UK university admissions for the AI-native generation.",
  // M1: still gated behind robots: { index: false } from the root layout.
  // Flip the global gate once Andy signs off and the GA / Search Console
  // properties are provisioned.
};

export default function LandingPage() {
  return (
    <>
      {/* Preconnect to Google Fonts — these three families are loaded
          via a single stylesheet <link> below. Kept as a plain <link>
          rather than `next/font` because the marketing page wants the
          exact font stack specified in the comp (Syne, DM Sans,
          Cormorant Garamond) and next/font would require pinning per
          family in a way that complicates future design iterations. */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      {/* eslint-disable-next-line @next/next/no-page-custom-font --
          The marketing landing is the one page that needs these three
          families; other route groups (admissions, wellbeing) run on
          their own font stacks, so loading them globally would waste
          bytes for every signed-in student. */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Syne:wght@300;400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap"
      />
      <LandingClient />
    </>
  );
}
