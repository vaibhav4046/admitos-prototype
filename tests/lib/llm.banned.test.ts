/**
 * The banned-model registry is one of the safety primitives Andy
 * called out by name (Thread 4). If this test ever fails, somebody
 * is trying to relax the rule — and that's a conversation that
 * happens with Andy in writing, not in a PR diff.
 */

import { describe, it, expect } from "vitest";

import { assertModelAllowed, BANNED_MODEL_PATTERNS } from "@/lib/llm/banned";

describe("assertModelAllowed", () => {
  it("rejects deepseek by name", () => {
    expect(() => assertModelAllowed("deepseek-chat")).toThrow(/banned_model/);
    expect(() => assertModelAllowed("DeepSeek-V2")).toThrow(/banned_model/);
    expect(() => assertModelAllowed("openrouter/deepseek/deepseek-r1")).toThrow(
      /banned_model/
    );
  });

  it("allows current sanctioned models", () => {
    expect(() => assertModelAllowed("claude-opus-4-6")).not.toThrow();
    expect(() => assertModelAllowed("claude-sonnet-4-6")).not.toThrow();
    expect(() => assertModelAllowed("gpt-4.1")).not.toThrow();
  });

  it("has at least one banned pattern", () => {
    // Defensive: if somebody nukes the registry by mistake we want
    // an obvious red signal in CI.
    expect(BANNED_MODEL_PATTERNS.length).toBeGreaterThan(0);
  });
});
