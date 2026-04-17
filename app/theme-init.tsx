/**
 * ThemeInit
 *
 * Renders a tiny synchronous script in <head> so the `data-theme`
 * attribute is set on <html> BEFORE the first paint. This prevents
 * FOUC (flash of wrong theme) that the V2 preview suffered when the
 * page shipped light CSS and hydrated the dark toggle afterwards.
 *
 * Order of precedence for the initial theme:
 *   1. localStorage 'unioffer-theme' (canonical key per UNIOFFER-SPEC-01)
 *   2. legacy localStorage 'uo-theme' (auto-migrated once, then cleared)
 *   3. prefers-color-scheme: dark at the OS level
 *   4. fallback to 'light' (UniOffer default per spec)
 *
 * The script is wrapped in try/catch because localStorage can throw in
 * Safari private mode, third-party cookie blocks, and some embedded
 * browsers. We still want to paint something if that happens.
 *
 * Used as the first child of <head> in app/layout.tsx.
 * <html> and <body> must carry suppressHydrationWarning because this
 * script mutates the DOM before React hydrates.
 */
export function ThemeInit() {
  // Spec key: `unioffer-theme`. Legacy key `uo-theme` is read once and
  // migrated on first load — downstream code only ever writes the spec
  // key. The migration is idempotent: if both keys exist, spec wins.
  const code = `(function(){try{var K='unioffer-theme',L='uo-theme';var t=localStorage.getItem(K);if(!t){var legacy=localStorage.getItem(L);if(legacy){t=legacy;try{localStorage.setItem(K,legacy);localStorage.removeItem(L);}catch(e){}}}if(!t){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','light');}})();`;
  return <script dangerouslySetInnerHTML={{ __html: code }} suppressHydrationWarning />;
}
