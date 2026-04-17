/**
 * Features — S2 per UNIOFFER-SPEC-01 v2.2, Module 4.
 *
 * A 3-column grid of 7 feature cards (01–07), all visible (no
 * progressive disclosure). Each card pairs a Lucide icon with a
 * spec-verbatim title and body. Beneath the grid, Feature 08 renders
 * as a full-width dark compliance/wellbeing strip — distinct from the
 * 7 cards by design, since it describes the platform's ethical
 * posture rather than a product capability.
 *
 * Spec changes from V6:
 *   - 05: Adie → Catie (user-facing rename — the wellbeing agent)
 *   - 06: "Activities + Leadership Programme" → "Commons Student Community"
 *   - 07: "Former Admissions Officer Review" → "Live Student Profile"
 *   - Feature 08 re-framed as "Compliance-First. Wellbeing-First."
 *   - Numbered badges dropped in favour of Lucide icons (spec v2.2)
 *   - Progressive disclosure removed — all 7 cards are visible; the
 *     3-col grid collapses to 1-col on mobile.
 *
 * Accessibility:
 *   - section has aria-labelledby pointing at the H2
 *   - each card is an <article> with its own aria-labelledby
 *   - icons are aria-hidden (title carries the semantic weight)
 */

import {
  Network,
  Dna,
  Gauge,
  Mic,
  HeartHandshake,
  Users,
  LineChart,
} from "lucide-react";

type Feat = {
  id: string;
  n: string;
  title: string;
  body: string;
  icon: typeof Network;
};

const FEATURES: readonly Feat[] = [
  {
    id: "mesh",
    n: "01",
    title: "12-Agent AI Mesh",
    body:
      "Twelve specialist agents execute in parallel — essay, strategy, research, interview, test prep, and more. Not a chatbot. A complete expert team working around the clock on your application.",
    icon: Network,
  },
  {
    id: "dna",
    n: "02",
    title: "Student DNA Engine",
    body:
      "An 8-dimension candidacy profile built from your first session. Every agent output is personalised to your cognitive style, writing voice, and motivation pattern — and stays that way throughout your entire journey.",
    icon: Dna,
  },
  {
    id: "readiness",
    n: "03",
    title: "Application Readiness Engine",
    body:
      "Multi-factor preparation strength analysis calibrated to your nationality pool and each university's published selection criteria. Counsellors use it to prioritise your preparation. You see clear, actionable readiness indicators — never misleading probability numbers.",
    icon: Gauge,
  },
  {
    id: "interview",
    n: "04",
    title: "Voice Interview Simulator",
    body:
      "Real-time emotion analysis powered by Hume AI. Oxbridge academic, medical MMI, and US top college alumni interview modes. After five AI sessions, a human coach refines the final 10% AI cannot reach.",
    icon: Mic,
  },
  {
    id: "catie",
    n: "05",
    title: "Catie — Your Wellbeing Companion",
    body:
      "The first admissions platform to embed a dedicated wellbeing companion. Catie provides light-touch emotional care, friendly nudges, and a safe space — structurally isolated from your admissions data so your counsellor never sees your private conversations.",
    icon: HeartHandshake,
  },
  {
    id: "commons",
    n: "06",
    title: "Commons Student Community",
    body:
      "A peer community curated by profile, target schools, and programme. Shared activities, leadership builds, capstone research pairings, and 200+ PhD and professor mentors — your extracurricular arc becomes a coherent story, not a list.",
    icon: Users,
  },
  {
    id: "live-profile",
    n: "07",
    title: "Live Student Profile",
    body:
      "A continuously updated profile of who you are as a candidate — academics, narrative, activities, readiness. Counsellors and former admissions officers review the same live view you do, so every conversation starts from the truth of where you stand today.",
    icon: LineChart,
  },
] as const;

const FEAT08 = {
  title: "Compliance-First. Wellbeing-First.",
  body:
    "Every AI output is governed by IECA, NACAC, and UCAS ethical frameworks. UniOffer never writes an essay for you. It never fabricates credentials. It never presents AI-generated text as your own. Your voice is protected, your data is encrypted, and every recommendation is traceable. Wellbeing data is physically isolated from admissions data — your counsellor never sees your private conversations with Catie. This is the admissions platform built for the post-AI regulatory landscape.",
};

export function Features() {
  return (
    <>
      <section
        id="features"
        className="uo-section uo-features"
        aria-labelledby="feat-h2"
      >
        <div className="uo-section__inner">
          <p className="uo-eyebrow">Features</p>
          <h2 id="feat-h2" className="uo-section__h2">
            12 specialist AI agents. One unified platform.
            <br />
            Built for the top 1%.
          </h2>
          <p className="uo-section__lede">
            Each agent is a specialist. Together, they cover every dimension of
            a competitive university application — strategy, essays, interviews,
            test prep, activities, research, and wellbeing.
          </p>

          <ul className="uo-features__grid" aria-label="Platform features">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              const headingId = `feat-${f.id}`;
              return (
                <li key={f.id}>
                  <article
                    className="uo-feat-card"
                    aria-labelledby={headingId}
                  >
                    <div className="uo-feat-card__icon" aria-hidden="true">
                      <Icon size={24} strokeWidth={1.75} />
                    </div>
                    <p className="uo-feat-card__n" aria-hidden="true">
                      {f.n}
                    </p>
                    <h3 id={headingId} className="uo-feat-card__title">
                      {f.title}
                    </h3>
                    <p className="uo-feat-card__body">{f.body}</p>
                  </article>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <aside className="uo-feat08" aria-label="Compliance and wellbeing">
        <div className="uo-feat08__inner">
          <h2 className="uo-feat08__h2">{FEAT08.title}</h2>
          <p className="uo-feat08__body">{FEAT08.body}</p>
        </div>
      </aside>
    </>
  );
}
