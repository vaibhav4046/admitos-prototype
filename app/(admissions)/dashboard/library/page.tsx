/**
 * Dashboard → Library.
 *
 * Grid of task-scoped documents (essay drafts, school lists, counsellor
 * notes). Manus-style: filter + search toolbar at the top, then groups
 * per task with a right-aligned date stamp. Server component — the
 * contents are hard-coded for M1; the real data source lands in M2 once
 * the CEF DDL ships.
 */

import { getCurrentUser } from "@/services/auth/server";
import { displayNameFromEmail } from "@/lib/utils";

import { getDashboardCopy } from "@/app/_i18n";
import { readLocale } from "@/app/_i18n/server";

import { DashboardShell } from "../_components/DashboardShell";

interface LibEntry {
  title: string;
  preview: string;
}

interface LibGroup {
  title: string;
  date: string;
  entries: LibEntry[];
}

const GROUPS: LibGroup[] = [
  {
    title: "Oxford PPE — personal statement draft 2",
    date: "2026/4/14",
    entries: [
      {
        title: "personal-statement.draft-2.md",
        preview:
          "Opens with the moment curiosity about markets tipped into philosophy — not a CV summary. Catie flagged paragraphs 2 and 4 as evidence-heavy but light on argument. Trim 48 words before the next counsellor pass.",
      },
      {
        title: "voice-check.md",
        preview:
          "A0 ran a drift check against your Session 1 transcripts. Sentence rhythm matches; three phrases reading as borrowed academic register — flagged inline for a human rewrite.",
      },
    ],
  },
  {
    title: "UK + US school list — pool-adjusted",
    date: "2026/4/10",
    entries: [
      {
        title: "shortlist.md",
        preview:
          "12 schools ranked by pool-adjusted admit rate for your cohort. LSE Gov leads the board ahead of Oxford PPE. Stanford SCPD is a reach; UC Berkeley Letters + Science sits at safety+.",
      },
      {
        title: "why-lse.outline.md",
        preview:
          "Three-beat structure: academic fit (Pickering's quant-heavy syllabus), community (SU Gov Soc debates), trajectory (LSE → civil-service fast-stream → think-tank).",
      },
    ],
  },
  {
    title: "Counsellor notes — Session 6",
    date: "2026/4/2",
    entries: [
      {
        title: "session-6.notes.md",
        preview:
          "You are on pace for a 15-Oct early submission. Focus the next two weeks on tightening activity paragraph 3 and booking the Cambridge interview-prep slot with Dr. Sato.",
      },
      {
        title: "interview-prep.plan.md",
        preview:
          "Three mock rounds queued: Cambridge-style PPE challenge, LSE policy case, and an unstructured curveball. A6 logs every session to the Commons so your counsellor sees the same footage you do.",
      },
    ],
  },
];

const DOC_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" />
    <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
  </svg>
);

const FILTER_ICON = (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3Z" />
  </svg>
);

const STAR_ICON = (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1 3-6Z" />
  </svg>
);

export default async function LibraryPage() {
  const [authed, locale] = await Promise.all([getCurrentUser(), readLocale()]);
  const copy = getDashboardCopy(locale);
  const user = authed
    ? {
        displayName: displayNameFromEmail(authed.email) || authed.email,
        email: authed.email,
      }
    : null;

  return (
    <DashboardShell copy={copy} locale={locale} title={copy.sidebar.library} user={user}>
      <section className="uo-dash-lib">
        <div className="uo-dash-lib-toolbar">
          <div className="uo-dash-lib-toolbar-left" role="group" aria-label="Filter library">
            <button type="button" className="uo-dash-lib-filter" aria-pressed="true">
              {FILTER_ICON} All
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            <button type="button" className="uo-dash-lib-filter" aria-pressed="false">
              {STAR_ICON} My favourites
            </button>
          </div>
          <form role="search" className="uo-dash-lib-search" action="/dashboard/search">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input name="q" placeholder="Search files" aria-label="Search files" />
          </form>
        </div>

        {GROUPS.map((g) => (
          <div key={g.title} className="uo-dash-lib-group">
            <div className="uo-dash-lib-group-head">
              <span className="uo-dash-lib-group-title">{g.title}</span>
              <span className="uo-dash-lib-group-date">{g.date}</span>
            </div>
            <div className="uo-dash-lib-grid">
              {g.entries.map((e) => (
                <article key={e.title} className="uo-dash-libcard">
                  <div className="uo-dash-libcard-head">
                    <span className="uo-dash-libcard-title">
                      {DOC_ICON}
                      {e.title}
                    </span>
                    <button type="button" className="uo-dash-iconbtn" aria-label="Actions">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="5" cy="12" r="1.4" />
                        <circle cx="12" cy="12" r="1.4" />
                        <circle cx="19" cy="12" r="1.4" />
                      </svg>
                    </button>
                  </div>
                  <p className="uo-dash-libcard-preview">{e.preview}</p>
                </article>
              ))}
            </div>
          </div>
        ))}
      </section>
    </DashboardShell>
  );
}
