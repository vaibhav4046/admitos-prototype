"use client";

/**
 * LangSwitcher — V6
 *
 * All 10 languages are selectable (no "Coming soon"). Selection persists
 * in localStorage under `uo-lang`. Click-outside and Escape key close
 * the dropdown. The button shows the currently selected language label.
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

export function LangSwitcher() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("en");

  /* Restore persisted language on mount */
  useEffect(() => {
    try {
      const stored = localStorage.getItem("uo-lang");
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
      localStorage.setItem("uo-lang", code);
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
