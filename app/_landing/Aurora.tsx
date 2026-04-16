/**
 * Aurora
 *
 * Three blurred radial blobs (green-cat, accent purple, cyan) drift
 * over the dark canonical surface. Tuned per V3 §3.2: 28% peak
 * opacity in light, 18% in dark so the manus.im-level minimalism
 * Andy asked for is preserved. All animation runs on transform/
 * opacity only, contained, and fully suppressed under
 * `prefers-reduced-motion`.
 *
 * Pure server component — no client deps. Sits as a fixed pseudo-
 * background behind every landing section via z-index 0.
 */

export function Aurora() {
  return (
    <div className="uo-aurora" aria-hidden="true">
      <span />
    </div>
  );
}
