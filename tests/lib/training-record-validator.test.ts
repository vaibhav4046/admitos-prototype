/**
 * tests/lib/training-record-validator.test.ts
 *
 * Gap 2 — Tests for training record validation with mandatory
 * application_year and extraction_confidence >= 0.7.
 */

import { describe, expect, it } from "vitest";

import {
  validateTrainingRecord,
  TrainingRecordSchema,
} from "@/lib/pipeline/training-record-validator";

const VALID_RECORD = {
  application_year: 2024,
  extraction_confidence: 0.85,
  source_url: "https://reddit.com/r/ApplyingToCollege/abc",
  source_type: "reddit",
  sat_score: 1500,
  act_score: null,
  unweighted_gpa: 3.9,
  ap_course_count: 8,
  major_category: "stem",
  ec_hours_per_week: 15,
  leadership_roles_count: 3,
  research_experience: true,
  nationality_region: "us_domestic",
  nationality_country: "US",
  admission_outcome: "admitted",
  recency_weight: 1.0,
  credential_type: "sat",
  test_optional_applicant: false,
};

describe("validateTrainingRecord", () => {
  it("accepts a fully valid record", () => {
    const result = validateTrainingRecord(VALID_RECORD);
    expect(result.valid).toBe(true);
    expect(result.record).toBeDefined();
  });

  it("rejects missing application_year", () => {
    const { application_year, ...noYear } = VALID_RECORD;
    const result = validateTrainingRecord(noYear);
    expect(result.valid).toBe(false);
    expect(result.errors?.some((e) => e.includes("application_year"))).toBe(true);
  });

  it("rejects extraction_confidence below 0.7", () => {
    const result = validateTrainingRecord({
      ...VALID_RECORD,
      extraction_confidence: 0.5,
    });
    expect(result.valid).toBe(false);
    expect(result.errors?.some((e) => e.includes("extraction_confidence"))).toBe(true);
  });

  it("accepts extraction_confidence at exactly 0.7", () => {
    const result = validateTrainingRecord({
      ...VALID_RECORD,
      extraction_confidence: 0.7,
    });
    expect(result.valid).toBe(true);
  });

  it("rejects when both sat_score and act_score are null", () => {
    const result = validateTrainingRecord({
      ...VALID_RECORD,
      sat_score: null,
      act_score: null,
    });
    expect(result.valid).toBe(false);
    expect(result.errors?.some((e) => e.includes("sat_score"))).toBe(true);
  });

  it("accepts with only act_score (sat null)", () => {
    const result = validateTrainingRecord({
      ...VALID_RECORD,
      sat_score: null,
      act_score: 34,
    });
    expect(result.valid).toBe(true);
  });

  it("rejects application_year outside range (pre-1990)", () => {
    const result = validateTrainingRecord({
      ...VALID_RECORD,
      application_year: 1985,
    });
    expect(result.valid).toBe(false);
  });

  it("rejects application_year outside range (post-2030)", () => {
    const result = validateTrainingRecord({
      ...VALID_RECORD,
      application_year: 2035,
    });
    expect(result.valid).toBe(false);
  });

  it("returns typed record on success", () => {
    const result = validateTrainingRecord(VALID_RECORD);
    expect(result.valid).toBe(true);
    expect(result.record?.application_year).toBe(2024);
    expect(result.record?.extraction_confidence).toBe(0.85);
  });

  it("returns error messages array on failure", () => {
    const result = validateTrainingRecord({});
    expect(result.valid).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors!.length).toBeGreaterThan(0);
  });
});
