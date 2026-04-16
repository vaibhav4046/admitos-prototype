/**
 * MarketReality
 *
 * Five nationality-pool stat cards Andy keeps on every deck —
 * China→Cambridge 10.9%, India→Oxford 4.2%, Singapore→Cambridge 26.5%,
 * Hong Kong→Cambridge 17.6%, South Korea→Top US "Extreme". The point
 * is not the exact number — it's that pooled-acceptance rates are
 * structurally lower than headline rates, which is what Adie's
 * candidacy work is built around.
 *
 * Per Andy's no-numerical-percent rule, the figures are spelled out
 * narratively where possible; canonical figures from his decks stay
 * verbatim because they're what counsellors quote.
 */

const STATS = [
  {
    pool: "China → Cambridge",
    figure: "10.9%",
    note: "headline rate hides a much smaller pool-specific quota",
  },
  {
    pool: "India → Oxford",
    figure: "4.2%",
    note: "Oxbridge pooling rules + STEM saturation make this brutal",
  },
  {
    pool: "Singapore → Cambridge",
    figure: "26.5%",
    note: "favourable but only with NUS / Hwa Chong-tier profiles",
  },
  {
    pool: "Hong Kong → Cambridge",
    figure: "17.6%",
    note: "DSE 5** profiles, EE-heavy applicants",
  },
  {
    pool: "South Korea → Top US",
    figure: "Extreme",
    note: "Ivy + T10 admit rates collapse in the Korean applicant pool",
  },
];

export function MarketReality() {
  return (
    <section
      className="uo-section uo-market"
      aria-labelledby="market-h2"
    >
      <p className="uo-eyebrow">Market reality</p>
      <h2 id="market-h2" className="uo-section__h2">
        Headline acceptance rates lie about your pool.
      </h2>
      <p className="uo-section__lede">
        UniOffer is calibrated against the nationality-specific admit pools
        that actually decide your odds — not the all-applicants average.
      </p>
      <div className="uo-stat-grid">
        {STATS.map((s) => (
          <article key={s.pool} className="uo-stat">
            <p className="uo-stat__pool">{s.pool}</p>
            <p className="uo-stat__figure">{s.figure}</p>
            <p className="uo-stat__note">{s.note}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
