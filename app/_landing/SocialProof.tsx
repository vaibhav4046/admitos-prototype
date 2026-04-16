/**
 * SocialProof
 *
 * Three counsellor / officer quotes. Logo strip is omitted in M1 —
 * we don't yet have permission from any partner school to display
 * their wordmark, and a placeholder strip reads worse than nothing.
 * Andy can swap in greyscale logos the moment partners sign off.
 */

const QUOTES = [
  {
    body:
      "It's the first tool that doesn't pretend my Korean students are competing with the headline applicant pool. Adie sees the same map I see.",
    author: "Hye-Jin K.",
    role: "Independent counsellor, Seoul",
  },
  {
    body:
      "Voice-drift protection is the feature I didn't know I needed. My students sound like themselves after six revisions.",
    author: "Marcus R.",
    role: "Former Admissions Officer, Cambridge",
  },
  {
    body:
      "The compliance posture is what convinced our school. Wellbeing is properly isolated — no telemetry leakage, no analytics on Adie chats.",
    author: "Priya N.",
    role: "Director of College Counselling, Singapore",
  },
];

export function SocialProof() {
  return (
    <section
      id="proof"
      className="uo-section uo-proof"
      aria-labelledby="proof-h2"
    >
      <p className="uo-eyebrow">What counsellors say</p>
      <h2 id="proof-h2" className="uo-section__h2">
        Built with the people who actually read the applications.
      </h2>
      <div className="uo-quote-grid">
        {QUOTES.map((q) => (
          <figure key={q.author} className="uo-quote">
            <blockquote className="uo-quote__body">{q.body}</blockquote>
            <figcaption className="uo-quote__cite">
              <span className="uo-quote__author">{q.author}</span>
              <span className="uo-quote__role">{q.role}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
