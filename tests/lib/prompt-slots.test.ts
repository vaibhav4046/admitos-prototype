/**
 * tests/lib/prompt-slots.test.ts
 *
 * Pins the `PROMPT_SLOT` registry in `lib/prompts/types.ts`. Prompt slot
 * identifiers are *load-bearing strings* — they are written into the
 * `admissions.prompt_version.slot` column (and the wellbeing-schema
 * equivalent) and indexed by the loader cache key. Renaming one silently
 * unroots every seeded prompt row and makes the "active" prompt for that
 * slot look like it doesn't exist.
 *
 * This test's job is to scream in CI the moment somebody rewrites a
 * slot string by accident. All the actual loader/renderer coverage
 * lives in `prompt-renderer.test.ts`.
 */

import { describe, expect, it } from "vitest";

import { PROMPT_SLOT, type PromptSlot } from "@/lib/prompts/types";

describe("PROMPT_SLOT registry", () => {
  it("pins every slot to its exact dotted identifier", () => {
    // Exact-string snapshot so a typo in any slot value trips the test.
    expect(PROMPT_SLOT).toEqual({
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
    });
  });

  it("has no duplicate slot values", () => {
    const values = Object.values(PROMPT_SLOT);
    const unique = new Set(values);
    expect(unique.size).toBe(values.length);
  });

  it("every slot follows the `<surface>.<noun>` dotted snake_case shape", () => {
    // surface segment is letters+digits (e.g. a0, are, adie); body segment
    // is lowercase snake_case. Multiple body segments are NOT allowed at
    // this layer — keep slot ids shallow to avoid accidentally encoding
    // hierarchy.
    const shape = /^[a-z0-9]+\.[a-z]+(_[a-z]+)*$/;
    for (const v of Object.values(PROMPT_SLOT)) {
      expect(v).toMatch(shape);
    }
  });

  it("exposes a PromptSlot union that is the literal value union of the registry", () => {
    // Type-level smoke test — this line is really a compile-time check,
    // but asserting `as const` at runtime guarantees the literal types.
    const sample: PromptSlot = PROMPT_SLOT.ADIE_CHAT;
    expect(sample).toBe("adie.chat");
  });

  it("separates admissions slots from wellbeing slots by prefix", () => {
    const wellbeingSlots = Object.values(PROMPT_SLOT).filter((s) =>
      s.startsWith("adie.")
    );
    const admissionsSlots = Object.values(PROMPT_SLOT).filter(
      (s) => !s.startsWith("adie.")
    );

    // Sanity: every slot is accounted for by exactly one of the two
    // groups (no slot belongs to both, no slot belongs to neither).
    expect(wellbeingSlots.length + admissionsSlots.length).toBe(
      Object.values(PROMPT_SLOT).length
    );

    // There MUST be at least one of each — if wellbeing slots drop to
    // zero, either the Adie prompts are missing entirely or somebody
    // moved them to the admissions schema by mistake.
    expect(wellbeingSlots.length).toBeGreaterThan(0);
    expect(admissionsSlots.length).toBeGreaterThan(0);
  });

  it("has A5 essay slots covering clarity / structure / voice / evidence / polish", () => {
    // The essay feedback pipeline assumes these five dimensions exist —
    // see `scripts/run-evals.ts` and the A5 prompt router. Losing any of
    // them silently degrades the feedback surface.
    const a5 = Object.values(PROMPT_SLOT).filter((s) => s.startsWith("a5."));
    expect(a5).toContain("a5.essay_clarity");
    expect(a5).toContain("a5.essay_structure");
    expect(a5).toContain("a5.essay_voice");
    expect(a5).toContain("a5.essay_evidence");
    expect(a5).toContain("a5.essay_polish");
    expect(a5).toHaveLength(5);
  });
});
