"use client";

/**
 * LandingObservers
 *
 * Single client island that wires the IntersectionObserver-driven
 * scroll reveals across every landing section. Sections start with
 * `data-reveal=""` and gain `data-reveal="in"` as they enter the
 * viewport — the corresponding CSS in landing-v3.css does the
 * fade + 12px slide.
 *
 * Reduced-motion: skip the observer entirely and mark every reveal
 * target as visible immediately so the layout reads identically.
 */

import { useEffect } from "react";

export function LandingObservers() {
  useEffect(() => {
    const targets = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]"),
    );
    if (targets.length === 0) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      targets.forEach((el) => el.setAttribute("data-reveal", "in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.setAttribute("data-reveal", "in");
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: "-10% 0px -10% 0px", threshold: 0.05 },
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, []);

  return null;
}
