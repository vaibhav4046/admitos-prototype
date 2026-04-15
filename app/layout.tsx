/**
 * Root layout.
 *
 * The root layout deliberately holds almost nothing — the real work
 * happens in the route-group layouts `(admissions)` and `(wellbeing)`.
 * Each route group owns its own providers, analytics wiring, and theme
 * so that wellbeing can never accidentally pick up PostHog or any other
 * admissions-scope telemetry.
 */

import type { ReactNode } from "react";
import { Suspense } from "react";
import type { Metadata } from "next";
import { Syne, DM_Sans, Cormorant_Garamond } from "next/font/google";

import { RouteProgress } from "@/components/ui";

import "./globals.css";

/* ── Self-hosted Google Fonts via next/font ──────────────────────────
   Eliminates the render-blocking <link> to fonts.googleapis.com that
   caused CLS on mobile (Lighthouse mobile perf 80 → 90+). Font files
   are inlined at build time; CSS variables are consumed by the landing
   page's font-family declarations in landing.css.  */
const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});
const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-dm-sans",
  display: "swap",
});
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
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
    <html lang="en" className={`${syne.variable} ${dmSans.variable} ${cormorant.variable}`}>
      <body className="min-h-screen bg-white text-slate-900 antialiased">
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
