"use client";

/**
 * ThemeToggle
 *
 * The canonical light/dark switch mounted in the top nav. Writes the
 * chosen theme to localStorage under the key `unioffer-theme` (per
 * UNIOFFER-SPEC-01) so the pre-hydration script in `app/theme-init.tsx`
 * can read it on the next page load and set `data-theme` on <html>
 * before first paint (no FOUC). Legacy key `uo-theme` is auto-migrated
 * by theme-init.tsx — this component only ever writes the spec key.
 *
 * Accessibility:
 *   - role=button is implicit on <button>
 *   - aria-pressed reflects current theme (true when dark, the default)
 *   - aria-label changes with state so screen readers announce the next
 *     action ("Switch to light theme" / "Switch to dark theme")
 *   - Icons are inline SVG — no emoji (Andy's no-emoji rule, v3 §0)
 *
 * Initial state:
 *   We can't call `document` during SSR, so the button renders in a
 *   neutral state on the server. On mount we sync `theme` from the
 *   attribute already set by ThemeInit. This avoids a hydration
 *   mismatch because the button's rendered markup doesn't depend on
 *   theme until after mount.
 */
import { useEffect, useState } from "react";

type Theme = "light" | "dark";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    setTheme(current === "light" ? "light" : "dark");
    setMounted(true);
  }, []);

  const flip = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("unioffer-theme", next);
      // One-shot cleanup of legacy key so both don't coexist indefinitely.
      localStorage.removeItem("uo-theme");
    } catch {
      // localStorage blocked (Safari private mode, embedded browsers).
      // The attribute is still set for this session — acceptable.
    }
  };

  const isDark = theme === "dark";
  const label = isDark ? "Switch to light theme" : "Switch to dark theme";

  return (
    <button
      type="button"
      onClick={flip}
      aria-label={label}
      aria-pressed={mounted ? isDark : undefined}
      className="uo-theme-toggle"
      suppressHydrationWarning
    >
      {isDark ? (
        // Sun — shown when current theme is dark (click = go light)
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
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      ) : (
        // Moon — shown when current theme is light (click = go dark)
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
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}
