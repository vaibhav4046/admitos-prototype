"use client";

/**
 * DashboardShell — Manus-style chrome wrapper.
 *
 * Owns the open/close state for the SettingsModal so any page
 * rendered inside the shell can trigger it via the sidebar gear.
 * Renders the topbar + sidebar + main slot.
 *
 * v2.3 i18n & theme integration:
 *   - Takes a typed `DashboardCopy` + active `locale` so every label
 *     (sidebar, topbar, settings modal) follows the cookie-driven
 *     locale chosen on the landing page or in the shell itself.
 *   - Topbar hosts a LangSwitcher (same pill the landing uses) and a
 *     ThemeToggle — both broadcast through the cookie / localStorage
 *     seams, so a change here is visible everywhere (landing,
 *     dashboard, signed-in pages) on next render.
 */

import { useState, type ReactNode } from "react";

import { LangSwitcher } from "@/app/_components/LangSwitcher";
import { ThemeToggle } from "@/app/_components/ThemeToggle";
import type { DashboardCopy } from "@/app/_i18n/types";

import { SettingsModal } from "./SettingsModal";
import { Sidebar } from "./Sidebar";

interface DashboardShellProps {
  copy: DashboardCopy;
  locale: string;
  /** Per-page topbar title override. When omitted the shell falls
   *  back to `copy.topbar.title` (the dashboard home's global
   *  "UniOffer · Admissions" label). */
  title?: string;
  children: ReactNode;
  user?: { displayName: string; email: string } | null;
  rightSlot?: ReactNode;
}

export function DashboardShell({
  copy,
  locale,
  title,
  children,
  user,
  rightSlot,
}: DashboardShellProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="uo-dash-shell">
      <Sidebar copy={copy.sidebar} onOpenSettings={() => setSettingsOpen(true)} />

      <div className="uo-dash-main">
        <div className="uo-dash-topbar">
          <span className="uo-dash-topbar-title">{title ?? copy.topbar.title}</span>
          <div className="uo-dash-topbar-right">
            {rightSlot}
            <span className="uo-dash-chip" title={copy.topbar.credits}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1 3-6Z" />
              </svg>
              1,300
            </span>
            <div className="uo-dash-topbar-divider" aria-hidden="true" />
            <LangSwitcher currentLocale={locale} />
            <ThemeToggle />
            <button
              type="button"
              className="uo-dash-avatar"
              aria-label={copy.topbar.accountMenu}
              onClick={() => setSettingsOpen(true)}
            >
              {user?.displayName ? (
                <span aria-hidden="true">
                  {user.displayName.charAt(0).toUpperCase()}
                </span>
              ) : null}
            </button>
          </div>
        </div>
        {children}
      </div>

      {settingsOpen && (
        <SettingsModal
          copy={copy.settings}
          locale={locale}
          onClose={() => setSettingsOpen(false)}
          user={user}
        />
      )}
    </div>
  );
}
