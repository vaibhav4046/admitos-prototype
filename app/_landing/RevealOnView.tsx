'use client';

/**
 * RevealOnView
 *
 * Tiny client island that toggles `.uo-rov-in` on its root element the
 * first time the element crosses the viewport. The CSS for
 * `.uo-rov` / `.uo-rov-in` lives in `landing-v3.css` — opacity,
 * translateY, blur fading to rest over 700ms. Disconnects the
 * observer after the first intersection so we don't keep listening
 * forever.
 *
 * Honors `prefers-reduced-motion: reduce` — if the user prefers
 * reduced motion, the component renders in its shown state
 * immediately (no transition).
 *
 * Polymorphic via `as` — defaults to `<div>` but callers can pass
 * `section`, `article`, etc. when semantics matter.
 */

import { useEffect, useRef, useState } from 'react';
import type { ElementType, ReactNode, Ref } from 'react';

interface RevealOnViewProps {
  children: ReactNode;
  /** Milliseconds to wait after intersection before revealing. */
  delay?: number;
  /** Polymorphic tag. Defaults to `div`. */
  as?: ElementType;
  className?: string;
}

export function RevealOnView({
  children,
  delay = 0,
  as: As = 'div',
  className = '',
}: RevealOnViewProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setShown(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            if (delay > 0) {
              window.setTimeout(() => setShown(true), delay);
            } else {
              setShown(true);
            }
            io.disconnect();
            return;
          }
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);

  const cls = ['uo-rov', shown ? 'uo-rov-in' : '', className]
    .filter(Boolean)
    .join(' ');

  // Polymorphic ref — As can be any intrinsic tag, so we cast.
  const Tag = As as ElementType;
  return (
    <Tag
      ref={ref as Ref<HTMLElement>}
      className={cls}
    >
      {children}
    </Tag>
  );
}
