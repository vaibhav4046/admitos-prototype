/**
 * School-gate: pre-insert gate rejecting out-of-scope schools.
 *
 * Only schools with a valid tier_band (u1-u5 for universities, l1-l4
 * for LACs) are allowed into the training pipeline. This gate runs
 * before any CEF submission enters the ARE computation queue.
 *
 * 9 allowed tiers: u1, u2, u3, u4, u5, l1, l2, l3, l4
 */

import "server-only";

/** All valid tier bands for the training pipeline. */
export const ALLOWED_TIER_BANDS = [
  "u1",
  "u2",
  "u3",
  "u4",
  "u5",
  "l1",
  "l2",
  "l3",
  "l4",
] as const;

export type TierBand = (typeof ALLOWED_TIER_BANDS)[number];

/** Valid institution types that pair with tier bands. */
export const ALLOWED_INSTITUTION_TYPES = ["university", "lac"] as const;
export type InstitutionType = (typeof ALLOWED_INSTITUTION_TYPES)[number];

/** Tier bands valid for each institution type. */
const TIER_BAND_BY_TYPE: Record<InstitutionType, readonly TierBand[]> = {
  university: ["u1", "u2", "u3", "u4", "u5"],
  lac: ["l1", "l2", "l3", "l4"],
};

export interface SchoolGateInput {
  institution_type: string | null | undefined;
  tier_band: string | null | undefined;
}

export interface SchoolGateResult {
  allowed: boolean;
  reason: string;
}

/**
 * Returns whether a school is in-scope for the training pipeline.
 *
 * A school passes the gate if:
 *   1. institution_type is 'university' or 'lac'
 *   2. tier_band is one of the 9 allowed values
 *   3. tier_band prefix matches institution_type (u* → university, l* → lac)
 */
export function schoolGate(school: SchoolGateInput): SchoolGateResult {
  const { institution_type, tier_band } = school;

  if (!institution_type) {
    return { allowed: false, reason: "missing_institution_type" };
  }

  if (!tier_band) {
    return { allowed: false, reason: "missing_tier_band" };
  }

  if (
    !ALLOWED_INSTITUTION_TYPES.includes(institution_type as InstitutionType)
  ) {
    return {
      allowed: false,
      reason: `invalid_institution_type: ${institution_type}`,
    };
  }

  if (!ALLOWED_TIER_BANDS.includes(tier_band as TierBand)) {
    return { allowed: false, reason: `invalid_tier_band: ${tier_band}` };
  }

  // Cross-check: tier_band prefix must match institution_type
  const validBands = TIER_BAND_BY_TYPE[institution_type as InstitutionType];
  if (!validBands.includes(tier_band as TierBand)) {
    return {
      allowed: false,
      reason: `tier_band_mismatch: ${tier_band} not valid for ${institution_type}`,
    };
  }

  return { allowed: true, reason: "in_scope" };
}
