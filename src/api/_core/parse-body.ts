/**
 * parseJsonBody — the boilerplate-killer for state-changing routes.
 *
 * Every POST/PATCH/PUT route looks like:
 *
 *   const raw = await request.json().catch(() => null);
 *   const parsed = Schema.safeParse(raw);
 *   if (!parsed.success) return jsonValidationError(...);
 *   const body = parsed.data;
 *
 * This helper collapses that to:
 *
 *   const body = await parseJsonBody(ctx, Schema);
 *   if (body instanceof NextResponse) return body;
 *
 * The early-return on `NextResponse` keeps the typing tidy: if the
 * call returns the success branch, `body` is typed as `z.infer<T>`;
 * if it returns the error branch, you bail with `return body`.
 *
 * Why not throw? Because the wrapping `instrumentedRoute` would
 * promote a thrown error into a 500 + Sentry capture, which is the
 * wrong behaviour for "user sent bad input".
 */

import type { NextResponse } from "next/server";
import type { z } from "zod";

import { jsonValidationError } from "./error-envelope";

export interface ParseJsonBodyContext {
  request: Request;
  requestId: string;
}

export async function parseJsonBody<T extends z.ZodTypeAny>(
  ctx: ParseJsonBodyContext,
  schema: T
): Promise<z.infer<T> | NextResponse> {
  const raw: unknown = await ctx.request.json().catch(() => null);
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return jsonValidationError(
      ctx.requestId,
      parsed.error.flatten().fieldErrors
    );
  }
  return parsed.data;
}
