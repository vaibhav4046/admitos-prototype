/**
 * POST /api/admissions/cef/enqueue-are — handler.
 *
 * After a CEF is submitted, the front-end (or the cef-submitted worker)
 * can request ARE computation for a specific school. This endpoint:
 *
 *   1. Validates the JWT (requireUser)
 *   2. CSRF check
 *   3. Rate limit (10/min per user — one per school in their list)
 *   4. Enqueues an are_computation job
 *   5. Returns 202 Accepted with the job metadata
 *
 * The ARE result is asynchronous — the client polls or subscribes via
 * the real-time channel for the result.
 */

import { NextResponse } from "next/server";
import { z } from "zod";

import {
  instrumentedRoute,
  jsonCsrfFailure,
  jsonRateLimited,
  jsonSuccess,
  parseJsonBody,
} from "@/api/_core";
import { verifyCsrf } from "@/services/security/csrf";
import { rateLimit } from "@/services/security/rate-limit";
import { enqueueAreComputation } from "@/services/queues";
import { requireUser } from "@/services/auth";
import { log } from "@/lib/log";

const EnqueueAreBodySchema = z.object({
  schoolSlug: z.string().min(1).max(100),
  cefVersion: z.number().int().positive(),
});

export const POST = instrumentedRoute(
  { namespace: "admissions", route: "/api/admissions/cef/enqueue-are" },
  async (ctx) => {
    // 1. CSRF
    const csrf = verifyCsrf(ctx.request);
    if (!csrf.ok) {
      return jsonCsrfFailure(ctx.requestId, csrf.reason ?? "unknown");
    }

    // 2. Auth
    const user = await requireUser();

    // 3. Rate limit — 10 ARE requests per minute per user
    const limit = await rateLimit({
      bucket: "cef.enqueue-are",
      key: `user:${user.id}`,
      limit: 10,
      windowMs: 60_000,
    });
    if (!limit.allowed) {
      return jsonRateLimited(ctx.requestId, limit.resetMs);
    }

    // 4. Body validation
    const body = await parseJsonBody(ctx, EnqueueAreBodySchema);
    if (body instanceof NextResponse) return body;

    // 5. Enqueue
    await enqueueAreComputation(
      {
        userId: user.id,
        schoolSlug: body.schoolSlug,
        cefVersion: body.cefVersion,
      },
      {
        requestId: ctx.requestId,
        cause: "POST /api/admissions/cef/enqueue-are",
      }
    );

    log.info("cef.enqueue-are.success", {
      requestId: ctx.requestId,
      userId: user.id,
      schoolSlug: body.schoolSlug,
    });

    return jsonSuccess(
      {
        status: "queued",
        schoolSlug: body.schoolSlug,
        cefVersion: body.cefVersion,
      },
      { requestId: ctx.requestId, status: 202 }
    );
  }
);
