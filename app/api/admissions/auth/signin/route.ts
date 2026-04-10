/**
 * App Router shim for POST /api/admissions/auth/signin.
 *
 * The actual handler lives under `src/api/admissions/auth/signin.ts`.
 * Do not add logic here — the whole file should be imports + exports.
 */

export { POST } from "@/api/admissions/auth/signin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
