/**
 * tests/lib/recency-weight.test.ts
 *
 * 9 tests for recency weighting and credential classification.
 */

import { describe, expect, it } from "vitest";

import {
  computeRecencyWeight,
  classifyCredentialType,
  EXCLUSION_CUTOFF,
  TEST_OPTIONAL_START_YEAR,
} from "@/lib/training/recency-weight";

describe("computeRecencyWeight", () => {
  it("returns 1.0 for 2023+", () => {
    const result = computeRecencyWeight({ application_year: 2024 });
    expect(result.weight).toBe(1.0);
    expect(result.excluded).toBe(false);
  });

  it("returns 0.7 for 2021-2022", () => {
    expect(computeRecencyWeight({ application_year: 2021 }).weight).toBe(0.7);
    expect(computeRecencyWeight({ application_year: 2022 }).weight).toBe(0.7);
  });

  it("returns 0.4 for 2019-2020", () => {
    expect(computeRecencyWeight({ application_year: 2019 }).weight).toBe(0.4);
    expect(computeRecencyWeight({ application_year: 2020 }).weight).toBe(0.4);
  });

  it("excludes pre-2019 data", () => {
    const result = computeRecencyWeight({ application_year: 2018 });
    expect(result.weight).toBeNull();
    expect(result.excluded).toBe(true);
  });

  it("marks 2020+ as test-optional eligible", () => {
    expect(computeRecencyWeight({ application_year: 2020 }).test_optional_eligible).toBe(true);
    expect(computeRecencyWeight({ application_year: 2023 }).test_optional_eligible).toBe(true);
  });

  it("marks pre-2020 as NOT test-optional eligible", () => {
    expect(computeRecencyWeight({ application_year: 2019 }).test_optional_eligible).toBe(false);
    expect(computeRecencyWeight({ application_year: 2018 }).test_optional_eligible).toBe(false);
  });

  it("exports correct constants", () => {
    expect(EXCLUSION_CUTOFF).toBe(2019);
    expect(TEST_OPTIONAL_START_YEAR).toBe(2020);
  });
});

describe("classifyCredentialType", () => {
  it("returns 'both' when SAT and ACT present", () => {
    expect(
      classifyCredentialType({ sat_score: 1500, act_score: 34, test_optional_eligible: true })
    ).toBe("both");
  });

  it("returns 'test_optional' when no scores and eligible", () => {
    expect(
      classifyCredentialType({ sat_score: null, act_score: null, test_optional_eligible: true })
    ).toBe("test_optional");
  });
});
