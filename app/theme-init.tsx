/**
 * ThemeInit
 *
 * Renders a tiny synchronous script in <head> so the `data-theme`
 * attribute is set on <html> BEFORE the first paint. This prevents
 * FOUC (flash of wrong theme) that the V2 preview suffered when the
 * page shipped light CSS and hydrated the dark toggle afterwards.
 *
 * Order of precedence for the initial theme:
 *   1. localStorage 'uo-theme' if present (user's last explicit choice)
 *   2. prefers-color-scheme: dark at the OS level
 *   3. fallback to 'dark' (Andy's canonical night site is the default)
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
  const code = `(function(){try{var t=localStorage.getItem('uo-theme');if(!t){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'dark';}document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`;
  return <script dangerouslySetInnerHTML={{ __html: code }} suppressHydrationWarning />;
}
