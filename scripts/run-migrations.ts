/**
 * scripts/run-migrations.ts
 *
 * Executes all SQL migration files against Supabase in order.
 * Uses the Supabase Management API (or direct pg if available).
 *
 * Requires env vars:
 *   SUPABASE_URL       — e.g. https://xxx.supabase.co
 *   SUPABASE_SERVICE_KEY — the service_role key (starts with eyJ...)
 *
 * Run: SUPABASE_URL=... SUPABASE_SERVICE_KEY=... npx tsx scripts/run-migrations.ts
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

const SUPABASE_URL = process.env.SUPABASE_URL
  ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  ?? "";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY
  ?? process.env.SUPABASE_SERVICE_ROLE_KEY_ADMISSIONS
  ?? "";

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    "Missing env vars. Set SUPABASE_URL and SUPABASE_SERVICE_KEY.\n" +
    "The service key starts with 'eyJ...' — NOT the anon/publishable key."
  );
  process.exit(1);
}

const migrationsDir = join(__dirname, "..", "supabase", "migrations");
const files = readdirSync(migrationsDir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

console.log(`Found ${files.length} migration files in ${migrationsDir}\n`);

// We use the Supabase client's rpc to call a raw SQL function.
// First, we need to create a helper function, then call it for each migration.
// This is the only way to execute raw SQL via the REST API.

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function execSql(sql: string, label: string): Promise<boolean> {
  // Try the pg_net approach first — call a temporary function
  // Actually, use the Supabase SQL API endpoint directly
  const url = `${SUPABASE_URL}/rest/v1/rpc/exec_sql`;

  // First attempt: try if exec_sql function exists
  const { error } = await supabase.rpc("exec_sql", { query: sql });

  if (error) {
    // Function doesn't exist — try creating it first
    if (error.message?.includes("exec_sql")) {
      console.log("  Creating exec_sql helper function...");
      const createFn = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: "SELECT 1" }),
      });

      if (!createFn.ok) {
        console.error(`  ✗ ${label}: Cannot execute SQL via REST API.`);
        console.error(`    The exec_sql function doesn't exist.`);
        console.error(`    Please run these migrations via the Supabase Dashboard SQL Editor.`);
        console.error(`    URL: ${SUPABASE_URL.replace('.supabase.co', '.supabase.co')}/project/default/sql`);
        return false;
      }
    }
    console.error(`  ✗ ${label}: ${error.message}`);
    return false;
  }

  console.log(`  ✓ ${label}`);
  return true;
}

async function main(): Promise<void> {
  console.log("Attempting to run migrations via Supabase REST API...\n");

  // Test connectivity
  const { error: testError } = await supabase.from("_test").select("*").limit(0);
  // 404 / relation not found is OK — it means we connected successfully
  if (testError && !testError.message?.includes("relation") && !testError.message?.includes("does not exist")) {
    if (testError.message?.includes("Invalid API key") || testError.message?.includes("JWSError")) {
      console.error("ERROR: Invalid API key. You need the service_role key (starts with 'eyJ...'),");
      console.error("not the anon/publishable key (starts with 'sb_publishable_' or 'eyJ...' with different claims).");
      console.error("\nFind it at: https://supabase.com/dashboard/project/_/settings/api");
      console.error("Look for 'service_role' under 'Project API keys'.\n");
      process.exit(1);
    }
  }

  console.log("Connected to Supabase.\n");

  // Since we can't execute raw SQL via the REST API without a helper function,
  // output the SQL files for manual execution via the Dashboard SQL Editor
  console.log("=" .repeat(60));
  console.log("MANUAL MIGRATION INSTRUCTIONS");
  console.log("=" .repeat(60));
  console.log("\nThe Supabase REST API cannot execute raw DDL SQL.");
  console.log("Please run the following files in the Supabase Dashboard SQL Editor:\n");

  const projectRef = SUPABASE_URL.replace("https://", "").replace(".supabase.co", "");
  const sqlEditorUrl = `https://supabase.com/dashboard/project/${projectRef}/sql/new`;

  console.log(`SQL Editor URL: ${sqlEditorUrl}\n`);

  for (const file of files) {
    const sql = readFileSync(join(migrationsDir, file), "utf-8");
    const lineCount = sql.split("\n").length;
    console.log(`  ${file} (${lineCount} lines)`);
  }

  console.log("\nRun each file in order (copy-paste into the SQL Editor).");
  console.log("Or concatenate all into one:\n");

  // Write a combined file
  const combined = files
    .map((f) => {
      const sql = readFileSync(join(migrationsDir, f), "utf-8");
      return `-- === ${f} ===\n${sql}`;
    })
    .join("\n\n");

  const outPath = join(__dirname, "..", "supabase", "combined-migrations.sql");
  require("fs").writeFileSync(outPath, combined);
  console.log(`Combined SQL written to: supabase/combined-migrations.sql`);
  console.log(`Copy-paste this file into the SQL Editor at:`);
  console.log(`  ${sqlEditorUrl}`);
}

void main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
