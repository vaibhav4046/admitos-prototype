-- =============================================================================
-- 00000000000008_admissions_extraction_audit.sql
-- =============================================================================
--
-- Extraction audit trail. Every Claude Haiku extraction attempt
-- (success or failure) is logged here for pipeline observability.
--
-- Source: supabase/migrations/DRAFTS.md §8.
-- Status: UNGATED — Day 5 go/no-go requires live data.
-- =============================================================================

set search_path = admissions, public;

create table admissions.extraction_audit (
  id                   uuid primary key default gen_random_uuid(),
  training_profile_id  uuid references admissions.training_profile(id) on delete set null,
  source_platform      text,
  source_uri           text not null,
  source_hash          text,
  model_name           text,
  model_version        text,
  prompt_slot          text,
  prompt_version       integer,
  overall_confidence   numeric(3,2) check (overall_confidence between 0 and 1),
  per_field_confidence jsonb,
  status               text not null,
  reason               text,
  reject_reason        text,
  raw_extraction       jsonb,
  created_at           timestamptz not null default now()
);

create index extraction_audit_status_idx on admissions.extraction_audit (status);
create index extraction_audit_created_idx on admissions.extraction_audit (created_at desc);

alter table admissions.extraction_audit enable row level security;
-- No policies: service-role only.
