/**
 * Root layout.
 *
 * The root layout deliberately holds almost nothing — the real work
 * happens in the route-group layouts `(admissions)` and `(wellbeing)`.
 * Each route group owns its own providers, analytics wiring, and theme
 * so that wellbeing can never accidentally pick up PostHog or any other
 * admissions-scope telemetry.
 *
 * V3 font stack: Libre Baskerville (serif headings) + Inter (body).
 * Exposed as CSS variables `--font-serif-raw` / `--font-sans-raw` which
 * globals.css composes into `--font-serif` / `--font-sans` with the
 * system fallbacks. Syne/DM_Sans/Cormorant from v1 are retired.
 *
 * Theme:
 *   - <ThemeInit /> is the FIRST child of <head>. It runs synchronously
 *     before first paint, reads localStorage('uo-theme'), and sets
 *     data-theme on <html>. Defaults to dark (Andy canonical).
 *   - suppressHydrationWarning on <html> and <body> is required because
 *     the pre-paint script mutates the DOM before React hydrates.
 */

import type { ReactNode } from "react";
import { Suspense } from "react";
import type { Metadata } from "next";
import { Libre_Baskerville, Inter } from "next/font/google";

import { RouteProgress } from "@/components/ui";

import { LoadingScreen } from "./_components/LoadingScreen";
import { ThemeInit } from "./theme-init";
import "./globals.css";

/* ── Self-hosted Google Fonts via next/font ──────────────────────────
   Font files are inlined at build time; CSS variables are consumed by
   globals.css (--font-serif / --font-sans) and the landing page.  */
const serif = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
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

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
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
        {children}
      </body>
    </html>
  );
}
