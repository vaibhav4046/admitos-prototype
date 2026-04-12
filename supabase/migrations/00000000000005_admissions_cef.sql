-- =============================================================================
-- 00000000000005_admissions_cef.sql
-- =============================================================================
--
-- CEF (Comprehensive Essay Form) wizard tables.
--
-- Two tables capture the draft-vs-submitted lifecycle:
--
--   * admissions.cef_draft    — per-step autosave rows, one per
--                               (user, version, step). Lost/orphaned
--                               rows are fine; the wizard always
--                               reads the latest row for a given
--                               (user, version, step).
--
--   * admissions.cef_version  — the submitted snapshot. Immutable
--                               once `submitted_at` is set. The
--                               `payload_hash` lets downstream
--                               pipelines (A1 DNA, ARE) cache keyed
--                               by content rather than by user+ver.
--
-- Source: supabase/migrations/DRAFTS.md §5.
-- Status: parallel-safe (not training-data-gated).
--
-- Note. The exact `step` enum values are placeholders — the full
-- field schema lands with the CEF PDF (blocker #2 in the project
-- notes). The values here match the skeleton state machine in
-- `lib/cef/` and can be widened in a follow-up migration when the
-- PDF lands.
-- =============================================================================

set search_path = admissions, public;

-- -----------------------------------------------------------------------------
-- admissions.cef_draft
-- -----------------------------------------------------------------------------

create table admissions.cef_draft (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references admissions.users(id) on delete cascade,
  version     integer not null default 1,
  step        text not null check (step in ('profile','academics','ecs','essays','schools','review')),
  payload     jsonb not null,
  autosaved_at timestamptz not null default now(),
  created_at  timestamptz not null default now(),
  unique (user_id, version, step)
);

create index cef_draft_user_idx on admissions.cef_draft (user_id);
create index cef_draft_version_idx on admissions.cef_draft (user_id, version);

-- -----------------------------------------------------------------------------
-- admissions.cef_version
--
-- One row per "submit" click. `submitted_at` being non-null means
-- the version is frozen; downstream jobs enqueue against it. The
-- `payload_hash` is sha256 of the canonicalized payload (JSON keys
-- sorted, whitespace normalized) so the ARE cache can key off it.
-- -----------------------------------------------------------------------------

create table admissions.cef_version (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references admissions.users(id) on delete cascade,
  version       integer not null,
  submitted_at  timestamptz,
  payload_hash  text not null,
  created_at    timestamptz not null default now(),
  unique (user_id, version)
);

create index cef_version_user_idx on admissions.cef_version (user_id);
create index cef_version_submitted_idx on admissions.cef_version (submitted_at) where submitted_at is not null;
