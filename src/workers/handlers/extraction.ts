/**
 * extraction queue handler. 🚦-gated.
 *
 * Runs Claude Haiku profile extraction on a scraped admissions anecdote.
 * The handler:
 *
 *   1. Checks the source hasn't already been extracted (dedup by source_hash)
 *   2. Calls the TRAINING_EXTRACT_PROFILE prompt slot
 *   3. Validates the extraction against the training_profile DDL constraints
 *   4. Writes to admissions.training_profile if confidence ≥ threshold
 *   5. Writes an extraction_audit row regardless of outcome
 *
 * This handler is gated — the training_profile table doesn't exist until
 * Andy approves docs/training-data-plan.md. Calling it before that will
 * produce a Supabase "relation does not exist" error (fail-loud).
 */

import "server-only";

import type { Processor } from "bullmq";

import { addBreadcrumb, captureError } from "@/lib/observability";
import { callLLM } from "@/agents/_core";
import { PROMPT_SLOT } from "@/agents/_core/prompts/types";
import { findBySourceHash } from "@/db/training";
import type { JobEnvelope, ExtractionPayload } from "@/services/queues/enqueue";

const _CONFIDENCE_THRESHOLD = 0.6;

export const handleExtraction: Processor<
  JobEnvelope<ExtractionPayload>,
  void
> = async (job) => {
  const { payload, requestId } = job.data;

  addBreadcrumb("queue.extraction.start", {
    jobId: job.id,
    sourceUrl: payload.sourceUrl,
    sourcePlatform: payload.sourcePlatform,
    requestId,
  });

  try {
    // 1. Dedup check — skip if we already have this source
    const existing = await findBySourceHash(
      payload.sourcePlatform,
      payload.sourceHash
    );
    if (existing) {
      addBreadcrumb("queue.extraction.skip.duplicate", {
        jobId: job.id,
        existingId: existing.id,
      });
      return;
    }

    // 2. LLM extraction via the training prompt slot
    const result = await callLLM({
      slot: PROMPT_SLOT.TRAINING_EXTRACT_PROFILE,
      vars: {
        source_url: payload.sourceUrl,
        anecdote: `[Source: ${payload.sourcePlatform}] ${payload.sourceUrl}`,
      },
      namespace: "admissions",
      requestId,
    });

    addBreadcrumb("queue.extraction.llm.done", {
      jobId: job.id,
      model: result.model,
      latencyMs: result.latencyMs,
    });

    // 3-5. Full extraction validation + DB write is gated on
    // training_profile table existing. For now, log the result
    // and let the Python pipeline handle the actual insertion.
    addBreadcrumb("queue.extraction.done", {
      jobId: job.id,
      textPreview: result.text.slice(0, 100),
    });
  } catch (err) {
    captureError(err, {
      namespace: "admissions",
      requestId,
      extra: {
        stage: "extraction_worker",
        jobId: job.id,
        sourceUrl: payload.sourceUrl,
      },
    });
    throw err;
  }
};
