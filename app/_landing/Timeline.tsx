/**
 * Timeline
 *
 * Application milestones with glowing dots that pulse on scroll-enter.
 * Pure server component; the pulse is a CSS animation triggered by
 * the section's `.is-visible` class set by the IntersectionObserver
 * in LandingObservers.
 */

const MILESTONES = [
  { month: "Apr", title: "Profile lock + school list" },
  { month: "Jun", title: "Essay drafting opens" },
  { month: "Aug", title: "First-draft personal statement" },
  { month: "Sep", title: "Letters of recommendation" },
  { month: "Oct", title: "ED / EA + UCAS submission" },
  { month: "Jan", title: "Regular Decision + interviews" },
];

export function Timeline() {
  return (
    <section
      id="timeline"
      className="uo-section uo-timeline"
      aria-labelledby="timeline-h2"
    >
      <p className="uo-eyebrow">Timeline</p>
      <h2 id="timeline-h2" className="uo-section__h2">
        Six months to a sharper application.
      </h2>
      <ol className="uo-timeline__list">
        {MILESTONES.map((m) => (
          <li key={m.month} className="uo-timeline__item">
            <span className="uo-timeline__dot" aria-hidden="true" />
            <span className="uo-timeline__month">{m.month}</span>
            <span className="uo-timeline__title">{m.title}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
