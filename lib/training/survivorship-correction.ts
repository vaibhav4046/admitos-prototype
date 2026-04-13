/**
 * Survivorship bias correction.
 *
 * Gap 3 — Detects and corrects survivorship bias in training data
 * scraped from Reddit (users disproportionately post "accepted" outcomes).
 *
 * Detection: admitted/rejected ratio > 1.5x the CDS (Common Data Set)
 * baseline admit rate for the school's tier band.
 *
 * Correction: compute inverse-probability sample_weight for XGBoost
 * training, capped at 3.0 to prevent extreme outliers from dominating.
 *
 * See ADR-003 for the full rationale.
 */

import "server-only";

/** Maximum sample weight to prevent extreme outlier influence. */
export const MAX_SAMPLE_WEIGHT = 3.0;

/** Bias detection threshold: scraped ratio vs CDS baseline. */
export const BIAS_DETECTION_MULTIPLIER = 1.5;

/** Approximate CDS admit rates by tier band (used as baseline). */
export const CDS_BASELINE_ADMIT_RATES: Record<string, number> = {
  u1: 0.05,
  u2: 0.09,
  u3: 0.13,
  u4: 0.25,
  u5: 0.40,
  l1: 0.09,
  l2: 0.13,
  l3: 0.15,
  l4: 0.30,
};

export interface BiasDetectionInput {
  tier_band: string;
  scraped_admit_count: number;
  scraped_reject_count: number;
}

export interface BiasDetectionResult {
  biased: boolean;
  scraped_admit_rate: number;
  cds_baseline_rate: number;
  ratio_to_baseline: number;
}

/**
 * Detect whether a scraped dataset shows survivorship bias
 * relative to the CDS baseline for the school's tier.
 */
export function detectSurvivorshipBias(
  input: BiasDetectionInput,
): BiasDetectionResult {
  const { tier_band, scraped_admit_count, scraped_reject_count } = input;

  const total = scraped_admit_count + scraped_reject_count;
  const scrapedAdmitRate = total > 0 ? scraped_admit_count / total : 0;
  const cdsBaseline = CDS_BASELINE_ADMIT_RATES[tier_band] ?? 0.2;

  const ratioToBaseline =
    cdsBaseline > 0 ? scrapedAdmitRate / cdsBaseline : 0;

  return {
    biased: ratioToBaseline > BIAS_DETECTION_MULTIPLIER,
    scraped_admit_rate: Math.round(scrapedAdmitRate * 10000) / 10000,
    cds_baseline_rate: cdsBaseline,
    ratio_to_baseline: Math.round(ratioToBaseline * 100) / 100,
  };
}

export interface SampleWeightInput {
  admission_outcome: "admitted" | "waitlisted" | "rejected";
  tier_band: string;
  scraped_admit_rate: number;
}

/**
 * Compute inverse-probability sample_weight for XGBoost training.
 *
 * Under-represented outcomes (rejected at schools where scraped data
 * is biased toward admitted) get higher weights. Capped at 3.0.
 *
 * Weight formula:
 *   - admitted:  cds_rate / scraped_rate  (down-weight over-represented)
 *   - rejected: (1 - cds_rate) / (1 - scraped_rate)  (up-weight under-represented)
 *   - waitlisted: 1.0 (neutral — too few data points to calibrate)
 */
export function computeSampleWeight(input: SampleWeightInput): number {
  const { admission_outcome, tier_band, scraped_admit_rate } = input;

  if (admission_outcome === "waitlisted") return 1.0;

  const cdsRate = CDS_BASELINE_ADMIT_RATES[tier_band] ?? 0.2;

  let weight: number;
  if (admission_outcome === "admitted") {
    weight = scraped_admit_rate > 0 ? cdsRate / scraped_admit_rate : 1.0;
  } else {
    // rejected
    const cdsRejectRate = 1 - cdsRate;
    const scrapedRejectRate = 1 - scraped_admit_rate;
    weight = scrapedRejectRate > 0 ? cdsRejectRate / scrapedRejectRate : 1.0;
  }

  // Cap at MAX_SAMPLE_WEIGHT to prevent extreme outliers
  return Math.min(Math.round(weight * 100) / 100, MAX_SAMPLE_WEIGHT);
}
