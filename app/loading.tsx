/**
 * Global loading UI — manus.im-style rotating arcs around the
 * UniOffer "u" mark.
 *
 * Composition:
 *   - Centered serif "u" glyph (Libre Baskerville, --fg).
 *   - Two static concentric ring outlines (thin, --border).
 *   - One outer accent arc that rotates clockwise (--accent).
 *   - One inner accent arc (--cat) rotating the other way for visual
 *     depth — staggered duration so the rings don't sync.
 *   - Below: a short accent underline + "UNIOFFER" wordmark in
 *     widely-tracked Inter caps.
 *
 * Pure server component — no client deps. The animations are CSS
 * transforms on the SVG circles and respect `prefers-reduced-motion`
 * (rings freeze, glyph stays visible).
 */

export default function Loading() {
  return (
    <div className="uo-loading" role="status" aria-label="Loading UniOffer">
      <div className="uo-loading__mark" aria-hidden="true">
        <svg viewBox="0 0 120 120" width="120" height="120">
          {/* Static rings */}
          <circle
            cx="60"
            cy="60"
            r="54"
            className="uo-loading__ring"
          />
          <circle
            cx="60"
            cy="60"
            r="42"
            className="uo-loading__ring"
          />
          {/* Rotating accent arcs (purple outer, green inner) */}
          <circle
            cx="60"
            cy="60"
            r="54"
            className="uo-loading__arc uo-loading__arc--outer"
            pathLength={100}
          />
          <circle
            cx="60"
            cy="60"
            r="42"
            className="uo-loading__arc uo-loading__arc--inner"
            pathLength={100}
          />
          {/* "u" mark */}
          <text
            x="60"
            y="72"
            textAnchor="middle"
            className="uo-loading__u"
          >
            u
          </text>
        </svg>
      </div>
      <span className="uo-loading__rule" aria-hidden="true" />
      <span className="uo-loading__word">UNIOFFER</span>
    </div>
  );
}
