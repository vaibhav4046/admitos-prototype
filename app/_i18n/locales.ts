/**
 * Supported locales — UNIOFFER-SPEC-01 v2.2 §Language switcher.
 *
 * Ten entries, EN first. Codes match `LangSwitcher`'s `LANGS` table;
 * `label` is the native-script name shown in the settings `<select>`.
 */

export const LOCALES = [
  { code: "en", label: "English", htmlLang: "en", dir: "ltr" },
  { code: "zh", label: "简体中文", htmlLang: "zh-Hans", dir: "ltr" },
  { code: "zt", label: "繁體中文", htmlLang: "zh-Hant", dir: "ltr" },
  { code: "ko", label: "한국어", htmlLang: "ko", dir: "ltr" },
  { code: "ar", label: "العربية", htmlLang: "ar", dir: "rtl" },
  { code: "vi", label: "Tiếng Việt", htmlLang: "vi", dir: "ltr" },
  { code: "ms", label: "Bahasa Melayu", htmlLang: "ms", dir: "ltr" },
  { code: "th", label: "ภาษาไทย", htmlLang: "th", dir: "ltr" },
  { code: "hi", label: "हिन्दी", htmlLang: "hi", dir: "ltr" },
  { code: "ja", label: "日本語", htmlLang: "ja", dir: "ltr" },
] as const;

export type Locale = (typeof LOCALES)[number]["code"];

export const DEFAULT_LOCALE: Locale = "en";

const LOCALE_CODES: ReadonlySet<string> = new Set(LOCALES.map((l) => l.code));

/** Narrow an untrusted string (cookie, query) to a supported `Locale`. */
export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && LOCALE_CODES.has(value);
}
