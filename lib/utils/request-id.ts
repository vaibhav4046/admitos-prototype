/**
 * Request ID generation + extraction.
 *
 * Every request gets one — assigned by `instrumentedRoute` if the
 * client didn't provide one in `x-request-id`. The same id then
 * propagates into:
 *
 *   - Sentry scope (`request_id` tag)
 *   - LangSmith metadata
 *   - PostHog event property (`request_id`)
 *   - AuditEvent.request_id column
 *   - the response header (`x-request-id`)
 *
 * Having one id flowing through every system means a support engineer
 * can grep one value across Sentry / LangSmith / PostHog / Postgres
 * and reconstruct the full request lineage. The single biggest
 * triage win we can get for our money.
 *
 * ### Format
 *
 * `req_` prefix + 16 hex chars (64 random bits). Short enough to fit
 * in log lines, distinctive enough to grep, no third-party UUID
 * dependency. We don't need RFC4122 compliance — these never leave
 * our infrastructure.
 */

// We deliberately use the Web Crypto API (`crypto.getRandomValues`)
// instead of `node:crypto` so this module works in both the Node.js
// runtime (route handlers, workers) and the Edge runtime (middleware).
// `crypto` is a global in both.
const PREFIX = "req_";
const VALID = /^req_[a-f0-9]{16}$/;

export function generateRequestId(): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  let hex = "";
  for (const b of bytes) hex += b.toString(16).padStart(2, "0");
  return PREFIX + hex;
}

/**
 * Extract a request id from headers, falling back to generating a new
 * one. The "trust client header" path is gated on the value matching
 * our exact format — anything else is dropped to avoid log injection.
 */
export function requestIdFromHeaders(headers: Headers): string {
  const incoming = headers.get("x-request-id");
  if (incoming && VALID.test(incoming)) return incoming;
  return generateRequestId();
}

export function isValidRequestId(id: string): boolean {
  return VALID.test(id);
}
