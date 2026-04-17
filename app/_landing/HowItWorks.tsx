/**
 * HowItWorks — S3 per UNIOFFER-SPEC-01 v2.2, Module 3.
 *
 * Four numbered steps from persona-building to submission. Renders as
 * a semantic <ol> so assistive tech announces ordinality. Each step is
 * a number + title + subtitle + full spec paragraph.
 *
 * v2.2 deltas vs V4:
 *   - "Adie" → "Catie" (the wellbeing companion's user-facing name)
 *   - "Activities + Leadership Programme" → "Commons Student Community"
 *     in step 3 copy. The former Admissions Officer Review human loop
 *     stays in step 4 — that's the human-in-the-loop, distinct from
 *     the Features page's "Live Student Profile" surface which is how
 *     the live state is rendered to the student.
 *
 * Delta 9: removed the `.uo-eyebrow` "How it works" label — the H2 now
 * carries the full section weight.
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
      "A5 drafts and refines your essays, anchored to your persona and protecting your authentic voice against AI drift. A6 trains your interview performance with real-time emotion feedback. A7 builds your test prep plan. A8 strengthens your Commons Student Community story — optimising your Common App slots, identifying your leadership arc, and positioning your extracurricular depth as a coherent narrative, not a list. A9 connects you to research mentors and supports your capstone research from topic selection to publication pipeline. All twelve agents work in parallel, coordinated by A0.",
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
      className="uo-section uo-how"
      aria-labelledby="how-h2"
    >
      <div className="uo-section__inner">
        <h2 id="how-h2" className="uo-section__h2">
          From profile to application.
          <br />
          Guided at every step.
        </h2>
        <p className="uo-section__lede">
          Every stage is powered by AI agents and guided by expert human
          counsellors. You always know what to do next.
        </p>
        <ol className="uo-how__list">
          {STEPS.map((s) => (
            <li key={s.n} className="uo-how__step">
              <span className="uo-how__num" aria-hidden="true">
                {s.n}
              </span>
              <div className="uo-how__body-wrap">
                <h3 className="uo-how__title">{s.title}</h3>
                <p className="uo-how__subtitle">{s.subtitle}</p>
                <p className="uo-how__body">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
