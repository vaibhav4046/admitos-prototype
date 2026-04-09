/**
 * Badge — small status pill.
 *
 * Used for queue states ("Processing", "Pending review"), draft
 * statuses ("Saved", "Submitted"), severity tags ("High", "Low"),
 * and the namespace ribbon on internal pages.
 *
 * Five tones, one size. If we need a second size we'll add it then;
 * a single size at this stage prevents bikeshedding.
 */

import type { ReactNode } from "react";

import { cn } from "@/lib/ui/cn";

export type BadgeTone =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "danger";

export interface BadgeProps {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: "bg-slate-100 text-slate-700 ring-slate-200",
  info: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  success: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  warning: "bg-amber-50 text-amber-800 ring-amber-200",
  danger: "bg-rose-50 text-rose-700 ring-rose-200",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        TONE_CLASSES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
