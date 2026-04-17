/**
 * HowItWorks
 *
 * Five-step flow describing the Adie + agent collaboration arc:
 * profile → strategy → essays → interview prep → submission.
 * The connecting SVG dash-draw line animates on scroll-enter via
 * the IntersectionObserver in `LandingObservers` — pure CSS animation
 * triggered by a `.is-visible` class on the section.
 *
 * V3.2 hook: the Happenstance-style `<JourneyGraph />` renders above
 * the card list. Graph is the visual hook (1 → 2 → 4 node topology
 * with animated streaks); cards keep carrying the copy.
 */

import { JourneyGraph } from "./JourneyGraph";

const STEPS = [
  {
    n: "01",
    title: "Build your candidacy",
    body:
      "Adie maps your profile against pool-adjusted admit data and finds the gaps your school list actually punishes you for.",
  },
  {
    n: "02",
    title: "Lock the school list",
    body:
      "Eight schools across reach, target, and likely — calibrated to your nationality pool, not the headline rate.",
  },
  {
    n: "03",
    title: "Draft every essay",
    body:
      "Voice-protected drafting with the Essay Agent. Brainstorm → draft → revise without losing what makes you sound like you.",
  },
  {
    n: "04",
    title: "Interview reps that actually help",
    body:
      "Hume-AI voice sessions with feedback on cadence, evidence, and the question behind the question.",
  },
  {
    n: "05",
    title: "Submit with confidence",
    body:
      "Application Readiness scores every component. You see the same dashboard your counsellor sees.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="uo-section uo-how"
      aria-labelledby="how-h2"
    >
      <p className="uo-eyebrow">How it works</p>
      <h2 id="how-h2" className="uo-section__h2">
        From scattered ambition to a submitted application.
      </h2>
      <JourneyGraph />
      <ol className="uo-how__list">
        {STEPS.map((s) => (
          <li key={s.n} className="uo-how__step">
            <span className="uo-how__num" aria-hidden="true">
              {s.n}
            </span>
            <div>
              <h3 className="uo-how__title">{s.title}</h3>
              <p className="uo-how__body">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
