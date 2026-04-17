/**
 * Features — V4 spec-accurate (Module 4, verbatim).
 *
 * Seven feature cards (01–07) rendered as a grid with progressive
 * disclosure (4 open + 3 behind "Show 3 more"). Feature 08 renders
 * as a full-width dark compliance strip BELOW the grid — distinct
 * from the 7 cards, as CEO spec requires.
 *
 * No icons, no emojis — numbered badges (01–07) only, typographic.
 */

import { FeatureGrid } from "./FeatureGrid";

const FEATURES = [
  {
    n: "01",
    title: "12-Agent AI Mesh",
    body:
      "Twelve specialist agents execute in parallel — essay, strategy, research, interview, test prep, and more. Not a chatbot. A complete expert team working around the clock on your application.",
  },
  {
    n: "02",
    title: "Student DNA Engine",
    body:
      "An 8-dimension candidacy profile built from your first session. Every agent output is personalised to your cognitive style, writing voice, and motivation pattern — and stays that way throughout your entire journey.",
  },
  {
    n: "03",
    title: "Application Readiness Engine",
    body:
      "Multi-factor preparation strength analysis calibrated to your nationality pool and each university's published selection criteria. Counsellors use it to prioritise your preparation. You see clear, actionable readiness indicators — never misleading probability numbers.",
  },
  {
    n: "04",
    title: "Voice Interview Simulator",
    body:
      "Real-time emotion analysis powered by Hume AI. Oxbridge academic, medical MMI, and US top college alumni interview modes. After five AI sessions, a human coach refines the final 10% AI cannot reach.",
  },
  {
    n: "05",
    title: "Adie — Your Wellbeing Companion",
    body:
      "The first admissions platform to embed a dedicated wellbeing companion. Adie provides light-touch emotional care, friendly nudges, and a safe space — structurally isolated from your admissions data so your counsellor never sees your private conversations.",
  },
  {
    n: "06",
    title: "Activities + Leadership Programme",
    body:
      "Common App 10-slot optimisation, leadership narrative construction, and extracurricular arc design. Your activities are positioned as a coherent story, not a list — and your capstone research programme connects you to 200+ PhD and professor mentors.",
  },
  {
    n: "07",
    title: "Former Admissions Officer Review",
    body:
      "Before you submit, a dual-perspective review: AI checks narrative integrity, voice drift, and quantitative readiness. Then a former Cambridge, Oxford, or Ivy admissions officer provides the strategic lens that AI cannot replicate.",
  },
];

const FEAT08 = {
  title: "Compliance-First Architecture",
  body:
    "Every AI output is governed by IECA, NACAC, and UCAS ethical frameworks. UniOffer never writes an essay for you. It never fabricates credentials. It never presents AI-generated text as your own. Your voice is protected, your data is encrypted, and every recommendation is traceable. This is the admissions platform built for the post-AI regulatory landscape.",
};

export function Features() {
  return (
    <>
      <section
        id="features"
        className="uo-section"
        aria-labelledby="feat-h2"
      >
        <p className="uo-eyebrow">Features</p>
        <h2 id="feat-h2" className="uo-section__h2">
          Meet the 12 agents behind your application.
        </h2>
        <p className="uo-section__lede">
          Each agent is a specialist. Together, they cover every dimension of
          a competitive university application — strategy, essays, interviews,
          test prep, activities, research, and wellbeing.
        </p>
        <FeatureGrid features={FEATURES} visibleCount={4} />
      </section>

      <div className="uo-feat08" role="complementary" aria-label="Compliance">
        <div className="uo-feat08__inner">
          <h2 className="uo-feat08__h2">{FEAT08.title}</h2>
          <p className="uo-feat08__body">{FEAT08.body}</p>
        </div>
      </div>
    </>
  );
}
