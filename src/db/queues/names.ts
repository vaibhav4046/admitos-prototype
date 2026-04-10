/**
 * BullMQ queue name constants.
 *
 * These names are locked by the V2 spec (Thread 5). Don't rename them
 * without updating the worker registration AND telling Andy — the
 * ADMITOS PRD + API Specification V2.pdf references them directly.
 *
 * Why a file of string constants and not just inline strings? Because if
 * someone typos "cef_submited" in one place and "cef_submitted" in another,
 * BullMQ will happily create two separate queues and jobs will silently
 * disappear into the wrong one. A central set of constants makes the typo
 * a type error.
 *
 * ### Location
 *
 * This file lives at `src/db/queues/names.ts` per the `/src/*` layout.
 * It used to live at `lib/queues/names.ts`. The name constants belong
 * in the `db` layer rather than `services` because they describe the
 * underlying Redis infrastructure — the typed enqueue helpers in
 * `src/services/queues/enqueue.ts` sit above these and call `getQueue`
 * from this layer.
 */

export const QUEUE = {
  /** Emitted after a student completes the 7-step CEF wizard. Fans out to A0 intake + A1 DNA. */
  CEF_SUBMITTED: "cef_submitted",

  /** Emitted after a student uploads an essay draft. Fans out to A5 essay pipeline. */
  ESSAY_UPLOADED: "essay_uploaded",

  /** Emitted when an audit-sensitive event happens — feeds Sentry + internal review queue. */
  AUDIT_ALERTS: "audit_alerts",

  /** Emitted on every message sent to the Adie wellbeing assistant. Wellbeing schema only. */
  ADIE_MESSAGE: "adie_message",

  /** Runs the ARE prediction pipeline for a (user, school) pair. */
  ARE_COMPUTATION: "are_computation",

  /** Runs profile extraction from scraped content via Claude Haiku. 🚦-gated. */
  EXTRACTION: "extraction",
} as const;

export type QueueName = (typeof QUEUE)[keyof typeof QUEUE];

export const ALL_QUEUE_NAMES: readonly QueueName[] = Object.values(QUEUE);

/**
 * Which schema does each queue's data live in? Used by the worker to pick
 * the right Supabase client — wellbeing workers must NEVER touch admissions.
 */
export const QUEUE_SCHEMA: Record<QueueName, "admissions" | "wellbeing"> = {
  [QUEUE.CEF_SUBMITTED]: "admissions",
  [QUEUE.ESSAY_UPLOADED]: "admissions",
  [QUEUE.AUDIT_ALERTS]: "admissions",
  [QUEUE.ADIE_MESSAGE]: "wellbeing",
  [QUEUE.ARE_COMPUTATION]: "admissions",
  [QUEUE.EXTRACTION]: "admissions",
};
