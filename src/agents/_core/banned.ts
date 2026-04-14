/**
 * Banned-model registry.
 *
 * Andy was explicit in Thread 4: DeepSeek is NEVER to be used as a
 * model provider on UniOffer. The ban is enforced in three places so
 * that a drift in any one layer still gets caught:
 *
 *   1. `src/services/env.ts` — throws on boot if any env var key matches /deepseek/i
 *   2. This file — the `callLLM` router refuses model IDs that match
 *   3. CI — a grep rule in the repo's lint config blocks PRs that add
 *      the string "deepseek" anywhere outside this file
 *
 * If a future model needs to be banned, add it here. Do NOT relax the
 * check — the point of redundancy is that a single careless commit
 * can't re-introduce a banned provider.
 */

export const BANNED_MODEL_PATTERNS: readonly RegExp[] = [
  /deepseek/i,
] as const;

export function assertModelAllowed(model: string): void {
  for (const pat of BANNED_MODEL_PATTERNS) {
    if (pat.test(model)) {
      throw new Error(
        `banned_model: model "${model}" is permanently disallowed on UniOffer. ` +
          `See Thread 4 and src/agents/_core/banned.ts.`
      );
    }
  }
}
