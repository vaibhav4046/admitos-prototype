/**
 * Tailwind config for AdmitOS.
 *
 * Goals for M1:
 *   1. Be boring. Use Tailwind's defaults wherever possible so the
 *      design language is one any new contributor already knows.
 *   2. Tighten just the few axes the design needs to feel intentional:
 *      a constrained colour palette anchored on slate (admissions) and
 *      teal (wellbeing), a content-friendly font stack, the standard
 *      shadow scale, and a single subtle motion easing.
 *   3. Make wellbeing visually distinct from admissions WITHOUT having
 *      to maintain a second Tailwind config. The wellbeing palette is
 *      reachable via `bg-wellbeing-*`, `text-wellbeing-*` etc and is
 *      deliberately calmer (warmer teal, lower contrast accents).
 *
 * The `content` glob covers every place a className can appear, except
 * the `tests/` and `scripts/` folders (which never render JSX in the
 * browser). Anything inside the route groups `(admissions)` and
 * `(wellbeing)` is included via the bracketed `app/**` glob — Tailwind
 * 3.4+ handles parens in folder names without quoting.
 */

import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx,mdx}",
    "./components/**/*.{ts,tsx,mdx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Wellbeing palette — referenced from `(wellbeing)` route group
        // only. Importing these classes from `(admissions)` is allowed
        // by Tailwind itself but discouraged by the isolation model;
        // CI cross-surface checks back this up at the import level.
        wellbeing: {
          50: "#ecfeff",
          100: "#cffafe",
          200: "#a5f3fc",
          300: "#67e8f9",
          400: "#22d3ee",
          500: "#0ea5a6",
          600: "#0891a2",
          700: "#0e7490",
          800: "#155e75",
          900: "#164e63",
        },
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      boxShadow: {
        // A softer "card" shadow used by Card / dashboard tiles.
        card: "0 1px 2px 0 rgb(15 23 42 / 0.04), 0 1px 3px 0 rgb(15 23 42 / 0.06)",
        // A slightly stronger lift used on hover for primary CTAs.
        cardHover:
          "0 4px 12px -2px rgb(15 23 42 / 0.08), 0 2px 4px -1px rgb(15 23 42 / 0.04)",
      },
      transitionTimingFunction: {
        // The single house easing — feels calm rather than springy.
        // Used by buttons, cards, the CEF progress bar and the header.
        out: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        // Used by `<Skeleton>` and any first-paint placeholder.
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        // Subtle entrance animation for primary content blocks. Cheap
        // and respectful — single keyframe, single transform.
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        shimmer: "shimmer 1.6s linear infinite",
        "fade-up": "fade-up 0.32s cubic-bezier(0.16, 1, 0.3, 1) both",
      },
    },
  },
  // No plugins. If we add @tailwindcss/forms or /typography later,
  // require an ADR — they expand the bundle and make CSS audits harder.
  plugins: [],
};

export default config;
