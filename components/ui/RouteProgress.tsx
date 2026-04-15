"use client";

/**
 * RouteProgress — top-of-page loading bar that animates whenever the
 * App Router begins navigating to a new route.
 *
 * Why this exists: Next 15 + RSC streams a route in chunks, so a slow
 * server component can leave the user staring at the previous page for
 * a beat with no feedback. NProgress-style bars are the universally
 * understood signal that "yes, something is happening." We render our
 * own (rather than pulling NProgress in) to keep the dep tree small.
 *
 * Implementation:
 *   - We watch `usePathname()` + `useSearchParams()`. When either
 *     changes, the bar animates from 0 → 90% over ~500ms, then jumps
 *     to 100% on the next tick (which is the moment the new route's
 *     server payload has been committed).
 *   - We also hook `<Link>` and `<a>` clicks at the document level so
 *     the bar starts moving the moment the user clicks, before the
 *     pathname has actually changed. This is the "feels instant" part.
 *   - Pure presentation; no analytics, no router import gymnastics.
 *
 * Wellbeing rule: this component is allowed in the wellbeing surface
 * because it's pure UI, no telemetry. Importing it does not pull in
 * any admissions chrome.
 */

import * as React from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function RouteProgress() {
  const pathname = usePathname();
  const search = useSearchParams();
  const key = `${pathname}?${search?.toString() ?? ""}`;

  const [progress, setProgress] = React.useState(0);
  const [visible, setVisible] = React.useState(false);
  const timersRef = React.useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = React.useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const start = React.useCallback(() => {
    clearTimers();
    setVisible(true);
    setProgress(8);
    // Trickle up to ~85% while we wait for the route to commit.
    timersRef.current.push(setTimeout(() => setProgress(35), 80));
    timersRef.current.push(setTimeout(() => setProgress(60), 220));
    timersRef.current.push(setTimeout(() => setProgress(85), 480));
  }, [clearTimers]);

  const finish = React.useCallback(() => {
    clearTimers();
    setProgress(100);
    timersRef.current.push(
      setTimeout(() => {
        setVisible(false);
        // Reset under cover of the fade-out so the next start() begins at 0.
        setTimeout(() => setProgress(0), 200);
      }, 180),
    );
  }, [clearTimers]);

  // Anchor / Link click → kick the bar off immediately, before the
  // pathname change is observable. This is what makes routing feel
  // snappy.
  React.useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href) return;
      // External, anchor-only, mailto, tel — let the browser handle it.
      if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      try {
        const url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin) return;
        if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      } catch {
        return;
      }
      if (anchor.target && anchor.target !== "_self") return;
      start();
    }
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true } as EventListenerOptions);
  }, [start]);

  // When the route actually commits, finish the bar.
  React.useEffect(() => {
    finish();
    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        zIndex: 9999,
        pointerEvents: "none",
        opacity: visible ? 1 : 0,
        transition: "opacity 200ms ease-out",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${progress}%`,
          background: "linear-gradient(90deg, #173B63 0%, #A33A3A 100%)",
          boxShadow: "0 0 8px rgba(163, 58, 58, 0.5)",
          transition: "width 200ms ease-out",
        }}
      />
    </div>
  );
}
