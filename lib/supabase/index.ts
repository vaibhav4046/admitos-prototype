/**
 * Public surface of the Supabase client module.
 *
 * - Client components → `createBrowserSupabaseClient` (lives in browser-client)
 * - Server components / Route handlers → `createServerSupabaseClient` + `serviceClient`
 * - Workers / cron jobs → `admissionsDb`, `wellbeingDb`, `commonsDb`
 *
 * This file deliberately does NOT re-export the browser client to avoid
 * pulling browser-only code into server bundles. Import it from
 * `@/lib/supabase/browser-client` directly.
 */

export { serviceClient, admissionsDb, wellbeingDb, commonsDb } from "./service-clients";
export { createServerSupabaseClient } from "./server-client";
export { SCHEMA_NAMESPACES, ROUTE_GROUP_ALLOWED_SCHEMAS } from "./types";
export type { SchemaNamespace } from "./types";
