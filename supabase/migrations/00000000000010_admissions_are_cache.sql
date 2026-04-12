-- =============================================================================
-- 00000000000010_admissions_are_cache.sql
-- =============================================================================
--
-- ARE (Admissions Readiness Estimate) cache.
--
-- One row per (user, school, cef_version, model_version). The
-- composite uniqueness is what makes re-computes idempotent — the
-- worker can call `insert ... on conflict do update` without fear
-- of producing duplicate labels.
--
-- ### What's published vs. internal
--
-- The student-facing render uses only:
--   * label         — ordinal bucket (NEVER a numerical %)
--   * explanation   — 80–120 words of Haiku-generated prose
--   * primary_driver, suggestion
--
-- The internal-only fields (`p_admit`, `shap_values`) are kept for
-- counsellor-side analytics and model retraining. They MUST NOT
-- cross the API layer — the response schema for
-- `/api/admissions/are` omits them. RLS (migration 12) restricts
-- reads to `user_id = current_user`, and there is no endpoint that
-- serves these fields.
--
-- ### label_boundary_version
--
-- The ordinal buckets (`strongly_aligned` / `competitive` /
-- `developing` / `gap_identified`) are defined by probability
-- cutoffs. Those cutoffs live in an ADR and can change — the
-- version column records which ADR governed the row, so a retro
-- analysis can always re-bucket historical rows correctly.
--
-- Source: supabase/migrations/DRAFTS.md §10.
-- Status: parallel-safe (not training-data-gated).
-- =============================================================================

set search_path = admissions, public;

create table admissions.are_cache (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null references admissions.users(id) on delete cascade,
  school_id              uuid not null references commons_db.school(id),
  cef_version            integer not null,
  model_version          text not null,
  label_boundary_version text not null,
  label                  text not null check (label in (
    'strongly_aligned','competitive','developing','gap_identified'
  )),
  explanation            text not null,
  primary_driver         text not null,
  suggestion             text not null,
  -- internal-only — never shipped to the client
  p_admit                numeric(5,4) not null check (p_admit between 0 and 1),
  shap_values            jsonb not null,
  computed_at            timestamptz not null default now(),
  unique (user_id, school_id, cef_version, model_version)
);

create index are_cache_user_idx on admissions.are_cache (user_id);
create index are_cache_school_idx on admissions.are_cache (school_id);
create index are_cache_computed_idx on admissions.are_cache (computed_at desc);
