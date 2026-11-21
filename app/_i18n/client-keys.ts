/**
 * Client-safe i18n constants.
 *
 * Kept separate from `./server` (which imports `next/headers`) so client
 * components such as SettingsModal can import the cookie name without
 * pulling a server-only module into the browser bundle.
 */

/** Cookie (and localStorage key) holding the user's chosen locale. */
export const LOCALE_COOKIE = "unioffer-lang";
