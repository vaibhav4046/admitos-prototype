/**
 * Unified LLM call router.
 *
 * Every LLM call in the app MUST go through `callLLM`. Don't import
 * the Anthropic SDK or any other provider client directly — this
 * router is the single place that:
 *
 *   1. Loads the active prompt from the DB
 *   2. Renders the template
 *   3. Checks the model isn't banned
 *   4. Wraps the call in a LangSmith trace
 *   5. Mirrors the call to the shadow prompt (if one exists) and logs
 *      the result for offline eval, WITHOUT returning it to the user
 *   6. Records token counts + latency for the 3-layer observability
 *      dashboards
 *
 * ### Why router-not-adapter
 *
 * A thinner adapter layer would let callsites pick their own model.
 * That's explicitly not what we want: Thread 4 mandates prompt pinning,
 * which means the prompt row determines the model, not the callsite.
 * The router enforces that by reading `prompt.model` and passing it
 * down — `modelOverride` exists only for explicit eval runs.
 *
 * ### Provider stub
 *
 * The actual provider calls are stubbed for M1. The stub throws if
 * `APP_ENV === "production"` so we can never accidentally ship a
 * running-but-no-op LLM router. In dev the stub returns a canned
 * response so the app boots cleanly.
 */

import "server-only";

import { env } from "@/lib/env";
import { getActivePrompt, getShadowPrompt, renderPrompt } from "@/lib/prompts";
import { traced, captureError } from "@/lib/observability";

import { assertModelAllowed } from "./banned";
import type { LLMCallInput, LLMCallResult } from "./types";

/** Minimal provider-agnostic request the stub accepts. */
interface ProviderRequest {
  model: string;
  system: string;
  user: string;
  maxTokens: number;
  temperature: number;
}

interface ProviderResponse {
  text: string;
  inputTokens: number;
  outputTokens: number;
  finishReason: LLMCallResult["finishReason"];
}

async function providerCall(req: ProviderRequest): Promise<ProviderResponse> {
  assertModelAllowed(req.model);

  if (env.APP_ENV === "production") {
    throw new Error(
      "llm_provider_stub_in_production: wire the real provider client before shipping."
    );
  }

  // Dev stub — echoes a deterministic canned response so the surrounding
  // plumbing is still exercised.
  return {
    text: `[stub response for model=${req.model}, user.len=${req.user.length}]`,
    inputTokens: Math.ceil((req.system.length + req.user.length) / 4),
    outputTokens: 32,
    finishReason: "stop",
  };
}

async function runOnce(
  input: LLMCallInput,
  kind: "active" | "shadow"
): Promise<LLMCallResult | null> {
  const prompt =
    kind === "active"
      ? await getActivePrompt(input.slot)
      : await getShadowPrompt(input.slot);

  if (!prompt) return null;

  const rendered = renderPrompt(prompt, input.vars);
  const model = input.modelOverride ?? rendered.model;
  const maxTokens =
    input.maxTokens ??
    (Number((prompt.config as { maxTokens?: unknown }).maxTokens) || 1024);
  const temperature =
    input.temperature ??
    (Number((prompt.config as { temperature?: unknown }).temperature) || 0.4);

  const started = performance.now();
  const { result, runId } = await traced(
    `llm.${kind}.${input.slot}`,
    {
      namespace: input.namespace,
      requestId: input.requestId,
      promptId: rendered.promptId,
      promptSlot: rendered.promptSlot,
      promptVersion: rendered.promptVersion,
      model,
    },
    async () => {
      return providerCall({
        model,
        system: rendered.system,
        user: rendered.user,
        maxTokens,
        temperature,
      });
    }
  );
  const latencyMs = Math.round(performance.now() - started);

  return {
    text: result.text,
    model,
    promptSlot: rendered.promptSlot as LLMCallResult["promptSlot"],
    promptVersion: rendered.promptVersion,
    promptId: rendered.promptId,
    inputTokens: result.inputTokens,
    outputTokens: result.outputTokens,
    latencyMs,
    finishReason: result.finishReason,
    langsmithRunId: runId,
  };
}

export async function callLLM(input: LLMCallInput): Promise<LLMCallResult> {
  const active = await runOnce(input, "active");
  if (!active) {
    throw new Error(`no_active_prompt_for_slot: ${input.slot}`);
  }

  // Fire shadow in parallel-ish. We `await` it but silence failures so
  // a broken shadow never leaks into the user path.
  let shadowResult: LLMCallResult | null = null;
  try {
    shadowResult = await runOnce(input, "shadow");
  } catch (err) {
    captureError(err, {
      namespace: input.namespace,
      requestId: input.requestId,
      extra: { stage: "llm_shadow", slot: input.slot },
    });
    shadowResult = null;
  }

  return { ...active, shadowResult };
}
