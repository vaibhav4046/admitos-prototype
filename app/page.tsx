/**
 * / — UniOffer marketing landing (V3 RSC tree).
 *
 * Single canonical site at `/`. Server-rendered shell with the
 * minimum number of client islands needed to power the typing
 * placeholder (HeroComposer), the cookie banner, the language
 * switcher, the theme toggle, and the scroll-reveal observer.
 *
 * Lives outside the `(admissions)` and `(wellbeing)` route groups so
 * neither route group's PostHog/Sentry providers ever hydrate on the
 * marketing surface. `app/layout.tsx` is the only ancestor.
 *
 * AdieFAB is intentionally NOT imported here — Andy item 7. The
 * V3 grep test guards this file at PR review.
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
import { SocialProof } from "./_landing/SocialProof";
import { Timeline } from "./_landing/Timeline";

import "./_landing/landing-v3.css";

export const metadata: Metadata = {
  title: "UniOffer — More Than Offers. We Spark Futures.",
  description:
    "12 AI agents and former admissions officers, working together on the single most consequential application of your life. IECA · NACAC · UCAS compliant.",
  openGraph: {
    title: "UniOffer — AI-Native University Admissions Platform",
    description:
      "Pool-aware school lists, voice-protected essay drafting, Hume-AI interview reps, and a wellbeing companion that respects you. Built with former Cambridge, Oxford, and Ivy admissions officers.",
    url: "https://unioffer.ai",
    siteName: "UniOffer",
    images: [{ url: "/brand/og-image.jpg" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "UniOffer — AI-Native University Admissions Platform",
    description:
      "Pool-aware school lists, voice-protected essay drafting, Hume-AI interview reps, and a wellbeing companion that respects you.",
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
          <Pricing />
        </div>
        <div data-reveal>
          <Timeline />
        </div>
        <div data-reveal>
          <SocialProof />
        </div>
      </main>
      <Footer />
      <CookieBanner />
      <LandingObservers />
    </div>
  );
}
