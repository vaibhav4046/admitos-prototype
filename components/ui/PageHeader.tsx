/**
 * PageHeader — consistent top-of-page block.
 *
 * Three optional bits in the title stack:
 *   - `eyebrow` — small uppercased label above the title (e.g. the
 *     surface name "Admissions" or "Counsellor"). Helps orient users
 *     who land on a deep-link.
 *   - `title` — the page H1. Required.
 *   - `description` — one-line lede. Constrained to a comfortable
 *     reading width so it never stretches across a wide viewport.
 *
 * Plus an optional right-aligned `actions` slot for primary CTAs,
 * which collapses below the title on narrow screens.
 *
 * Used across the admissions index, the dashboard, essay list,
 * counsellor surface, etc., so the typographic rhythm stays the same
 * as we add more pages. Whenever a page invents its own header block
 * instead of using this, the visual hierarchy of the product drifts.
 */

import type { ReactNode } from "react";

import { cn } from "@/lib/ui/cn";

export interface PageHeaderProps {
  title: string;
  eyebrow?: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  eyebrow,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-3 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between sm:gap-6",
        className
      )}
    >
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-1 text-balance text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-balance text-sm leading-relaxed text-slate-600">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      ) : null}
    </header>
  );
}
