/**
 * Recency-weight: application_year weighting for training data.
 *
 * Time-decay schedule:
 *   2023+    → 1.0  (full weight — current cycle)
 *   2021–22  → 0.7  (recent but pre-current policy)
 *   2019–20  → 0.4  (COVID-era, many test-optional)
 *   pre-2019 → null (excluded from training — too stale)
 *
 * Also determines test-optional eligibility:
 *   year >= 2020 → applicant may legitimately have no SAT/ACT.
 */

import "server-only";

export interface RecencyInput {
  application_year: number;
}

export interface RecencyResult {
  weight: number | null;
  excluded: boolean;
  test_optional_eligible: boolean;
}

/** Cutoff year — anything before this is excluded from training. */
export const EXCLUSION_CUTOFF = 2019;

/** Year at which test-optional policies began (COVID). */
export const TEST_OPTIONAL_START_YEAR = 2020;

/**
 * Compute the recency weight for a training data point.
 *
 * Returns `null` weight and `excluded: true` for pre-2019 data.
 */
export function computeRecencyWeight(input: RecencyInput): RecencyResult {
  const { application_year } = input;

  const testOptionalEligible = application_year >= TEST_OPTIONAL_START_YEAR;

  if (application_year < EXCLUSION_CUTOFF) {
    return { weight: null, excluded: true, test_optional_eligible: false };
  }

  if (application_year <= 2020) {
    return { weight: 0.4, excluded: false, test_optional_eligible: testOptionalEligible };
  }

  if (application_year <= 2022) {
    return { weight: 0.7, excluded: false, test_optional_eligible: testOptionalEligible };
  }

  // 2023+
  return { weight: 1.0, excluded: false, test_optional_eligible: testOptionalEligible };
}

/**
 * Determine the credential_type based on available scores and
 * test-optional eligibility.
 */
export type CredentialType = "sat" | "act" | "both" | "test_optional";

export function classifyCredentialType(opts: {
  sat_score: number | null;
  act_score: number | null;
  test_optional_eligible: boolean;
}): CredentialType {
  const hasSat = opts.sat_score != null;
  const hasAct = opts.act_score != null;

  if (hasSat && hasAct) return "both";
  if (hasSat) return "sat";
  if (hasAct) return "act";

  // No scores — only valid if test-optional era
  if (opts.test_optional_eligible) return "test_optional";

  // Pre-test-optional era with no scores is an extraction issue,
  // but we still classify it — the validator will catch bad data.
  return "test_optional";
}
