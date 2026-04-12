/**
 * cef_submitted queue handler.
 *
 * Fired when a student completes the CEF wizard and clicks "Submit".
 * The handler orchestrates the downstream pipeline:
 *
 *   1. Load the submitted CEF drafts from the DB
 *   2. Run A0 intake classification via callLLM
 *   3. Run A1 DNA digest generation via callLLM
 *   4. Write audit events for each stage
 *   5. Log completion breadcrumb
 *
 * The provider is still stubbed for M1, but the full pipeline plumbing
 * (LangSmith traces, audit events, error handling) is exercised. When
 * the real provider is wired, the pipeline runs end-to-end without
 * changing this file.
 */

import "server-only";

import type { Processor } from "bullmq";

import { addBreadcrumb, captureError } from "@/lib/observability";
import { callLLM } from "@/agents/_core";
import { PROMPT_SLOT } from "@/agents/_core/prompts/types";
import { logAuditEvent } from "@/services/audit/log";
import { AUDIT_ACTION } from "@/services/audit/types";
import { findDrafts } from "@/db/cef";
import { schoolGate } from "@/lib/training/school-gate";
import type { JobEnvelope, CefSubmittedPayload } from "@/services/queues/enqueue";

export const handleCefSubmitted: Processor<
  JobEnvelope<CefSubmittedPayload>,
  void
> = async (job) => {
  const { payload, requestId } = job.data;

  addBreadcrumb("queue.cef_submitted.start", {
    jobId: job.id,
    submissionId: payload.submissionId,
    requestId,
  });

  try {
    // 1. Load the submitted CEF draft steps
    const drafts = await findDrafts(payload.profileId, 1);
    const cefPayload = Object.fromEntries(
      drafts.map((d) => [d.step, d.payload])
    );

    // 1b. School-gate: reject out-of-scope schools before running the pipeline.
    // The school metadata is expected in the CEF payload's "school" step.
    const schoolStep = cefPayload["school"] as
      | { institution_type?: string; tier_band?: string }
      | undefined;
    if (schoolStep) {
      const gateResult = schoolGate({
        institution_type: schoolStep.institution_type ?? null,
        tier_band: schoolStep.tier_band ?? null,
      });
      if (!gateResult.allowed) {
        addBreadcrumb("queue.cef_submitted.school_gate.rejected", {
          jobId: job.id,
          reason: gateResult.reason,
        });
        await logAuditEvent({
          namespace: "admissions",
          actor: { kind: "system", systemName: "cef-submitted-worker" },
          action: AUDIT_ACTION.ARE_COMPUTED,
          summary: `School gate rejected submission ${payload.submissionId}: ${gateResult.reason}`,
          target: { type: "cef_submission", id: payload.submissionId },
          requestId,
          data: { gateReason: gateResult.reason },
        });
        return; // Skip pipeline for out-of-scope schools
      }
    }

    // 2. A0 intake — classify the student's profile category
    const intakeResult = await callLLM({
      slot: PROMPT_SLOT.A0_INTAKE,
      vars: {
        submissionId: payload.submissionId,
        cef: cefPayload,
      },
      namespace: "admissions",
      requestId,
    });

    addBreadcrumb("queue.cef_submitted.a0_intake.done", {
      jobId: job.id,
      model: intakeResult.model,
      latencyMs: intakeResult.latencyMs,
    });

    // 3. A1 DNA — generate the student DNA digest
    const dnaResult = await callLLM({
      slot: PROMPT_SLOT.A1_DNA_GENERATE,
      vars: {
        submissionId: payload.submissionId,
        cef: cefPayload,
        intakeClassification: intakeResult.text,
      },
      namespace: "admissions",
      requestId,
    });

    addBreadcrumb("queue.cef_submitted.a1_dna.done", {
      jobId: job.id,
      model: dnaResult.model,
      latencyMs: dnaResult.latencyMs,
    });

    // 4. Audit — record the ARE computation event
    await logAuditEvent({
      namespace: "admissions",
      actor: { kind: "system", systemName: "cef-submitted-worker" },
      action: AUDIT_ACTION.ARE_COMPUTED,
      summary: `Pipeline completed for submission ${payload.submissionId}`,
      target: { type: "cef_submission", id: payload.submissionId },
      requestId,
      data: {
        intakeModel: intakeResult.model,
        intakeLatencyMs: intakeResult.latencyMs,
        dnaModel: dnaResult.model,
        dnaLatencyMs: dnaResult.latencyMs,
      },
    });

    addBreadcrumb("queue.cef_submitted.done", {
      jobId: job.id,
      submissionId: payload.submissionId,
    });
  } catch (err) {
    captureError(err, {
      namespace: "admissions",
      requestId,
      extra: {
        stage: "cef_submitted_worker",
        jobId: job.id,
        submissionId: payload.submissionId,
      },
    });
    throw err;
  }
};
