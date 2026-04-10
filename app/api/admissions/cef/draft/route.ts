/**
 * App Router shim for /api/admissions/cef/draft.
 * GET (load drafts), PUT (autosave), POST (submit).
 * Handler lives at src/api/admissions/cef/draft.ts.
 */

export { GET, PUT, POST } from "@/api/admissions/cef/draft";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
