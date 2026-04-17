/**
 * Root layout.
 *
 * The root layout deliberately holds almost nothing — the real work
 * happens in the route-group layouts `(admissions)` and `(wellbeing)`.
 * Each route group owns its own providers, analytics wiring, and theme
 * so that wellbeing can never accidentally pick up PostHog or any other
 * admissions-scope telemetry.
 *
 * Spec font stack (UNIOFFER-SPEC-01): Alice (display serif) + Inter (body).
 * Exposed as CSS variables `--font-serif-raw` / `--font-sans-raw` which
 * globals.css composes into `--font-serif` / `--font-sans` with the
 * system fallbacks. Libre_Baskerville retired in the v2.2 rebuild.
 *
 * i18n at the root:
 *   - We read the `unioffer-lang` cookie on the server and set
 *     `<html lang=…>` and `<html dir=…>` to match the chosen dict.
 *     Arabic flips the entire document to RTL; every other supported
 *     locale stays LTR.
 *   - This is safe for the whole app (not just landing) because every
 *     locale's html-lang is well-formed, and dir only flips to "rtl"
 *     on ar. Non-landing routes that don't translate yet simply
 *     render their English copy inside an "rtl" container if the
 *     user has picked Arabic — readable, cosmetic misalignment only.
 *
 * Theme:
 *   - <ThemeInit /> is the FIRST child of <head>. It runs synchronously
 *     before first paint, reads localStorage('unioffer-theme') (with
 *     one-shot migration from legacy 'uo-theme'), and sets data-theme
 *     on <html>. Defaults to light (UniOffer canonical).
 *   - suppressHydrationWarning on <html> and <body> is required because
 *     the pre-paint script mutates the DOM before React hydrates.
 */

import type { ReactNode } from "react";
import { Suspense } from "react";
import type { Metadata } from "next";
import { Alice, Inter } from "next/font/google";

import { RouteProgress } from "@/components/ui";

import { LoadingScreen } from "./_components/LoadingScreen";
import { getCopy } from "./_i18n";
import { readLocale } from "./_i18n/server";
import { OsThemeWatcher } from "./_landing/OsThemeWatcher";
import { ThemeInit } from "./theme-init";
import "./globals.css";

/* ── Self-hosted Google Fonts via next/font ──────────────────────────
   Font files are inlined at build time; CSS variables are consumed by
   globals.css (--font-serif / --font-sans) and the landing page.
   Alice is a single-weight (400) transitional serif — the spec pairing
   partner for Inter. */
const serif = Alice({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-serif-raw",
  display: "swap",
});
const sans = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans-raw",
  display: "swap",
});

export const metadata: Metadata = {
  title: "UniOffer",
  description:
    "UniOffer — the decision-stage operating system for UK university applications.",
  // M1: do not index. The production indexing policy is set per route
  // group in later milestones.
  robots: { index: false, follow: false },
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const locale = await readLocale();
  const copy = getCopy(locale);

  return (
    <html
      lang={copy.htmlLang}
      dir={copy.dir}
      className={`${serif.variable} ${sans.variable}`}
      suppressHydrationWarning
    >
      <head>
        <ThemeInit />
      </head>
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        {/* First-paint splash — green cat + counter-rotating arcs.
            Auto-fades after ~900ms then unmounts. Sits above all
            content (z-index: 100). pointer-events: none so it never
            blocks user interaction during the fade. */}
        <LoadingScreen />
        {/* Top route-progress bar — wrapped in Suspense because it
            uses useSearchParams(), which Next requires to be inside a
            Suspense boundary at the layout level. */}
        <Suspense fallback={null}>
          <RouteProgress />
        </Suspense>
        {/* Live OS dark/light sync for the whole app (landing + dashboard
            + signin). Pre-hydration script paints the initial theme;
            this island keeps it in lockstep with the OS for users who
            haven't set an explicit pref via ThemeToggle. */}
        <OsThemeWatcher />
        {children}
      </body>
    </html>
  );
}
