/**
 * jsonSuccess — the symmetric counterpart to `jsonError`.
 *
 * Every successful API response should:
 *
 *   - Echo `x-admitos-request-id`
 *   - Set `Cache-Control: no-store` (we never want a CDN to memoize
 *     a JSON API response by accident)
 *   - Carry the request id inside the body too, so a user reporting
 *     "this came back wrong" can paste a single string
 *
 * Doing this through a helper means a single edit changes all routes.
 */

import { NextResponse } from "next/server";

export interface JsonSuccessOptions {
  requestId: string;
  /** Defaults to 200. Use 201 for created, 202 for queued, etc. */
  status?: number;
  /** Optional extra response headers. */
  headers?: Record<string, string>;
}

export function jsonSuccess<T extends Record<string, unknown>>(
  data: T,
  opts: JsonSuccessOptions
): NextResponse {
  return NextResponse.json(
    { ...data, requestId: opts.requestId },
    {
      status: opts.status ?? 200,
      // IMPORTANT: caller headers spread FIRST so the standard
      // x-admitos-request-id + Cache-Control headers always win.
      // A request id that the caller could overwrite would defeat
      // the entire trace-id propagation contract.
      headers: {
        ...opts.headers,
        "x-admitos-request-id": opts.requestId,
        "Cache-Control": "no-store",
      },
    }
  );
}
