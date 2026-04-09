/**
 * Prompt loader — fetches active + shadow prompts from the DB.
 *
 * Thread 4 rule: prompts are NEVER imported from TS source. The loader is
 * the one and only door between application code and a prompt string.
 *
 * Shape of the flow:
 *
 *   callsite
 *     └── getActivePrompt("a5.essay_clarity")
 *           └── supabase.from("prompt_version")
 *                 .select("*")
 *                 .eq("slot", "a5.essay_clarity")
 *                 .eq("status", "active")
 *                 .single()
 *
 * The partial unique index on (slot) WHERE status = 'active' makes this
 * `.single()` safe: if two actives somehow exist, the index write fails
 * before either row ever lands, and we fail loud at promotion time
 * rather than silently at read time.
 *
 * ### Caching
 *
 * Prompts are read on the hot path for every LLM call, so we keep a
 * per-process in-memory cache keyed by `{namespace}:{slot}` with a short
 * TTL (default 60s). The cache is cleared explicitly by `bustPromptCache`
 * which the promotion RPC calls via a Postgres LISTEN/NOTIFY bridge in
 * a later milestone. For M1 the 60s TTL is good enough.
 *
 * ### Shadow prompts
 *
 * `getShadowPrompt(slot)` returns the current shadow version, if any,
 * so the router in `callLLM` can fan out a second request whose output
 * is logged to LangSmith and scored by the judge but NEVER returned to
 * the user. This is how we A/B prompt changes without shipping them.
 */

import "server-only";

import { admissionsDb, wellbeingDb } from "@/lib/supabase";
import { captureError } from "@/lib/observability";

import type { PromptSlot, PromptVersion, PromptStatus } from "./types";

type PromptNamespace = "admissions" | "wellbeing";

interface CacheEntry {
  value: PromptVersion | null;
  expiresAt: number;
}

const CACHE_TTL_MS = 60_000;
const cache = new Map<string, CacheEntry>();

function cacheKey(
  namespace: PromptNamespace,
  slot: PromptSlot,
  status: PromptStatus
): string {
  return `${namespace}:${slot}:${status}`;
}

function namespaceForSlot(slot: PromptSlot): PromptNamespace {
  // Wellbeing-specific prompts live in the wellbeing schema. Everything
  // else is admissions. Keep this list explicit — wellbeing isolation
  // means we'd rather hit a KeyError than route a wellbeing prompt
  // through the admissions client.
  if (slot === "adie.chat" || slot === "adie.crisis_check") {
    return "wellbeing";
  }
  return "admissions";
}

function clientFor(namespace: PromptNamespace) {
  return namespace === "wellbeing" ? wellbeingDb() : admissionsDb();
}

async function fetchPrompt(
  slot: PromptSlot,
  status: PromptStatus
): Promise<PromptVersion | null> {
  const namespace = namespaceForSlot(slot);
  const key = cacheKey(namespace, slot, status);

  const hit = cache.get(key);
  if (hit && hit.expiresAt > Date.now()) {
    return hit.value;
  }

  const client = clientFor(namespace);
  const { data, error } = await client
    .from("prompt_version")
    .select("*")
    .eq("slot", slot)
    .eq("status", status)
    .maybeSingle();

  if (error) {
    captureError(error, {
      namespace,
      extra: { stage: "prompt_loader", slot, status },
    });
    throw new Error(`prompt_loader_failed: ${slot}/${status}: ${error.message}`);
  }

  const value = (data as PromptVersion | null) ?? null;
  cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
  return value;
}

/**
 * Get the active prompt for a slot. Throws if none exists — the app
 * must never silently fall back to an empty prompt.
 */
export async function getActivePrompt(slot: PromptSlot): Promise<PromptVersion> {
  const p = await fetchPrompt(slot, "active");
  if (!p) {
    throw new Error(
      `no_active_prompt: slot="${slot}" has no active version. Check prompt_version table.`
    );
  }
  return p;
}

/**
 * Get the shadow prompt for a slot, if one exists. Returns `null` when
 * there is no shadow running — that's the normal case outside of prompt
 * experiments.
 */
export async function getShadowPrompt(
  slot: PromptSlot
): Promise<PromptVersion | null> {
  return fetchPrompt(slot, "shadow");
}

/**
 * Clear the in-process prompt cache. Called by the promotion RPC
 * listener once wired up; also exported for tests and for the
 * admin CLI's `prompts:bust-cache` command.
 */
export function bustPromptCache(slot?: PromptSlot): void {
  if (!slot) {
    cache.clear();
    return;
  }
  for (const key of cache.keys()) {
    if (key.includes(`:${slot}:`)) cache.delete(key);
  }
}
