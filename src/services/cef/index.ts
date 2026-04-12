/**
 * CEF service barrel.
 *
 * The Common Enrolment Form (CEF) service sits between the API routes
 * and the DB query module. It owns:
 *
 *   - Autosave orchestration (upsert draft step)
 *   - Version creation + submission finalization
 *   - Pre-submission validation (all 6 steps present)
 *   - SHA-256 payload hashing for version integrity
 *
 * The API route handlers (`src/api/admissions/cef/*`) call into this
 * service; this service calls `src/db/cef.ts` for persistence.
 */

export {
  autosaveDraftStep,
  getDraft,
  submitCef,
  getLatestVersion,
  type AutosaveInput,
  type SubmitCefInput,
  type SubmitCefResult,
} from "./cef";
