/**
 * Tailwind class name combiner.
 *
 * Replaces `clsx` for our purposes — we don't need conditional
 * objects, just flat string concatenation that drops falsy values.
 * Eight lines is cheaper than another dependency.
 *
 * Usage:
 *
 *   <div className={cn("base", isOpen && "open", error && "ring-red-500")} />
 */
export function cn(
  ...parts: Array<string | false | null | undefined>
): string {
  return parts.filter(Boolean).join(" ");
}
