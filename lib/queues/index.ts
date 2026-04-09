/**
 * Public surface of the queue module. Use these imports in API routes
 * and workers rather than constructing Queue / Worker instances directly.
 *
 * Typical call site:
 *   const q = getQueue(QUEUE.CEF_SUBMITTED);
 *   await q.add("cef:new", { submissionId, profileId });
 */

import "server-only";

import { Queue, QueueEvents, type ConnectionOptions } from "bullmq";

import { getRedisConnection } from "./connection";
import { ALL_QUEUE_NAMES, QUEUE, type QueueName } from "./names";

const queueCache = new Map<QueueName, Queue>();
const eventsCache = new Map<QueueName, QueueEvents>();

function bullConnection(): ConnectionOptions {
  return { connection: getRedisConnection() };
}

/** Get (or create) the BullMQ Queue instance for a given queue name. */
export function getQueue(name: QueueName): Queue {
  let q = queueCache.get(name);
  if (!q) {
    q = new Queue(name, bullConnection());
    queueCache.set(name, q);
  }
  return q;
}

/** Get (or create) the BullMQ QueueEvents stream for a given queue. */
export function getQueueEvents(name: QueueName): QueueEvents {
  let qe = eventsCache.get(name);
  if (!qe) {
    qe = new QueueEvents(name, bullConnection());
    eventsCache.set(name, qe);
  }
  return qe;
}

/** Useful for tests / graceful shutdown. */
export async function closeAllQueues() {
  await Promise.all([
    ...Array.from(queueCache.values()).map((q) => q.close()),
    ...Array.from(eventsCache.values()).map((qe) => qe.close()),
  ]);
  queueCache.clear();
  eventsCache.clear();
}

export { QUEUE, ALL_QUEUE_NAMES, type QueueName } from "./names";
export { QUEUE_SCHEMA } from "./names";

// Typed enqueue helpers — prefer these over direct getQueue().add().
export {
  enqueueCefSubmitted,
  enqueueEssayUploaded,
  enqueueAuditAlert,
  enqueueAdieMessage,
} from "./enqueue";
export type {
  CefSubmittedPayload,
  EssayUploadedPayload,
  AuditAlertPayload,
  AdieMessagePayload,
  JobEnvelope,
} from "./enqueue";
