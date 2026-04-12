/**
 * DB query module for admissions.are_cache.
 *
 * The ARE (Admissions Readiness Evaluator) cache stores computed
 * readiness labels per (user, school, cef_version, model_version).
 * Labels are categorical — strongly_aligned / competitive /
 * developing / gap_identified — and NEVER expose numerical
 * probabilities to the client.
 *
 * The internal `p_admit` and `shap_values` columns are stored for
 * the ARE model pipeline and offline evaluation, but are explicitly
 * excluded from any client-facing query projection.
 *
 * Table DDL: supabase/migrations/DRAFTS.md §10
 */

import "server-only";

import { admissionsDb } from "@/db/supabase";

export type AreLabel =
  | "strongly_aligned"
  | "competitive"
  | "developing"
  | "gap_identified";

/** Client-safe ARE result — NO numerical probability fields. */
export interface AreResult {
  id: string;
  user_id: string;
  school_id: string;
  cef_version: number;
  model_version: string;
  label_boundary_version: string;
  label: AreLabel;
  explanation: string;
  primary_driver: string;
  suggestion: string;
  computed_at: string;
}

/** Full DB row — includes internal-only fields. Server use only. */
export interface DbAreCacheRow extends AreResult {
  p_admit: number;
  shap_values: Record<string, unknown>;
}

/** Fields projected for client-facing queries — excludes p_admit and shap_values. */
const CLIENT_COLUMNS =
  "id,user_id,school_id,cef_version,model_version,label_boundary_version,label,explanation,primary_driver,suggestion,computed_at";

export async function findAreResult(
  userId: string,
  schoolId: string,
  cefVersion: number
): Promise<AreResult | null> {
  const { data, error } = await admissionsDb()
    .from("are_cache")
    .select(CLIENT_COLUMNS)
    .eq("user_id", userId)
    .eq("school_id", schoolId)
    .eq("cef_version", cefVersion)
    .order("computed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(`db.areCache.find: ${error.message}`);
  return data as AreResult | null;
}

export async function listAreResultsForUser(
  userId: string,
  cefVersion: number
): Promise<AreResult[]> {
  const { data, error } = await admissionsDb()
    .from("are_cache")
    .select(CLIENT_COLUMNS)
    .eq("user_id", userId)
    .eq("cef_version", cefVersion)
    .order("computed_at", { ascending: false });

  if (error) throw new Error(`db.areCache.listForUser: ${error.message}`);
  return (data ?? []) as AreResult[];
}

export async function insertAreCache(
  row: Omit<DbAreCacheRow, "id" | "computed_at">
): Promise<DbAreCacheRow> {
  const { data, error } = await admissionsDb()
    .from("are_cache")
    .upsert(row, {
      onConflict: "user_id,school_id,cef_version,model_version",
    })
    .select()
    .single();

  if (error) throw new Error(`db.areCache.insert: ${error.message}`);
  return data as DbAreCacheRow;
}

/**
 * Internal-only: fetch full row including p_admit and shap_values.
 * Used by the ARE eval pipeline, never by client-facing code.
 */
export async function findFullAreCacheRow(
  userId: string,
  schoolId: string,
  cefVersion: number,
  modelVersion: string
): Promise<DbAreCacheRow | null> {
  const { data, error } = await admissionsDb()
    .from("are_cache")
    .select("*")
    .eq("user_id", userId)
    .eq("school_id", schoolId)
    .eq("cef_version", cefVersion)
    .eq("model_version", modelVersion)
    .maybeSingle();

  if (error) throw new Error(`db.areCache.findFull: ${error.message}`);
  return data as DbAreCacheRow | null;
}
