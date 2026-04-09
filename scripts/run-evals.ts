/**
 * LLM-as-Judge eval runner.
 *
 * Run with `pnpm test:evals`. The script:
 *
 *   1. Reads the eval suite from `tests/evals/*.eval.json` files
 *   2. For each case, calls `callLLM` with the configured slot+vars
 *   3. Calls a judge prompt slot (configurable) to score the response
 *   4. Logs the score to LangSmith via `logEval(runId, ...)`
 *   5. Asserts a per-suite minimum mean score and exits non-zero if
 *      any suite drops below threshold
 *
 * The judge is itself a prompt slot living in the DB so the rubric
 * can be promoted independently of the runner.
 *
 * ### Why a separate runner
 *
 * In dev we run this on demand to validate a prompt before promoting
 * it from `shadow` to `active`. In CI we run it nightly against the
 * production prompt set as a regression guard. Same code path either
 * way, just different env + dataset.
 *
 * Skeleton — the eval JSON schema and the judge slot are M1 Week 2.
 */

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { callLLM } from "@/lib/llm";
import { logEval } from "@/lib/observability";
import type { PromptSlot } from "@/lib/prompts";

interface EvalCase {
  id: string;
  vars: Record<string, unknown>;
  expectedSubstrings?: string[];
  judgeMinScore?: number;
}

interface EvalSuite {
  slot: PromptSlot;
  judgeSlot: PromptSlot;
  namespace: "admissions" | "wellbeing";
  threshold: number;
  cases: EvalCase[];
}

const EVALS_DIR = path.join(process.cwd(), "tests", "evals");

async function loadSuites(): Promise<{ file: string; suite: EvalSuite }[]> {
  let entries: string[];
  try {
    entries = await readdir(EVALS_DIR);
  } catch {
    return [];
  }
  const files = entries.filter((f) => f.endsWith(".eval.json"));
  const out: { file: string; suite: EvalSuite }[] = [];
  for (const file of files) {
    const raw = await readFile(path.join(EVALS_DIR, file), "utf8");
    out.push({ file, suite: JSON.parse(raw) as EvalSuite });
  }
  return out;
}

async function runSuite(suite: EvalSuite, file: string): Promise<{
  file: string;
  mean: number;
  passed: boolean;
  cases: { id: string; score: number; reason: string }[];
}> {
  const results: { id: string; score: number; reason: string }[] = [];
  for (const c of suite.cases) {
    const requestId = `eval-${suite.slot}-${c.id}-${Date.now()}`;

    const candidate = await callLLM({
      slot: suite.slot,
      vars: c.vars,
      namespace: suite.namespace,
      requestId,
    });

    // Judge call. The judge takes the original input + candidate output
    // and returns a JSON `{ score: 0..1, reason: "..." }` blob.
    const judged = await callLLM({
      slot: suite.judgeSlot,
      vars: { ...c.vars, candidate: candidate.text },
      namespace: suite.namespace,
      requestId: `${requestId}-judge`,
    });

    let score = 0;
    let reason = "judge_unparseable";
    try {
      const parsed = JSON.parse(judged.text) as {
        score: number;
        reason: string;
      };
      score = Number(parsed.score) || 0;
      reason = String(parsed.reason ?? "");
    } catch {
      /* leave defaults */
    }

    if (candidate.langsmithRunId) {
      await logEval(candidate.langsmithRunId, {
        score,
        reason,
        judgeName: suite.judgeSlot,
      });
    }

    results.push({ id: c.id, score, reason });
  }

  const mean =
    results.length > 0
      ? results.reduce((s, r) => s + r.score, 0) / results.length
      : 0;
  return {
    file,
    mean,
    passed: mean >= suite.threshold,
    cases: results,
  };
}

async function main(): Promise<void> {
  const suites = await loadSuites();
  if (suites.length === 0) {
    // eslint-disable-next-line no-console
    console.log("[evals] no .eval.json files found in tests/evals/");
    return;
  }

  let allPassed = true;
  for (const { file, suite } of suites) {
    // eslint-disable-next-line no-console
    console.log(`[evals] running ${file} (slot=${suite.slot})`);
    const report = await runSuite(suite, file);
    // eslint-disable-next-line no-console
    console.log(
      `[evals] ${file} → mean=${report.mean.toFixed(3)} threshold=${suite.threshold} ${report.passed ? "PASS" : "FAIL"}`
    );
    if (!report.passed) allPassed = false;
  }

  if (!allPassed) {
    // eslint-disable-next-line no-console
    console.error("[evals] one or more suites failed");
    process.exit(1);
  }
}

void main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("[evals] fatal:", err);
  process.exit(1);
});
