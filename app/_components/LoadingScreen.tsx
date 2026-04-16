"use client";

/**
 * LoadingScreen
 *
 * First-paint splash mounted as the first child of <body> in app/layout.tsx.
 * Renders Andy's canonical green cat icon (public/brand/v2/unioffer-cat-icon.svg)
 * breathing at 2s ease-in-out, wrapped in two counter-rotating arcs in
 * --cat green. Fades out after 900ms, then unmounts.
 *
 * Honours prefers-reduced-motion — cat stays visible, arcs static.
 *
 * Pure cosmetic — no analytics, no router awareness, no data dependency.
 * The animation lives in globals.css under the .uo-loading namespace so
 * the splash works identically on every route (landing, admissions,
 * wellbeing) without pulling in landing-v3.css.
 */

import { useEffect, useState } from "react";

export function LoadingScreen() {
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setGone(true), 900);
    return () => clearTimeout(t);
  }, []);

  if (gone) return null;

  return (
    <div
      className="uo-loading"
      role="status"
      aria-live="polite"
      aria-label="Loading UniOffer"
    >
      <div className="uo-loading-mark">
        <svg
          className="uo-loading-ring"
          viewBox="0 0 120 120"
          aria-hidden="true"
        >
          <circle cx="60" cy="60" r="52" className="uo-loading-arc uo-loading-arc-1" />
          <circle cx="60" cy="60" r="44" className="uo-loading-arc uo-loading-arc-2" />
        </svg>
        {/* eslint-disable-next-line @next/next/no-img-element -- inline SVG splash, next/image not needed */}
        <img
          src="/brand/v2/unioffer-cat-icon.svg"
          alt=""
          aria-hidden="true"
          className="uo-loading-cat"
          width={64}
          height={64}
          draggable={false}
        />
      </div>
      <span className="uo-loading-label">UniOffer</span>
    </div>
  );
}
