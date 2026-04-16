/**
 * Features
 *
 * Six cards, each a single agent or capability. Card hover lifts 2px
 * with shadow-2 + border accent. All animation honors
 * `prefers-reduced-motion`.
 */

const FEATURES = [
  {
    title: "School-List Agent",
    body:
      "Pool-adjusted reach / target / likely list. Knows the difference between Stanford-from-Korea and Stanford-from-anywhere.",
  },
  {
    title: "Essay Agent",
    body:
      "Voice-drift protection so revisions never sand you down to generic-applicant-tone.",
  },
  {
    title: "Interview Coach",
    body:
      "Hume-AI voice rounds with feedback on hesitation, hedging, and the answer behind your answer.",
  },
  {
    title: "Application Readiness",
    body:
      "One dashboard. Every component scored against the requirements your specific schools weigh.",
  },
  {
    title: "Adie wellbeing",
    body:
      "Compliance-first companion. PHI-isolated. Referral pathways for crisis. Samaritans-aware.",
  },
  {
    title: "Counsellor sync",
    body:
      "Your in-person counsellor sees the same dashboard. UniOffer never replaces them — it gives them leverage.",
  },
];

export function Features() {
  return (
    <section
      id="features"
      className="uo-section uo-features"
      aria-labelledby="features-h2"
    >
      <p className="uo-eyebrow">Features</p>
      <h2 id="features-h2" className="uo-section__h2">
        Twelve agents. One application. Your voice intact.
      </h2>
      <div className="uo-feat-grid">
        {FEATURES.map((f) => (
          <article key={f.title} className="uo-feat-card">
            <h3 className="uo-feat__title">{f.title}</h3>
            <p className="uo-feat__body">{f.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
