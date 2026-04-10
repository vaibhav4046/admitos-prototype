/**
 * Redis-backed sliding-window rate limiter.
 *
 * One small primitive used by:
 *
 *   - the auth signin route (5/minute per IP)
 *   - the CEF autosave route (60/minute per user)
 *   - the Adie message route (20/minute per user, 5/second burst)
 *
 * The implementation is a textbook sliding-window log: we keep a Redis
 * sorted set of timestamps per key, prune entries older than the window,
 * and check the cardinality. Cheap, accurate, and survives a single
 * instance restart.
 *
 * ### Why not a token bucket
 *
 * Token bucket is fewer Redis ops but harder to debug — when a user
 * gets a 429 we want to be able to say "you sent N requests in the
 * last 60 seconds" and a sliding-window log gives us that for free.
 *
 * ### Failure mode
 *
 * If Redis is unreachable the limiter **fails open** (allows the
 * request) and emits a Sentry breadcrumb. We'd rather serve a few
 * extra requests than block legitimate users behind a Redis blip.
 * For genuinely security-sensitive paths (e.g. password reset), use
 * the `failClosed` option.
 */

import "server-only";

import { getRedisConnection } from "@/db/queues/connection";
import { addBreadcrumb } from "@/lib/observability";

export interface RateLimitOptions {
  /** Logical bucket name. e.g. `cef.autosave`. */
  bucket: string;
  /** Identifier within the bucket. Usually `user:<id>` or `ip:<addr>`. */
  key: string;
  /** Max requests allowed within the window. */
  limit: number;
  /** Window in milliseconds. */
  windowMs: number;
  /** If true, deny requests when Redis is unreachable. Default false. */
  failClosed?: boolean;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetMs: number;
  /** True when the limiter degraded to fail-open due to a Redis error. */
  degraded: boolean;
}

export async function rateLimit(
  opts: RateLimitOptions
): Promise<RateLimitResult> {
  const now = Date.now();
  const windowStart = now - opts.windowMs;
  const redisKey = `rl:${opts.bucket}:${opts.key}`;

  try {
    const redis = getRedisConnection();
    // Pipeline: zremrangebyscore (prune old) + zadd (record this hit)
    // + zcard (count) + pexpire (TTL safety net).
    const member = `${now}:${Math.random().toString(36).slice(2, 8)}`;
    const pipeline = redis.multi();
    pipeline.zremrangebyscore(redisKey, 0, windowStart);
    pipeline.zadd(redisKey, now, member);
    pipeline.zcard(redisKey);
    pipeline.pexpire(redisKey, opts.windowMs + 1000);
    const exec = await pipeline.exec();
    if (!exec) throw new Error("rate_limit_pipeline_no_result");

    const cardEntry = exec[2];
    const count = Number(cardEntry?.[1] ?? 0);
    const allowed = count <= opts.limit;
    const remaining = Math.max(0, opts.limit - count);
    return { allowed, remaining, resetMs: opts.windowMs, degraded: false };
  } catch (err) {
    addBreadcrumb("rate_limit.degraded", {
      bucket: opts.bucket,
      error: err instanceof Error ? err.message : String(err),
    });
    return {
      allowed: !opts.failClosed,
      remaining: opts.limit,
      resetMs: opts.windowMs,
      degraded: true,
    };
  }
}
