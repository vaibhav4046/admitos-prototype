/**
 * Server-only Supabase clients — one per schema, each with its own
 * service-role credentials. Importing this file from a client component
 * will (correctly) fail the build.
 *
 * Q3 default (single Supabase project + per-schema service roles + middleware
 * guard). If Andy decides on two physically separate Supabase projects, this
 * file is the ONLY place that needs to change — just point the wellbeing
 * client at a different `NEXT_PUBLIC_SUPABASE_URL_WELLBEING` and its own key.
 *
 * Every client returned here is scoped to a single schema via the
 * `db.schema` option. Code in an admissions handler that tries to query
 * the wellbeing schema through the admissions client will get a Postgres
 * permission error, not a partial result.
 */

import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { env } from "@/services/env";
import type { SchemaNamespace } from "./types";

// Re-use one client per namespace across the process. The Supabase client
// is thread-safe and holds no per-request state, so a module-level singleton
// is both safe and measurably cheaper than building a new one per request.
const cache = new Map<SchemaNamespace, SupabaseClient>();

function build(namespace: SchemaNamespace): SupabaseClient {
  const url = env.NEXT_PUBLIC_SUPABASE_URL;

  const key =
    namespace === "admissions"
      ? env.SUPABASE_SERVICE_ROLE_KEY_ADMISSIONS
      : namespace === "wellbeing"
        ? env.SUPABASE_SERVICE_ROLE_KEY_WELLBEING
        : env.SUPABASE_SERVICE_ROLE_KEY_COMMONS;

  // The cast widens the per-schema client back to the shared `SupabaseClient`
  // signature declared in the function return type. `createClient` narrows
  // the returned client's schema generic to the literal namespace string
  // (`"admissions"` / `"wellbeing"` / `"commons_db"`), and the default
  // `SupabaseClient` generic is parameterised against `"public"`, so without
  // the cast every caller would have to know the specific namespace at
  // compile time — which defeats the point of the cache map.
  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    db: { schema: namespace },
    global: {
      headers: {
        "X-UniOffer-Schema": namespace,
      },
    },
  }) as unknown as SupabaseClient;
}

/**
 * Get the service-role Supabase client for a given schema.
 *
 * Call this from an API route only after the middleware isolation guard
 * has confirmed the caller is allowed to access that schema.
 */
export function serviceClient(namespace: SchemaNamespace): SupabaseClient {
  let client = cache.get(namespace);
  if (!client) {
    client = build(namespace);
    cache.set(namespace, client);
  }
  return client;
}

/** Convenience accessors — these are what 99% of the codebase should use. */
export const admissionsDb = () => serviceClient("admissions");
export const wellbeingDb = () => serviceClient("wellbeing");
export const commonsDb = () => serviceClient("commons_db");
