/**
 * Skeleton — minimal animated placeholder block.
 *
 * Used in suspense fallbacks for the dashboard tiles, the essay list,
 * the CEF wizard step body, etc. The actual loading shapes are
 * composed by the consumer; this component is just a single rectangle
 * with a subtle pulse.
 */

import { cn } from "@/lib/ui/cn";

export interface SkeletonProps {
  /** Tailwind classes (typically `h-4 w-1/2`, `h-32 w-full`, etc.) */
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "animate-pulse rounded-md bg-slate-200/70",
        className
      )}
    />
  );
}

/**
 * SkeletonLines — convenience for stacked text-line skeletons.
 * `count` controls how many bars are rendered; the last bar is
 * 2/3 width so it visually mimics the end of a paragraph.
 */
export function SkeletonLines({
  count = 3,
  className,
}: {
  count?: number;
  className?: string;
}) {
  const bars = Array.from({ length: count }, (_, i) => i);
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {bars.map((i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-3",
            i === bars.length - 1 ? "w-2/3" : "w-full"
          )}
        />
      ))}
    </div>
  );
}
