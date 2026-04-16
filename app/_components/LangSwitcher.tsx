"use client";

/**
 * LangSwitcher
 *
 * Andy's spec: 10 languages in priority order (UK admissions feeder
 * markets), English active, the other 9 rendered as "Coming soon" with
 * `aria-disabled` so screen readers announce them as non-interactive
 * but they remain visible. Andy's checklist item 5: Deutsche locale
 * is intentionally absent from the priority list.
 *
 * The current locale is always `en` in M1; switching is purely a
 * marketing signal until the i18n layer lands in M2.
 *
 * Click on `en` is a no-op. Click on a coming-soon entry shows a brief
 * inline toast — no analytics, no router push.
 */
import { useState } from "react";

export const LANGS = [
  { code: "en", label: "English",        active: true  },
  { code: "zh", label: "简体中文",        active: false },
  { code: "zt", label: "繁體中文",        active: false },
  { code: "ko", label: "한국어",          active: false },
  { code: "ar", label: "العربية",         active: false },
  { code: "vi", label: "Tiếng Việt",     active: false },
  { code: "ms", label: "Bahasa Melayu",  active: false },
  { code: "th", label: "ภาษาไทย",        active: false },
  { code: "hi", label: "हिन्दी",           active: false },
  { code: "ja", label: "日本語",          active: false },
] as const;

export function LangSwitcher() {
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const handlePick = (code: string, active: boolean, label: string) => {
    if (active) {
      setOpen(false);
      return;
    }
    setToast(`${label} — coming soon`);
    window.setTimeout(() => setToast(null), 2200);
  };

  return (
    <div className="uo-lang">
      <button
        type="button"
        className="uo-lang__btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" />
        </svg>
        <span>EN</span>
      </button>
      {open && (
        <ul className="uo-lang__menu" role="listbox">
          {LANGS.map((l) => (
            <li key={l.code}>
              <button
                type="button"
                role="option"
                aria-selected={l.active}
                aria-disabled={!l.active}
                className={`uo-lang__opt${l.active ? " is-active" : ""}`}
                onClick={() => handlePick(l.code, l.active, l.label)}
              >
                <span>{l.label}</span>
                {!l.active && <span className="uo-lang__cs">Coming soon</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
      {toast && <div className="uo-lang__toast" role="status">{toast}</div>}
    </div>
  );
}
