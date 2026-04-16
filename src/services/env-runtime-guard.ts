/**
 * Runtime env guards.
 *
 * Per the build-phase contract in `src/services/env.ts`, server-env
 * values are NOT Zod-validated during `next build` (phase-production-build).
 * Consumers that rely on those values at request time must therefore
 * assert presence themselves and fail closed if a secret is missing.
 *
 * Usage inside a server module (API route, server action, worker):
 *
 *     import "server-only";
 *     import { requireServerEnv } from "@/services/env-runtime-guard";
 *
 *     export async function POST(req: Request) {
 *       const key = requireServerEnv("ANTHROPIC_API_KEY", 20);
 *       if (!key.ok) return key.response;
 *       // …use key.value…
 *     }
 *
 * The returned object is deliberately a tagged union so TypeScript narrows
 * `key.value` to `string` only after the `ok` check. Returning a Response
 * instead of throwing keeps route handlers simple (no try/catch) and
 * consistent with the existing error shape used across the app.
 */

import "server-only";

type GuardResult =
  | { ok: true; value: string }
  | { ok: false; response: Response };

/** Service-unavailable response body mirrors `lib/api/errors.ts`. */
const SERVICE_UNAVAILABLE_BODY = JSON.stringify({
  error: "service_unavailable",
  message:
    "The requested capability is temporarily unavailable. Please retry shortly.",
});

/**
 * Assert that a server env var is present and meets the minimum length
 * requirement. Returns a `GuardResult` — callers should early-return
 * `result.response` on failure and use `result.value` on success.
 *
 * Intentionally does NOT log the key's value (redacted by design).
 */
export function requireServerEnv(name: string, minLength = 1): GuardResult {
  const value = process.env[name];
  if (typeof value === "string" && value.length >= minLength) {
    return { ok: true, value };
  }
  // Keep the log line actionable but never print the value itself.
  console.error(
    `[env-guard] Required server env "${name}" missing or shorter than ${minLength} chars at request time.`
  );
  return {
    ok: false,
    response: new Response(SERVICE_UNAVAILABLE_BODY, {
      status: 503,
      headers: { "content-type": "application/json" },
    }),
  };
}

/**
 * Throwing variant for callsites that are not HTTP handlers (workers,
 * cron jobs, startup bootstrappers). Fails loud rather than returning a
 * Response.
 */
export function mustServerEnv(name: string, minLength = 1): string {
  const value = process.env[name];
  if (typeof value !== "string" || value.length < minLength) {
    throw new Error(
      `Required server env "${name}" missing or shorter than ${minLength} chars.`
    );
  }
  return value;
}
