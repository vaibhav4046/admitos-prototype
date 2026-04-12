/**
 * Token cost estimation for LLM calls.
 *
 * AdmitOS pays per token across multiple model providers. We track
 * estimated cost on every `callLLM` invocation so the Sentry metric
 * dashboard and the LangSmith trace both surface "$0.012 — A5 essay
 * clarity" alongside the raw output.
 *
 * The estimates here are intentionally conservative — round UP. We'd
 * rather over-state cost in dashboards than discover a hidden bill.
 *
 * Source: provider public price sheets, snapshot 2026-04-09. Update
 * this file when a price changes; do not scatter prices across the
 * codebase.
 *
 * The function returns USD as a number, not a string, so the caller
 * can sum it up cleanly. UI formatting happens at the render layer.
 */

interface PricePer1M {
  input: number;
  output: number;
}

/** USD per 1,000,000 tokens. Updated 2026-04-09. */
const PRICE_TABLE: Record<string, PricePer1M> = {
  "claude-opus-4-6": { input: 15.0, output: 75.0 },
  "claude-sonnet-4-6": { input: 3.0, output: 15.0 },
  "claude-haiku-4-5-20251001": { input: 0.8, output: 4.0 },
  "gpt-4.1": { input: 5.0, output: 15.0 },
  "gpt-4.1-mini": { input: 0.4, output: 1.6 },
};

/** Returns USD cost for a single completion. Rounded UP to nearest cent. */
export function estimateCostUsd(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const price = PRICE_TABLE[model];
  if (!price) {
    // Unknown model — assume the most expensive tier so somebody
    // notices in the dashboard.
    const fallback = PRICE_TABLE["claude-opus-4-6"]!;
    return roundUpCents(
      (inputTokens * fallback.input) / 1_000_000 +
        (outputTokens * fallback.output) / 1_000_000
    );
  }
  return roundUpCents(
    (inputTokens * price.input) / 1_000_000 +
      (outputTokens * price.output) / 1_000_000
  );
}

function roundUpCents(usd: number): number {
  return Math.ceil(usd * 100) / 100;
}

/** Total estimated cost for a batch of completions. */
export function totalCostUsd(
  rows: Array<{ model: string; inputTokens: number; outputTokens: number }>
): number {
  return roundUpCents(
    rows.reduce(
      (sum, r) => sum + estimateCostUsd(r.model, r.inputTokens, r.outputTokens),
      0
    )
  );
}
