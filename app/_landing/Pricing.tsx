/**
 * Pricing — V4 spec-accurate (Module 6, verbatim).
 *
 * Three tiers, exact CEO spec copy — tagline, credits (500 Basic /
 * 2,000 Plus), bullet text, footnote, CTA labels, compliance
 * disclaimer strip.
 *
 * CTA routing:
 *   Basic  → /signin?plan=basic           (label: "Get Started")
 *   Plus   → /signin?plan=plus            (label: "Start Plus")
 *   Premium → /contact-sales              (label: "Contact Sales →")
 * Contact Sales MUST route to /contact-sales (never /signin).
 */

import Link from "next/link";

const TIERS = [
  {
    key: "basic",
    name: "Basic",
    price: "£20",
    per: "/ month",
    yearLine: "Year plan: 2 months free · £200/year",
    tagline: "Your AI admissions foundation.",
    sub: "500 AI credits included monthly. Purchased credits never expire.",
    bullets: [
      "Student DNA — Build your applicant persona across 8 dimensions from day one",
      "AI Orchestrator — Weekly action plans, deadline tracking, full application timeline",
      "School Intelligence — Target school research powered by official CDS and UCAS data",
      "US or UK Application Strategy — School list, ED/EA timing, preparation priorities — up to 5 schools (US or UK track)",
      "Essay Agent — Brainstorming, structure, and first draft generation that protects your authentic voice",
      "Application Readiness — Clear, qualitative readiness indicators. What to focus on next, always visible",
      "Interview Prep — AI voice simulation, 2 sessions per month",
      "Adie — Your wellbeing companion. Light-touch care and friendly nudges, available at every tier",
      "Commons — Full community access. Anonymous, governed, locked to admissions topics",
      "Live Student Profile — Your progress page, updated in real time. Parents and counsellors stay in sync with one link",
    ],
    cta: { href: "/signin?plan=basic", label: "Get Started" },
    featured: false,
    footnote: null,
  },
  {
    key: "plus",
    name: "Plus",
    price: "£50",
    per: "/ month",
    yearLine: "Year plan: 2 months free · £500/year",
    tagline: "Full AI execution across your entire application.",
    sub: "2,000 AI credits monthly. Purchased credits roll over, never expire.",
    bullets: [
      "Everything in Basic, plus:",
      "US + UK Dual-Track Strategy — Both markets in parallel. ED/EA conflict detection, balanced school list across two systems — up to 12 schools (US + UK dual track)",
      "Essay Agent — Full — Unlimited revisions, cross-essay narrative consistency, writing style drift detection anchored to your persona",
      "Voice Interview + Hume AI — 5 sessions per month with real-time emotion analysis — confidence, clarity, and anxiety tracked across every answer",
      "Test Prep Agent — Adaptive diagnostic, predicted score curve, topic-by-topic priority planning",
      "Activities + Leadership Programme — Common App 10-slot optimisation, leadership narrative construction, extracurricular arc built as a story, not a list",
      "Capstone Research Programme — Mentor matching from 200+ PhD and professor network, research project support from topic selection to publication pipeline",
      "Application Readiness + What-if — Scenario planning. See exactly how a higher SAT score or a new activity changes your readiness for each target school",
      "Adie Advanced — Voice responses, weekly personalised wellbeing report, 30-day mood trend",
      "Top-up credits — Purchase additional credits anytime when you need to go deeper",
    ],
    cta: { href: "/signin?plan=plus", label: "Start Plus" },
    featured: true,
    footnote: null,
  },
  {
    key: "premium",
    name: "Premium",
    price: "Bespoke",
    per: "AI + Human Expertise",
    yearLine: null,
    tagline:
      "Private advisory service. For families who want AI precision and expert human judgement at every critical moment. All Premium plans are privately designed.",
    sub: null,
    bullets: [
      "Everything in Plus, plus:",
      "Former Admissions Officer Review — Every essay, every activity, every narrative reviewed through the lens of a real admissions reader before you submit",
      "Private Counsellor Sessions — One-to-one expert guidance from former admissions officers at Cambridge, Oxford, and Ivy League institutions",
      "Unlimited AI credits — No caps. Use every agent, every tool, every feature without limits",
      "Priority Support — Direct line to the UniOffer advisory team, 24-hour response guarantee",
      "Family Dashboard — Dedicated parent/guardian view with progress summaries and counsellor notes",
    ],
    cta: { href: "/contact-sales", label: "Contact Sales →" },
    featured: false,
    footnote:
      "Premium plans are privately designed in consultation with our advisory team. Pricing reflects the scope of human expert involvement and is discussed during your initial call.",
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="uo-section" aria-labelledby="price-h2">
      <p className="uo-eyebrow">Pricing</p>
      <h2 id="price-h2" className="uo-section__h2">
        Plans built for every stage of your journey.
      </h2>
      <p className="uo-section__lede">
        Start free with Basic essentials. Upgrade when you&rsquo;re ready for
        full AI execution or private expert advisory.
      </p>

      <div className="uo-price-grid">
        {TIERS.map((t) => (
          <article
            key={t.key}
            className={`uo-price-card${t.featured ? " is-featured" : ""}`}
          >
            {t.featured && (
              <p className="uo-price__flag">Most popular</p>
            )}
            <h3 className="uo-price__name">{t.name}</h3>
            <p className="uo-price__amt">
              <span className="uo-price__num">{t.price}</span>{" "}
              <span className="uo-price__per">{t.per}</span>
            </p>
            {t.yearLine && (
              <p className="uo-price__year">{t.yearLine}</p>
            )}
            {t.tagline && (
              <p className="uo-price__tagline">{t.tagline}</p>
            )}
            {t.sub && <p className="uo-price__sub">{t.sub}</p>}
            <ul className="uo-price__ul">
              {t.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
            {t.footnote && (
              <p className="uo-price__footnote">{t.footnote}</p>
            )}
            <Link
              href={t.cta.href}
              className={`uo-price__cta${t.featured ? " is-featured" : ""}`}
            >
              {t.cta.label}
            </Link>
          </article>
        ))}
      </div>

      <p className="uo-pricing__disclaimer">
        UniOffer uses a credit-based system. AI credits are consumed when you
        interact with agents. Basic includes 500 credits/month; Plus includes
        2,000 credits/month. Purchased top-up credits never expire. Premium
        plans include unlimited credits. All plans include Adie wellbeing
        support at no additional cost. Prices shown in GBP. Annual plans
        include two months free.
      </p>
    </section>
  );
}
