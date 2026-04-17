/**
 * Admissions dashboard — Manus-style "What can I do for you?" home.
 *
 * Server component. Reads the session to personalise the greeting,
 * reads the `unioffer-lang` cookie to resolve the active locale, then
 * hands off to the shell + composer client islands. Every string on
 * the dashboard surface — sidebar labels, topbar chip, composer
 * placeholder, chips, carousel — flows down as typed copy props so
 * the language choice the user made on the landing (or in the
 * dashboard settings modal) is honoured from the first paint.
 */

import type { Metadata } from "next";
import Link from "next/link";

import { getCurrentUser } from "@/services/auth/server";
import { displayNameFromEmail } from "@/lib/utils";

import { getDashboardCopy } from "@/app/_i18n";
import { readLocale } from "@/app/_i18n/server";

import { Composer } from "./_components/Composer";
import { DashboardShell } from "./_components/DashboardShell";

export const metadata: Metadata = {
  title: "Dashboard — UniOffer",
};

export default async function DashboardHomePage() {
  const [authed, locale] = await Promise.all([getCurrentUser(), readLocale()]);
  const copy = getDashboardCopy(locale);

  const user = authed
    ? {
        displayName: displayNameFromEmail(authed.email) || authed.email,
        email: authed.email,
      }
    : null;

  const firstName = user?.displayName.split(" ")[0] ?? "";
  const greeting = user
    ? copy.home.greetingNamed.replace("{name}", firstName)
    : copy.home.greeting;

  const chips = [
    { key: "essay", label: copy.home.chips.essay, icon: "✍️" },
    { key: "schoolList", label: copy.home.chips.schoolList, icon: "🏫" },
    { key: "odds", label: copy.home.chips.odds, icon: "📊" },
    { key: "timeline", label: copy.home.chips.timeline, icon: "🗓️" },
    { key: "activities", label: copy.home.chips.activities, icon: "✨" },
  ];

  return (
    <DashboardShell copy={copy} locale={locale} user={user}>
      <section className="uo-dash-home">
        <div className="uo-dash-planpill">
          <span>{copy.home.planFree}</span>
          <span aria-hidden="true" style={{ opacity: 0.4 }}>|</span>
          <Link className="uo-dash-planpill-link" href="/#pricing" prefetch>
            {copy.home.planUpgrade}
          </Link>
        </div>

        <h1 className="uo-dash-h1">{greeting}</h1>

        <Composer copy={copy.composer} />

        <div
          className="uo-dash-connect"
          role="status"
          aria-label={copy.home.connectTools}
        >
          <span className="uo-dash-connect-left">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 14a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71 M14 10a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.71" />
            </svg>
            {copy.home.connectTools}
          </span>
          <span className="uo-dash-connect-icons">
            <span title="Drive">D</span>
            <span title="Gmail">M</span>
            <span title="Notion">N</span>
            <span title="Figma">F</span>
            <span title="GitHub">G</span>
          </span>
        </div>

        <div className="uo-dash-quick-row" aria-label={copy.home.suggestionsAria}>
          {chips.map((c) => (
            <button key={c.key} type="button" className="uo-dash-quickchip">
              <span aria-hidden="true">{c.icon}</span>
              <span>{c.label}</span>
            </button>
          ))}
        </div>

        <div className="uo-dash-carousel" aria-label={copy.home.carousel.ariaLabel}>
          <div>
            <h3>{copy.home.carousel.heading}</h3>
            <p>{copy.home.carousel.body}</p>
          </div>
          <div className="uo-dash-carousel-art" aria-hidden="true">
            <span style={{ background: "#1ea3d6" }}>✈</span>
            <span style={{ background: "#0084ff" }}>ᴹ</span>
            <span style={{ background: "#06c755" }}>L</span>
            <span style={{ background: "#25d366" }}>W</span>
          </div>
        </div>
      </section>
    </DashboardShell>
  );
}
