/**
 * POST /api/admissions/cef/submit
 *
 * Marks a CEF submission as complete and fans out the downstream
 * pipeline (A0 intake + A1 DNA) via the cef_submitted queue.
 *
 * Wired-in concerns (every state-changing route in M1 should look
 * like this):
 *
 *   - `instrumentedRoute` for Sentry / request id / namespace tag
 *   - CSRF check (signed double-submit)
 *   - Per-user rate limit (3/min) — submitting more often than that
 *     is either a bug or abuse
 *   - AuditEvent row written before the response is returned (via
 *     ctx.audit) — append-only, fail-loud
 *   - BullMQ enqueue with the typed helper, propagating the request id
 *
 * The actual DDL for `cef_submission` is gated on the field-schema
 * PDF (#2). Until that lands, the body is parsed loosely and the
 * `submissionId` is treated as opaque — we'll tighten the Zod schema
 * once the field map is in.
 */

import { NextResponse } from "next/server";
import { z } from "zod";

import {
  instrumentedRoute,
  jsonCsrfFailure,
  jsonRateLimited,
  jsonSuccess,
  parseJsonBody,
} from "@/lib/api";
import { verifyCsrf } from "@/lib/security/csrf";
import { rateLimit } from "@/lib/security/rate-limit";
import { enqueueCefSubmitted } from "@/lib/queues";
import { AUDIT_ACTION } from "@/lib/audit";
import { requireUser } from "@/lib/auth";
import { log } from "@/lib/log";

const SubmitBodySchema = z.object({
  submissionId: z.string().min(1).max(64),
});

export const POST = instrumentedRoute(
  { namespace: "admissions", route: "/api/admissions/cef/submit" },
  async (ctx) => {
    // 1. CSRF
    const csrf = verifyCsrf(ctx.request);
    if (!csrf.ok) {
      return jsonCsrfFailure(ctx.requestId, csrf.reason ?? "unknown");
    }

    // 2. Auth — must be a real signed-in user
    const user = await requireUser();

    // 3. Rate limit — 3 submissions per minute per user
    const limit = await rateLimit({
      bucket: "cef.submit",
      key: `user:${user.id}`,
      limit: 3,
      windowMs: 60_000,
    });
    if (!limit.allowed) {
      return jsonRateLimited(ctx.requestId, limit.resetMs);
    }

    // 4. Body validation
    const body = await parseJsonBody(ctx, SubmitBodySchema);
    if (body instanceof NextResponse) return body;
    const { submissionId } = body;

    // 5. Audit + enqueue (write-then-enqueue order: audit must
    // succeed before any external side effect kicks off)
    const submittedAt = new Date().toISOString();
    await ctx.audit({
      action: AUDIT_ACTION.CEF_SUBMISSION_COMPLETED,
      summary: `CEF submission ${submissionId} marked complete`,
      target: { type: "cef_submission", id: submissionId },
      data: { submittedAt },
    });

    await enqueueCefSubmitted(
      {
        submissionId,
        profileId: user.id,
        submittedAt,
      },
      { requestId: ctx.requestId, cause: "POST /api/admissions/cef/submit" }
    );

    log.info("cef.submit.success", {
      requestId: ctx.requestId,
      submissionId,
      userId: user.id,
    });

    return jsonSuccess(
      { status: "queued", submissionId, submittedAt },
      { requestId: ctx.requestId, status: 202 }
    );
  }
);
