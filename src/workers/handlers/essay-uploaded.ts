/**
 * essay_uploaded queue handler.
 *
 * Fired when a student uploads a personal statement draft. Runs the
 * 5-stage A5 feedback pipeline:
 *
 *   1. A5_ESSAY_CLARITY   — clarity + readability notes
 *   2. A5_ESSAY_STRUCTURE — paragraph flow + thesis check
 *   3. A5_ESSAY_VOICE     — authenticity + register
 *   4. A5_ESSAY_EVIDENCE  — specificity + "show don't tell"
 *   5. A5_ESSAY_POLISH    — final copy-level pass
 *
 * Each stage calls `callLLM` with its own prompt slot. All 5 results
 * are joined into a single FeedbackBundle row in the
 * `admissions.essay_feedback` table with status=`awaiting_counsellor`.
 * The counsellor approval step is a human-in-the-loop gate — the
 * student NEVER sees raw model output.
 *
 * Skeleton for M1. Real implementation depends on the essay storage
 * schema landing.
 */

import "server-only";

import type { Processor } from "bullmq";

import { addBreadcrumb } from "@/lib/observability";

interface EssayUploadedJobData {
  essayId: string;
  userId: string;
  requestId: string;
}

export const handleEssayUploaded: Processor<EssayUploadedJobData, void> = async (
  job
) => {
  addBreadcrumb("queue.essay_uploaded.start", {
    jobId: job.id,
    essayId: job.data.essayId,
  });

  // TODO(M1 Week 2):
  //   - load essay text
  //   - run 5-stage pipeline via callLLM
  //   - write FeedbackBundle awaiting_counsellor
  //   - logAuditEvent(ESSAY_FEEDBACK_QUEUED)

  addBreadcrumb("queue.essay_uploaded.done.stub", { jobId: job.id });
};
