/**
 * ESLint configuration.
 *
 * The interesting bits — beyond the Next.js + TypeScript defaults —
 * are the custom restricted-syntax rules that enforce Thread 4 invariants
 * at lint time. These are the second line of defence behind the runtime
 * checks in `lib/env.ts` and `lib/llm/banned.ts`.
 */

/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
  },
  plugins: ["@typescript-eslint"],
  rules: {
    // -----------------------------------------------------------------
    // Banned identifiers — Thread 4 hard rules.
    // -----------------------------------------------------------------
    "no-restricted-syntax": [
      "error",
      {
        selector: "Literal[value=/deepseek/i]",
        message:
          "DeepSeek is permanently banned as a model provider on AdmitOS. " +
          "See lib/llm/banned.ts and Thread 4.",
      },
      {
        selector:
          "ImportDeclaration[source.value='@anthropic-ai/sdk'], ImportDeclaration[source.value='openai']",
        message:
          "Don't import provider SDKs directly. Go through `callLLM` from `@/lib/llm`.",
      },
      {
        selector:
          "CallExpression[callee.object.name='posthog'][callee.property.name='capture']",
        message:
          "Use the wrapped `capture()` from `@/lib/observability` so the " +
          "wellbeing event-prefix ban applies.",
      },
    ],

    // -----------------------------------------------------------------
    // Banned imports — keep wellbeing isolation enforceable.
    // -----------------------------------------------------------------
    "no-restricted-imports": [
      "error",
      {
        paths: [
          {
            name: "posthog-js",
            message:
              "Use `@/lib/observability` instead — the wrapper enforces " +
              "the wellbeing event-prefix ban.",
          },
          {
            name: "posthog-node",
            message:
              "Use `@/lib/observability` instead — the wrapper enforces " +
              "the wellbeing event-prefix ban.",
          },
        ],
        patterns: [
          {
            group: ["**/lib/supabase/browser-client*"],
            message:
              "browser-client.ts is client-only. Importing from server " +
              "code leaks the anon key into the server bundle.",
          },
        ],
      },
    ],

    "@typescript-eslint/no-unused-vars": [
      "warn",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],
    "@typescript-eslint/consistent-type-imports": [
      "warn",
      { prefer: "type-imports" },
    ],
  },
  overrides: [
    {
      // Allow the banned-list file itself to mention "deepseek" — it's
      // the registry that *defines* the ban.
      files: ["lib/llm/banned.ts", "lib/env.ts", "tests/**/*.test.ts"],
      rules: { "no-restricted-syntax": "off" },
    },
  ],
  ignorePatterns: [
    "node_modules",
    ".next",
    "supabase/migrations",
    "*.config.mjs",
    "*.config.ts",
  ],
};
