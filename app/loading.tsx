/**
 * Global loading UI.
 *
 * Renders a quiet "breathing" cat glyph while the route segment streams.
 * Pure server component — no client deps. The breathing animation
 * (scale 1 ↔ 1.06, opacity .8 ↔ 1, 2s ease-in-out) lives in
 * globals.css under `.uo-cat-breath` and respects
 * `prefers-reduced-motion`.
 */

export default function Loading() {
  return (
    <div className="uo-loading" role="status" aria-label="Loading">
      <svg
        className="uo-cat-breath"
        width="48"
        height="48"
        viewBox="0 0 64 64"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M14 22 L14 12 L24 22 Z M50 22 L50 12 L40 22 Z M32 12
             C18 12 10 22 10 34 C10 46 20 56 32 56 C44 56 54 46 54 34
             C54 22 46 12 32 12 Z"
          fill="#64ee85"
        />
      </svg>
      <span className="uo-loading__txt">Loading…</span>
    </div>
  );
}
