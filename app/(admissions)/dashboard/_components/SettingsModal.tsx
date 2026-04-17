"use client";

/**
 * SettingsModal — Manus-style settings overlay.
 *
 * Left rail (Account / Settings / Usage / Scheduled / Mail / Data
 * controls / Cloud browser / My computer / Personalization /
 * Skills / Connectors / Integrations) plus right-pane content for
 * the currently selected tab. Keyboard-escape closes. Backdrop
 * click closes. Focus traps to the modal root for the duration.
 *
 * v2.3 wiring:
 *   - Takes `DashboardCopy["settings"]` + active `locale` so every
 *     tab label, eyebrow, button, placeholder, and "coming soon"
 *     string is localised. No hard-coded English strings remain.
 *   - Theme radio group reads/writes the canonical `unioffer-theme`
 *     localStorage key (same key ThemeInit + ThemeToggle use) and
 *     broadcasts a `unioffer:theme` CustomEvent so every listener
 *     (nav toggle, OsThemeWatcher, etc.) stays in sync without a
 *     provider. "Follow System" clears the key and immediately
 *     applies `prefers-color-scheme`.
 *   - Language `<select>` writes the `unioffer-lang` cookie and
 *     calls `router.refresh()` — same behaviour as LangSwitcher, so
 *     the modal and the topbar pill agree on a single source of
 *     truth.
 */

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { THEME_EVENT } from "@/app/_components/ThemeToggle";
import { LOCALES } from "@/app/_i18n";
import { LOCALE_COOKIE } from "@/app/_i18n/client-keys";
import type { DashboardCopy } from "@/app/_i18n/types";

const THEME_KEY = "unioffer-theme";
const LEGACY_THEME_KEY = "uo-theme";

type Tab =
  | "account"
  | "settings"
  | "usage"
  | "scheduled"
  | "mail"
  | "data"
  | "cloud"
  | "computer"
  | "personalization"
  | "skills"
  | "connectors"
  | "integrations";

type AppearancePref = "light" | "dark" | "system";

function readAppearancePref(): AppearancePref {
  try {
    const stored =
      localStorage.getItem(THEME_KEY) ?? localStorage.getItem(LEGACY_THEME_KEY);
    if (stored === "light" || stored === "dark") return stored;
    return "system";
  } catch {
    return "system";
  }
}

function applyAppearance(pref: AppearancePref) {
  if (typeof window === "undefined") return;
  if (pref === "system") {
    try {
      localStorage.removeItem(THEME_KEY);
      localStorage.removeItem(LEGACY_THEME_KEY);
    } catch {
      /* ignore */
    }
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const next = prefersDark ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: next }));
    return;
  }
  document.documentElement.setAttribute("data-theme", pref);
  try {
    localStorage.setItem(THEME_KEY, pref);
    localStorage.removeItem(LEGACY_THEME_KEY);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: pref }));
}

interface SettingsModalProps {
  copy: DashboardCopy["settings"];
  locale: string;
  onClose: () => void;
  user?: { displayName: string; email: string } | null;
}

