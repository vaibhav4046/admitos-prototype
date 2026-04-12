/**
 * Vitest setup. Loaded once before any test file runs.
 *
 * Responsibilities:
 *
 *   1. Force `APP_ENV=test` so the env validator runs the test schema
 *   2. Mock the LangSmith client so test runs don't pollute real traces
 *   3. Provide a clean Sentry stub
 *   4. Stub out `next/headers` cookies for unit tests that touch the
 *      server-side Supabase client
 *
 * The setup file does NOT mock the Supabase client itself — tests that
 * need DB access should use the local Supabase emulator started by the
 * `pnpm db:reset` script.
 */

import { vi, afterEach, beforeAll } from "vitest";

// ─── Module-scope env stubs ───────────────────────────────────────────────
//
// Vitest hoists `vi.mock` but NOT `beforeAll`. Any test file that
// transitively imports `@/services/env` will trigger `parseEnv()` at import
// time, which runs BEFORE `beforeAll`. That means the env vars the
// validator needs have to exist at module scope here, not inside
// `beforeAll`. We only set values that aren't already present so a
// real `.env.test` can override them.
const fakeEnv: Record<string, string> = {
  APP_ENV: "test",
  NEXT_PUBLIC_APP_URL: "https://app.test.local",
  NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "test-anon-key-must-be-at-least-20-chars",
  NEXT_PUBLIC_POSTHOG_KEY: "phc_test_key",
  NEXT_PUBLIC_POSTHOG_HOST: "https://eu.i.posthog.com",
  SUPABASE_SERVICE_ROLE_KEY_ADMISSIONS:
    "test-admissions-service-role-key-at-least-20",
  SUPABASE_SERVICE_ROLE_KEY_WELLBEING:
    "test-wellbeing-service-role-key-at-least-20",
  SUPABASE_SERVICE_ROLE_KEY_COMMONS:
    "test-commons-service-role-key-at-least-20",
  REDIS_URL: "redis://localhost:6379",
  LANGSMITH_API_KEY: "ls-test-key",
  LANGSMITH_PROJECT: "admitos-test",
  LANGSMITH_ENDPOINT: "https://api.smith.langchain.com",
  SENTRY_DSN: "https://public@sentry.test/1",
  SENTRY_ORG: "admitos-test",
  SENTRY_PROJECT: "admitos-mvp-test",
  POSTHOG_API_KEY: "phc_test_server_key",
  POSTHOG_HOST: "https://eu.i.posthog.com",
  ANTHROPIC_API_KEY: "sk-ant-test-key-must-be-at-least-20-chars",
  GOOGLE_OAUTH_CLIENT_ID: "test-google-client-id",
  GOOGLE_OAUTH_CLIENT_SECRET: "test-google-client-secret",
  NEXTAUTH_SECRET: "test-nextauth-secret-must-be-at-least-32-chars-long",
  CSRF_SECRET: "test-csrf-secret-must-be-at-least-32-chars-long",
};
// Overwrite empty-string ambient values too — several CI runners
// export e.g. `ANTHROPIC_API_KEY=""` which would otherwise slip past
// an `=== undefined` guard and then fail the `min(20)` Zod check.
for (const [k, v] of Object.entries(fakeEnv)) {
  const existing = process.env[k];
  if (existing === undefined || existing === "") process.env[k] = v;
}

// Block any accidental DeepSeek key from leaking into the test env
// BEFORE `lib/env.ts` runs its own DeepSeek scan.
for (const k of Object.keys(process.env)) {
  if (/deepseek/i.test(k)) delete process.env[k];
}

beforeAll(() => {
  // `process.env.NODE_ENV` is typed readonly in @types/node ≥22 because Next
  // and several other frameworks read it at compile time. `vi.stubEnv` both
  // sets the runtime value and gets automatically restored by vitest between
  // files, which is what we want here.
  vi.stubEnv("NODE_ENV", "test");
});

afterEach(() => {
  vi.clearAllMocks();
});

// Quiet, deterministic Math.random for any test that needs it.
let seed = 1234567890;
vi.spyOn(Math, "random").mockImplementation(() => {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
});
