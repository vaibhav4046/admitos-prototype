/**
 * i18n entry point.
 *
 * Only English is translated today (spec v2.2: EN live, the other nine
 * locales listed but not yet translated). Each locale keeps its own
 * `htmlLang` / `dir` (Arabic correctly flips the document to RTL) and
 * resolves its strings through `DICTIONARIES`. Adding a translation
 * means writing one `Dictionary` and registering it there; no call
 * site changes.
 */

import { en } from "./en";
import { LOCALES, type Locale } from "./locales";
import type { DashboardCopy, Dictionary, LandingCopy } from "./types";

export { LOCALES, DEFAULT_LOCALE, isLocale, type Locale } from "./locales";
export type { DashboardCopy, LandingCopy, NavCopy } from "./types";

/** Locales with a real translation; anything absent falls back to `en`. */
const DICTIONARIES: Partial<Record<Locale, Dictionary>> = {
  en,
};

function dictionaryFor(locale: Locale): Dictionary {
  return DICTIONARIES[locale] ?? en;
}

/** Marketing-site copy (`<html>` attributes + nav) for a locale. */
export function getCopy(locale: Locale): LandingCopy {
  const meta = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];
  return {
    htmlLang: meta.htmlLang,
    dir: meta.dir,
    ...dictionaryFor(locale).landing,
  };
}

/** Dashboard copy for a locale. */
export function getDashboardCopy(locale: Locale): DashboardCopy {
  return dictionaryFor(locale).dashboard;
}
