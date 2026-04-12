/**
 * tests/lib/school-gate.test.ts
 *
 * 6 tests for the school-gate pre-insert filter.
 */

import { describe, expect, it } from "vitest";

import {
  schoolGate,
  ALLOWED_TIER_BANDS,
} from "@/lib/training/school-gate";

describe("schoolGate", () => {
  it("allows a valid university tier (u1)", () => {
    const result = schoolGate({ institution_type: "university", tier_band: "u1" });
    expect(result).toEqual({ allowed: true, reason: "in_scope" });
  });

  it("allows a valid LAC tier (l3)", () => {
    const result = schoolGate({ institution_type: "lac", tier_band: "l3" });
    expect(result).toEqual({ allowed: true, reason: "in_scope" });
  });

  it("rejects missing institution_type", () => {
    const result = schoolGate({ institution_type: null, tier_band: "u2" });
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe("missing_institution_type");
  });

  it("rejects missing tier_band", () => {
    const result = schoolGate({ institution_type: "university", tier_band: null });
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe("missing_tier_band");
  });

  it("rejects tier_band that doesn't match institution_type (l2 for university)", () => {
    const result = schoolGate({ institution_type: "university", tier_band: "l2" });
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("tier_band_mismatch");
  });

  it("has exactly 9 allowed tier bands", () => {
    expect(ALLOWED_TIER_BANDS).toHaveLength(9);
    expect(ALLOWED_TIER_BANDS).toEqual(
      expect.arrayContaining(["u1", "u2", "u3", "u4", "u5", "l1", "l2", "l3", "l4"])
    );
  });
});
