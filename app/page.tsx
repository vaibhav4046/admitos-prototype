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

/**
 * Landing-page metadata per V3.1 spec §"SEO and Open Graph".
 *
 * Title, description, and OG/Twitter tags are copied verbatim from
 * Andy's 03_Landing_Page_V3.1.pdf (committed to repo root 15 Apr)
 * so the marketing surface matches what compliance + marketing
 * signed off on.
 *
 * The OG image at `/public/brand/og-image.jpg` is NOT yet shipped —
 * Andy has not delivered the asset (not among the 14 files dropped
 * on 15 Apr). The URL is still declared so the moment the asset
 * lands in `/public/brand/`, the crawler cache will pick it up
 * without another metadata change.
 *
 * The root layout sets `robots: { index: false, follow: false }` for
 * M1; flip that gate once Andy signs off on the GA / Search Console
 * property.
 */
export const metadata: Metadata = {
  title: "UniOffer — The Operating System for University Applications",
  description:
    "12 AI agents. One platform. Build your competitive candidacy, execute your full application, and access expert human guidance — from your first essay to your final submission.",
  openGraph: {
    title: "UniOffer — AI-Native University Admissions Platform",
    description:
      "The world's first compliance-first, wellbeing-first AI platform for top university applications. IECA · NACAC · UCAS compliant.",
    url: "https://unioffer.ai",
    siteName: "UniOffer",
    images: [{ url: "/brand/og-image.jpg" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "UniOffer — AI-Native University Admissions Platform",
    description:
      "The world's first compliance-first, wellbeing-first AI platform for top university applications. IECA · NACAC · UCAS compliant.",
    images: ["/brand/og-image.jpg"],
  },
};

export default function LandingPage() {
  return (
    <>
      {/* Fonts are self-hosted via next/font/google in layout.tsx.
          CSS variables --font-syne, --font-dm-sans, --font-cormorant
          are applied to <html> and consumed in landing.css. No external
          Google Fonts request is made — eliminates CLS from font swap
          and the render-blocking stylesheet. */}
      <LandingClient />
    </>
  );
}
