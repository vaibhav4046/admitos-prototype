/**
 * Public surface of the `src/db/queues` module — the DB-layer half of
 * the BullMQ split (see `docs/scaffold-deltas/02-src-restructure.md`
 * PR 4). This layer exposes the queue name constants, the shared
 * ioredis connection, and the `Queue` / `QueueEvents` factory. The
 * typed enqueue helpers that wrap this factory live in
 * `src/services/queues/enqueue.ts`.
 */

export { QUEUE, ALL_QUEUE_NAMES, QUEUE_SCHEMA, type QueueName } from "./names";
export { getRedisConnection, closeRedisConnection } from "./connection";
export { getQueue, getQueueEvents, closeAllQueues } from "./client";
