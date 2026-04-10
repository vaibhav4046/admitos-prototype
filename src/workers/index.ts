/**
 * BullMQ worker registry.
 *
 * Entry point run as `pnpm worker`. Spawns one BullMQ Worker per queue
 * in `QUEUE`, wires them to the shared ioredis connection, and mounts
 * graceful shutdown handlers so a deploy rollout drains in-flight jobs
 * before exiting.
 *
 * ### Isolation invariant
 *
 * Workers that process wellbeing queues use the wellbeing service
 * client. Workers that process admissions queues use the admissions
 * service client. There is no worker that crosses schemas. The
 * `QUEUE_SCHEMA` map in `src/db/queues/names.ts` is the source of truth
 * for which side a queue belongs to, and the worker factory below
 * refuses to attach a handler whose namespace doesn't match the map.
 *
 * ### One process vs many
 *
 * For M1 we run a single Node process that owns all workers. This is
 * operationally simple and good enough until the wellbeing load grows
 * enough to justify its own deployment unit. When we split, the split
 * happens here — the queue constants and handlers don't need to change.
 */

import "server-only";

import { Worker, type Processor } from "bullmq";

import { getRedisConnection, closeRedisConnection } from "@/db/queues/connection";
import {
  QUEUE,
  QUEUE_SCHEMA,
  type QueueName,
} from "@/db/queues";
import { captureError, addBreadcrumb } from "@/lib/observability";

import { handleCefSubmitted } from "./handlers/cef-submitted";
import { handleEssayUploaded } from "./handlers/essay-uploaded";
import { handleAuditAlert } from "./handlers/audit-alerts";
import { handleAdieMessage } from "./handlers/adie-message";
import { handleAreComputation } from "./handlers/are-computation";
import { handleExtraction } from "./handlers/extraction";

const HANDLERS: Record<QueueName, Processor> = {
  [QUEUE.CEF_SUBMITTED]: handleCefSubmitted,
  [QUEUE.ESSAY_UPLOADED]: handleEssayUploaded,
  [QUEUE.AUDIT_ALERTS]: handleAuditAlert,
  [QUEUE.ADIE_MESSAGE]: handleAdieMessage,
  [QUEUE.ARE_COMPUTATION]: handleAreComputation,
  [QUEUE.EXTRACTION]: handleExtraction,
};

function spawnWorker(name: QueueName): Worker {
  const namespace = QUEUE_SCHEMA[name];
  const connection = getRedisConnection();

  const worker = new Worker(name, HANDLERS[name], {
    connection,
    concurrency: 4,
    // Keep completed jobs for 24h for debugging; failed jobs for 7d.
    removeOnComplete: { age: 24 * 3600, count: 1000 },
    removeOnFail: { age: 7 * 24 * 3600 },
  });

  worker.on("ready", () => {
    addBreadcrumb("worker.ready", { queue: name, namespace });
  });
  worker.on("error", (err) => {
    captureError(err, { namespace, extra: { queue: name, stage: "worker_error" } });
  });
  worker.on("failed", (job, err) => {
    captureError(err, {
      namespace,
      extra: { queue: name, jobId: job?.id, attempts: job?.attemptsMade },
    });
  });

  return worker;
}

async function main(): Promise<void> {
  const workers: Worker[] = [];
  for (const q of Object.values(QUEUE) as QueueName[]) {
    workers.push(spawnWorker(q));
  }

  // eslint-disable-next-line no-console
  console.log(`[worker] started — queues: ${workers.map((w) => w.name).join(", ")}`);

  const shutdown = async (signal: string) => {
    // eslint-disable-next-line no-console
    console.log(`[worker] received ${signal} — draining`);
    await Promise.allSettled(workers.map((w) => w.close()));
    await closeRedisConnection();
    process.exit(0);
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

void main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("[worker] fatal:", err);
  captureError(err, { namespace: "admissions", extra: { stage: "worker_bootstrap" } });
  process.exit(1);
});
