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
 *
 * i18n:
 *   - The landing is a server component. It reads the `unioffer-lang`
 *     cookie server-side via `readLocale()` and passes the
 *     corresponding `LandingCopy` dict down to every section as a
 *     typed prop. No client-side dict swapping — the first paint is
 *     already in the chosen language, zero layout shift.
 *   - When the user picks a new language in LangSwitcher, it writes
 *     the cookie and calls `router.refresh()`, which re-runs this
 *     server component with the new cookie in place.
 */

import type { Metadata } from "next";

import { CookieBanner } from "./_components/CookieBanner";
import { Footer } from "./_components/Footer";
import { Nav } from "./_components/Nav";

import { getCopy } from "./_i18n";
import { readLocale } from "./_i18n/server";

import { Features } from "./_landing/Features";
import { Hero } from "./_landing/Hero";
import { HowItWorks } from "./_landing/HowItWorks";
import { LandingObservers } from "./_landing/LandingObservers";
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

export default async function LandingPage() {
  const locale = await readLocale();
  const copy = getCopy(locale);

  return (
    <div className="uo-shell">
      <Nav copy={copy.nav} locale={locale} />
      <main className="uo-main" id="main">
        <Hero copy={copy.hero} />
        <div data-reveal>
          <HowItWorks copy={copy.how} />
        </div>
        <div data-reveal>
          <Features copy={copy.features} />
        </div>
        <div data-reveal>
          <Pricing copy={copy.price} />
        </div>
      </main>
      <Footer copy={copy.footer} />
      <CookieBanner copy={copy.cookieBanner} />
      <LandingObservers />
      {/* OsThemeWatcher now lives in the root layout so the dashboard,
          signin, and every other route share the same live OS sync —
          removed from here. */}
    </div>
  );
}
