"use client";

/**
 * LangSwitcher — UNIOFFER-SPEC-01 v2.2
 *
 * Ten selectable locales — EN, Simplified + Traditional Chinese,
 * Korean, Arabic, Vietnamese, Malay, Thai, Hindi, Japanese. Selection
 * persists in localStorage under the spec key `unioffer-lang`, with a
 * one-shot migration from the legacy V6 key `uo-lang` so returning
 * users don't lose their preference. Click-outside and Escape close
 * the dropdown. The button shows the currently selected language's
 * native label.
 *
 * v2.2 note: full i18n routing (middleware + per-locale dictionaries)
 * is wired in a follow-up — this switcher persists the choice and is
 * the seam those routes will read from.
 */
import { useEffect, useState } from "react";

const LANGS = [
  { code: "en", label: "EN" },
  { code: "zh", label: "简体中文" },
  { code: "zt", label: "繁體中文" },
  { code: "ko", label: "한국어" },
  { code: "ar", label: "العربية" },
  { code: "vi", label: "Tiếng Việt" },
  { code: "ms", label: "Bahasa Melayu" },
  { code: "th", label: "ภาษาไทย" },
  { code: "hi", label: "हिन्दी" },
  { code: "ja", label: "日本語" },
] as const;

interface LangSwitcherProps {
  /**
   * Server-resolved locale (read from the `unioffer-lang` cookie on the
   * server). When provided, the switcher hydrates in the correct state
   * so there's no client-side "flash of English" on first paint. Optional
   * because landing surfaces that read `document.documentElement.lang`
   * via useEffect still work without passing it.
   */
  currentLocale?: string;
}

export function LangSwitcher({ currentLocale }: LangSwitcherProps = {}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(currentLocale ?? "en");

  /* Restore persisted language on mount, with one-shot migration from
     the legacy key `uo-lang` → `unioffer-lang`. */
  useEffect(() => {
    try {
      const K = "unioffer-lang";
      const LEGACY = "uo-lang";
      let stored = localStorage.getItem(K);
      if (!stored) {
        const legacy = localStorage.getItem(LEGACY);
        if (legacy) {
          stored = legacy;
          localStorage.setItem(K, legacy);
          localStorage.removeItem(LEGACY);
        }
      }
      if (stored) setSelected(stored);
    } catch {
      /* localStorage blocked — acceptable */
    }
  }, []);

  /* Click-outside-to-close */
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".uo-lang")) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [open]);

  /* Escape key to close */
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const handlePick = (code: string) => {
    setSelected(code);
    setOpen(false);
    try {
      localStorage.setItem("unioffer-lang", code);
      localStorage.removeItem("uo-lang");
    } catch {
      /* localStorage blocked */
    }
  };

  const currentLabel =
    LANGS.find((l) => l.code === selected)?.label ?? "EN";

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
        <span>{currentLabel}</span>
      </button>
      {open && (
        <ul className="uo-lang__menu" role="listbox">
          {LANGS.map((l) => (
            <li key={l.code}>
              <button
                type="button"
                role="option"
                aria-selected={l.code === selected}
                className={`uo-lang__opt${l.code === selected ? " is-active" : ""}`}
                onClick={() => handlePick(l.code)}
              >
                <span>{l.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
