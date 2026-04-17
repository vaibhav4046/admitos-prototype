/**
 * TrustSignals — V4 spec-accurate (Module 5, verbatim).
 *
 * Four compliance badges with exact spec copy. Headline is "Built to
 * the highest standard in the industry." — NOT "Compliance-First.
 * Wellbeing-First." (that belongs on Feature 08).
 */

const BADGES = [
  {
    code: "IECA",
    label: "IECA Member Standards",
    note:
      "Independent Educational Consultants Association guidelines hardwired into every feature.",
  },
  {
    code: "NACAC",
    label: "NACAC Compliant",
    note:
      "No admission outcome may be guaranteed or implied at any tier. Ever.",
  },
  {
    code: "UCAS",
    label: "UCAS Aligned",
    note:
      "UK application processes built to UCAS specifications and guidelines.",
  },
  {
    code: "UK-GDPR",
    label: "UK GDPR · Online Safety Act",
    note:
      "EU-West data residency. Right to erasure within 30 days. Age verification at registration.",
  },
];

export function TrustSignals() {
  return (
    <section
      id="trust"
      className="uo-section uo-trust"
      aria-labelledby="trust-h2"
    >
      <p className="uo-eyebrow">Compliance &amp; Safety</p>
      <h2 id="trust-h2" className="uo-section__h2">
        Built to the highest standard in the industry.
      </h2>
      <div className="uo-trust-grid">
        {BADGES.map((b) => (
          <article key={b.code} className="uo-trust-card">
            <p className="uo-trust-card__label">{b.label}</p>
            <p className="uo-trust-card__note">{b.note}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
