/**
 * tests/lib/cn.test.ts
 *
 * `cn` is the tiny class-combiner used by every UI primitive. The
 * cost of getting it wrong is global, so we lock the contract here.
 */

import { describe, expect, it } from "vitest";

import { cn } from "@/lib/ui/cn";

describe("cn", () => {
  it("joins truthy strings with a single space", () => {
    expect(cn("a", "b", "c")).toBe("a b c");
  });

  it("drops falsy values", () => {
    expect(cn("a", false, null, undefined, "b")).toBe("a b");
  });

  it("returns empty string when everything is falsy", () => {
    expect(cn(false, null, undefined)).toBe("");
  });

  it("supports conditional patterns at the call site", () => {
    const isOpen = true;
    const hasError = false;
    expect(cn("base", isOpen && "open", hasError && "error")).toBe("base open");
  });

  it("does not deduplicate or trim — that's intentional", () => {
    // We want this to be O(n) and predictable. If callers want to
    // dedupe, they can. cn just concatenates.
    expect(cn("a", "a")).toBe("a a");
  });
});
