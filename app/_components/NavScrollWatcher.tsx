"use client";

/**
 * NavScrollWatcher: toggles `is-scrolled` on the landing nav.
 *
 * landing-v3.css shrinks `.uo-nav` from 72px to 64px while the class is
 * present. Mounted as a child of the `<header>`; renders nothing.
 */

import { useEffect } from "react";

const SCROLL_THRESHOLD_PX = 8;

export function NavScrollWatcher() {
  useEffect(() => {
    const nav = document.querySelector<HTMLElement>(".uo-nav");
    if (!nav) return;

    const sync = () =>
      nav.classList.toggle("is-scrolled", window.scrollY > SCROLL_THRESHOLD_PX);

    sync();
    window.addEventListener("scroll", sync, { passive: true });
    return () => window.removeEventListener("scroll", sync);
  }, []);

  return null;
}
