/**
 * Prompt renderer behavior. The renderer is the seam between the DB-
 * stored prompt template and the actual model call, so the rules it
 * enforces matter for safety:
 *
 *   - Missing variables MUST throw, never silently render `{{name}}`
 *   - Whitespace inside `{{ var }}` is allowed
 *   - Identifiers are alphanumeric + underscore
 *   - The renderer does NOT do any escaping (templates are trusted)
 */

import { describe, it, expect } from "vitest";

import { renderPrompt } from "@/agents/_core/prompts/renderer";
import type { PromptVersion } from "@/agents/_core/prompts/types";

function makePrompt(
  system: string,
  user: string,
  config: Record<string, unknown> = {}
): PromptVersion {
  return {
    id: "p_test",
    slot: "a5.essay_clarity" as PromptVersion["slot"],
    version: 1,
    status: "active",
    system,
    user_template: user,
    config,
    model: "claude-sonnet-4-6",
    created_at: "2026-04-09T00:00:00Z",
    created_by: "test",
  };
}

describe("renderPrompt", () => {
  it("substitutes variables in both system and user", () => {
    const out = renderPrompt(
      makePrompt("You are a {{role}} coach.", "Read this:\n\n{{essay}}"),
      { role: "clarity", essay: "hello world" }
    );
    expect(out.system).toBe("You are a clarity coach.");
    expect(out.user).toBe("Read this:\n\nhello world");
  });

  it("throws on missing variable", () => {
    expect(() =>
      renderPrompt(makePrompt("Hi {{name}}", "x"), {})
    ).toThrow(/prompt_render_missing_var/);
  });

  it("treats null and undefined as missing", () => {
    expect(() =>
      renderPrompt(makePrompt("Hi {{name}}", "x"), { name: null })
    ).toThrow(/prompt_render_missing_var/);
    expect(() =>
      renderPrompt(makePrompt("Hi {{name}}", "x"), { name: undefined })
    ).toThrow(/prompt_render_missing_var/);
  });

  it("allows whitespace inside curly braces", () => {
    const out = renderPrompt(
      makePrompt("Hi {{ name }}!", "x"),
      { name: "Vaibhav" }
    );
    expect(out.system).toBe("Hi Vaibhav!");
  });

  it("coerces non-string values via String()", () => {
    const out = renderPrompt(
      makePrompt("count={{n}}", "x"),
      { n: 42 }
    );
    expect(out.system).toBe("count=42");
  });

  it("echoes prompt metadata back to the caller", () => {
    const out = renderPrompt(makePrompt("a", "b"), {});
    expect(out.promptId).toBe("p_test");
    expect(out.promptSlot).toBe("a5.essay_clarity");
    expect(out.promptVersion).toBe(1);
    expect(out.model).toBe("claude-sonnet-4-6");
  });
});
