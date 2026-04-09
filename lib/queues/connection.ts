/**
 * Single shared ioredis connection for all BullMQ queues and workers.
 *
 * BullMQ strongly recommends a single connection per process — creating
 * one per queue wastes file descriptors and confuses Redis's latency
 * stats. This module exports the connection lazily so that importing
 * a queue name constant doesn't force a Redis connect.
 */

import "server-only";

import IORedis, { type Redis } from "ioredis";

import { env } from "@/lib/env";

let connection: Redis | null = null;

export function getRedisConnection(): Redis {
  if (connection) return connection;

  connection = new IORedis(env.REDIS_URL, {
    // BullMQ requires this to be null for reliable blocking commands.
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    // Reconnect aggressively — Upstash can drop idle connections.
    reconnectOnError(err) {
      const targetError = "READONLY";
      return err.message.includes(targetError);
    },
    retryStrategy(times) {
      // Exponential backoff capped at 3s. After 60 retries we let BullMQ
      // surface the failure so it doesn't silently hide a dead Redis.
      if (times > 60) return null;
      return Math.min(times * 100, 3000);
    },
  });

  connection.on("error", (err) => {
    // Log, don't throw — BullMQ expects the connection to recover itself.
    console.error("[redis] connection error", err);
  });

  return connection;
}

/**
 * For tests and graceful shutdown. Safe to call multiple times.
 */
export async function closeRedisConnection() {
  if (!connection) return;
  try {
    await connection.quit();
  } finally {
    connection = null;
  }
}
