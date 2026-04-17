'use client';

/**
 * JourneyGraph — Happenstance-style animated node graph.
 *
 * Topology: 1 → 2 → 4
 *   You (green outline)
 *     → Strategy  → Candidacy, School list
 *     → Voice     → Essays, Interviews
 *
 * Edges render twice: a static muted baseline + an animated "streak"
 * overlay using stroke-dasharray motion. Each streak has a staggered
 * delay so the flow reads as continuous traffic, not a pulse.
 *
 * The plate is hard-coded #0a3042 (canonical dark) so the component
 * reads identically on light and dark parent themes — a dark island
 * on a cream section. Reduced-motion freezes the streaks. A11y:
 * <svg role="img" aria-label="…"> with an sr-only caption.
 */

export function JourneyGraph() {
  // Node positions tuned for 1200×420 viewBox.
  // You at x=120, middle column at x=560, right column at x=1040.
  const NODES = {
    you: { x: 120, y: 210, label: 'You' },
    strategy: { x: 560, y: 110, label: 'Strategy' },
    voice: { x: 560, y: 310, label: 'Voice' },
    candidacy: { x: 1040, y: 60, label: 'Candidacy' },
    list: { x: 1040, y: 165, label: 'School list' },
    essays: { x: 1040, y: 255, label: 'Essays' },
    interviews: { x: 1040, y: 360, label: 'Interviews' },
  } as const;

  const EDGES: Array<[keyof typeof NODES, keyof typeof NODES, number]> = [
    ['you', 'strategy', 0],
    ['you', 'voice', 0.4],
    ['strategy', 'candidacy', 0.8],
    ['strategy', 'list', 1.1],
    ['voice', 'essays', 1.4],
    ['voice', 'interviews', 1.7],
  ];

  const pathFor = (a: keyof typeof NODES, b: keyof typeof NODES) => {
    const A = NODES[a];
    const B = NODES[b];
    const cx = (A.x + B.x) / 2;
    return `M${A.x},${A.y} C${cx},${A.y} ${cx},${B.y} ${B.x},${B.y}`;
  };

  return (
    <figure className="uo-journey" aria-labelledby="uo-journey-caption">
      <svg
        viewBox="0 0 1200 420"
        className="uo-journey-svg"
        role="img"
        aria-label="From You, Adie orchestrates Strategy and Voice into four outcomes: Candidacy, School list, Essays, Interviews."
      >
        <defs>
          <linearGradient id="uo-streak-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(100, 238, 133, 0)" />
            <stop offset="50%" stopColor="rgba(100, 238, 133, 0.95)" />
            <stop offset="100%" stopColor="rgba(100, 238, 133, 0)" />
          </linearGradient>
        </defs>

        {/* Static edge baseline */}
        {EDGES.map(([a, b], i) => (
          <path key={`base-${i}`} d={pathFor(a, b)} className="uo-edge-base" />
        ))}

        {/* Animated streak overlay (one per edge, staggered) */}
        {EDGES.map(([a, b, delay], i) => (
          <path
            key={`streak-${i}`}
            d={pathFor(a, b)}
            className="uo-edge-streak"
            style={{ animationDelay: `${delay}s` }}
          />
        ))}

        {/* Nodes */}
        {Object.entries(NODES).map(([key, n]) => {
          const isYou = key === 'you';
          const isMid = key === 'strategy' || key === 'voice';
          const r = isYou ? 38 : isMid ? 34 : 28;
          const klass = isYou
            ? 'uo-node uo-node-you'
            : isMid
              ? 'uo-node uo-node-mid'
              : 'uo-node uo-node-end';
          return (
            <g key={key} transform={`translate(${n.x}, ${n.y})`}>
              <circle r={r} className={klass} />
              <text
                y={r + 22}
                textAnchor="middle"
                className={`uo-node-label ${isYou ? 'uo-node-label-you' : ''}`}
              >
                {n.label}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption id="uo-journey-caption" className="uo-sr-only">
        A diagram showing how Adie connects a student&rsquo;s profile
        through Strategy and Voice workflows into four concrete
        application outcomes.
      </figcaption>
    </figure>
  );
}
