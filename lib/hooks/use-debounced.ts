"use client";

/**
 * `useDebounced(value, delayMs)` — returns a value that lags behind
 * the input by `delayMs`. Standard React utility, but it's useful
 * to have one canonical implementation in the codebase so people
 * don't roll their own (and get the cleanup wrong).
 *
 * Common uses:
 *   - search inputs that hit an API
 *   - autosave triggers (although the CEF wizard uses a more
 *     complex hook in `lib/cef/use-cef-autosave.ts` because it
 *     also needs flush + abort + beforeunload)
 *
 * The cleanup clears the pending timer on every value change, which
 * is what makes the debounce *trailing-only*. If we ever need a
 * leading-edge debounce, copy this to a new file rather than
 * making this one configurable.
 */

import { useEffect, useState } from "react";

export function useDebounced<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);

  return debounced;
}
