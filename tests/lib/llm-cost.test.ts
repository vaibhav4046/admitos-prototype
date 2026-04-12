/**
 * Cost estimator behavior. The dashboard relies on these numbers, so
 * a regression here would be silent — guard with explicit cases.
 */

import { describe, it, expect } from "vitest";

import { estimateCostUsd, totalCostUsd } from "@/agents/_core/observability/llm-cost";

describe("estimateCostUsd", () => {
  it("computes Sonnet cost for a typical essay-clarity call", () => {
    // 1500 in, 600 out → 1500*3 + 600*15 = 4500 + 9000 = 13_500 / 1M
    // = $0.0135 → round up to $0.02
    expect(estimateCostUsd("claude-sonnet-4-6", 1500, 600)).toBe(0.02);
  });

  it("computes Opus cost for a DNA generation call", () => {
    // 4000 in, 1500 out → 4000*15 + 1500*75 = 60_000 + 112_500 = 172_500 / 1M
    // = $0.1725 → round up to $0.18
    expect(estimateCostUsd("claude-opus-4-6", 4000, 1500)).toBe(0.18);
  });

  it("falls back to the most expensive tier for unknown models", () => {
    const fallback = estimateCostUsd("future-model-9000", 1000, 500);
    const opus = estimateCostUsd("claude-opus-4-6", 1000, 500);
    expect(fallback).toBe(opus);
  });

  it("rounds up to the nearest cent", () => {
    // Tiny call that resolves to a fraction of a cent.
    const r = estimateCostUsd("claude-haiku-4-5-20251001", 1, 1);
    expect(r).toBe(0.01);
  });
});

describe("totalCostUsd", () => {
  it("sums a batch and rounds up the total", () => {
    const total = totalCostUsd([
      { model: "claude-sonnet-4-6", inputTokens: 1500, outputTokens: 600 },
      { model: "claude-sonnet-4-6", inputTokens: 1500, outputTokens: 600 },
    ]);
    expect(total).toBe(0.04);
  });

  it("returns 0 for an empty batch", () => {
    expect(totalCostUsd([])).toBe(0);
  });
});
