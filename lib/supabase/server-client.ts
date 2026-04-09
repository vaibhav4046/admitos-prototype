/**
 * Server Supabase client — used in React Server Components and Route Handlers
 * to read on behalf of the signed-in user (RLS-enforced). Unlike the service
 * clients, this one carries the user's cookies, so row-level security applies.
 *
 * Like the browser client, this is scoped to the admissions schema by default.
 * If you need to read the wellbeing schema, you must be inside a wellbeing
 * route handler AND you must use the wellbeing service client, not this one.
 */

import "server-only";

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

import { env } from "@/lib/env";

export function createServerSupabaseClient() {
  const cookieStore = cookies();

  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Server Components can't mutate cookies — safe to ignore.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // Same reason as above.
          }
        },
      },
      db: { schema: "admissions" },
    }
  );
}
