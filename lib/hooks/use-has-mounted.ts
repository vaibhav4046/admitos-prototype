"use client";

/**
 * useHasMounted — returns false during SSR + the first client render,
 * then true forever after.
 *
 * Useful for client components that touch `window`, `localStorage`,
 * or anything else that doesn't exist on the server. Wrap the
 * client-only branch behind `if (!hasMounted) return null;` to avoid
 * hydration mismatches.
 *
 * Avoid this for anything that should be SSR'd for SEO — that's
 * what server components are for. This hook is the escape hatch,
 * not the default.
 */

import { useEffect, useState } from "react";

export function useHasMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
}
