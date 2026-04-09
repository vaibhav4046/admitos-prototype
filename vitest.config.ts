/**
 * Vitest config.
 *
 * - Uses the same path aliases as `tsconfig.json` so test imports look
 *   like real app imports (`@/lib/...` rather than `../../../lib/...`).
 * - Runs `tests/setup.ts` once before any test file.
 * - Excludes the `tests/evals/` directory from the unit test run —
 *   evals are a separate `pnpm test:evals` command.
 */

import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    setupFiles: ["./tests/setup.ts"],
    environment: "node",
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    exclude: ["tests/evals/**", "node_modules/**", ".next/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["lib/**/*.ts", "app/**/*.tsx"],
      exclude: ["**/*.test.ts", "**/*.test.tsx"],
    },
  },
  resolve: {
    alias: {
      "@/lib": path.resolve(__dirname, "./lib"),
      "@/app": path.resolve(__dirname, "./app"),
      "@/components": path.resolve(__dirname, "./components"),
      "@/workers": path.resolve(__dirname, "./workers"),
    },
  },
});
