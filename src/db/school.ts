/**
 * DB query module for commons_db.school.
 *
 * Schools are reference data shared across admissions and wellbeing.
 * This module reads from the commons_db schema via `commonsDb()`.
 * Writes are handled by the seed script (`scripts/seed-schools.ts`),
 * not by the application at runtime.
 *
 * Table DDL: supabase/migrations/DRAFTS.md §3
 */

import "server-only";

import { commonsDb } from "@/db/supabase";

export type SchoolTier =
  | "us_top50"
  | "uk_oxbridge"
  | "uk_top10"
  | "us_top100"
  | "uk_general"
  | "other";

export type SchoolCountry = "us" | "uk";

export interface DbSchool {
  id: string;
  slug: string;
  display_name: string;
  country: SchoolCountry;
  region: string | null;
  tier: SchoolTier;
  admit_rate: number | null;
  median_sat_25th: number | null;
  median_sat_75th: number | null;
  median_gpa_25th: number | null;
  median_gpa_75th: number | null;
  ipeds_unitid: string | null;
  ucas_institution_code: string | null;
  source_dataset_year: number;
  created_at: string;
  updated_at: string;
}

export async function findSchoolBySlug(slug: string): Promise<DbSchool | null> {
  const { data, error } = await commonsDb()
    .from("school")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw new Error(`db.school.findBySlug: ${error.message}`);
  return data as DbSchool | null;
}

export async function findSchoolById(id: string): Promise<DbSchool | null> {
  const { data, error } = await commonsDb()
    .from("school")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`db.school.findById: ${error.message}`);
  return data as DbSchool | null;
}

export async function listSchoolsByTier(tier: SchoolTier): Promise<DbSchool[]> {
  const { data, error } = await commonsDb()
    .from("school")
    .select("*")
    .eq("tier", tier)
    .order("display_name");

  if (error) throw new Error(`db.school.listByTier: ${error.message}`);
  return (data ?? []) as DbSchool[];
}

export async function listSchoolsByCountry(country: SchoolCountry): Promise<DbSchool[]> {
  const { data, error } = await commonsDb()
    .from("school")
    .select("*")
    .eq("country", country)
    .order("display_name");

  if (error) throw new Error(`db.school.listByCountry: ${error.message}`);
  return (data ?? []) as DbSchool[];
}

export async function searchSchools(query: string, limit = 20): Promise<DbSchool[]> {
  const { data, error } = await commonsDb()
    .from("school")
    .select("*")
    .ilike("display_name", `%${query}%`)
    .limit(limit)
    .order("display_name");

  if (error) throw new Error(`db.school.search: ${error.message}`);
  return (data ?? []) as DbSchool[];
}

export async function countSchools(): Promise<number> {
  const { count, error } = await commonsDb()
    .from("school")
    .select("id", { count: "exact", head: true });

  if (error) throw new Error(`db.school.count: ${error.message}`);
  return count ?? 0;
}
