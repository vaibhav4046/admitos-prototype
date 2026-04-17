"use client";

/**
 * Sidebar — Manus-style left rail.
 *
 * Client component because the active route highlight uses
 * `usePathname()`. The settings button opens the SettingsModal via
 * a lifted state callback passed down from the dashboard layout.
 *
 * Copy is driven by `DashboardCopy["sidebar"]` so the rail follows
 * the user's locale choice — no hard-coded English.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ThemeToggle } from "@/app/_components/ThemeToggle";
import type { DashboardCopy } from "@/app/_i18n/types";

type NavItem = { href: string; label: string; icon: React.ReactNode };

const ICONS = {
  newTask: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z" />
    </svg>
  ),
  agent: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  ),
  search: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  ),
  library: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  ),
  plus: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  folder: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 20H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2Z" />
    </svg>
  ),
  filter: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3Z" />
    </svg>
  ),
  sidebar: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="9" y1="3" x2="9" y2="21" />
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </svg>
  ),
  grid: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  ),
  monitor: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  ),
  gift: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12h16v9H4z" />
      <path d="M3 7h18v5H3z" />
      <path d="M12 7v14" />
      <path d="M12 7a3 3 0 0 1-3-3 2 2 0 0 1 3-1 2 2 0 0 1 3 1 3 3 0 0 1-3 3z" />
    </svg>
  ),
};

const TASKS: { href: string; emoji: string; title: string; badge?: number }[] = [
  { href: "#", emoji: "🎓", title: "Oxford PPE — personal statement draft 2", badge: 1 },
  { href: "#", emoji: "🏫", title: "US school list — pool-adjusted shortlist" },
];

interface SidebarProps {
  copy: DashboardCopy["sidebar"];
  onOpenSettings: () => void;
}

export function Sidebar({ copy, onOpenSettings }: SidebarProps) {
  const pathname = usePathname();

  const NAV: NavItem[] = [
    { href: "/dashboard",         label: copy.newTask, icon: ICONS.newTask },
    { href: "/dashboard/agent",   label: copy.agent,   icon: ICONS.agent },
    { href: "/dashboard/search",  label: copy.search,  icon: ICONS.search },
    { href: "/dashboard/library", label: copy.library, icon: ICONS.library },
  ];

  return (
    <aside className="uo-dash-side" aria-label={copy.home}>
      <div className="uo-dash-brand">
        <Link href="/dashboard" className="uo-dash-brand-mark uo-brand-lockup" aria-label={copy.home}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/v2/unioffer-wordmark-on-navy.svg"
            alt="UniOffer"
            width={132}
            height={28}
            className="uo-brand-img-dark"
            style={{ height: 28, width: "auto" }}
            draggable={false}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/v2/unioffer-wordmark-greencat-dark.svg"
            alt="UniOffer"
            width={132}
            height={28}
            className="uo-brand-img-light"
            style={{ height: 28, width: "auto" }}
            draggable={false}
          />
        </Link>
        <button type="button" className="uo-dash-iconbtn" aria-label={copy.collapse}>
          {ICONS.sidebar}
        </button>
      </div>

      <ul className="uo-dash-nav">
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className="uo-dash-navlink"
                aria-current={active ? "page" : undefined}
                prefetch
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="uo-dash-sectitle">
        <span>{copy.projects}</span>
        <button type="button" className="uo-dash-iconbtn" aria-label={copy.newProject}>
          {ICONS.plus}
        </button>
      </div>
      <ul className="uo-dash-tasklist">
        <li>
          <Link href="#" className="uo-dash-task">
            {ICONS.folder}
            <span className="uo-dash-task-title">{copy.newProject}</span>
          </Link>
        </li>
      </ul>

      <div className="uo-dash-sectitle">
        <span>{copy.allTasks}</span>
        <button type="button" className="uo-dash-iconbtn" aria-label={copy.filterTasks}>
          {ICONS.filter}
        </button>
      </div>
      <ul className="uo-dash-tasklist">
        {TASKS.map((t) => (
          <li key={t.title}>
            <Link href={t.href} className="uo-dash-task">
              <span className="uo-dash-task-emoji" aria-hidden="true">{t.emoji}</span>
              <span className="uo-dash-task-title">{t.title}</span>
              {t.badge ? <span className="uo-dash-task-badge">{t.badge}</span> : null}
            </Link>
          </li>
        ))}
      </ul>

      <div className="uo-dash-side-foot">
        <Link href="#" className="uo-dash-share">
          <span className="uo-dash-share-icon" aria-hidden="true">{ICONS.gift}</span>
          <span className="uo-dash-share-txt">
            <span className="uo-dash-share-title">{copy.share}</span>
            <span className="uo-dash-share-sub">{copy.shareSub}</span>
          </span>
        </Link>

        <div className="uo-dash-side-toolbar">
          <div className="uo-dash-side-toolbar-left">
            <button
              type="button"
              className="uo-dash-iconbtn"
              onClick={onOpenSettings}
              aria-label={copy.settings}
            >
              {ICONS.settings}
            </button>
            <button type="button" className="uo-dash-iconbtn" aria-label={copy.apps}>
              {ICONS.grid}
            </button>
            <button type="button" className="uo-dash-iconbtn" aria-label={copy.desktop}>
              {ICONS.monitor}
            </button>
            <ThemeToggle />
          </div>
          <span className="uo-dash-side-metabrand">{copy.metaBrand}</span>
        </div>
      </div>
    </aside>
  );
}
