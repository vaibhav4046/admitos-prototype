/**
 * BullMQ Queue / QueueEvents factory.
 *
 * API routes and workers get queues via `getQueue(QUEUE.X)` rather than
 * constructing `Queue` instances directly. The cache ensures we reuse one
 * `Queue` per process per queue name — BullMQ itself is happy with many
 * instances, but each one opens a Redis connection, and Upstash has a
 * hard connection cap on the low tier.
 *
 * Typical call site:
 *   const q = getQueue(QUEUE.CEF_SUBMITTED);
 *   await q.add("cef:new", envelope, DEFAULT_JOB_OPTS);
 *
 * The typed `enqueue*` helpers in `src/services/queues/enqueue.ts` wrap
 * this factory so presentation code never constructs an envelope by
 * hand.
 */

import "server-only";

import { Queue, QueueEvents } from "bullmq";
import type { Redis } from "ioredis";

import { getRedisConnection } from "./connection";
import type { QueueName } from "./names";

const queueCache = new Map<QueueName, Queue>();
const eventsCache = new Map<QueueName, QueueEvents>();

// BullMQ v5's Queue / QueueEvents constructor options expect `{ connection: Redis | ConnectionOptions }`
// at the top level (not a bare `ConnectionOptions`). We feed them a shared ioredis instance.
function bullConnection(): { connection: Redis } {
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
