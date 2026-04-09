/**
 * LLM call contract.
 *
 * The router in `call.ts` wraps every model call in a uniform envelope
 * so that the callsite doesn't care whether we're hitting Anthropic,
 * OpenAI, or a self-hosted model via an OpenAI-compatible gateway.
 *
 * The request always carries:
 *   - A `promptSlot` identifier so the LangSmith trace is grouped
 *     correctly and the LLM-as-Judge knows which eval to run
 *   - A `requestId` tied to the HTTP request that triggered the call
 *   - A `namespace` so Sentry and audit logs can tag correctly
 *
 * The response always carries:
 *   - The model's text output
 *   - Structured metadata about the run (input/output tokens, latency,
 *     finish reason, LangSmith run id)
 *   - A nullable `shadowResult` that, when a shadow prompt was active,
 *     contains the shadow run's output. The caller ignores it; only
 *     LangSmith and the judge care.
 */

import type { PromptSlot } from "@/lib/prompts";

export type LLMNamespace = "admissions" | "wellbeing";

export interface LLMCallInput {
  slot: PromptSlot;
  vars: Record<string, unknown>;
  namespace: LLMNamespace;
  requestId: string;
  /**
   * Override the model from the prompt version. Use sparingly —
   * normally the model is pinned inside the prompt row so we can
   * A/B test the prompt + model combination together.
   */
  modelOverride?: string;
  /** Max tokens. Defaults to whatever the prompt config specifies. */
  maxTokens?: number;
  /** Temperature. Defaults to whatever the prompt config specifies. */
  temperature?: number;
}

export interface LLMCallResult {
  text: string;
  model: string;
  promptSlot: PromptSlot;
  promptVersion: number;
  promptId: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  finishReason: "stop" | "length" | "content_filter" | "tool_use" | "error";
  langsmithRunId: string | null;
  /** Present only when a shadow prompt was active for the slot. */
  shadowResult?: Omit<LLMCallResult, "shadowResult"> | null;
}
