/**
 * Hero — V5 with Andy's approved headline ("More Than Offers. We Spark Futures.").
 *
 * Order:
 *   status pill → H1 → subhead → decorative chat input →
 *   4 quick-action buttons → bottom nav links → JourneyGraph.
 *
 * No icons on quick action buttons — text only per V4 visual directive.
 *
 * Chat input is decorative (not functional) on landing — per spec it
 * exists as a visual focal point, not an interactive surface. Sign-in
 * gates the real chat. Button inside routes to /signin.
 *
 * LCP protection preserved — no blur/entrance animation on H1.
 */

import Link from "next/link";

import { JourneyGraph } from "./JourneyGraph";

const QUICK_ACTIONS = [
  { id: "shortlist", label: "Build my school shortlist" },
  {
    id: "what-if",
    label:
      "What-if: How does my readiness change if SAT improves to 1550?",
  },
  { id: "oxford-mat", label: "Oxford MAT four-week prep plan" },
  { id: "voice-drift", label: "Check my essay for voice drift" },
];

export function Hero() {
  return (
    <section className="uo-hero" aria-labelledby="hero-h1">
      <div className="uo-hero-aurora" aria-hidden="true" />

      <div className="uo-hero-inner">
        <p className="uo-hero__status" role="status">
          12 AI agents · Always on · Compliance-first · IECA · NACAC · UCAS
        </p>

        <h1 id="hero-h1" className="uo-hero__h1">
          More Than Offers.
          <br />
          We Spark Futures.
        </h1>

        <p className="uo-hero__lede uo-reveal-fast uo-reveal-2">
          AI-Powered Admissions for the AI-Native Generation
        </p>

        <form
          className="uo-hero-chat uo-reveal-fast uo-reveal-3"
          action="/signin"
          method="get"
          aria-label="Start your UniOffer session"
        >
          <label htmlFor="hero-chat" className="uo-sr-only">
            Start your UniOffer session
          </label>
          <input
            id="hero-chat"
            name="intent"
            type="text"
            className="uo-hero-chat__input"
            placeholder="Ask about school strategy, essay planning, test prep, application deadlines, or readiness indicators..."
            autoComplete="off"
          />
          <button type="submit" className="uo-hero-chat__send">
            Get Unioffer
          </button>
        </form>

        <ul
          className="uo-hero-quick uo-reveal-fast uo-reveal-3"
          aria-label="Quick actions"
        >
          {QUICK_ACTIONS.map((q) => (
            <li key={q.id}>
              <button type="button" className="uo-hero-quick__btn">
                {q.label}
              </button>
            </li>
          ))}
        </ul>

        <nav
          className="uo-hero__bottom-nav uo-reveal-fast uo-reveal-4"
          aria-label="Page shortcuts"
        >
          <Link href="/#how-it-works">How it works →</Link>
          <span aria-hidden="true">·</span>
          <Link href="/#pricing">See pricing →</Link>
          <span aria-hidden="true">·</span>
          <Link href="/#features">Meet all 12 agents →</Link>
        </nav>
      </div>

      <JourneyGraph />
    </section>
  );
}
