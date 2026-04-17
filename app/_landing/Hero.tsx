/**
 * Hero
 *
 * V3 hero: Libre Baskerville H1 (clamp 40-72px), Adie composer with
 * cycling typing placeholder, 4 quick-action chips. The composer is
 * a server-rendered shell — the typing-placeholder client island
 * (HeroComposer) hydrates on top so the static markup is meaningful
 * before JS lands.
 *
 * Copy lifted verbatim from the v2 prototype Andy approved.
 */

import Link from "next/link";
import { HeroComposer } from "./HeroComposer";

const CHIPS = [
  "Build my US + UK school list",
  "Draft my Common App essay opener",
  "Plan my 6-month application timeline",
  "Show me my offer probabilities",
];

export function Hero() {
  return (
    <section className="uo-hero" aria-labelledby="hero-h1">
      {/* Intentionally no uo-reveal classes on the eyebrow or H1.
          Blur + translate on the LCP element defers the Lighthouse
          LCP measurement by several hundred ms. Subhead + CTA still
          fade/slide so the page doesn't feel static. */}
      <p className="uo-eyebrow">UniOffer · UK + US admissions</p>
      <h1 id="hero-h1" className="uo-hero__h1">
        More than offers.
        <br />
        We spark futures.
      </h1>
      <p className="uo-hero__lede uo-reveal-fast uo-reveal-2">
        12 AI agents and former admissions officers, working together on the
        single most consequential application of your life.
      </p>
      <div className="uo-hero__cta uo-reveal-fast uo-reveal-3">
        <Link href="/signin" className="uo-btn uo-btn--primary uo-hero__primary" prefetch>
          Get UniOffer
        </Link>
      </div>
      <HeroComposer />
      <ul className="uo-hero__chips" aria-label="Sample prompts">
        {CHIPS.map((c) => (
          <li key={c}>
            <button type="button" className="uo-chip">
              {c}
            </button>
          </li>
        ))}
      </ul>
      <p className="uo-hero__sub">
        IECA · NACAC · UCAS compliant. Wellbeing-first. Built with former
        Cambridge, Oxford, and Ivy admissions officers.{" "}
        <Link href="/contact-sales" prefetch>
          Talk to sales →
        </Link>
      </p>
    </section>
  );
}
