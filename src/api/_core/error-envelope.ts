/**
 * Standard JSON error envelope for API responses.
 *
 * Every error returned to the client looks like this:
 *
 *   {
 *     "error": "<machine-readable code>",
 *     "message": "<human-readable summary, hidden in production unless safe>",
 *     "detail": { ... },
 *     "requestId": "req_..."
 *   }
 *
 * The discipline matters because:
 *
 *   - Front-end can switch on `error` (the code) without parsing
 *     prose. Codes are stable; messages are not.
 *
 *   - In production, raw `Error.message` strings are dangerous —
 *     they can leak SQL fragments, file paths, third-party API
 *     details. The envelope lets us decide what's safe to show.
 *
 *   - The request id is always echoed so a user reporting "I got
 *     an error" can paste a string and we can grep our logs.
 *
 * Use this from inside any `instrumentedRoute` handler. The wrapper
 * also catches uncaught throws and produces a fallback envelope of
 * the same shape.
 */

import { NextResponse } from "next/server";

export interface ErrorEnvelope {
  error: string;
  message?: string;
  detail?: Record<string, unknown>;
  requestId: string;
}

export interface ErrorEnvelopeOptions {
  code: string;
  /** Always-safe summary string. Defaults to the code. */
  message?: string;
  /** Extra fields the client can render (e.g. field-level Zod errors). */
  detail?: Record<string, unknown>;
  /** Stable request id from the wrapping route. */
  requestId: string;
  /** HTTP status code to return. */
  status: number;
  /** Optional extra response headers (e.g. retry-after). */
  headers?: Record<string, string>;
}

export function jsonError(opts: ErrorEnvelopeOptions): NextResponse {
  const body: ErrorEnvelope = {
    error: opts.code,
    message: opts.message,
    detail: opts.detail,
    requestId: opts.requestId,
  };
  return NextResponse.json(body, {
    status: opts.status,
    // Caller headers spread FIRST so the standard ones win.
    // (e.g. retry-after from jsonRateLimited still passes through.)
    headers: {
      ...opts.headers,
      "x-admitos-request-id": opts.requestId,
      "Cache-Control": "no-store",
    },
  });
}

/**
 * Convenience wrapper for the most common 400 case — Zod validation
 * failure. Pass the flattened field errors and you get a properly
 * shaped envelope.
 */
export function jsonValidationError(
  requestId: string,
  fieldErrors: Record<string, string[] | undefined>
): NextResponse {
  return jsonError({
    code: "invalid_body",
    message: "Request body failed validation.",
    detail: { fieldErrors },
    requestId,
    status: 400,
  });
}

export function jsonRateLimited(
  requestId: string,
  retryAfterMs: number
): NextResponse {
  return jsonError({
    code: "rate_limited",
    message: "Too many requests. Please slow down.",
    detail: { retryAfterMs },
    requestId,
    status: 429,
    headers: {
      "retry-after": String(Math.ceil(retryAfterMs / 1000)),
    },
  });
}

export function jsonCsrfFailure(
  requestId: string,
  reason: string
): NextResponse {
  return jsonError({
    code: "csrf_failed",
    message: "CSRF token check failed.",
    detail: { reason },
    requestId,
    status: 403,
  });
}
