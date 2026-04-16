/**
 * Pricing
 *
 * Three tiers per Andy's 03_Landing_Page_V3.1 spec:
 *   - Basic: "Up to 5 schools (US or UK track)" — Andy item 6
 *   - Plus:  "Up to 12 schools (US + UK dual track)" — Andy item 6,
 *            featured card with conic rotating border
 *   - Premium: Contact Sales — routes to /contact-sales (Andy item 3)
 *
 * No CTA on Basic / Plus tiers links to /signin?mode=signup using the
 * label "Contact" / "Get UniOffer" / "Get in touch", which is what
 * Andy's strict grep test guards against.
 */

import Link from "next/link";

const TIERS = [
  {
    key: "basic",
    name: "Basic",
    price: "£25",
    per: "/ month",
    yearLine: "Year plan: 2 months free · £250/year",
    sub: "Calibrated single-track applications. 800 credits monthly. Credits never expire.",
    bullets: [
      "Up to 5 schools (US or UK track)",
      "School-List Agent — pool-aware shortlist",
      "Essay Agent — brainstorming and first draft",
      "Application Readiness indicators",
      "Interview Prep — 2 AI voice sessions per month",
      "Adie — wellbeing companion, every tier",
      "Live Student Profile — one share link",
    ],
    cta: { href: "/contact-sales", label: "Get started" },
    featured: false,
  },
  {
    key: "plus",
    name: "Plus",
    price: "£50",
    per: "/ month",
    yearLine: "Year plan: 2 months free · £500/year",
    sub: "Full AI execution, end to end. 2,000 credits monthly. Credits never expire.",
    bullets: [
      "Up to 12 schools (US + UK dual track)",
      "Everything in Basic, plus:",
      "US + UK Dual-Track Strategy with ED/EA conflict detection",
      "Essay Agent Full — unlimited revisions, voice drift protection",
      "Voice Interview + Hume AI — 5 sessions per month",
      "Test Prep Agent — adaptive diagnostic and predicted score curve",
      "Activities + Leadership Programme",
      "Capstone Research Programme — 200+ PhD mentor network",
      "Adie Advanced — voice responses, weekly report",
    ],
    cta: { href: "/contact-sales", label: "Start Plus" },
    featured: true,
  },
  {
    key: "premium",
    name: "Premium",
    price: "Bespoke",
    per: "AI + Human Expertise",
    yearLine: null,
    sub: "Private advisory. AI precision plus expert human judgement at every step.",
    bullets: [
      "Everything in Plus, plus:",
      "Former Admissions Officer Review",
      "Private Counsellor Sessions",
      "Interview Coaching",
      "Adie Counsellor Sync",
      "Unlimited AI Credits",
      "Fully bespoke service design",
    ],
    cta: { href: "/contact-sales", label: "Contact Sales" },
    featured: false,
  },
] as const;

export function Pricing() {
  return (
    <section
      id="pricing"
      className="uo-section uo-pricing"
      aria-labelledby="pricing-h2"
    >
      <p className="uo-eyebrow">Pricing</p>
      <h2 id="pricing-h2" className="uo-section__h2">
        One credit pool. Three commitment levels.
      </h2>
      <p className="uo-section__lede">
        Credits never expire. Switch tiers any month. Cancel any time.
      </p>
      <div className="uo-price-grid">
        {TIERS.map((t) => (
          <article
            key={t.key}
            className={`uo-price-card${t.featured ? " is-featured" : ""}`}
            aria-labelledby={`price-${t.key}`}
          >
            {t.featured && <p className="uo-price__flag">Most popular</p>}
            <h3 id={`price-${t.key}`} className="uo-price__name">
              {t.name}
            </h3>
            <p className="uo-price__amt">
              <span className="uo-price__num">{t.price}</span>{" "}
              <span className="uo-price__per">{t.per}</span>
            </p>
            {t.yearLine && <p className="uo-price__year">{t.yearLine}</p>}
            <p className="uo-price__sub">{t.sub}</p>
            <ul className="uo-price__ul">
              {t.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
            <Link
              href={t.cta.href}
              prefetch
              className={`uo-price__cta${t.featured ? " is-featured" : ""}`}
            >
              {t.cta.label}
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
