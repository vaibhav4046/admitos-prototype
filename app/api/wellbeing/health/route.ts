/**
 * App Router shim for GET /api/wellbeing/health.
 *
 * The actual handler lives under `src/api/wellbeing/health.ts`.
 * Wellbeing stays physically isolated from admissions — `src/api/
 * wellbeing/` is its own subtree and the cross-surface CI grep
 * extends into `src/` so a leak trips CI.
 *
 * Do not add logic here — the whole file should be imports + exports.
 */

export { GET } from "@/api/wellbeing/health";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
