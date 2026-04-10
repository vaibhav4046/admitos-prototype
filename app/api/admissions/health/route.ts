/**
 * App Router shim for GET /api/admissions/health.
 *
 * The actual handler lives under `src/api/admissions/health.ts`. This
 * file exists only because Next.js App Router requires a `route.ts`
 * at the URL path. Keeping the real handler under `/src/api/` means
 * the layer boundary (no presentation code importing services
 * directly) is explicit and enforceable by the CI grep job.
 *
 * Do not add logic here — the whole file should be imports + exports.
 */

export { GET } from "@/api/admissions/health";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
