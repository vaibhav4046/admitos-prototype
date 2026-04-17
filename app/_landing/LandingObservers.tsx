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
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ── Reveal observer ────────────────────────────────────────
    let io: IntersectionObserver | null = null;
    let fallback: ReturnType<typeof setTimeout> | null = null;
    if (targets.length > 0) {
      if (reduce) {
        targets.forEach((el) => el.setAttribute("data-reveal", "in"));
      } else {
        io = new IntersectionObserver(
          (entries) => {
            entries.forEach((e) => {
              if (e.isIntersecting) {
                e.target.setAttribute("data-reveal", "in");
                io?.unobserve(e.target);
              }
            });
          },
          { rootMargin: "-10% 0px -10% 0px", threshold: 0.05 },
        );
        targets.forEach((t) => io!.observe(t));
        // Reveal anything still hidden after 1.2s to cover End-key
        // and anchor jumps that skip past the observer window.
        fallback = setTimeout(() => {
          targets.forEach((el) => {
            if (el.getAttribute("data-reveal") !== "in") {
              el.setAttribute("data-reveal", "in");
            }
          });
        }, 1200);
      }
    }

    // ── Nav shrink on scroll ───────────────────────────────────
    // Adds `.is-scrolled` to <header.uo-nav> once we pass 16px so
    // landing-v3.css can collapse its height from 72px to 64px.
    const nav = document.querySelector<HTMLElement>("header.uo-nav");
    let rafId = 0;
    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        if (!nav) return;
        if (window.scrollY > 16) nav.classList.add("is-scrolled");
        else nav.classList.remove("is-scrolled");
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      io?.disconnect();
      if (fallback) clearTimeout(fallback);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return null;
}
