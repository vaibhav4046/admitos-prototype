"use client";

/**
 * HeroComposer
 *
 * Adie input shell with a cycling typing placeholder. The placeholder
 * is the only mutating element — the rest of the composer is static
 * markup so the page is meaningful pre-hydration and CLS = 0.
 *
 * `suppressHydrationWarning` is set on the <input> because the
 * placeholder text changes between SSR ("ask Adie...") and client
 * (the first item in the rotation), and we don't want React to log
 * a mismatch on every page load.
 *
 * Reduced-motion: the rotation is disabled and the placeholder is
 * pinned to the first prompt.
 */

import { useEffect, useState } from "react";

const PROMPTS = [
  "Ask Adie anything about your application…",
  "What are my chances at Cambridge Engineering?",
  "Draft my UCAS personal statement opener",
  "Compare Oxford PPE vs LSE Government",
  "Build my 8-school US shortlist",
];

export function HeroComposer() {
  const [idx, setIdx] = useState(0);
  const [displayed, setDisplayed] = useState(PROMPTS[0]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const id = window.setInterval(() => {
      setIdx((i) => (i + 1) % PROMPTS.length);
    }, 3500);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const target = PROMPTS[idx] ?? "";
    let i = 0;
    setDisplayed("");
    const id = window.setInterval(() => {
      if (cancelled) return;
      i += 1;
      setDisplayed(target.slice(0, i));
      if (i >= target.length) window.clearInterval(id);
    }, 24);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [idx]);

  return (
    <form
      className="uo-composer"
      role="search"
      aria-label="Ask Adie"
      onSubmit={(e) => e.preventDefault()}
    >
      <label className="uo-visually-hidden" htmlFor="adie-q">
        Ask Adie
      </label>
      <input
        id="adie-q"
        name="q"
        className="uo-composer__input"
        type="text"
        autoComplete="off"
        placeholder={displayed}
        suppressHydrationWarning
      />
      <button type="submit" className="uo-composer__send" aria-label="Send">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </button>
    </form>
  );
}