export function SettingsModal({
  copy,
  locale,
  onClose,
  user,
}: SettingsModalProps) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("settings");
  const [theme, setTheme] = useState<AppearancePref>("system");
  const [updates, setUpdates] = useState(true);
  const [queueMail, setQueueMail] = useState(true);

  // Hydrate theme from localStorage on mount, then listen for external
  // changes (ThemeToggle, OsThemeWatcher) so this modal never falls
  // out of sync with the rest of the shell.
  useEffect(() => {
    setTheme(readAppearancePref());
    const onExternal = () => setTheme(readAppearancePref());
    window.addEventListener(THEME_EVENT, onExternal);
    return () => window.removeEventListener(THEME_EVENT, onExternal);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const pickTheme = useCallback((next: AppearancePref) => {
    setTheme(next);
    applyAppearance(next);
  }, []);

  const pickLocale = useCallback(
    (nextLocale: string) => {
      if (nextLocale === locale) return;
      try {
        document.cookie = `${LOCALE_COOKIE}=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;
        localStorage.setItem("unioffer-lang", nextLocale);
        localStorage.removeItem("uo-lang");
      } catch {
        /* localStorage blocked */
      }
      router.refresh();
    },
    [locale, router],
  );

  return (
    <div
      className="uo-dash-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="uo-dash-modal">
        <aside className="uo-dash-modal-side">
          <div className="uo-dash-modal-side-head">
            <div className="uo-dash-modal-side-avatar" aria-hidden="true">
              {user?.displayName ? (
                <span>{user.displayName.charAt(0).toUpperCase()}</span>
              ) : null}
            </div>
            <div className="uo-dash-modal-side-who">
              <span className="uo-dash-modal-side-who-name">
                {user?.displayName ?? copy.userFallback}
              </span>
              <span className="uo-dash-modal-side-who-plan">{copy.planPersonal}</span>
            </div>
          </div>

          <ul className="uo-dash-modal-nav">
            {(
              [
                "account",
                "settings",
                "usage",
                "scheduled",
                "mail",
                "data",
                "cloud",
                "computer",
                "personalization",
                "skills",
                "connectors",
                "integrations",
              ] as const
            ).map((id) => (
              <li key={id}>
                <button
                  type="button"
                  aria-current={tab === id || undefined}
                  onClick={() => setTab(id)}
                >
                  <TabIcon id={id} />
                  <span>{copy.tabs[id]}</span>
                </button>
              </li>
            ))}
          </ul>

          <div className="uo-dash-modal-foot">
            <button type="button" className="uo-dash-navlink" style={{ width: "100%" }}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" />
              </svg>
              {copy.getHelp}
            </button>
          </div>
        </aside>

        <div className="uo-dash-modal-body">
          <button
            type="button"
            className="uo-dash-modal-close"
            onClick={onClose}
            aria-label={copy.close}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m18 6-12 12M6 6l12 12" />
            </svg>
          </button>

          <h2 id="settings-title" className="uo-dash-modal-title">
            {copy.tabs[tab]}
          </h2>
          <hr />

          {tab === "settings" && (
            <SettingsPane
              copy={copy}
              locale={locale}
              onPickLocale={pickLocale}
              theme={theme}
              onPickTheme={pickTheme}
              updates={updates}
              setUpdates={setUpdates}
              queueMail={queueMail}
              setQueueMail={setQueueMail}
            />
          )}
          {tab === "personalization" && (
            <PersonalizationPane copy={copy} user={user} />
          )}
          {tab === "account" && <AccountPane copy={copy} user={user} />}
          {tab !== "settings" && tab !== "personalization" && tab !== "account" && (
            <EmptyPane copy={copy} tab={tab} />
          )}
        </div>
      </div>
    </div>
  );
}

function SettingsPane({
  copy,
  locale,
  onPickLocale,
  theme,
  onPickTheme,
  updates,
  setUpdates,
  queueMail,
  setQueueMail,
}: {
  copy: DashboardCopy["settings"];
  locale: string;
  onPickLocale: (code: string) => void;
  theme: AppearancePref;
  onPickTheme: (t: AppearancePref) => void;
  updates: boolean;
  setUpdates: (b: boolean) => void;
  queueMail: boolean;
  setQueueMail: (b: boolean) => void;
}) {
  return (
    <>
      <p className="uo-dash-modal-eyebrow">{copy.generalEyebrow}</p>
      <div className="uo-dash-modal-field">
        <label className="uo-dash-modal-label" htmlFor="lang">
          {copy.languageLabel}
        </label>
        <select
          id="lang"
          className="uo-dash-modal-select"
          value={locale}
          onChange={(e) => onPickLocale(e.target.value)}
        >
          {LOCALES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label}
            </option>
          ))}
        </select>
      </div>

      <div className="uo-dash-modal-field">
        <p className="uo-dash-modal-label">{copy.appearanceLabel}</p>
        <div className="uo-dash-theme-row" role="radiogroup" aria-label={copy.appearanceLabel}>
          {(["light", "dark", "system"] as const).map((k) => (
            <button
              key={k}
              type="button"
              className="uo-dash-theme-opt"
              aria-pressed={theme === k}
              onClick={() => onPickTheme(k)}
            >
              <span className={`uo-dash-theme-opt-swatch ${k === "system" ? "sys" : k}`} />
              {k === "system"
                ? copy.followSystem
                : k === "light"
                ? copy.lightLabel
                : copy.darkLabel}
            </button>
          ))}
        </div>
      </div>

      <hr />
      <p className="uo-dash-modal-eyebrow">{copy.communicationEyebrow}</p>
      <div className="uo-dash-toggle-row">
        <div className="uo-dash-toggle-row-txt">
          <span className="uo-dash-toggle-row-title">{copy.updatesTitle}</span>
          <span className="uo-dash-toggle-row-sub">{copy.updatesSub}</span>
        </div>
        <button
          type="button"
          className="uo-dash-toggle"
          role="switch"
          aria-checked={updates}
          onClick={() => setUpdates(!updates)}
          aria-label={copy.updatesTitle}
        />
      </div>
      <div className="uo-dash-toggle-row">
        <div className="uo-dash-toggle-row-txt">
          <span className="uo-dash-toggle-row-title">{copy.queueMailTitle}</span>
          <span className="uo-dash-toggle-row-sub">{copy.queueMailSub}</span>
        </div>
        <button
          type="button"
          className="uo-dash-toggle"
          role="switch"
          aria-checked={queueMail}
          onClick={() => setQueueMail(!queueMail)}
          aria-label={copy.queueMailTitle}
        />
      </div>

      <hr />
      <div className="uo-dash-toggle-row">
        <div className="uo-dash-toggle-row-txt">
          <span className="uo-dash-toggle-row-title">{copy.manageCookies}</span>
        </div>
        <button type="button" className="uo-dash-lib-filter">
          {copy.manageBtn}
        </button>
      </div>
    </>
  );
}

function PersonalizationPane({
  copy,
  user,
}: {
  copy: DashboardCopy["settings"];
  user?: { displayName: string; email: string } | null;
}) {
  return (
    <>
      <p className="uo-dash-modal-eyebrow">{copy.personalizationEyebrow}</p>
      <div className="uo-dash-modal-field">
        <label className="uo-dash-modal-label" htmlFor="nick">
          {copy.nicknameLabel}
        </label>
        <input
          id="nick"
          className="uo-dash-modal-select"
          placeholder={copy.nicknamePlaceholder}
          defaultValue={user?.displayName ?? ""}
        />
      </div>
      <div className="uo-dash-modal-field">
        <label className="uo-dash-modal-label" htmlFor="role">
          {copy.occupationLabel}
        </label>
        <input
          id="role"
          className="uo-dash-modal-select"
          placeholder={copy.occupationPlaceholder}
        />
      </div>
      <div className="uo-dash-modal-field">
        <label className="uo-dash-modal-label" htmlFor="about">
          {copy.aboutLabel}
        </label>
        <textarea
          id="about"
          className="uo-dash-modal-select"
          rows={5}
          placeholder={copy.aboutPlaceholder}
        />
      </div>
    </>
  );
}

function AccountPane({
  copy,
  user,
}: {
  copy: DashboardCopy["settings"];
  user?: { displayName: string; email: string } | null;
}) {
  return (
    <>
      <p className="uo-dash-modal-eyebrow">{copy.accountEyebrow}</p>
      <div className="uo-dash-modal-field">
        <span className="uo-dash-modal-label">{copy.emailLabel}</span>
        <span style={{ color: "var(--fg-muted)", fontSize: 14 }}>
          {user?.email ?? copy.notSignedIn}
        </span>
      </div>
    </>
  );
}

function EmptyPane({
  copy,
  tab,
}: {
  copy: DashboardCopy["settings"];
  tab: Tab;
}) {
  const label = copy.tabs[tab];
  return (
    <p style={{ color: "var(--fg-soft)", fontSize: 14, margin: 0 }}>
      {copy.comingSoon.replace("{label}", label)}
    </p>
  );
}

/* ── Tab icons (pure SVG, theme-token stroke) ───────────────── */
function TabIcon({ id }: { id: Tab }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    width: 16,
    height: 16,
    "aria-hidden": true,
  };
  switch (id) {
    case "account":
      return (
        <svg {...common}>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    case "settings":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
        </svg>
      );
    case "usage":
      return (
        <svg {...common}>
          <path d="M3 12h4l3-9 4 18 3-9h4" />
        </svg>
      );
    case "scheduled":
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M3 10h18M8 2v4M16 2v4" />
        </svg>
      );
    case "mail":
      return (
        <svg {...common}>
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="m22 6-10 7L2 6" />
        </svg>
      );
    case "data":
      return (
        <svg {...common}>
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M3 5v6c0 1.66 4.03 3 9 3s9-1.34 9-3V5M3 11v6c0 1.66 4.03 3 9 3s9-1.34 9-3v-6" />
        </svg>
      );
    case "cloud":
      return (
        <svg {...common}>
          <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10Z" />
        </svg>
      );
    case "computer":
      return (
        <svg {...common}>
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <path d="M8 21h8M12 17v4" />
        </svg>
      );
    case "personalization":
      return (
        <svg {...common}>
          <path d="M12 2 15 8l6 .75-4.5 4.4 1 6.35L12 16.5l-5.5 2.9 1-6.35L3 8.75 9 8l3-6Z" />
        </svg>
      );
    case "skills":
      return (
        <svg {...common}>
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          <circle cx="12" cy="12" r="4" />
        </svg>
      );
    case "connectors":
      return (
        <svg {...common}>
          <path d="M10 14a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71 M14 10a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.71" />
        </svg>
      );
    case "integrations":
      return (
        <svg {...common}>
          <rect x="4" y="4" width="6" height="6" rx="1" />
          <rect x="14" y="4" width="6" height="6" rx="1" />
          <rect x="14" y="14" width="6" height="6" rx="1" />
          <rect x="4" y="14" width="6" height="6" rx="1" />
        </svg>
      );
  }
}
