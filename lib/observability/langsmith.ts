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

import { Client } from "langsmith";

import { env } from "@/lib/env";

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

/**
 * Wrap an async function in a LangSmith run. The run id is returned so
 * the caller can attach evaluations or follow-up metadata later.
 *
 * In development we short-circuit and just run the function so that local
 * dev doesn't leak anything to the LangSmith project.
 */
export async function traced<T>(
  name: string,
  attributes: Record<string, unknown>,
  fn: Runnable<T>
): Promise<{ result: T; runId: string | null }> {
  if (!langsmithEnabled()) {
    const result = await fn();
    return { result, runId: null };
  }

  const startTime = new Date();
  try {
    const result = await fn();
    const run = await client().createRun({
      name,
      run_type: "chain",
      inputs: attributes,
      outputs: { ok: true },
      start_time: startTime.getTime(),
      end_time: Date.now(),
      project_name: env.LANGSMITH_PROJECT,
    });
    return { result, runId: run?.id ?? null };
  } catch (error) {
    await client().createRun({
      name,
      run_type: "chain",
      inputs: attributes,
      error: error instanceof Error ? error.message : String(error),
      start_time: startTime.getTime(),
      end_time: Date.now(),
      project_name: env.LANGSMITH_PROJECT,
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
