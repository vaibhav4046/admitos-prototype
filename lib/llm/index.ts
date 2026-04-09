/**
 * LLM barrel. The one and only entrypoint for model calls.
 *
 *   import { callLLM } from "@/lib/llm";
 *
 * Everything downstream — providers, banned list, prompt routing,
 * LangSmith tracing, shadow fan-out — is internal.
 */

export { callLLM } from "./call";
export { assertModelAllowed, BANNED_MODEL_PATTERNS } from "./banned";
export type {
  LLMCallInput,
  LLMCallResult,
  LLMNamespace,
} from "./types";
