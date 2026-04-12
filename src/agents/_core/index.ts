/**
 * Agents core barrel — the shared chassis for every agent.
 *
 *   import { callLLM } from "@/agents/_core";
 *
 * Everything downstream — providers, banned list, prompt routing,
 * LangSmith tracing, shadow fan-out — is internal. Individual agent
 * implementations (A5 essay feedback, A0 intake, Adie chat, etc.)
 * live in sibling folders under `src/agents/` and all call into this
 * core.
 */

export { callLLM } from "./call";
export { assertModelAllowed, BANNED_MODEL_PATTERNS } from "./banned";
export type {
  LLMCallInput,
  LLMCallResult,
  LLMNamespace,
} from "./types";
