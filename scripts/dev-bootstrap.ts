/**
 * scripts/dev-bootstrap.ts
 *
 * "Does my dev environment work?" check. Run with:
 *
 *   pnpm tsx scripts/dev-bootstrap.ts
 *
 * The script doesn't *fix* anything — it just verifies and reports.
 * If a check fails it prints a one-line remediation hint and exits
 * non-zero so you can chain it in a Makefile or pre-commit hook.
 *
 * Checks:
 *
 *   1. Required env vars are present (delegates to lib/env.ts)
 *   2. No banned env vars (DeepSeek) are present
 *   3. Redis is reachable on REDIS_URL
 *   4. Supabase REST is reachable on NEXT_PUBLIC_SUPABASE_URL
 *
 * The script uses `console.log` only — no Sentry, no LangSmith. It is
 * the "is the room on fire" smoke test, not an instrumented call.
 */

/* eslint-disable no-console */

import Redis from "ioredis";

interface CheckResult {
  name: string;
  ok: boolean;
  detail: string;
  remediation?: string;
}

async function checkEnv(): Promise<CheckResult> {
  try {
    // Importing the env module triggers the Zod validation. Any
    // missing or malformed var will throw here.
    await import("../src/services/env");
    return { name: "env", ok: true, detail: "all required vars present" };
  } catch (err) {
    return {
      name: "env",
      ok: false,
      detail: err instanceof Error ? err.message : String(err),
      remediation: "Copy .env.example to .env.local and fill in the values.",
    };
  }
}

async function checkBannedVars(): Promise<CheckResult> {
  const offenders = Object.keys(process.env).filter((k) => /deepseek/i.test(k));
  if (offenders.length > 0) {
    return {
      name: "banned-vars",
      ok: false,
      detail: `found banned env vars: ${offenders.join(", ")}`,
      remediation: "Remove DeepSeek-related env vars. Provider is permanently banned.",
    };
  }
  return { name: "banned-vars", ok: true, detail: "none" };
}

async function checkRedis(): Promise<CheckResult> {
  const url = process.env.REDIS_URL;
  if (!url) {
    return {
      name: "redis",
      ok: false,
      detail: "REDIS_URL not set",
      remediation: "Set REDIS_URL in .env.local (e.g. redis://localhost:6379).",
    };
  }
  const r = new Redis(url, {
    maxRetriesPerRequest: 1,
    enableReadyCheck: true,
    lazyConnect: true,
  });
  try {
    await r.connect();
    const pong = await r.ping();
    await r.quit();
    return { name: "redis", ok: pong === "PONG", detail: `ping → ${pong}` };
  } catch (err) {
    return {
      name: "redis",
      ok: false,
      detail: err instanceof Error ? err.message : String(err),
      remediation: "Make sure Redis is running locally (e.g. `redis-server` or `docker run -p 6379:6379 redis:7`).",
    };
  }
}

async function checkSupabase(): Promise<CheckResult> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    return {
      name: "supabase",
      ok: false,
      detail: "NEXT_PUBLIC_SUPABASE_URL not set",
      remediation: "Run `pnpm db:reset` (which starts the local emulator) and copy the URL into .env.local.",
    };
  }
  try {
    const res = await fetch(`${url}/auth/v1/health`, {
      headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "" },
    });
    return {
      name: "supabase",
      ok: res.ok,
      detail: `GET /auth/v1/health → ${res.status}`,
    };
  } catch (err) {
    return {
      name: "supabase",
      ok: false,
      detail: err instanceof Error ? err.message : String(err),
      remediation: "Start the local emulator with `pnpm db:reset`.",
    };
  }
}

async function main(): Promise<void> {
  const checks: CheckResult[] = [];
  checks.push(await checkEnv());
  checks.push(await checkBannedVars());
  checks.push(await checkRedis());
  checks.push(await checkSupabase());

  const colW = Math.max(...checks.map((c) => c.name.length));
  let allOk = true;
  for (const c of checks) {
    const tag = c.ok ? "✅" : "❌";
    console.log(`${tag} ${c.name.padEnd(colW)}  ${c.detail}`);
    if (!c.ok && c.remediation) {
      console.log(`   ↳ ${c.remediation}`);
      allOk = false;
    }
  }
  process.exit(allOk ? 0 : 1);
}

void main().catch((err) => {
  console.error("[dev-bootstrap] fatal:", err);
  process.exit(1);
});
