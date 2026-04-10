/**
 * Browser Supabase client — used in React Client Components for RLS-protected
 * reads/writes on behalf of the signed-in user. Uses the anon key only.
 *
 * This client NEVER has access to the wellbeing schema directly; even if
 * a user's JWT had a wellbeing role claim, the server-side middleware would
 * block the request. Treat this client as "read what the user can see via
 * the admissions schema + commons_db only".
 */

"use client";

import { createBrowserClient } from "@supabase/ssr";

import { env } from "@/services/env";

export function createBrowserSupabaseClient() {
  return createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      db: { schema: "admissions" },
    }
  );
}
