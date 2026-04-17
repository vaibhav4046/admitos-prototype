/**
 * ThemeInit
 *
 * Renders a tiny synchronous script in <head> that sets `data-theme` on
 * <html> BEFORE the first paint. Prevents FOUC (flash of wrong theme)
 * that the V2 preview suffered.
 *
 * Route-aware resolution:
 *   - On the landing page (path === "/" ) the theme is ALWAYS driven by
 *     the OS `prefers-color-scheme` media query. Landing intentionally
 *     has no user-facing theme toggle — it's a marketing surface, not a
 *     preference surface.
 *   - On every other route (dashboard, etc.) the theme is resolved in
 *     this order:
 *       1. localStorage 'unioffer-theme'
 *       2. legacy localStorage 'uo-theme' (migrated once, then cleared)
 *       3. OS prefers-color-scheme
 *       4. "light" as a hard fallback (spec default)
 *
 * The script is wrapped in try/catch because localStorage can throw in
 * Safari private mode, third-party cookie blocks, and some embedded
 * browsers. We still want to paint something if that happens.
 *
 * `suppressHydrationWarning` is set on <html> and <body> because this
 * script mutates the DOM before React hydrates.
 */
export function ThemeInit() {
  // Inlined as a single string so Next can bake it into the HTML and
  // execute it synchronously. Keep it tight — every byte ships ahead of
  // first paint.
  const code = `(function(){try{var path=location.pathname;var isLanding=path==="/"||path==="";var t;if(isLanding){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}else{var K='unioffer-theme',L='uo-theme';t=localStorage.getItem(K);if(!t){var legacy=localStorage.getItem(L);if(legacy){t=legacy;try{localStorage.setItem(K,legacy);localStorage.removeItem(L);}catch(e){}}}if(!t){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}}document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','light');}})();`;
  return (
    <script
      dangerouslySetInnerHTML={{ __html: code }}
      suppressHydrationWarning
    />
  );
}
