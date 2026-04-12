/**
 * PostCSS config for AdmitOS.
 *
 * Two plugins, in order:
 *   1. tailwindcss — expands `@tailwind base/components/utilities` and
 *      generates the per-file utility classes the components reference.
 *   2. autoprefixer — adds vendor prefixes for the browsers in our
 *      `browserslist`. Next.js sets a sensible default browserslist if
 *      we don't override it; we are NOT overriding it for M1 because
 *      our target is "evergreen Chromium + Safari + Firefox" which is
 *      already what the Next default covers.
 *
 * This file is intentionally CJS (`.cjs`) rather than ESM. Next.js
 * supports both, but PostCSS plugin discovery is a smaller surface
 * area in CJS and avoids edge cases with `type: "module"` projects.
 */

module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
