/**
 * DB query module for admissions.cef_draft and admissions.cef_version.
 *
 * The CEF (Common Enrolment Form) wizard has two tables:
 *   - `cef_draft`: per-step autosaved payloads (profile, academics, ecs, essays, schools, review)
 *   - `cef_version`: immutable snapshots created when the student submits
 *
 * Table DDL: supabase/migrations/DRAFTS.md §5
 */

import "server-only";

import { admissionsDb } from "@/db/supabase";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CefStep = "profile" | "academics" | "ecs" | "essays" | "schools" | "review";

export interface DbCefDraft {
  id: string;
  user_id: string;
  version: number;
  step: CefStep;
  payload: Record<string, unknown>;
  autosaved_at: string;
  created_at: string;
}

export interface DbCefVersion {
  id: string;
  user_id: string;
  version: number;
  submitted_at: string | null;
  payload_hash: string;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Drafts
// ---------------------------------------------------------------------------

export async function upsertDraft(
  draft: Pick<DbCefDraft, "user_id" | "version" | "step" | "payload">
): Promise<DbCefDraft> {
  const { data, error } = await admissionsDb()
    .from("cef_draft")
    .upsert(
      {
        user_id: draft.user_id,
        version: draft.version,
        step: draft.step,
        payload: draft.payload,
        autosaved_at: new Date().toISOString(),
      },
      { onConflict: "user_id,version,step" }
    )
    .select()
    .single();

  if (error) throw new Error(`db.cef.upsertDraft: ${error.message}`);
  return data as DbCefDraft;
}

export async function findDrafts(
  userId: string,
  version: number
): Promise<DbCefDraft[]> {
  const { data, error } = await admissionsDb()
    .from("cef_draft")
    .select("*")
    .eq("user_id", userId)
    .eq("version", version)
    .order("step");

  if (error) throw new Error(`db.cef.findDrafts: ${error.message}`);
  return (data ?? []) as DbCefDraft[];
}

export async function findDraftStep(
  userId: string,
  version: number,
  step: CefStep
): Promise<DbCefDraft | null> {
  const { data, error } = await admissionsDb()
    .from("cef_draft")
    .select("*")
    .eq("user_id", userId)
    .eq("version", version)
    .eq("step", step)
    .maybeSingle();

  if (error) throw new Error(`db.cef.findDraftStep: ${error.message}`);
  return data as DbCefDraft | null;
}

// ---------------------------------------------------------------------------
// Versions
// ---------------------------------------------------------------------------

export async function insertVersion(
  version: Pick<DbCefVersion, "user_id" | "version" | "payload_hash">
): Promise<DbCefVersion> {
  const { data, error } = await admissionsDb()
    .from("cef_version")
    .insert(version)
    .select()
    .single();

  if (error) throw new Error(`db.cef.insertVersion: ${error.message}`);
  return data as DbCefVersion;
}

export async function markVersionSubmitted(
  userId: string,
  version: number
): Promise<DbCefVersion | null> {
  const { data, error } = await admissionsDb()
    .from("cef_version")
    .update({ submitted_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("version", version)
    .select()
    .maybeSingle();

  if (error) throw new Error(`db.cef.markVersionSubmitted: ${error.message}`);
  return data as DbCefVersion | null;
}

export async function findLatestVersion(userId: string): Promise<DbCefVersion | null> {
  const { data, error } = await admissionsDb()
    .from("cef_version")
    .select("*")
    .eq("user_id", userId)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(`db.cef.findLatestVersion: ${error.message}`);
  return data as DbCefVersion | null;
}
