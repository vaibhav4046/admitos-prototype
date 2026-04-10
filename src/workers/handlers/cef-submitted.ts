/**
 * cef_submitted queue handler.
 *
 * Fired when a student completes step 7 of the CEF wizard and clicks
 * "Submit". The handler is responsible for:
 *
 *   1. Generating the DNA digest via the A1 prompt slot (LLM call)
 *   2. Computing the initial ARE score
 *   3. Computing the initial School Readiness signal (NEVER as %)
 *   4. Writing an AuditEvent via `logAuditEvent(AUDIT_ACTION.ARE_COMPUTED)`
 *   5. Enqueuing downstream notifications (counsellor, parent)
 *
 * This file is a skeleton — the real pipeline is M1 Week 2 work and
 * depends on the CEF field schema being finalized. For now the handler
 * logs a breadcrumb and no-ops.
 */

import "server-only";

import type { Processor } from "bullmq";

import { addBreadcrumb } from "@/lib/observability";

interface CefSubmittedJobData {
  submissionId: string;
  userId: string;
  requestId: string;
}

export const handleCefSubmitted: Processor<CefSubmittedJobData, void> = async (
  job
) => {
  addBreadcrumb("queue.cef_submitted.start", {
    jobId: job.id,
    submissionId: job.data.submissionId,
  });

  // TODO(M1 Week 2):
  //   - callLLM(A1_DNA_GENERATE, { cef: ... })
  //   - compute ARE
  //   - compute School Readiness (non-%)
  //   - logAuditEvent(ARE_COMPUTED)
  //   - enqueue counsellor notification

  addBreadcrumb("queue.cef_submitted.done.stub", { jobId: job.id });
};
