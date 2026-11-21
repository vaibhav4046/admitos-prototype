import { cookies } from "next/headers";

import { LOCALE_COOKIE } from "./client-keys";
import { DEFAULT_LOCALE, isLocale, type Locale } from "./locales";

/**
 * Resolve the active locale from the `unioffer-lang` cookie.
 *
 * Unknown or missing values fall back to English, so a stale or
 * tampered cookie can never select a dictionary that does not exist.
 */
export async function readLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}
