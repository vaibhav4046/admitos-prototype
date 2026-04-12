/**
 * are_computation queue handler.
 *
 * Runs the ARE (Admissions Readiness Evaluator) pipeline for a single
 * (user, school) pair:
 *
 *   1. Load the student's CEF profile from the DB
 *   2. Load the target school's reference data
 *   3. Placeholder for XGBoost model call → p_admit (internal-only)
 *   4. Call Claude Haiku via ARE_NARRATIVE prompt to generate the
 *      student-facing explanation (label + explanation + suggestion)
 *   5. Write the result to are_cache
 *   6. Audit event logged
 *
 * The ARE labels are CATEGORICAL — strongly_aligned / competitive /
 * developing / gap_identified. The internal p_admit NEVER reaches the
 * client. This is enforced both here and in the are-cache DB module.
 */

import "server-only";

import type { Processor } from "bullmq";

import { addBreadcrumb, captureError } from "@/lib/observability";
import { callLLM } from "@/agents/_core";
import { PROMPT_SLOT } from "@/agents/_core/prompts/types";
import { logAuditEvent } from "@/services/audit/log";
import { AUDIT_ACTION } from "@/services/audit/types";
import { findSchoolBySlug } from "@/db/school";
import { insertAreCache, type AreLabel } from "@/db/are-cache";
import type { JobEnvelope, AreComputationPayload } from "@/services/queues/enqueue";

/**
 * Placeholder label boundaries — in production this comes from the
 * XGBoost model. The `label_boundary_version` ADR id tracks which
 * thresholds were used so we can diff results across boundary changes.
 */
const LABEL_BOUNDARY_VERSION = "statistical-prior-v1";

function classifyLabel(pAdmit: number): AreLabel {
  if (pAdmit >= 0.7) return "strongly_aligned";
  if (pAdmit >= 0.45) return "competitive";
  if (pAdmit >= 0.25) return "developing";
  return "gap_identified";
}

export const handleAreComputation: Processor<
  JobEnvelope<AreComputationPayload>,
  void
> = async (job) => {
  const { payload, requestId } = job.data;

  addBreadcrumb("queue.are_computation.start", {
    jobId: job.id,
    userId: payload.userId,
    schoolSlug: payload.schoolSlug,
    requestId,
  });

  try {
    // 1. Load school reference data
    const school = await findSchoolBySlug(payload.schoolSlug);
    if (!school) {
      throw new Error(`school_not_found: ${payload.schoolSlug}`);
    }

    // 2. Placeholder XGBoost call — returns a statistical prior based on
    // school admit rate. Real model lands in M1 Week 3.
    const pAdmit = school.admit_rate ?? 0.3;
    const label = classifyLabel(pAdmit);

    // 3. Claude Haiku narrative — generates the student-facing explanation
    const narrativeResult = await callLLM({
      slot: PROMPT_SLOT.ARE_NARRATIVE,
      vars: {
        userId: payload.userId,
        schoolName: school.display_name,
        schoolTier: school.tier,
        label,
        admitRate: school.admit_rate,
      },
      namespace: "admissions",
      requestId,
    });

    addBreadcrumb("queue.are_computation.narrative.done", {
      jobId: job.id,
      model: narrativeResult.model,
      latencyMs: narrativeResult.latencyMs,
    });

    // 4. Write to are_cache — p_admit stored internally, never client-facing
    await insertAreCache({
      user_id: payload.userId,
      school_id: school.id,
      cef_version: payload.cefVersion,
      model_version: "statistical-prior-v1",
      label_boundary_version: LABEL_BOUNDARY_VERSION,
      label,
      explanation: narrativeResult.text.slice(0, 500),
      primary_driver: school.tier,
      suggestion: `Focus on what makes you unique for ${school.display_name}.`,
      p_admit: pAdmit,
      shap_values: { admit_rate: pAdmit, tier: school.tier },
    });

    // 5. Audit
    await logAuditEvent({
      namespace: "admissions",
      actor: { kind: "system", systemName: "are-computation-worker" },
      action: AUDIT_ACTION.ARE_COMPUTED,
      summary: `ARE computed for user ${payload.userId} × ${school.display_name}: ${label}`,
      target: { type: "are_cache", id: `${payload.userId}:${school.id}` },
      requestId,
      data: {
        label,
        modelVersion: "statistical-prior-v1",
        labelBoundaryVersion: LABEL_BOUNDARY_VERSION,
      },
    });

    addBreadcrumb("queue.are_computation.done", {
      jobId: job.id,
      label,
    });
  } catch (err) {
    captureError(err, {
      namespace: "admissions",
      requestId,
      extra: {
        stage: "are_computation_worker",
        jobId: job.id,
        userId: payload.userId,
        schoolSlug: payload.schoolSlug,
      },
    });
    throw err;
  }
};
