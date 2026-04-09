/**
 * Prompt versioning types.
 *
 * Thread 4 is explicit: prompts must never be hardcoded in TypeScript.
 * Every prompt lives in the `admissions.prompt_version` table (and the
 * wellbeing-specific ones in `wellbeing.prompt_version`). Each prompt
 * has an `id`, a `slot` (what it's for), and a `status`:
 *
 *   - `active`      — the prompt currently in production for this slot
 *   - `shadow`      — evaluated alongside the active one; results logged
 *                     but not returned to users
 *   - `deprecated`  — historical, kept for trace reproducibility
 *
 * There is AT MOST ONE `active` prompt per slot. The migration adds a
 * partial unique index to enforce this at the DB layer.
 */

export type PromptStatus = "active" | "shadow" | "deprecated";

/** Stable slot identifiers — add here, never rename. */
export const PROMPT_SLOT = {
  A0_INTAKE: "a0.intake",
  A1_DNA_GENERATE: "a1.dna_generate",
  A5_ESSAY_CLARITY: "a5.essay_clarity",
  A5_ESSAY_STRUCTURE: "a5.essay_structure",
  A5_ESSAY_VOICE: "a5.essay_voice",
  A5_ESSAY_EVIDENCE: "a5.essay_evidence",
  A5_ESSAY_POLISH: "a5.essay_polish",
  ARE_NARRATIVE: "are.narrative",
  ADIE_CHAT: "adie.chat",
  ADIE_CRISIS_CHECK: "adie.crisis_check",
} as const;

export type PromptSlot = (typeof PROMPT_SLOT)[keyof typeof PROMPT_SLOT];

export interface PromptVersion {
  id: string;
  slot: PromptSlot;
  version: number;
  status: PromptStatus;
  system: string;
  user_template: string;
  /** Whatever structured config the slot needs (e.g. response schemas). */
  config: Record<string, unknown>;
  model: string;
  created_at: string;
  created_by: string;
}
