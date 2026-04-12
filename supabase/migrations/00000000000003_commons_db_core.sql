-- =============================================================================
-- 00000000000003_commons_db_core.sql
-- =============================================================================
--
-- commons_db schema: reference data shared across admissions and
-- wellbeing. Only admissions may FK into commons_db; wellbeing reads
-- via query, never FK (per §0 rule 7 of DRAFTS.md).
--
-- Two tables here:
--   * commons_db.school       — canonical school reference (US/UK)
--   * commons_db.gdpr_actions — takedown/erasure log for the
--                               training-data pipeline
--
-- Source: supabase/migrations/DRAFTS.md §3.
-- Status: parallel-safe (not training-data-gated).
-- =============================================================================

create schema if not exists commons_db;

set search_path = commons_db, public;

-- -----------------------------------------------------------------------------
-- commons_db.school
--
-- Canonical school reference. `slug` is the stable URL-safe key used
-- by the seed script and scrapers; `ipeds_unitid` and
-- `ucas_institution_code` are the external identifiers we cross-ref
-- against when deduping. `tier` is used to drive the Week 0 seed
-- breakdown (US Top 50 / UK Oxbridge / etc.) and by the ARE model to
-- pick per-tier priors.
-- -----------------------------------------------------------------------------

create table commons_db.school (
  id                     uuid primary key default gen_random_uuid(),
  slug                   text not null unique,
  display_name           text not null,
  country                text not null check (country in ('us','uk')),
  region                 text,
  tier                   text not null check (tier in (
    'us_top50','uk_oxbridge','uk_top10','us_top100','uk_general','other'
  )),
  admit_rate             numeric(5,4) check (admit_rate between 0 and 1),
  median_sat_25th        integer check (median_sat_25th between 400 and 1600),
  median_sat_75th        integer check (median_sat_75th between 400 and 1600),
  median_gpa_25th        numeric(3,2) check (median_gpa_25th between 0 and 4),
  median_gpa_75th        numeric(3,2) check (median_gpa_75th between 0 and 4),
  ipeds_unitid           text,
  ucas_institution_code  text,
  source_dataset_year    integer not null,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create index school_tier_idx on commons_db.school (tier);
create index school_country_idx on commons_db.school (country);
create unique index school_ipeds_idx on commons_db.school (ipeds_unitid) where ipeds_unitid is not null;
create unique index school_ucas_idx on commons_db.school (ucas_institution_code) where ucas_institution_code is not null;

create trigger school_set_updated_at
  before update on commons_db.school
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- commons_db.gdpr_actions
--
-- Append-only log of GDPR actions against any row we've ingested.
-- This is the audit trail for takedowns and erasures — used by the
-- training-data pipeline to honour removal requests consistently
-- across the scraper, extraction audit, and downstream model state.
--
-- `action_type`:
--   takedown    — remove upon publisher / ToS challenge
--   rectification — user asked to correct a field
--   erasure     — user asked for full deletion ("right to be forgotten")
--   access      — user requested a copy of their data (DSAR)
-- -----------------------------------------------------------------------------

create table commons_db.gdpr_actions (
  id             uuid primary key default gen_random_uuid(),
  action_type    text not null check (action_type in ('takedown','rectification','erasure','access')),
  source_schema  text not null,
  source_table   text not null,
  source_row_id  uuid not null,
  source_uri     text,
  reason         text,
  requested_at   timestamptz not null default now(),
  actioned_at    timestamptz,
  actioned_by    uuid,
  notes          text
);

create index gdpr_actions_type_idx on commons_db.gdpr_actions (action_type);
create index gdpr_actions_requested_idx on commons_db.gdpr_actions (requested_at desc);
create index gdpr_actions_source_idx on commons_db.gdpr_actions (source_schema, source_table, source_row_id);
