/**
 * DB query module for admissions.training_profile (🚦-gated).
 *
 * This module is wired now so the Python pipeline and the TS eval
 * runner can share query patterns. The underlying table does NOT
 * exist until Andy approves `docs/training-data-plan.md` and the
 * migration in DRAFTS.md §7 is applied.
 *
 * Calling any function here before the migration runs will throw a
 * Supabase "relation does not exist" error — which is correct
 * behavior (fail-loud, not silent-null).
 *
 * Table DDL: supabase/migrations/DRAFTS.md §7
 */

import "server-only";

import { admissionsDb } from "@/db/supabase";

export type MajorCategory =
  | "stem"
  | "humanities"
  | "social_science"
  | "arts"
  | "business"
  | "undecided";

export type NationalityRegion =
  | "us_domestic"
  | "us_international"
  | "uk_home"
  | "uk_international"
  | "asia"
  | "middle_east"
  | "europe"
  | "africa"
  | "latam"
  | "oceania"
  | "other";

export type AdmissionOutcome = "admitted" | "waitlisted" | "rejected";

export interface DbTrainingProfile {
  id: string;
  source_platform: string;
  source_uri: string;
  source_hash: string;
  author_hmac: string;
  unweighted_gpa: number;
  sat_score: number | null;
  act_score: number | null;
  ap_course_count: number;
  ec_hours_per_week: number;
  leadership_roles_count: number;
  research_experience: boolean;
  major_category: MajorCategory;
  nationality_region: NationalityRegion;
  target_school_id: string;
  admission_outcome: AdmissionOutcome;
  extraction_confidence: number;
  first_gen_status: boolean | null;
  legacy_status: boolean | null;
  recruited_athlete: boolean | null;
  decision_round: string | null;
  application_year: number | null;
  created_at: string;
}

export async function insertTrainingProfile(
  profile: Omit<DbTrainingProfile, "id" | "created_at">
): Promise<DbTrainingProfile> {
  const { data, error } = await admissionsDb()
    .from("training_profile")
    .insert(profile)
    .select()
    .single();

  if (error) throw new Error(`db.training.insert: ${error.message}`);
  return data as DbTrainingProfile;
}

export async function findBySourceHash(
  platform: string,
  sourceHash: string
): Promise<DbTrainingProfile | null> {
  const { data, error } = await admissionsDb()
    .from("training_profile")
    .select("*")
    .eq("source_platform", platform)
    .eq("source_hash", sourceHash)
    .maybeSingle();

  if (error) throw new Error(`db.training.findBySourceHash: ${error.message}`);
  return data as DbTrainingProfile | null;
}

export async function listBySchool(
  schoolId: string,
  limit = 100
): Promise<DbTrainingProfile[]> {
  const { data, error } = await admissionsDb()
    .from("training_profile")
    .select("*")
    .eq("target_school_id", schoolId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`db.training.listBySchool: ${error.message}`);
  return (data ?? []) as DbTrainingProfile[];
}

export async function listByOutcome(
  outcome: AdmissionOutcome,
  limit = 100
): Promise<DbTrainingProfile[]> {
  const { data, error } = await admissionsDb()
    .from("training_profile")
    .select("*")
    .eq("admission_outcome", outcome)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`db.training.listByOutcome: ${error.message}`);
  return (data ?? []) as DbTrainingProfile[];
}

export async function countProfiles(): Promise<number> {
  const { count, error } = await admissionsDb()
    .from("training_profile")
    .select("id", { count: "exact", head: true });

  if (error) throw new Error(`db.training.count: ${error.message}`);
  return count ?? 0;
}
