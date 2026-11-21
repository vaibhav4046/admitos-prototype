/**
 * tests/lib/i18n.test.ts
 *
 * Locks the contract the landing + dashboard rely on: ten locales with
 * EN first, untrusted cookie values never select a missing dictionary,
 * Arabic flips the document to RTL, and untranslated locales fall back
 * to English copy.
 */

import { describe, expect, it } from "vitest";

import {
  DEFAULT_LOCALE,
  LOCALES,
  getCopy,
  getDashboardCopy,
  isLocale,
} from "@/app/_i18n";
import { LOCALE_COOKIE } from "@/app/_i18n/client-keys";

describe("i18n locales", () => {
  it("exposes ten locales with English first", () => {
    expect(LOCALES).toHaveLength(10);
    expect(LOCALES[0].code).toBe(DEFAULT_LOCALE);
  });

  it("uses the spec cookie name", () => {
    expect(LOCALE_COOKIE).toBe("unioffer-lang");
  });

  it("accepts supported codes and rejects everything else", () => {
    expect(isLocale("ar")).toBe(true);
    expect(isLocale("de")).toBe(false);
    expect(isLocale("")).toBe(false);
    expect(isLocale(undefined)).toBe(false);
  });
});

describe("i18n copy", () => {
  it("flips only Arabic to RTL", () => {
    for (const { code } of LOCALES) {
      expect(getCopy(code).dir).toBe(code === "ar" ? "rtl" : "ltr");
    }
  });

  it("keeps each locale's own html lang tag", () => {
    expect(getCopy("zh").htmlLang).toBe("zh-Hans");
    expect(getCopy("zt").htmlLang).toBe("zh-Hant");
  });

  it("falls back to English strings for untranslated locales", () => {
    expect(getCopy("ja").nav).toEqual(getCopy("en").nav);
    expect(getDashboardCopy("ko")).toBe(getDashboardCopy("en"));
  });

  it("keeps the interpolation placeholders callers substitute", () => {
    const { home, settings } = getDashboardCopy("en");
    expect(home.greetingNamed).toContain("{name}");
    expect(settings.comingSoon).toContain("{label}");
  });
});
