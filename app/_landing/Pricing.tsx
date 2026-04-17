/**
 * Pricing — S4 per UNIOFFER-SPEC-01 v2.2, Module 6.
 *
 * Three tiers, spec-verbatim copy. The Plus card is featured:
 *   - -12px vertical offset (desktop only, collapses on tablet)
 *   - 2px accent border instead of 1px hairline
 *   - "MOST POPULAR" badge pinned -14px above the top edge,
 *     centred, uppercase, rounded-full
 *
 * Each bullet uses a Lucide Check icon (14px, strokeWidth 2.5,
 * accent colour). The compliance/credits disclaimer is rendered
 * as a full-width muted strip beneath the grid — not inside any
 * single card — so it applies to all three tiers.
 *
 * CTA routing (unchanged):
 *   Basic   → /signin?plan=basic
 *   Plus    → /signin?plan=plus
 *   Premium → /contact-sales   (MUST NOT route to /signin)
 */

import Link from "next/link";
import { Check } from "lucide-react";

type Tier = {
  key: string;
  name: string;
  price: string;
  per: string;
  yearLine: string | null;
  tagline: string;
  sub: string | null;
  bullets: readonly string[];
  cta: { href: string; label: string };
  featured: boolean;
  footnote: string | null;
  premium?: boolean;
};

const TIERS: readonly Tier[] = [
  {
    key: "basic",
    name: "Basic",
    price: "£20",
    per: "/ month",
    yearLine: "Year plan: 2 months free · £200 / year",
    tagline: "Your AI admissions foundation.",
    sub: "500 AI credits included monthly. Purchased credits never expire.",
    bullets: [
      "Student DNA — 8-dimension applicant persona from day one",
      "AI Orchestrator — weekly plans, deadline tracking, full timeline",
      "School Intelligence — target-school research from CDS and UCAS data",
      "US or UK application strategy — up to 5 schools (single track)",
      "Essay Agent — brainstorming, structure, first draft with voice protection",
      "Application Readiness — qualitative readiness indicators, always visible",
      "Interview Prep — AI voice simulation, 2 sessions per month",
      "Catie — wellbeing companion at every tier, no extra cost",
      "Commons — anonymous, governed community access",
      "Live Student Profile — one shared link for student, parents, counsellor",
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
    yearLine: "Year plan: 2 months free · £500 / year",
    tagline: "Full AI execution across your entire application.",
    sub: "2,000 AI credits monthly. Top-up credits roll over and never expire.",
    bullets: [
      "Everything in Basic, plus:",
      "US + UK dual-track strategy — up to 12 schools, ED / EA conflict detection",
      "Essay Agent Full — unlimited revisions, cross-essay narrative consistency, voice-drift detection",
      "Voice Interview + Hume AI — 5 sessions/month with real-time emotion analysis",
      "Test Prep Agent — adaptive diagnostic, predicted curve, topic-priority plan",
      "Commons — Common App 10-slot optimisation, leadership arc, extracurricular depth",
      "Capstone Research — 200+ PhD and professor mentor network, topic to publication",
      "Readiness What-if — scenario planning across target schools",
      "Catie Advanced — voice responses, weekly wellbeing report, 30-day mood trend",
      "Top-up credits — purchase additional credits anytime",
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
      "Private advisory. AI precision with expert human judgement at every critical moment. All Premium plans are privately designed.",
    sub: null,
    bullets: [
      "Everything in Plus, plus:",
      "Former Admissions Officer Review — every essay, activity, narrative reviewed before submission",
      "Private Counsellor Sessions — one-to-one with former officers at Cambridge, Oxford, Ivy",
      "Unlimited AI credits — no caps on any agent or feature",
      "Priority Support — direct line to advisory team, 24-hour response",
      "Family Dashboard — parent / guardian view with progress and counsellor notes",
    ],
    cta: { href: "/contact-sales", label: "Contact Sales →" },
    featured: false,
    premium: true,
    footnote:
      "Premium plans are privately designed in consultation with our advisory team. Pricing reflects the scope of human expert involvement and is discussed during your initial call.",
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="uo-section" aria-labelledby="price-h2">
      <div className="uo-section__inner">
        <p className="uo-eyebrow">Pricing</p>
        <h2 id="price-h2" className="uo-section__h2">
          Simple, transparent pricing.
        </h2>
        <p className="uo-section__lede">
          Start with AI. Upgrade when you&rsquo;re ready for human expertise.
        </p>

        <div className="uo-price-grid">
          {TIERS.map((t) => (
            <article
              key={t.key}
              className={[
                "uo-price-card",
                t.featured ? "is-featured" : "",
                t.premium ? "is-premium" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {t.featured && (
                <p className="uo-price-card__badge">Most Popular</p>
              )}
              <h3 className="uo-price__name">{t.name}</h3>
              <p className="uo-price__amt">
                <span className="uo-price__num">{t.price}</span>{" "}
                <span className="uo-price__per">{t.per}</span>
              </p>
              {t.yearLine && <p className="uo-price__year">{t.yearLine}</p>}
              <p className="uo-price__tagline">{t.tagline}</p>
              {t.sub && <p className="uo-price__sub">{t.sub}</p>}
              <ul className="uo-price__ul">
                {t.bullets.map((b) => (
                  <li key={b}>
                    <Check size={14} strokeWidth={2.5} aria-hidden="true" />
                    <span>{b}</span>
                  </li>
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

        <div className="uo-price-compliance">
          <p>
            UniOffer uses a credit-based system. AI credits are consumed
            when you interact with agents. Basic includes 500 credits/month;
            Plus includes 2,000 credits/month. Purchased top-up credits
            never expire. Premium plans include unlimited credits. All
            plans include Catie wellbeing support at no additional cost.
            Prices shown in GBP. Annual plans include two months free.
          </p>
        </div>
      </div>
    </section>
  );
}
