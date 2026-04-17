"use client";

/**
 * FeatureGrid — progressive-disclosure grid.
 *
 * First `visibleCount` cards open; the rest collapse behind a "Show N
 * more" toggle. Numbered badges (01, 02…) render typographically — no
 * icons, no emojis, per V4 visual directive.
 */

import { useState } from "react";

type Feature = { n: string; title: string; body: string };

export function FeatureGrid({
  features,
  visibleCount,
}: {
  features: readonly Feature[];
  visibleCount: number;
}) {
  const [open, setOpen] = useState(false);
  const visible = features.slice(0, visibleCount);
  const hidden = features.slice(visibleCount);

  return (
    <>
      <div className="uo-feat-grid">
        {visible.map((f) => (
          <article key={f.n} className="uo-feat-card">
            <p className="uo-feat__num" aria-hidden="true">
              {f.n}
            </p>
            <h3 className="uo-feat__title">{f.title}</h3>
            <p className="uo-feat__body">{f.body}</p>
          </article>
        ))}
        {hidden.map((f) => (
          <article
            key={f.n}
            className="uo-feat-card uo-feat-card--extra"
            hidden={!open}
            aria-hidden={!open}
          >
            <p className="uo-feat__num" aria-hidden="true">
              {f.n}
            </p>
            <h3 className="uo-feat__title">{f.title}</h3>
            <p className="uo-feat__body">{f.body}</p>
          </article>
        ))}
      </div>
      {hidden.length > 0 && (
        <div className="uo-feat-more">
          <button
            type="button"
            className="uo-btn-link"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Show less" : `Show ${hidden.length} more features`}
          </button>
        </div>
      )}
    </>
  );
}
