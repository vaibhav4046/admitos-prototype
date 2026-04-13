/**
 * tests/lib/survivorship-correction.test.ts
 *
 * Gap 3 — Survivorship bias detection and sample weight correction.
 */

import { describe, expect, it } from "vitest";

import {
  detectSurvivorshipBias,
  computeSampleWeight,
  MAX_SAMPLE_WEIGHT,
  BIAS_DETECTION_MULTIPLIER,
  CDS_BASELINE_ADMIT_RATES,
} from "@/lib/training/survivorship-correction";

describe("detectSurvivorshipBias", () => {
  it("flags bias when scraped rate is >1.5x CDS baseline", () => {
    // u1 baseline is 0.05, scraped 80% admitted = 16x baseline
    const result = detectSurvivorshipBias({
      tier_band: "u1",
      scraped_admit_count: 80,
      scraped_reject_count: 20,
    });
    expect(result.biased).toBe(true);
    expect(result.ratio_to_baseline).toBeGreaterThan(BIAS_DETECTION_MULTIPLIER);
  });

  it("does not flag bias when scraped rate is close to CDS", () => {
    // u5 baseline is 0.40, scraped 45% admitted = 1.125x
    const result = detectSurvivorshipBias({
      tier_band: "u5",
      scraped_admit_count: 45,
      scraped_reject_count: 55,
    });
    expect(result.biased).toBe(false);
    expect(result.ratio_to_baseline).toBeLessThanOrEqual(BIAS_DETECTION_MULTIPLIER);
  });

  it("handles zero total gracefully", () => {
    const result = detectSurvivorshipBias({
      tier_band: "u3",
      scraped_admit_count: 0,
      scraped_reject_count: 0,
    });
    expect(result.biased).toBe(false);
    expect(result.scraped_admit_rate).toBe(0);
  });

  it("uses fallback baseline for unknown tier_band", () => {
    const result = detectSurvivorshipBias({
      tier_band: "unknown",
      scraped_admit_count: 50,
      scraped_reject_count: 50,
    });
    // Fallback is 0.2, scraped is 0.5 → ratio 2.5 → biased
    expect(result.cds_baseline_rate).toBe(0.2);
    expect(result.biased).toBe(true);
  });
});

describe("computeSampleWeight", () => {
  it("down-weights admitted outcomes in biased dataset", () => {
    // u1 CDS rate 0.05, scraped rate 0.80
    // admitted weight = 0.05 / 0.80 = 0.0625
    const weight = computeSampleWeight({
      admission_outcome: "admitted",
      tier_band: "u1",
      scraped_admit_rate: 0.80,
    });
    expect(weight).toBeLessThan(1.0);
    expect(weight).toBeCloseTo(0.06, 1);
  });

  it("up-weights rejected outcomes in biased dataset", () => {
    // u1 CDS rate 0.05 → reject rate 0.95, scraped reject rate 0.20
    // rejected weight = 0.95 / 0.20 = 4.75 → capped at 3.0
    const weight = computeSampleWeight({
      admission_outcome: "rejected",
      tier_band: "u1",
      scraped_admit_rate: 0.80,
    });
    expect(weight).toBe(MAX_SAMPLE_WEIGHT);
  });

  it("caps sample weight at 3.0", () => {
    const weight = computeSampleWeight({
      admission_outcome: "rejected",
      tier_band: "u1",
      scraped_admit_rate: 0.99,
    });
    expect(weight).toBeLessThanOrEqual(MAX_SAMPLE_WEIGHT);
  });

  it("returns 1.0 for waitlisted (neutral)", () => {
    const weight = computeSampleWeight({
      admission_outcome: "waitlisted",
      tier_band: "u2",
      scraped_admit_rate: 0.70,
    });
    expect(weight).toBe(1.0);
  });

  it("returns ~1.0 when scraped rate matches CDS baseline", () => {
    // u5 CDS rate 0.40, scraped rate 0.40 → admitted weight = 1.0
    const weight = computeSampleWeight({
      admission_outcome: "admitted",
      tier_band: "u5",
      scraped_admit_rate: 0.40,
    });
    expect(weight).toBe(1.0);
  });

  it("exports correct constants", () => {
    expect(MAX_SAMPLE_WEIGHT).toBe(3.0);
    expect(BIAS_DETECTION_MULTIPLIER).toBe(1.5);
    expect(CDS_BASELINE_ADMIT_RATES["u1"]).toBe(0.05);
  });
});
