/**
 * DB query module for admissions.users and admissions.sessions.
 *
 * Every query goes through the schema-scoped `admissionsDb()` client.
 * This module owns reads/writes for auth-related tables — the service
 * layer (`src/services/auth`) calls these, never the Supabase client
 * directly.
 *
 * Table DDL: supabase/migrations/DRAFTS.md §1
 */

import "server-only";

import { admissionsDb } from "@/db/supabase";

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export interface DbUser {
  id: string;
  email: string;
  display_name: string | null;
  role: "student" | "counsellor" | "admin";
  created_at: string;
  updated_at: string;
}

export async function findUserByEmail(email: string): Promise<DbUser | null> {
  const { data, error } = await admissionsDb()
    .from("users")
    .select("*")
    .eq("email", email.toLowerCase())
    .maybeSingle();

  if (error) throw new Error(`db.auth.findUserByEmail: ${error.message}`);
  return data as DbUser | null;
}

export async function findUserById(id: string): Promise<DbUser | null> {
  const { data, error } = await admissionsDb()
    .from("users")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`db.auth.findUserById: ${error.message}`);
  return data as DbUser | null;
}

export async function insertUser(
  user: Pick<DbUser, "email" | "display_name" | "role">
): Promise<DbUser> {
  const { data, error } = await admissionsDb()
    .from("users")
    .insert({
      email: user.email.toLowerCase(),
      display_name: user.display_name,
      role: user.role,
    })
    .select()
    .single();

  if (error) throw new Error(`db.auth.insertUser: ${error.message}`);
  return data as DbUser;
}

// ---------------------------------------------------------------------------
// Sessions
// ---------------------------------------------------------------------------

export interface DbSession {
  id: string;
  user_id: string;
  csrf_token: string;
  issued_at: string;
  expires_at: string;
  revoked_at: string | null;
  ip_hash: string | null;
  user_agent: string | null;
}

export async function insertSession(
  session: Pick<DbSession, "user_id" | "csrf_token" | "expires_at" | "ip_hash" | "user_agent">
): Promise<DbSession> {
  const { data, error } = await admissionsDb()
    .from("sessions")
    .insert(session)
    .select()
    .single();

  if (error) throw new Error(`db.auth.insertSession: ${error.message}`);
  return data as DbSession;
}

export async function findActiveSession(sessionId: string): Promise<DbSession | null> {
  const { data, error } = await admissionsDb()
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
    .is("revoked_at", null)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (error) throw new Error(`db.auth.findActiveSession: ${error.message}`);
  return data as DbSession | null;
}

export async function revokeSession(sessionId: string): Promise<void> {
  const { error } = await admissionsDb()
    .from("sessions")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", sessionId);

  if (error) throw new Error(`db.auth.revokeSession: ${error.message}`);
}

export async function revokeAllUserSessions(userId: string): Promise<void> {
  const { error } = await admissionsDb()
    .from("sessions")
    .update({ revoked_at: new Date().toISOString() })
    .eq("user_id", userId)
    .is("revoked_at", null);

  if (error) throw new Error(`db.auth.revokeAllUserSessions: ${error.message}`);
}
