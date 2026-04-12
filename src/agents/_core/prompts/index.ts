/**
 * Barrel for the prompt-versioning module. The only two callsite verbs
 * you need are:
 *
 *   import { getActivePrompt, renderPrompt } from "@/agents/_core/prompts";
 *
 *   const p = await getActivePrompt(PROMPT_SLOT.A5_ESSAY_CLARITY);
 *   const { system, user, promptId } = renderPrompt(p, { essay: text });
 *
 * Keep the surface area small — anything else (cache internals, slot
 * namespace routing, shadow fan-out) should stay private to this folder.
 */

export {
  getActivePrompt,
  getShadowPrompt,
  bustPromptCache,
} from "./loader";

export { renderPrompt, type RenderedPrompt } from "./renderer";

export {
  PROMPT_SLOT,
  type PromptSlot,
  type PromptStatus,
  type PromptVersion,
} from "./types";
