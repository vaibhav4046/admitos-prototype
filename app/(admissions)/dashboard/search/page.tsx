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
      "First 75 words open on the moment curiosity about markets tipped into philosophy. Catie flagged two evidence-heavy paragraphs as thin on argument.",
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
  {
    href: "/dashboard/library",
    emoji: "🗓️",
    title: "6-month timeline — 15-Oct early submission",
    preview:
      "A2 pinned the UCAS deadline, Common App ED round, and Cambridge interview slot. Two gaps flagged for counsellor review.",
    date: "2026/4/6",
  },
];

export default async function SearchPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const [authed, locale, params] = await Promise.all([
    getCurrentUser(),
    readLocale(),
    searchParams ?? Promise.resolve({ q: undefined } as { q?: string }),
  ]);
  const query = (params?.q ?? "").trim();
  const copy = getDashboardCopy(locale);
  const user = authed
    ? {
        displayName: displayNameFromEmail(authed.email) || authed.email,
        email: authed.email,
      }
    : null;

  const filtered = query
    ? ROWS.filter((r) =>
        (r.title + " " + r.preview).toLowerCase().includes(query.toLowerCase()),
      )
    : ROWS;

  return (
    <DashboardShell copy={copy} locale={locale} title={copy.sidebar.search} user={user}>
      <section className="uo-dash-lib" aria-label="Search tasks">
        <form
          role="search"
          className="uo-dash-lib-toolbar"
          action="/dashboard/search"
          method="get"
        >
          <div className="uo-dash-lib-search" style={{ width: "100%", maxWidth: 560 }}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              name="q"
              defaultValue={query}
              placeholder="Search tasks..."
              aria-label="Search tasks"
              autoFocus
            />
          </div>
        </form>

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
            <span className="uo-dash-lib-group-title">
              {query ? `Results for "${query}"` : "Older"}
            </span>
            {query && (
              <span className="uo-dash-lib-group-date">
                {filtered.length} match{filtered.length === 1 ? "" : "es"}
              </span>
            )}
          </div>
          {filtered.length === 0 ? (
            <p
              style={{
                margin: 0,
                padding: "28px 16px",
                color: "var(--dash-fg-soft)",
                fontSize: 14,
              }}
            >
              No tasks match your query. Try a different keyword or{" "}
              <Link href="/dashboard" style={{ color: "var(--dash-fg)" }}>
                start a new task
              </Link>
              .
            </p>
          ) : (
            <div className="uo-dash-lib-grid">
              {filtered.map((r) => (
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
          )}
        </div>
      </section>
    </DashboardShell>
  );
}
