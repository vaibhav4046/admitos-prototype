/**
 * HowItWorks — V4 spec-accurate (Module 3, verbatim).
 *
 * Four steps with subtitle + full spec paragraph. CEO rejected the
 * prior 5-step fabrication.
 */

const STEPS = [
  {
    n: "01",
    title: "Build Your DNA",
    subtitle: "Your applicant persona starts here.",
    body:
      "Your journey starts with A1 — Student DNA. In your first session, UniOffer maps your cognitive style, writing voice, academic depth, and motivation profile across eight dimensions. The result is your applicant persona — a deep, structured portrait of who you are as a candidate. This persona is the engine behind every recommendation, every essay review, and every strategy call that follows.",
  },
  {
    n: "02",
    title: "Set Your Strategy",
    subtitle: "Your school list. Your narrative. Your timeline.",
    body:
      "A3 and A4 build your US and UK school lists with ED/EA timing, college balance, and preparation priorities. Your counsellor and agents work together to define your core narratives — the through-lines that will connect your persona to your target schools across every part of your application. A11 — the Application Readiness Engine — shows you exactly where to focus. Your counsellor sees the full picture. You see what to do next.",
  },
  {
    n: "03",
    title: "Execute with Your Agent Team",
    subtitle: "12 specialists working in parallel. Coordinated by AI.",
    body:
      "A5 drafts and refines your essays, anchored to your persona and protecting your authentic voice against AI drift. A6 trains your interview performance with real-time emotion feedback. A7 builds your test prep plan. A8 strengthens your activities narrative — optimising your Common App slots, identifying your leadership programme story, and positioning your extracurricular depth as a coherent arc, not a list. A9 connects you to research mentors and supports your capstone research programme from topic selection to publication pipeline. All twelve agents work in parallel, coordinated by A0.",
  },
  {
    n: "04",
    title: "Submit with Confidence",
    subtitle: "Every narrative. Every essay. Every activity. Reviewed.",
    body:
      "A10 — Former Admissions Officer Review — gives your application a dual-perspective read before you submit. First through the AI lens: consistency, narrative integrity, voice drift, and quantitative readiness. Then through a human lens: a former Cambridge, Oxford, or Ivy admissions officer reviews your materials and provides the strategic perspective that AI cannot replicate. You submit knowing that both perspectives have been applied.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="uo-section"
      aria-labelledby="how-h2"
    >
      <p className="uo-eyebrow">How it works</p>
      <h2 id="how-h2" className="uo-section__h2">
        Four steps from persona to submission.
      </h2>
      <p className="uo-section__lede">
        Every stage is powered by AI agents and guided by expert human
        counsellors. You always know what to do next.
      </p>
      <ol className="uo-how__list">
        {STEPS.map((s) => (
          <li key={s.n} className="uo-how__step">
            <span className="uo-how__num">{s.n}</span>
            <div>
              <h3 className="uo-how__title">{s.title}</h3>
              <p className="uo-how__subtitle">{s.subtitle}</p>
              <p className="uo-how__body">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
