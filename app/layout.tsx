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

import { RouteProgress } from "@/components/ui";

import "./globals.css";

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
    <html lang="en">
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
