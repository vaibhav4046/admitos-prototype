/**
 * Signal Yield Rate monitoring.
 *
 * Signal Yield Rate (SYR) = usable_profiles / total_scraped
 *
 * Architecture directive thresholds:
 *   - Minimum SYR: 12% — below this, the scraping source is too noisy
 *   - Survivorship bias check: if admitted >> rejected by 1.5x ratio,
 *     flag the source as survivorship-biased
 *
 * These metrics feed the quality monitoring materialized views and
 * inform whether a scraping source should continue being harvested.
 */

import "server-only";

/** Minimum acceptable signal yield rate (12%). */
export const MIN_SIGNAL_YIELD_RATE = 0.12;

/** Survivorship bias threshold — admitted/rejected ratio. */
export const SURVIVORSHIP_BIAS_THRESHOLD = 1.5;

export interface SignalYieldInput {
  total_scraped: number;
  usable_profiles: number;
  admitted_count: number;
  rejected_count: number;
}

export interface SignalYieldResult {
  yield_rate: number;
  meets_threshold: boolean;
  survivorship_biased: boolean;
  admitted_rejected_ratio: number | null;
  recommendation: "continue" | "review" | "suspend";
}

/**
 * Compute Signal Yield Rate metrics for a scraping source.
 */
export function computeSignalYield(input: SignalYieldInput): SignalYieldResult {
  const { total_scraped, usable_profiles, admitted_count, rejected_count } =
    input;

  // Guard against division by zero
  const yieldRate =
    total_scraped > 0 ? usable_profiles / total_scraped : 0;

  const meetsThreshold = yieldRate >= MIN_SIGNAL_YIELD_RATE;

  // Survivorship bias: ratio of admitted to rejected outcomes
  const admittedRejectedRatio =
    rejected_count > 0 ? admitted_count / rejected_count : null;

  const survivorshipBiased =
    admittedRejectedRatio !== null &&
    admittedRejectedRatio > SURVIVORSHIP_BIAS_THRESHOLD;

  // Recommendation logic
  let recommendation: SignalYieldResult["recommendation"];
  if (!meetsThreshold) {
    recommendation = "suspend";
  } else if (survivorshipBiased) {
    recommendation = "review";
  } else {
    recommendation = "continue";
  }

  return {
    yield_rate: Math.round(yieldRate * 10000) / 10000,
    meets_threshold: meetsThreshold,
    survivorship_biased: survivorshipBiased,
    admitted_rejected_ratio:
      admittedRejectedRatio !== null
        ? Math.round(admittedRejectedRatio * 100) / 100
        : null,
    recommendation,
  };
}
