/**
 * Security primitives barrel.
 *
 * Use:
 *
 *   import { rateLimit, issueCsrfToken, verifyCsrf } from "@/lib/security";
 *
 * Anything in here is server-only and assumes Redis + the env module
 * have already been initialised.
 */

export { rateLimit } from "./rate-limit";
export type { RateLimitOptions, RateLimitResult } from "./rate-limit";

export {
  issueCsrfToken,
  verifyCsrf,
  methodRequiresCsrf,
} from "./csrf";
export type { CsrfToken, CsrfVerifyResult, CsrfFailureReason } from "./csrf";
