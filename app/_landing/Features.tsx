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
 * Delta 5 copy updates (spec v2.2):
 *   - 03 Readiness: "calibrated against each university's published
 *     selection criteria" (was "nationality pool and each university's")
 *   - 05 Catie: new wellbeing-first body emphasising peer-support
 *   - 06 Commons: new anonymous / governed framing
 *   - 07 Live Student Profile: new Student DNA & CEF framing
 *   - Feat08: "Not features. Founding principles." compliance-first
 *
 * Delta 9: removed the `.uo-eyebrow` "Features" label — the H2 now
 * carries the full section weight.
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
      "Multi-factor preparation strength analysis calibrated against each university's published selection criteria. Counsellors use it to prioritise your preparation. You see clear, actionable readiness indicators — never misleading probability numbers.",
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
      "The first admissions platform to embed a dedicated wellbeing companion at every tier. Catie offers light-touch care and friendly nudges — reminding you to rest, checking in at the right moments, and staying with you through results day. Catie is a peer support tool, not a substitute for professional mental health care.",
    icon: HeartHandshake,
  },
  {
    id: "commons",
    n: "06",
    title: "Commons Student Community",
    body:
      "Every student's journey becomes collective knowledge. A governed, anonymous space locked to admissions topics — where students share experiences, ask questions, and offer limited peer commentary in a safe and moderated environment.",
    icon: Users,
  },
  {
    id: "live-profile",
    n: "07",
    title: "Live Student Profile",
    body:
      "Powered by Student DNA & CEF, unioffer generates a personal profile page for each student that updates in real time. Parents and counsellors get a complete, always-current view of progress, preparation strength, and upcoming milestones — in one place, with one click.",
    icon: LineChart,
  },
] as const;

const FEAT08 = {
  title: "Compliance-First. Wellbeing-First.",
  body:
    "Not features. Founding principles. Every agent output, every data decision, and every user interaction is built against the strictest applicable standard — IECA, NACAC, UCAS, UK GDPR, and the Online Safety Act. Compliance and student wellbeing are core company assets, not afterthoughts.",
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
