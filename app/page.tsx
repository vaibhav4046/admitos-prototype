/**
 * / — UniOffer marketing landing (V4 spec-accurate RSC tree).
 *
 * Section order locked to CEO spec (03_Landing_Page_V3.1.pdf):
 *   Hero → MarketReality → HowItWorks → Features (+ Feature 08 strip)
 *   → TrustSignals → Pricing (+ compliance disclaimer) → Footer
 *
 * AdiePreview, Timeline, SocialProof REMOVED — not in spec. Adie is
 * gated behind sign-in per compliance policy (no wellbeing companion
 * surface on unauthenticated marketing page).
 *
 * AdieFAB intentionally NOT imported here — Andy item 7. The V3 grep
 * test guards this file at PR review.
 */

import type { Metadata } from "next";

import { CookieBanner } from "./_components/CookieBanner";
import { Footer } from "./_components/Footer";
import { Nav } from "./_components/Nav";

import { Aurora } from "./_landing/Aurora";
import { Features } from "./_landing/Features";
import { Hero } from "./_landing/Hero";
import { HowItWorks } from "./_landing/HowItWorks";
import { LandingObservers } from "./_landing/LandingObservers";
import { MarketReality } from "./_landing/MarketReality";
import { Pricing } from "./_landing/Pricing";
import { TrustSignals } from "./_landing/TrustSignals";

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
      <Aurora />
      <Nav />
      <main className="uo-main" id="main">
        <Hero />
        <div data-reveal>
          <MarketReality />
        </div>
        <div data-reveal>
          <HowItWorks />
        </div>
        <div data-reveal>
          <Features />
        </div>
        <div data-reveal>
          <TrustSignals />
        </div>
        <div data-reveal>
          <Pricing />
        </div>
      </main>
      <Footer />
      <CookieBanner />
      <LandingObservers />
    </div>
  );
}
