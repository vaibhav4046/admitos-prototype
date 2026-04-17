/**
 * / — UniOffer marketing landing (UNIOFFER-SPEC-01 v2.2 RSC tree).
 *
 * Section order per spec v2.2 (03_Landing_Page_V3.1.pdf, revision 2.2):
 *   S0 Nav → S1 Hero → S3 HowItWorks → S2 Features (+ Feature 08 strip)
 *   → S4 Pricing → S5 Footer
 *
 * Deltas from V4:
 *   - Aurora, MarketReality, TrustSignals REMOVED (not in spec v2.2).
 *     The hero's typography carries the full visual weight; no
 *     background canvas effect; no standalone reality/trust modules
 *     — trust content now lives inside Feature 08's compliance strip.
 *   - Adie surfaces are gone from the public landing (Catie is gated
 *     behind sign-in for compliance reasons).
 *   - No AdieFAB; V3 grep test guards this.
 */

import type { Metadata } from "next";

import { CookieBanner } from "./_components/CookieBanner";
import { Footer } from "./_components/Footer";
import { Nav } from "./_components/Nav";

import { Features } from "./_landing/Features";
import { Hero } from "./_landing/Hero";
import { HowItWorks } from "./_landing/HowItWorks";
import { LandingObservers } from "./_landing/LandingObservers";
import { OsThemeWatcher } from "./_landing/OsThemeWatcher";
import { Pricing } from "./_landing/Pricing";

import "./_landing/landing-v3.css";

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
    <div className="uo-shell">
      <Nav />
      <main className="uo-main" id="main">
        <Hero />
        <div data-reveal>
          <HowItWorks />
        </div>
        <div data-reveal>
          <Features />
        </div>
        <div data-reveal>
          <Pricing />
        </div>
      </main>
      <Footer />
      <CookieBanner />
      <LandingObservers />
      {/* Live OS dark/light sync for the lifetime of the landing view.
          Pre-hydration script paints the initial theme; this island
          keeps it in lockstep with the OS if the user flips their
          system appearance mid-session. No manual toggle on landing. */}
      <OsThemeWatcher />
    </div>
  );
}
