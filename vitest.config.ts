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
      "@/workers": path.resolve(__dirname, "./src/workers"),
      // /src/* hexagonal layout — must mirror the tsconfig.json paths
      // exactly. Added by Delta 2 PR 1; PR 2 onward populates each
      // subtree as files move out of lib/ into src/.
      "@/api": path.resolve(__dirname, "./src/api"),
      "@/services": path.resolve(__dirname, "./src/services"),
      "@/agents": path.resolve(__dirname, "./src/agents"),
      "@/db": path.resolve(__dirname, "./src/db"),
      // `server-only` is a tiny Next-provided module whose only job is
      // to blow up the build if something imports it from a client
      // bundle. Vitest's node resolver doesn't know about it, so we
      // stub it out with an empty module. The runtime guarantee
      // (server-side only) isn't relevant during unit tests.
      "server-only": path.resolve(__dirname, "./tests/stubs/server-only.ts"),
    },
  },
});
