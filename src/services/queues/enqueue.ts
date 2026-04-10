/**
 * Typed enqueue helpers.
 *
 * `getQueue(QUEUE.X).add("name", payload)` works fine but loses
 * type safety on the payload — anyone can pass anything. The
 * helpers below make every queue's payload shape an exported
 * type, so a typo on a job key fails at compile time.
 *
 * The other reason these helpers exist: every enqueue needs to
 * propagate the request id (so we can grep one id across the API
 * layer + the worker layer) and a `cause` field describing what
 * triggered the job. Forcing both through a typed function instead
 * of relying on convention makes those required.
 *
 * ### Location
 *
 * This file lives at `src/services/queues/enqueue.ts` — the
 * services-layer half of the BullMQ split introduced in Delta 2
 * PR 4. It imports `getQueue` and the name constants from
 * `@/db/queues`, which is an allowed `services → db` traversal
 * per the seam rules in `docs/scaffold-deltas/02-src-restructure.md`.
 *
 * ### Adding a new queue
 *
 *   1. Add the name to `src/db/queues/names.ts`
 *   2. Add a payload type below
 *   3. Add an enqueue function that wraps `getQueue(...).add(...)`
 *   4. Add a worker handler in `src/workers/handlers/`
 */

import "server-only";

import type { JobsOptions } from "bullmq";

import { getQueue, QUEUE, type QueueName } from "@/db/queues";
import { addBreadcrumb } from "@/lib/observability";

// ─── Common envelope ─────────────────────────────────────────────────────────

interface JobEnvelope<T> {
  /** The actual job payload. */
  payload: T;
  /** Request id from `instrumentedRoute`. Lets workers correlate to API logs. */
  requestId: string;
  /** Free-form description of what enqueued this. */
  cause: string;
  /** ISO timestamp when the job was enqueued. */
  enqueuedAt: string;
}

const DEFAULT_JOB_OPTS: JobsOptions = {
  attempts: 3,
  backoff: { type: "exponential", delay: 5_000 },
  removeOnComplete: { age: 24 * 3600, count: 1000 },
  removeOnFail: { age: 7 * 24 * 3600 },
};

// ─── cef_submitted ───────────────────────────────────────────────────────────

export interface CefSubmittedPayload {
  submissionId: string;
  profileId: string;
  /** ISO timestamp the student hit "Submit". */
  submittedAt: string;
}

export async function enqueueCefSubmitted(
  payload: CefSubmittedPayload,
  ctx: { requestId: string; cause: string }
): Promise<void> {
  await enqueue(QUEUE.CEF_SUBMITTED, "cef:new", payload, ctx);
}

// ─── essay_uploaded ──────────────────────────────────────────────────────────

export interface EssayUploadedPayload {
  draftId: string;
  studentId: string;
  /** Storage key for the draft text/file in Supabase storage. */
  storageKey: string;
  promptSlot: "essay.feedback" | "essay.review";
}

export async function enqueueEssayUploaded(
  payload: EssayUploadedPayload,
  ctx: { requestId: string; cause: string }
): Promise<void> {
  await enqueue(QUEUE.ESSAY_UPLOADED, "essay:new", payload, ctx);
}

// ─── audit_alerts ────────────────────────────────────────────────────────────

export interface AuditAlertPayload {
  /** AuditEvent.id that triggered this alert. */
  auditEventId: string;
  /** Why this alert was raised (e.g. "rate_limit_exceeded", "csrf_failure"). */
  reason: string;
  severity: "low" | "medium" | "high";
}

export async function enqueueAuditAlert(
  payload: AuditAlertPayload,
  ctx: { requestId: string; cause: string }
): Promise<void> {
  await enqueue(QUEUE.AUDIT_ALERTS, "audit:alert", payload, ctx);
}

// ─── adie_message ────────────────────────────────────────────────────────────
//
// IMPORTANT: this payload only carries IDs and metadata, NOT the
// message body. The Adie worker reads the body itself from the
// wellbeing schema. Wellbeing content NEVER passes through Redis
// because Redis is shared infrastructure with the admissions side.

export interface AdieMessagePayload {
  conversationId: string;
  messageId: string;
  /** Length only — body is fetched from the wellbeing schema by the worker. */
  messageLength: number;
}

export async function enqueueAdieMessage(
  payload: AdieMessagePayload,
  ctx: { requestId: string; cause: string }
): Promise<void> {
  await enqueue(QUEUE.ADIE_MESSAGE, "adie:message", payload, ctx);
}

// ─── are_computation ────────────────────────────────────────────────────────

export interface AreComputationPayload {
  userId: string;
  schoolSlug: string;
  cefVersion: number;
}

export async function enqueueAreComputation(
  payload: AreComputationPayload,
  ctx: { requestId: string; cause: string }
): Promise<void> {
  await enqueue(QUEUE.ARE_COMPUTATION, "are:compute", payload, ctx);
}

// ─── extraction ─────────────────────────────────────────────────────────────

export interface ExtractionPayload {
  sourceUrl: string;
  sourcePlatform: string;
  sourceHash: string;
}

export async function enqueueExtraction(
  payload: ExtractionPayload,
  ctx: { requestId: string; cause: string }
): Promise<void> {
  await enqueue(QUEUE.EXTRACTION, "extraction:run", payload, ctx);
}

// ─── shared internal ─────────────────────────────────────────────────────────

async function enqueue<T>(
  queueName: QueueName,
  jobName: string,
  payload: T,
  ctx: { requestId: string; cause: string }
): Promise<void> {
  const queue = getQueue(queueName);
  const envelope: JobEnvelope<T> = {
    payload,
    requestId: ctx.requestId,
    cause: ctx.cause,
    enqueuedAt: new Date().toISOString(),
  };
  await queue.add(jobName, envelope, DEFAULT_JOB_OPTS);
  addBreadcrumb(`queue.${queueName}.enqueued`, {
    jobName,
    requestId: ctx.requestId,
    cause: ctx.cause,
  });
}

export type { JobEnvelope };
