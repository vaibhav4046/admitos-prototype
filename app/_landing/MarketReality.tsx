/**
 * MarketReality — V4 spec-accurate (Module 2, verbatim).
 *
 * Five pool cards. Copy is EXACT — CEO rejected prior paraphrases.
 * Korean card renders in a wider span because its card has no raw
 * applicants/offers split.
 */

import Link from "next/link";

const STATS = [
  {
    pool: "China → Cambridge",
    split: "2,308 applicants · 252 admitted",
    rate: "10.9%",
    note: "The general Cambridge rate is 21%. Chinese applicants face a pool twice as competitive.",
  },
  {
    pool: "India → Oxford",
    split: "1,757 applicants · 74 admitted",
    rate: "4.2%",
    note: "The lowest admit rate among all major applicant nationalities at Oxford.",
  },
  {
    pool: "Singapore → Cambridge",
    split: "577 applicants · 153 admitted",
    rate: "26.5%",
    note: "The highest rate — but only because the competitive bar within Singapore is already extreme.",
  },
  {
    pool: "Hong Kong → Cambridge",
    split: "557 applicants · 98 admitted",
    rate: "17.6%",
    note: "Still nearly double the China rate. UniOffer's ARE understands why.",
  },
  {
    pool: "South Korea → Top US Universities",
    split: null,
    rate: "Highest-risk pool",
    note: "Among the most competitive international applicant pools at every Ivy League institution.",
  },
];

export function MarketReality() {
  return (
    <section
      id="market-reality"
      className="uo-section uo-market"
      aria-labelledby="market-h2"
    >
      <p className="uo-eyebrow">Market reality</p>
      <h2 id="market-h2" className="uo-section__h2">
        The competition is not who you think it is.
      </h2>
      <p className="uo-section__lede">
        International applicants don&rsquo;t compete against all applicants.
        You compete within your own nationality pool — at admit rates that
        are 2 to 3 times harder than the headline numbers suggest.
      </p>
      <div className="uo-stat-grid">
        {STATS.map((s) => (
          <article key={s.pool} className="uo-stat">
            <p className="uo-stat__pool">{s.pool}</p>
            <p className="uo-stat__figure">{s.rate}</p>
            {s.split && <p className="uo-stat__split">{s.split}</p>}
            <p className="uo-stat__note">{s.note}</p>
          </article>
        ))}
      </div>

      <div className="uo-market__cta-lede">
        <p>
          These numbers come from published UCAS and Common Data Set records.
          UniOffer&rsquo;s Application Readiness Engine calibrates to your
          specific pool — so you always know where you stand.
        </p>
        <Link href="/#features" className="uo-btn uo-btn--primary uo-market__cta">
          See how UniOffer helps →
        </Link>
      </div>
    </section>
  );
}
