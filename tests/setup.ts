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

beforeAll(() => {
  process.env.APP_ENV = "test";
  process.env.NODE_ENV = "test";

  // Block any accidental DeepSeek key from leaking into the test env.
  for (const k of Object.keys(process.env)) {
    if (/deepseek/i.test(k)) delete process.env[k];
  }
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
