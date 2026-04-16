/**
 * Route-level loading boundary.
 *
 * Fires while a route segment is streaming. Uses the same visual
 * language as the first-paint splash (LoadingScreen) — Andy's green
 * cat icon breathing, with two counter-rotating arcs in --cat green.
 *
 * No auto-fade here: Next unmounts the boundary as soon as the route
 * is ready. CSS lives in globals.css under the .uo-loading namespace
 * so this file stays a pure server component (no client deps).
 */

export default function Loading() {
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
