/**
 * tests/lib/format.test.ts
 *
 * Locks the small format helpers. Most of these are deceptively easy
 * to introduce off-by-one bugs in (rounding boundaries, plural at 1
 * vs 0, byte units), so each helper has a few representative cases.
 */

import { describe, expect, it } from "vitest";

import {
  pluralise,
  formatBytes,
  formatRelative,
  formatDateTime,
  initialsFor,
  displayNameFromEmail,
} from "@/lib/utils/format";

describe("pluralise", () => {
  it("uses singular for exactly 1", () => {
    expect(pluralise(1, "essay")).toBe("1 essay");
  });
  it("uses plural for 0 and >1", () => {
    expect(pluralise(0, "essay")).toBe("0 essays");
    expect(pluralise(2, "essay")).toBe("2 essays");
  });
  it("respects an explicit plural form", () => {
    expect(pluralise(3, "child", "children")).toBe("3 children");
    expect(pluralise(1, "child", "children")).toBe("1 child");
  });
});

describe("formatBytes", () => {
  it("returns 0 B for zero", () => {
    expect(formatBytes(0)).toBe("0 B");
  });
  it("scales through KB / MB / GB", () => {
    expect(formatBytes(1024)).toBe("1.0 KB");
    expect(formatBytes(1024 * 1024)).toBe("1.0 MB");
    expect(formatBytes(1024 * 1024 * 1024)).toBe("1.0 GB");
  });
  it("returns em-dash for invalid input", () => {
    expect(formatBytes(-1)).toBe("—");
    expect(formatBytes(Number.NaN)).toBe("—");
  });
});

describe("formatRelative", () => {
  const now = new Date("2026-04-09T13:00:00Z");

  it("renders past minutes", () => {
    const d = new Date("2026-04-09T12:55:00Z");
    expect(formatRelative(d, now)).toBe("5 minutes ago");
  });
  it("renders past hours", () => {
    const d = new Date("2026-04-09T10:00:00Z");
    expect(formatRelative(d, now)).toBe("3 hours ago");
  });
  it("renders future days", () => {
    const d = new Date("2026-04-12T13:00:00Z");
    expect(formatRelative(d, now)).toBe("in 3 days");
  });
  it("renders moments for sub-45-second deltas", () => {
    const d = new Date("2026-04-09T12:59:50Z");
    expect(formatRelative(d, now)).toBe("moments ago");
  });
  it("returns empty string on invalid input", () => {
    expect(formatRelative("not a date", now)).toBe("");
  });
});

describe("formatDateTime", () => {
  it("returns empty string on null/undefined/invalid", () => {
    expect(formatDateTime(null)).toBe("");
    expect(formatDateTime(undefined)).toBe("");
    expect(formatDateTime("nope")).toBe("");
  });
  it("returns a non-empty en-GB formatted string for a real date", () => {
    const out = formatDateTime("2026-04-09T13:42:00Z");
    expect(out.length).toBeGreaterThan(0);
    // We don't assert exact characters because Intl output can vary
    // very slightly across Node versions, but it must contain the
    // year and a time-of-day separator.
    expect(out).toMatch(/2026/);
    expect(out).toMatch(/:/);
  });
});

describe("initialsFor", () => {
  it("returns the first letter of each of the first and last token", () => {
    expect(initialsFor("Vaibhav Lalwani")).toBe("VL");
    expect(initialsFor("ada lovelace")).toBe("AL");
  });
  it("returns a single letter for a single token", () => {
    expect(initialsFor("Alice")).toBe("A");
  });
  it("strips everything after the first @", () => {
    expect(initialsFor("alice@example.com")).toBe("A");
    expect(initialsFor("mary.smith@adropedu.com")).toBe("MS");
  });
  it("handles dots, dashes, and underscores as separators", () => {
    expect(initialsFor("mary-ann.smith")).toBe("MS");
    expect(initialsFor("john_doe")).toBe("JD");
  });
  it("takes the first and the LAST token, not the first two", () => {
    // "Juan Carlos Pérez" → "JP" (skip the middle name)
    expect(initialsFor("Juan Carlos Perez")).toBe("JP");
  });
  it("uppercases the result", () => {
    expect(initialsFor("alice bob")).toBe("AB");
  });
  it("returns ? for null / undefined / empty / whitespace", () => {
    expect(initialsFor(null)).toBe("?");
    expect(initialsFor(undefined)).toBe("?");
    expect(initialsFor("")).toBe("?");
    expect(initialsFor("   ")).toBe("?");
    expect(initialsFor("...___")).toBe("?");
  });
  it("never returns more than two characters", () => {
    const out = initialsFor("Alexander Benjamin Christopher David");
    expect(out.length).toBeLessThanOrEqual(2);
  });
});

describe("displayNameFromEmail", () => {
  it("returns empty string for null / undefined / empty", () => {
    expect(displayNameFromEmail(null)).toBe("");
    expect(displayNameFromEmail(undefined)).toBe("");
    expect(displayNameFromEmail("")).toBe("");
    expect(displayNameFromEmail("   ")).toBe("");
  });

  it("strips the domain after the first @", () => {
    expect(displayNameFromEmail("alice@example.com")).toBe("Alice");
    expect(displayNameFromEmail("alice@a@b.com")).toBe("Alice");
  });

  it("title-cases a single-token local-part", () => {
    expect(displayNameFromEmail("alice@x.com")).toBe("Alice");
    expect(displayNameFromEmail("VAIBHAV@x.com")).toBe("Vaibhav");
    expect(displayNameFromEmail("bOb@x.com")).toBe("Bob");
  });

  it("splits on dots and title-cases each token", () => {
    expect(displayNameFromEmail("vaibhav.lalwani@adrop.com")).toBe(
      "Vaibhav Lalwani"
    );
    expect(displayNameFromEmail("mary.jane.watson@x.com")).toBe(
      "Mary Jane Watson"
    );
  });

  it("splits on underscores too", () => {
    expect(displayNameFromEmail("john_doe@x.com")).toBe("John Doe");
    expect(displayNameFromEmail("a_b_c@x.com")).toBe("A B C");
  });

  it("preserves internal hyphens as hyphenated tokens", () => {
    expect(displayNameFromEmail("mary-ann@x.com")).toBe("Mary-Ann");
    expect(displayNameFromEmail("jean-luc.picard@x.com")).toBe(
      "Jean-Luc Picard"
    );
  });

  it("strips everything from a + plus-address onwards", () => {
    expect(displayNameFromEmail("user+tag@x.com")).toBe("User");
    expect(displayNameFromEmail("alice+newsletter@gmail.com")).toBe("Alice");
  });

  it("collapses multiple consecutive separators", () => {
    expect(displayNameFromEmail("alice...bob@x.com")).toBe("Alice Bob");
    expect(displayNameFromEmail("alice__bob@x.com")).toBe("Alice Bob");
  });

  it("never returns the @domain in the output", () => {
    expect(displayNameFromEmail("alice@example.com")).not.toMatch(/@/);
    expect(displayNameFromEmail("alice@example.com")).not.toMatch(
      /example\.com/
    );
  });
});
