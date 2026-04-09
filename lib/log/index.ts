/**
 * Structured logger.
 *
 * Thin wrapper over `console.log` that emits NDJSON lines so the
 * platform log shipper (Vercel → Logflare in production, plain
 * stdout locally) gets structured fields without us having to wire
 * a heavyweight logger like pino.
 *
 * The logger ALSO drops a Sentry breadcrumb at INFO+ levels so the
 * Sentry timeline mirrors the log feed for any request that ends
 * up triggering an error.
 *
 * ### Why not pino / winston
 *
 * Three reasons. First, this app runs on the Edge runtime in places
 * (middleware) and pino's Node bindings don't load there. Second,
 * a 60-line wrapper covers everything we need for the MVP. Third,
 * the *consumers* of these logs (Sentry + Vercel log feed + local
 * stdout) all expect different shapes — having one tiny adapter
 * makes it easy to fan out without dragging in a transport plugin.
 *
 * ### Usage
 *
 *   import { log } from "@/lib/log";
 *   log.info("cef.autosave.success", { submissionId, step, durationMs });
 *
 * Conventions:
 *   - First arg is a stable event name in `<surface>.<noun>.<verb>` form
 *   - Second arg is a flat object of structured fields
 *   - NEVER log PII directly. If you must include user input, hash it
 *     or truncate to a class of value.
 *   - NEVER log wellbeing content. Use `log.info("adie.message.received",
 *     { messageLength })` instead of including the message body.
 */

import { addBreadcrumb } from "@/lib/observability";

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogFields {
  [k: string]: unknown;
}

const LEVEL_RANK: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

function minLevel(): number {
  // In tests, suppress everything below WARN to keep output readable.
  // In production, INFO and above. In dev, DEBUG and above.
  const env = process.env.APP_ENV ?? "development";
  if (env === "test") return LEVEL_RANK.warn;
  if (env === "production") return LEVEL_RANK.info;
  return LEVEL_RANK.debug;
}

/**
 * Banned key check. We refuse to serialise any field whose key
 * matches a wellbeing-content pattern, because PII / clinical content
 * must never end up in the log feed even by accident. The matching
 * keys are dropped (and replaced with a sentinel) before serialisation.
 */
const BANNED_FIELD_PATTERNS: readonly RegExp[] = [
  /wellbeing[._]content/i,
  /adie[._]message[._]body/i,
  /message[._]body/i,
  /transcript[._]raw/i,
];

function scrub(fields: LogFields): LogFields {
  const out: LogFields = {};
  for (const [k, v] of Object.entries(fields)) {
    if (BANNED_FIELD_PATTERNS.some((pat) => pat.test(k))) {
      out[k] = "[REDACTED]";
      continue;
    }
    out[k] = v;
  }
  return out;
}

function emit(level: LogLevel, event: string, fields: LogFields = {}): void {
  if (LEVEL_RANK[level] < minLevel()) return;
  const scrubbed = scrub(fields);
  const line = JSON.stringify({
    level,
    event,
    ts: new Date().toISOString(),
    ...scrubbed,
  });
  // eslint-disable-next-line no-console
  if (level === "error") console.error(line);
  // eslint-disable-next-line no-console
  else if (level === "warn") console.warn(line);
  // eslint-disable-next-line no-console
  else console.log(line);

  // Mirror INFO+ into Sentry breadcrumb timeline. Errors are
  // captured separately by `captureError`, so we don't double up.
  if (LEVEL_RANK[level] >= LEVEL_RANK.info && level !== "error") {
    addBreadcrumb(event, scrubbed);
  }
}

export const log = {
  debug: (event: string, fields?: LogFields) => emit("debug", event, fields),
  info: (event: string, fields?: LogFields) => emit("info", event, fields),
  warn: (event: string, fields?: LogFields) => emit("warn", event, fields),
  error: (event: string, fields?: LogFields) => emit("error", event, fields),
};

export type { LogLevel, LogFields };
