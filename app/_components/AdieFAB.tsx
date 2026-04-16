"use client";

/**
 * AdieFAB
 *
 * Floating action button that opens the Adie wellbeing companion.
 * HARD-GATED on the presence of an authenticated user — Andy item 7
 * requires this never to render on public routes. Importing the
 * component into `app/page.tsx` or `app/_landing/**` is forbidden;
 * the strict grep test in the V3 prompt enforces this at PR review.
 *
 * The footer's `<aside class="uo-foot__adie">` is a separate
 * compliance disclaimer (Samaritans + crisis line) — keep them
 * mentally separate.
 */

export function AdieFAB({ user }: { user?: { id: string } | null }) {
  if (!user) return null;
  return (
    <aside className="uo-fab-adie" aria-label="Open Adie wellbeing chat">
      <button type="button" className="uo-fab-adie__btn">
        <span aria-hidden="true">A</span>
        <span className="uo-visually-hidden">Open Adie</span>
      </button>
    </aside>
  );
}
