/**
 * scripts/seed-prompts.ts
 *
 * Seeds the local Supabase emulator's `prompt_version` tables with
 * placeholder rows for every slot in `PROMPT_SLOT`. The placeholders
 * are intentionally non-final — they exist so that `callLLM` resolves
 * a row without throwing during local dev.
 *
 * The real prompt copy is filled in by Andy + Vaibhav during the
 * prompt-engineering pass in M1 Week 3. Until then this script gives
 * the rest of the app something to render against.
 *
 * Run with: `pnpm db:seed:prompts`
 */

import { admissionsDb, wellbeingDb } from "@/db/supabase";
import { PROMPT_SLOT, type PromptStatus } from "@/agents/_core/prompts";

interface SeedRow {
  slot: string;
  system: string;
  user_template: string;
  config: Record<string, unknown>;
  model: string;
  schema: "admissions" | "wellbeing";
  /** Defaults to `active`. Use `shadow` for experiments and for prompts
   *  whose downstream callsite is behind a feature gate. */
  status?: PromptStatus;
}

const ADMISSIONS_PLACEHOLDER_SYSTEM =
  "You are a calm, accurate, candid UniOffer assistant helping a UK university applicant. " +
  "Be specific. Never invent facts about the applicant.";

const WELLBEING_PLACEHOLDER_SYSTEM =
  "You are Adie, a supportive companion for a UK university applicant " +
  "navigating the admissions process. You are not a therapist. If the " +
  "user mentions self-harm or crisis, always surface a real-world resource.";

const SEED_ROWS: SeedRow[] = [
  {
    slot: PROMPT_SLOT.A0_INTAKE,
    system: ADMISSIONS_PLACEHOLDER_SYSTEM,
    user_template: "Walk this applicant through the intake form: {{name}}",
    config: { maxTokens: 600, temperature: 0.4 },
    model: "claude-sonnet-4-6",
    schema: "admissions",
  },
  {
    slot: PROMPT_SLOT.A1_DNA_GENERATE,
    system: ADMISSIONS_PLACEHOLDER_SYSTEM,
    user_template:
      "Generate a candidate DNA digest from this CEF JSON:\n\n{{cef}}",
    config: { maxTokens: 1500, temperature: 0.3 },
    model: "claude-opus-4-6",
    schema: "admissions",
  },
  ...(
    [
      PROMPT_SLOT.A5_ESSAY_CLARITY,
      PROMPT_SLOT.A5_ESSAY_STRUCTURE,
      PROMPT_SLOT.A5_ESSAY_VOICE,
      PROMPT_SLOT.A5_ESSAY_EVIDENCE,
      PROMPT_SLOT.A5_ESSAY_POLISH,
    ] as const
  ).map<SeedRow>((slot) => ({
    slot,
    system: ADMISSIONS_PLACEHOLDER_SYSTEM,
    user_template: `Stage: ${slot}. Read this essay and respond as JSON.\n\n{{essay}}`,
    config: { maxTokens: 1200, temperature: 0.3 },
    model: "claude-sonnet-4-6",
    schema: "admissions",
  })),
  {
    slot: PROMPT_SLOT.ARE_NARRATIVE,
    system: ADMISSIONS_PLACEHOLDER_SYSTEM,
    user_template:
      "Write the ARE narrative for this candidate, never including a percentage:\n\n{{candidate}}",
    config: { maxTokens: 800, temperature: 0.3 },
    model: "claude-sonnet-4-6",
    schema: "admissions",
  },
  {
    slot: PROMPT_SLOT.ADIE_CHAT,
    system: WELLBEING_PLACEHOLDER_SYSTEM,
    user_template: "{{message}}",
    config: { maxTokens: 600, temperature: 0.5 },
    model: "claude-sonnet-4-6",
    schema: "wellbeing",
  },
  {
    slot: PROMPT_SLOT.ADIE_CRISIS_CHECK,
    system:
      "You are a crisis detector. Read the user message and respond with " +
      'JSON `{"flag": true|false, "reason": "..."}`. Be conservative — ' +
      "false positives are far better than false negatives.",
    user_template: "{{message}}",
    config: { maxTokens: 200, temperature: 0.0 },
    model: "claude-sonnet-4-6",
    schema: "wellbeing",
  },
  // ---------------------------------------------------------------------------
  // Training-data profile extractor — SHADOW ONLY.
  //
  // This row exists so the offline eval harness and prompt-renderer tests
  // can resolve `training.extract_profile_v1` without crashing. There is
  // no production callsite for it yet — the training_data schema (drafts
  // 7/8/9) is 🚦-gated on Andy's training-data sign-off.
  //
  // Seeding it as `shadow` rather than `active` means:
  //   1. `getActivePrompt(slot)` throws, matching the "not yet live" state
  //   2. `getShadowPrompt(slot)` returns this row, so eval tooling works
  //   3. The partial unique index on (slot) WHERE status='active' stays
  //      available for a real active version when the gate lifts
  // ---------------------------------------------------------------------------
  {
    slot: PROMPT_SLOT.TRAINING_EXTRACT_PROFILE,
    system:
      "You are an information extraction system. Read the provided raw " +
      "admissions anecdote and return a single JSON object matching the " +
      "training-data profile schema. Do not editorialize. If a field is " +
      "not present in the source, set it to null. Never invent values.",
    user_template:
      "SOURCE_URL: {{source_url}}\n" +
      "ANECDOTE:\n{{anecdote}}\n\n" +
      "Return a JSON object with the following keys: country, school_slug, " +
      "program, intake_year, gpa_gpa4, sat_composite, act_composite, " +
      "ielts_overall, toefl_total, ecs, essay_themes, outcome.",
    config: {
      maxTokens: 2000,
      temperature: 0.0,
      responseFormat: "json_object",
    },
    model: "claude-sonnet-4-6",
    schema: "admissions",
    status: "shadow",
  },
];

async function main(): Promise<void> {
  for (const row of SEED_ROWS) {
    const client = row.schema === "wellbeing" ? wellbeingDb() : admissionsDb();
    // Insert as the active version of the slot. The partial unique
    // index on (slot) WHERE status='active' will reject duplicates,
    // which is the behavior we want — re-running the seed should be
    // a no-op except for newly added slots.
    const { error } = await client
      .from("prompt_version")
      .upsert(
        {
          slot: row.slot,
          version: 1,
          status: row.status ?? "active",
          system: row.system,
          user_template: row.user_template,
          config: row.config,
          model: row.model,
          created_by: "seed-script",
        },
        { onConflict: "slot,version" }
      );
    if (error) {
      // eslint-disable-next-line no-console
      console.error(`[seed-prompts] FAIL ${row.slot}:`, error.message);
      process.exit(1);
    }
    // eslint-disable-next-line no-console
    console.log(
      `[seed-prompts] OK ${row.slot} (${row.schema}, ${row.status ?? "active"})`
    );
  }
}

void main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("[seed-prompts] fatal:", err);
  process.exit(1);
});
