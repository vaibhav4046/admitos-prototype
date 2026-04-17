/**
 * Dashboard → Search.
 *
 * Manus-style search surface. The modal lives permanently here rather
 * than as a portal overlay so a deep link (/dashboard/search?q=...)
 * still lands on something useful.
 */

import Link from "next/link";

import { getCurrentUser } from "@/services/auth/server";
import { displayNameFromEmail } from "@/lib/utils";

import { getDashboardCopy } from "@/app/_i18n";
import { readLocale } from "@/app/_i18n/server";

import { DashboardShell } from "../_components/DashboardShell";

interface TaskRow {
  href: string;
  emoji: string;
  title: string;
  preview: string;
  date: string;
}

const ROWS: TaskRow[] = [
  {
    href: "/dashboard/library",
    emoji: "🎓",
    title: "Oxford PPE — personal statement draft 2",
    preview:
      "First 75 words open on the moment curiosity about markets tipped into philosophy. Adie flagged two evidence-heavy paragraphs as thin on argument.",
    date: "2026/4/14",
  },
  {
    href: "/dashboard/library",
    emoji: "🏫",
    title: "UK + US school list — pool-adjusted shortlist",
    preview:
      "12 schools ranked by pool-adjusted admit rate. LSE Gov leads your cohort ahead of Oxford PPE. Stanford SCPD flagged as reach.",
    date: "2026/4/10",
  },
];

export default async function SearchPage() {
  const [authed, locale] = await Promise.all([getCurrentUser(), readLocale()]);
  const copy = getDashboardCopy(locale);
  const user = authed
    ? {
        displayName: displayNameFromEmail(authed.email) || authed.email,
        email: authed.email,
      }
    : null;

  return (
    <DashboardShell copy={copy} locale={locale} title={copy.sidebar.search} user={user}>
      <section className="uo-dash-lib" aria-label="Search tasks">
        <div className="uo-dash-lib-toolbar">
          <div className="uo-dash-lib-search" style={{ width: "100%", maxWidth: 560 }}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input placeholder="Search tasks..." aria-label="Search tasks" autoFocus />
          </div>
        </div>

        <div className="uo-dash-lib-group">
          <div className="uo-dash-lib-group-head">
            <span className="uo-dash-lib-group-title">New task</span>
          </div>
          <div className="uo-dash-lib-grid">
            <Link href="/dashboard" className="uo-dash-libcard">
              <span className="uo-dash-libcard-title">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Start a new task
              </span>
              <p className="uo-dash-libcard-preview">
                Open the composer and hand UniOffer an instruction — draft an essay,
                build a list, plan a timeline.
              </p>
            </Link>
          </div>
        </div>

        <div className="uo-dash-lib-group">
          <div className="uo-dash-lib-group-head">
            <span className="uo-dash-lib-group-title">Older</span>
          </div>
          <div className="uo-dash-lib-grid">
            {ROWS.map((r) => (
              <Link href={r.href} key={r.title} className="uo-dash-libcard">
                <div className="uo-dash-libcard-head">
                  <span className="uo-dash-libcard-title">
                    <span aria-hidden="true">{r.emoji}</span>
                    {r.title}
                  </span>
                  <span className="uo-dash-lib-group-date">{r.date}</span>
                </div>
                <p className="uo-dash-libcard-preview">{r.preview}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </DashboardShell>
  );
}
