"use client";

/**
 * OsThemeWatcher — landing-only live OS theme sync.
 *
 * The pre-hydration script in app/theme-init.tsx picks the initial
 * theme from `prefers-color-scheme` on the landing page. This client
 * island subscribes to that same media query for the LIFETIME of the
 * landing view, so if the user flips their OS dark/light toggle (or
 * Windows' system-driven sunset switch fires) while the page is open,
 * the site follows instantly — no reload required.
 *
 * Guarded to the landing route only; other routes read the user's
 * explicit localStorage preference via ThemeToggle on the dashboard.
 */

import { useEffect } from "react";

export function OsThemeWatcher() {
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = (isDark: boolean) => {
      document.documentElement.setAttribute(
        "data-theme",
        isDark ? "dark" : "light",
      );
    };
    // Sync once on mount (covers the edge case where the pre-hydration
    // script missed due to embedded-browser localStorage weirdness).
    apply(mq.matches);
    const onChange = (e: MediaQueryListEvent) => apply(e.matches);
    // addEventListener is the modern path; older Safari still needs the
    // deprecated addListener shim, but we target evergreen Next 15.
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return null;
}
