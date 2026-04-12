/**
 * EmptyState — used everywhere "you have no X yet" needs to be shown
 * (essays list before any uploads, counsellor notes before any are
 * written, recommended actions when the dashboard is fresh).
 *
 * Deliberately minimal: a centred icon slot, a title, optional copy,
 * and an optional action slot. No animations, no illustrations — those
 * land in the M2 design polish pass.
 */

import type { ReactNode } from "react";

import { cn } from "@/lib/ui/cn";

export interface EmptyStateProps {
  /** Optional icon or illustration. Render an inline SVG or a Lucide icon. */
  icon?: ReactNode;
  /** Required short title — what the user is missing. */
  title: string;
  /** Optional one-or-two-sentence description. */
  description?: string;
  /** Optional action — usually a primary `<Button>`. */
  action?: ReactNode;
  /** Tailwind classes appended to the wrapper. */
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center",
        className
      )}
      role="status"
      aria-live="polite"
    >
      {icon ? (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-400">
          {icon}
        </div>
      ) : null}

      <h3 className="text-base font-semibold text-slate-900">{title}</h3>

      {description ? (
        <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>
      ) : null}

      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
