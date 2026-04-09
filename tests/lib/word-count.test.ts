import { describe, expect, it } from "vitest";

import { wordCount, trimmedCharCount } from "@/lib/utils/word-count";

describe("wordCount", () => {
  it.each([
    ["", 0],
    ["   ", 0],
    ["hello", 1],
    ["hello world", 2],
    ["  hello   world  ", 2],
    ["one\ntwo\nthree", 3],
    ["isn't a word", 3], // contractions count as one
    ["a-b c-d", 2], // hyphens don't split
    ["foo,bar baz", 2], // punctuation runs without space don't split
  ])("%j → %i", (input, expected) => {
    expect(wordCount(input)).toBe(expected);
  });
});

describe("trimmedCharCount", () => {
  it("ignores trailing whitespace", () => {
    expect(trimmedCharCount("hello   ")).toBe(5);
    expect(trimmedCharCount("   hello")).toBe(8); // leading whitespace stays
    expect(trimmedCharCount("")).toBe(0);
  });
});
