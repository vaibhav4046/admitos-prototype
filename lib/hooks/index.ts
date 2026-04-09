/**
 * Client-side React hooks shared across the app.
 *
 * Server components and route handlers should NOT import from
 * `@/lib/hooks` — these all start with `"use client"` and dragging
 * them into a server file forces an unintended client boundary.
 */

export { useDebounced } from "./use-debounced";
export { useHasMounted } from "./use-has-mounted";
