/**
 * Environment variable schema — validated at boot.
 *
 * Every env var the app uses is declared here with a Zod type. If anything is
 * missing or malformed, the process dies immediately rather than blowing up
 * halfway through a request. Import `env` everywhere — never touch
 * `process.env` directly.
 *
 * The file is split into `serverEnv` and `clientEnv` so that server-only
 * secrets never leak into the client bundle (Next.js will fail the build if
 * a server-only var is referenced in a client component).
 *
 * ### Location
 *
 * This file lives at `src/services/env.ts` per the `/src/*` hexagonal
 * layout (Andy's Full Project Kickoff Brief, 2026-04-09; see
 * `docs/scaffold-deltas/02-src-restructure.md`). It used to live at
 * `lib/env.ts`. Anything that needs env should
 * `import { env } from "@/services/env"` — the old `@/lib/env` alias
 * is gone.
 */

import { z } from "zod";

// ─── Shared validators ────────────────────────────────────────────────────────

const httpsUrl = z
  .string()
  .url()
  .refine((v) => v.startsWith("https://"), { message: "must be https://" });

const redisUrl = z
  .string()
  .url()
  .refine((v) => v.startsWith("redis://") || v.startsWith("rediss://"), {
    message: "must be redis:// or rediss:// (TLS)",
  });

// ─── Client-safe env (anything prefixed NEXT_PUBLIC_) ────────────────────────

const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_URL: httpsUrl,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().min(10),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().url(),
});

// The "shape" is duplicated as an object so we can construct a literal at
// runtime in client components without referring to process.env at all.
const clientValues = {
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
  NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
};

// ─── Server-only env ─────────────────────────────────────────────────────────

const serverSchema = z.object({
  // `test` is a valid APP_ENV because `lib/log` gates its level
  // threshold on `APP_ENV === "test"` and the vitest setup file
  // injects it. Leaving it out of the enum causes `parseEnv()` to
  // throw during test runs as soon as a server-only module is
  // imported transitively.
  APP_ENV: z.enum(["development", "test", "staging", "production"]),

  // Supabase — three distinct service roles (see middleware.ts / lib/supabase)
  SUPABASE_SERVICE_ROLE_KEY_ADMISSIONS: z.string().min(20),
  SUPABASE_SERVICE_ROLE_KEY_WELLBEING: z.string().min(20),
  SUPABASE_SERVICE_ROLE_KEY_COMMONS: z.string().min(20),

  // Redis / BullMQ
  REDIS_URL: redisUrl,
  UPSTASH_REDIS_REST_URL: httpsUrl.optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // Observability
  LANGSMITH_API_KEY: z.string().min(10),
  LANGSMITH_PROJECT: z.string().default("admitos-mvp"),
  LANGSMITH_ENDPOINT: httpsUrl.default("https://api.smith.langchain.com"),

  SENTRY_DSN: z.string().url(),
  SENTRY_ORG: z.string(),
  SENTRY_PROJECT: z.string(),
  SENTRY_AUTH_TOKEN: z.string().optional(),

  POSTHOG_API_KEY: z.string().min(10),
  POSTHOG_HOST: z.string().url(),

  // Model providers — DeepSeek is permanently banned
  ANTHROPIC_API_KEY: z.string().min(20),

  // Auth
  GOOGLE_OAUTH_CLIENT_ID: z.string().min(10),
  GOOGLE_OAUTH_CLIENT_SECRET: z.string().min(10),
  NEXTAUTH_SECRET: z.string().min(32),

  // CSRF — HMAC secret for the signed double-submit token (src/services/security/csrf.ts).
  // Must be ≥32 chars; rotate by setting both CSRF_SECRET and CSRF_SECRET_PREVIOUS
  // and grace-accepting both for one TTL window. (Rotation logic is post-MVP.)
  CSRF_SECRET: z.string().min(32),
});

const serverValues = {
  APP_ENV: process.env.APP_ENV,
  SUPABASE_SERVICE_ROLE_KEY_ADMISSIONS:
    process.env.SUPABASE_SERVICE_ROLE_KEY_ADMISSIONS,
  SUPABASE_SERVICE_ROLE_KEY_WELLBEING:
    process.env.SUPABASE_SERVICE_ROLE_KEY_WELLBEING,
  SUPABASE_SERVICE_ROLE_KEY_COMMONS:
    process.env.SUPABASE_SERVICE_ROLE_KEY_COMMONS,
  REDIS_URL: process.env.REDIS_URL,
  UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
  UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
  LANGSMITH_API_KEY: process.env.LANGSMITH_API_KEY,
  LANGSMITH_PROJECT: process.env.LANGSMITH_PROJECT,
  LANGSMITH_ENDPOINT: process.env.LANGSMITH_ENDPOINT,
  SENTRY_DSN: process.env.SENTRY_DSN,
  SENTRY_ORG: process.env.SENTRY_ORG,
  SENTRY_PROJECT: process.env.SENTRY_PROJECT,
  SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
  POSTHOG_API_KEY: process.env.POSTHOG_API_KEY,
  POSTHOG_HOST: process.env.POSTHOG_HOST,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  GOOGLE_OAUTH_CLIENT_ID: process.env.GOOGLE_OAUTH_CLIENT_ID,
  GOOGLE_OAUTH_CLIENT_SECRET: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  CSRF_SECRET: process.env.CSRF_SECRET,
};

// ─── Parse once, at import time ──────────────────────────────────────────────

const isServer = typeof window === "undefined";

function parseEnv() {
  const clientParsed = clientSchema.safeParse(clientValues);
  if (!clientParsed.success) {
    console.error(
      "❌ Invalid client environment variables:",
      clientParsed.error.flatten().fieldErrors
    );
    throw new Error("Invalid client environment variables");
  }

  if (!isServer) {
    // Client bundle — only expose client-safe env
    return { ...clientParsed.data } as const;
  }

  const serverParsed = serverSchema.safeParse(serverValues);
  if (!serverParsed.success) {
    console.error(
      "❌ Invalid server environment variables:",
      serverParsed.error.flatten().fieldErrors
    );
    throw new Error("Invalid server environment variables");
  }

  // Cheap safety net — refuse to boot if anyone snuck a DeepSeek key into .env
  for (const k of Object.keys(process.env)) {
    if (/deepseek/i.test(k)) {
      throw new Error(
        `DeepSeek is permanently banned as a model provider — found env var "${k}". Remove it and try again.`
      );
    }
  }

  return { ...clientParsed.data, ...serverParsed.data } as const;
}

// Declared return type is the full client+server intersection. On the client,
// server-only fields are undefined at runtime, but accessing them is guarded by
// `import "server-only"` at the top of every server module that reads them —
// a client import of any of those modules fails the Next.js build. The cast
// keeps downstream call-sites cleanly typed without forcing every caller to
// narrow a discriminated union.
type ClientEnv = z.infer<typeof clientSchema>;
type ServerEnv = z.infer<typeof serverSchema>;
export type Env = Readonly<ClientEnv & ServerEnv>;

export const env = parseEnv() as Env;
