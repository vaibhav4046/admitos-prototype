/**
 * /api/admissions/cef/draft — CEF draft CRUD handler.
 *
 * GET  — Load all draft steps for the user's current version
 * PUT  — Autosave a single step
 * POST — Submit the CEF (all 6 steps must be present)
 *
 * All endpoints require authentication. PUT/POST require CSRF.
 */

import { NextResponse } from "next/server";
import { z } from "zod";

import {
  instrumentedRoute,
  jsonCsrfFailure,
  jsonRateLimited,
  jsonSuccess,
  jsonError,
  parseJsonBody,
} from "@/api/_core";
import { verifyCsrf } from "@/services/security/csrf";
import { rateLimit } from "@/services/security/rate-limit";
import { requireUser } from "@/services/auth";
import { AUDIT_ACTION } from "@/services/audit";
import { log } from "@/lib/log";
import {
  autosaveDraftStep,
  getDraft,
  submitCef,
  getLatestVersion,
  CefValidationError,
} from "@/services/cef/cef";
import { enqueueCefSubmitted } from "@/services/queues";

const AutosaveBodySchema = z.object({
  version: z.number().int().positive(),
  step: z.enum(["profile", "academics", "ecs", "essays", "schools", "review"]),
  payload: z.record(z.unknown()),
});

const SubmitBodySchema = z.object({
  version: z.number().int().positive(),
});

export const GET = instrumentedRoute(
  { namespace: "admissions", route: "/api/admissions/cef/draft" },
  async (ctx) => {
    const user = await requireUser();

    // Get latest version or default to 1
    const latest = await getLatestVersion(user.id);
    const version = latest ? latest.version : 1;

    const drafts = await getDraft(user.id, version);

    return jsonSuccess(
      {
        version,
        steps: drafts.map((d) => ({
          step: d.step,
          payload: d.payload,
          autosaved_at: d.autosaved_at,
        })),
      },
      { requestId: ctx.requestId }
    );
  }
);

export const PUT = instrumentedRoute(
  { namespace: "admissions", route: "/api/admissions/cef/draft" },
  async (ctx) => {
    // CSRF
    const csrf = verifyCsrf(ctx.request);
    if (!csrf.ok) {
      return jsonCsrfFailure(ctx.requestId, csrf.reason ?? "unknown");
    }

    const user = await requireUser();

    // Rate limit — 60 autosaves per minute
    const limit = await rateLimit({
      bucket: "cef.autosave",
      key: `user:${user.id}`,
      limit: 60,
      windowMs: 60_000,
    });
    if (!limit.allowed) {
      return jsonRateLimited(ctx.requestId, limit.resetMs);
    }

    const body = await parseJsonBody(ctx, AutosaveBodySchema);
    if (body instanceof NextResponse) return body;

    const draft = await autosaveDraftStep({
      userId: user.id,
      version: body.version,
      step: body.step,
      payload: body.payload,
    });

    await ctx.audit({
      action: AUDIT_ACTION.CEF_STEP_SAVED,
      summary: `Autosaved step ${body.step} for version ${body.version}`,
      target: { type: "cef_draft", id: draft.id },
    });

    return jsonSuccess(
      {
        id: draft.id,
        step: draft.step,
        autosaved_at: draft.autosaved_at,
      },
      { requestId: ctx.requestId }
    );
  }
);

export const POST = instrumentedRoute(
  { namespace: "admissions", route: "/api/admissions/cef/draft" },
  async (ctx) => {
    // CSRF
    const csrf = verifyCsrf(ctx.request);
    if (!csrf.ok) {
      return jsonCsrfFailure(ctx.requestId, csrf.reason ?? "unknown");
    }

    const user = await requireUser();

    // Rate limit — 3 submissions per minute
    const limit = await rateLimit({
      bucket: "cef.submit",
      key: `user:${user.id}`,
      limit: 3,
      windowMs: 60_000,
    });
    if (!limit.allowed) {
      return jsonRateLimited(ctx.requestId, limit.resetMs);
    }

    const body = await parseJsonBody(ctx, SubmitBodySchema);
    if (body instanceof NextResponse) return body;

    try {
      const result = await submitCef({
        userId: user.id,
        version: body.version,
      });

      await ctx.audit({
        action: AUDIT_ACTION.CEF_SUBMISSION_COMPLETED,
        summary: `CEF version ${body.version} submitted`,
        target: { type: "cef_version", id: result.versionId },
        data: { payloadHash: result.payloadHash },
      });

      // Enqueue downstream pipeline
      await enqueueCefSubmitted(
        {
          submissionId: result.versionId,
          profileId: user.id,
          submittedAt: result.submittedAt,
        },
        {
          requestId: ctx.requestId,
          cause: "POST /api/admissions/cef/draft",
        }
      );

      log.info("cef.draft.submit.success", {
        requestId: ctx.requestId,
        userId: user.id,
        versionId: result.versionId,
      });

      return jsonSuccess(
        {
          status: "submitted",
          versionId: result.versionId,
          payloadHash: result.payloadHash,
          submittedAt: result.submittedAt,
        },
        { requestId: ctx.requestId, status: 202 }
      );
    } catch (err) {
      if (err instanceof CefValidationError) {
        return jsonError({
          requestId: ctx.requestId,
          status: 422,
          code: "cef_incomplete",
          detail: {
            missingSteps: err.missingSteps,
            message: err.message,
          },
        });
      }
      throw err;
    }
  }
);
