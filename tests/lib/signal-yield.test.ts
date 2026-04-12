/**
 * tests/lib/signal-yield.test.ts
 *
 * 7 tests for Signal Yield Rate monitoring.
 */

import { describe, expect, it } from "vitest";

import {
  computeSignalYield,
  MIN_SIGNAL_YIELD_RATE,
  SURVIVORSHIP_BIAS_THRESHOLD,
} from "@/lib/training/signal-yield";

describe("computeSignalYield", () => {
  it("recommends 'continue' for healthy source", () => {
    const result = computeSignalYield({
      total_scraped: 100,
      usable_profiles: 20,
      admitted_count: 12,
      rejected_count: 8,
    });
    expect(result.yield_rate).toBe(0.2);
    expect(result.meets_threshold).toBe(true);
    expect(result.survivorship_biased).toBe(false);
    expect(result.recommendation).toBe("continue");
  });

  it("recommends 'suspend' when yield below 12%", () => {
    const result = computeSignalYield({
      total_scraped: 100,
      usable_profiles: 5,
      admitted_count: 3,
      rejected_count: 2,
    });
    expect(result.yield_rate).toBe(0.05);
    expect(result.meets_threshold).toBe(false);
    expect(result.recommendation).toBe("suspend");
  });

  it("recommends 'review' when survivorship-biased", () => {
    const result = computeSignalYield({
      total_scraped: 100,
      usable_profiles: 30,
      admitted_count: 25,
      rejected_count: 5,
    });
    expect(result.survivorship_biased).toBe(true);
    expect(result.admitted_rejected_ratio).toBe(5.0);
    expect(result.recommendation).toBe("review");
  });

  it("handles zero total_scraped gracefully", () => {
    const result = computeSignalYield({
      total_scraped: 0,
      usable_profiles: 0,
      admitted_count: 0,
      rejected_count: 0,
    });
    expect(result.yield_rate).toBe(0);
    expect(result.meets_threshold).toBe(false);
    expect(result.recommendation).toBe("suspend");
  });

  it("returns null ratio when zero rejected", () => {
    const result = computeSignalYield({
      total_scraped: 50,
      usable_profiles: 10,
      admitted_count: 10,
      rejected_count: 0,
    });
    expect(result.admitted_rejected_ratio).toBeNull();
    expect(result.survivorship_biased).toBe(false);
  });

  it("exports correct threshold constants", () => {
    expect(MIN_SIGNAL_YIELD_RATE).toBe(0.12);
    expect(SURVIVORSHIP_BIAS_THRESHOLD).toBe(1.5);
  });

  it("rounds yield_rate to 4 decimal places", () => {
    const result = computeSignalYield({
      total_scraped: 3,
      usable_profiles: 1,
      admitted_count: 1,
      rejected_count: 0,
    });
    // 1/3 = 0.3333... → 0.3333
    expect(result.yield_rate).toBe(0.3333);
  });
});
