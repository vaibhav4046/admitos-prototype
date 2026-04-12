/**
 * LangSmith wiring shell.
 *
 * LangSmith is our trace store for every Claude call. Per Thread 4's
 * "3 mandatory systems":
 *   - Every LLM invocation must be traced
 *   - Every A1 and A5 invocation must be evaluated by an LLM-as-Judge
 *   - The judge runs are themselves LangSmith traces so we can diff them
 *
 * This file exposes:
 *   - `traced(name, fn)` — wrap any async function in a LangSmith run
 *   - `logEval(runId, result)` — attach an eval judgement to a prior run
 *   - `langsmithEnabled()` — respects APP_ENV so local dev doesn't upload
 */

import "server-only";

import { randomUUID } from "node:crypto";

import { Client } from "langsmith";

import { env } from "@/services/env";

let _client: Client | null = null;

function client() {
  if (_client) return _client;
  _client = new Client({
    apiKey: env.LANGSMITH_API_KEY,
    apiUrl: env.LANGSMITH_ENDPOINT,
  });
  return _client;
}

export function langsmithEnabled() {
  return env.APP_ENV !== "development";
}

type Runnable<T> = () => Promise<T>;

interface TracedOptions<T> {
  /**
   * Extra tags to attach to the LangSmith run. These are appended to the
   * tags we auto-derive from the `attributes` record, so callers only
   * need to pass tags that aren't already in attributes.
   */
  tags?: string[];
  /**
   * Project the function result down to a JSON-safe summary for the
   * `outputs` column. When omitted, runs log `{ ok: true }` on success,
   * which is cheap but hides token counts and response previews.
   */
  summarizeOutput?: (result: T) => Record<string, unknown>;
}

/**
 * Turn the `attributes` record into a `key:value` tag array so the
 * LangSmith UI can filter runs without a custom view. Only primitive
 * string/number values are tagified — objects and nulls stay in
 * `inputs` where they belong.
 *
 * Tags are capped at 64 characters per Thread 4's observability ADR
 * to keep the LangSmith sidebar readable on small screens.
 */
function deriveTags(attributes: Record<string, unknown>): string[] {
  const tags: string[] = [];
  for (const [k, v] of Object.entries(attributes)) {
    if (typeof v === "string") {
      if (v.length > 0 && v.length <= 64) tags.push(`${k}:${v}`);
    } else if (typeof v === "number" && Number.isFinite(v)) {
      tags.push(`${k}:${v}`);
    } else if (typeof v === "boolean") {
      tags.push(`${k}:${v}`);
    }
  }
  return tags;
}

/**
 * Wrap an async function in a LangSmith run. The run id is returned so
 * the caller can attach evaluations or follow-up metadata later.
 *
 * In development we short-circuit and just run the function so that local
 * dev doesn't leak anything to the LangSmith project.
 *
 * The `attributes` record becomes BOTH the LangSmith `inputs` (full
 * structured blob) AND a set of `key:value` tags (for sidebar
 * filtering). Keep attribute values JSON-serializable — they are
 * uploaded as-is.
 */
export async function traced<T>(
  name: string,
  attributes: Record<string, unknown>,
  fn: Runnable<T>,
  opts?: TracedOptions<T>
): Promise<{ result: T; runId: string | null }> {
  if (!langsmithEnabled()) {
    const result = await fn();
    return { result, runId: null };
  }

  // Generate the run id locally so the caller can attach evaluations
  // regardless of what `createRun` returns. Newer versions of the
  // `langsmith` client type `createRun` as returning `void`, so we
  // can't rely on it to hand the id back.
  const runId = randomUUID();
  const startTime = new Date();
  const tags = [...deriveTags(attributes), ...(opts?.tags ?? [])];
  // The langsmith SDK's `CreateRunParams` type doesn't expose a
  // top-level `tags` field, but the backend reads tags from
  // `extra.metadata.tags` (the same place RunTree serializes them).
  // Stashing them there makes the LangSmith sidebar filter work
  // without needing to type-cast around the SDK.
  const extra = { metadata: { tags } };
  try {
    const result = await fn();
    const outputs = opts?.summarizeOutput
      ? opts.summarizeOutput(result)
      : { ok: true };
    await client().createRun({
      id: runId,
      name,
      run_type: "chain",
      inputs: attributes,
      outputs,
      start_time: startTime.getTime(),
      end_time: Date.now(),
      project_name: env.LANGSMITH_PROJECT,
      extra,
    });
    return { result, runId };
  } catch (error) {
    await client().createRun({
      id: runId,
      name,
      run_type: "chain",
      inputs: attributes,
      error: error instanceof Error ? error.message : String(error),
      start_time: startTime.getTime(),
      end_time: Date.now(),
      project_name: env.LANGSMITH_PROJECT,
      extra,
    });
    throw error;
  }
}

export async function logEval(
  runId: string,
  result: { score: number; reason: string; judgeName: string }
) {
  if (!langsmithEnabled()) return;
  await client().createFeedback(runId, result.judgeName, {
    score: result.score,
    comment: result.reason,
  });
}
