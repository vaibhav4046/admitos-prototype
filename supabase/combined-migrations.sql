-- === 00000000000000_helpers.sql ===
-- =============================================================================
-- Shared helper functions
-- =============================================================================
--
-- This migration is intentionally schema-agnostic — it lives in `public`
-- and is callable from `admissions`, `wellbeing`, and `commons_db`.
--
-- The two helpers here are the foundation pieces the app calls regardless
-- of which schema it's writing to:
--
--   * public.now_utc()       — single source of truth for "now" so we
--                               never accidentally end up with mixed
--                               clock-tz semantics across schemas
--
--   * public.with_audit_*    — placeholder for the auditedMutation RPC
--                               pattern. Real implementation lands once
--                               the audit_event table DDL is written
--                               (blocked on Q3 — see README.md)
--
-- DO NOT add per-schema tables here. Schema-scoped DDL goes in the
-- `*_init.sql` files.
-- =============================================================================

create or replace function public.now_utc()
returns timestamptz
language sql
stable
as $$
  select now() at time zone 'utc'
$$;

comment on function public.now_utc() is
  'Single source of truth for "now". Use instead of now() so timezone semantics are uniform across schemas.';

-- -----------------------------------------------------------------------------
-- with_audit_admissions / with_audit_wellbeing — STUB
-- -----------------------------------------------------------------------------
-- These are the SQL counterparts of `auditedMutation` in lib/audit/log.ts.
-- The real implementation will:
--
--   1. Run the caller-supplied mutation as a SQL block
--   2. Insert the AuditEvent row
--   3. COMMIT both, or ROLLBACK both
--
-- The function CANNOT be implemented until the `audit_event` table
-- exists, which depends on Q3. Marking it as a stub here so the
-- application code's reference to `with_audit_admissions` resolves
-- in dev (returning NULL) without causing a missing-function error.
--
-- TODO(M1 Week 2): replace these stubs with the real plpgsql once
-- the audit_event tables land.
-- -----------------------------------------------------------------------------

create or replace function public.with_audit_admissions(
  _action text,
  _actor jsonb,
  _target jsonb,
  _data jsonb
)
returns void
language plpgsql
as $$
begin
  raise notice 'with_audit_admissions stub called: action=%', _action;
  -- intentionally a no-op — see README.md and Q3 blocker.
end;
$$;

create or replace function public.with_audit_wellbeing(
  _action text,
  _actor jsonb,
  _target jsonb,
  _data jsonb
)
returns void
language plpgsql
as $$
begin
  raise notice 'with_audit_wellbeing stub called: action=%', _action;
  -- intentionally a no-op — see README.md and Q3 blocker.
end;
$$;


-- === 00000000000001_admissions_core.sql ===
-- =============================================================================
-- 00000000000001_admissions_core.sql
-- =============================================================================
--
-- Admissions schema core tables: users + sessions.
--
-- This is the first non-helpers migration. It establishes the
-- `admissions` schema, the `public.set_updated_at()` trigger function
-- used by every mutable table across schemas (per §0 rule 3 of
-- supabase/migrations/DRAFTS.md), and the two foundation tables that
-- everything else in admissions references.
--
-- Source: supabase/migrations/DRAFTS.md §1.
-- Status: parallel-safe (not training-data-gated).
-- =============================================================================

create schema if not exists admissions;

set search_path = admissions, public;

-- -----------------------------------------------------------------------------
-- public.set_updated_at()
--
-- Shared BEFORE UPDATE trigger function. Defined in `public` so the
-- same function is reusable from every schema without duplicating
-- plpgsql. Per §0 rule 3: every mutable table with an updated_at
-- column must attach this trigger.
-- -----------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

comment on function public.set_updated_at() is
  'BEFORE UPDATE trigger helper: stamps updated_at = now() on the new row. Attach to any mutable table that has an updated_at column.';

-- -----------------------------------------------------------------------------
-- admissions.users
-- -----------------------------------------------------------------------------

create table admissions.users (
  id           uuid primary key default gen_random_uuid(),
  email        text not null unique,
  display_name text,
  role         text not null check (role in ('student','counsellor','admin')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index users_email_idx on admissions.users (lower(email));

create trigger users_set_updated_at
  before update on admissions.users
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- admissions.sessions
--
-- Server-side session records. `csrf_token` is the signed token
-- issued by src/services/security/csrf.ts — we keep it here only to
-- support future revocation by token. `ip_hash` is HMAC-peppered,
-- never a raw IP. `revoked_at` is null for active sessions.
-- -----------------------------------------------------------------------------

create table admissions.sessions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references admissions.users(id) on delete cascade,
  csrf_token   text not null,
  issued_at    timestamptz not null default now(),
  expires_at   timestamptz not null,
  revoked_at   timestamptz,
  ip_hash      text,
  user_agent   text
);

create index sessions_user_idx on admissions.sessions (user_id) where revoked_at is null;
create index sessions_expires_idx on admissions.sessions (expires_at) where revoked_at is null;


-- === 00000000000002_wellbeing_core.sql ===
-- =============================================================================
-- 00000000000002_wellbeing_core.sql
-- =============================================================================
--
-- Wellbeing schema core tables.
--
-- Wellbeing is physically isolated from admissions — there is NO
-- foreign key from `wellbeing.*` into `admissions.users`. Instead,
-- `wellbeing.wellbeing_users` holds an opaque token hash. The
-- middleware maps an admissions session to a wellbeing token at
-- request time; the wellbeing schema only ever sees the hash.
--
-- This indirection is what enables the "zero PostHog, scrubbed
-- Sentry, never touch admissions" guarantees downstream — wellbeing
-- rows cannot be trivially joined back to a user identity through
-- SQL alone.
--
-- Source: supabase/migrations/DRAFTS.md §2.
-- Status: parallel-safe (not training-data-gated).
-- =============================================================================

create schema if not exists wellbeing;

set search_path = wellbeing, public;

-- -----------------------------------------------------------------------------
-- wellbeing.wellbeing_users
--
-- Opaque token store. `opaque_token_hash` is HMAC-SHA256 of the
-- mapping token using a pepper from env (see src/services/env.ts).
-- The hash is non-reversible in bulk — a database leak does not
-- compromise the admissions→wellbeing linkage.
-- -----------------------------------------------------------------------------

create table wellbeing.wellbeing_users (
  id                 uuid primary key default gen_random_uuid(),
  opaque_token_hash  text not null unique,
  created_at         timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- wellbeing.sessions
--
-- A wellbeing conversation session. `crisis_flag` is tripped by the
-- A_die crisis-check prompt slot and triggers an out-of-band alert
-- via the audit_alerts queue — it is NOT set from user input.
-- -----------------------------------------------------------------------------

create table wellbeing.sessions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references wellbeing.wellbeing_users(id) on delete cascade,
  started_at   timestamptz not null default now(),
  ended_at     timestamptz,
  crisis_flag  boolean not null default false
);

create index sessions_user_idx on wellbeing.sessions (user_id);


-- === 00000000000003_commons_db_core.sql ===
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


-- === 00000000000005_admissions_cef.sql ===
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


-- === 00000000000006_admissions_audit_event.sql ===
-- =============================================================================
-- 00000000000006_admissions_audit_event.sql
-- =============================================================================
--
-- Append-only audit trail for admissions.
--
-- Every state-changing action in the admissions namespace writes a
-- row here via src/services/audit/log.ts (logAuditEvent). The table
-- is deliberately narrow: the `payload` JSON is intended for small
-- structured summaries, NEVER raw PII. Scrubbing happens at the
-- application layer (`lib/audit/`), but the schema itself also
-- enables RLS with no policies (service-role only) in migration 12
-- to prevent accidental client reads.
--
-- The indices are tuned for the three most common queries:
--
--   1. "all actions by user X"                  → actor_idx
--   2. "all rows for action X in last N days"   → action_idx + created_idx
--   3. "history for this CEF draft / session"   → resource_idx
--
-- Source: supabase/migrations/DRAFTS.md §6.
-- Status: parallel-safe (not training-data-gated).
-- =============================================================================

set search_path = admissions, public;

create table admissions.audit_event (
  id             uuid primary key default gen_random_uuid(),
  actor_user_id  uuid references admissions.users(id) on delete set null,
  actor_type     text not null check (actor_type in ('user','system','worker','scraper')),
  action         text not null,
  resource_type  text not null,
  resource_id    uuid,
  request_id     text,
  ip_hash        text,
  user_agent     text,
  payload        jsonb,
  created_at     timestamptz not null default now()
);

create index audit_event_actor_idx on admissions.audit_event (actor_user_id);
create index audit_event_action_idx on admissions.audit_event (action);
create index audit_event_created_idx on admissions.audit_event (created_at desc);
create index audit_event_resource_idx on admissions.audit_event (resource_type, resource_id);


-- === 00000000000007_admissions_training_profile.sql ===
-- =============================================================================
-- 00000000000007_admissions_training_profile.sql
-- =============================================================================
--
-- Training profile table for the ML training data pipeline.
--
-- Each row is one extracted applicant profile from a Reddit/forum post.
-- The Pydantic validator in unioffer-training-pipeline ensures every row
-- satisfies these constraints before it hits the DB.
--
-- Source: supabase/migrations/DRAFTS.md §7.
-- Status: UNGATED — Day 5 go/no-go requires live data.
-- =============================================================================

set search_path = admissions, public;

create table admissions.training_profile (
  id                       uuid primary key default gen_random_uuid(),
  source_platform          text,
  source_uri               text,
  source_url               text,
  source_type              text not null default 'reddit',
  source_hash              text,
  author_hmac              text,
  unweighted_gpa           numeric(3,2) not null check (unweighted_gpa between 0 and 4),
  sat_score                integer check (sat_score between 400 and 1600),
  act_score                integer check (act_score between 1 and 36),
  ap_course_count          integer not null check (ap_course_count between 0 and 20),
  ec_hours_per_week        integer not null check (ec_hours_per_week between 0 and 60),
  leadership_roles_count   integer not null check (leadership_roles_count between 0 and 12),
  research_experience      boolean not null,
  major_category           text not null check (major_category in (
    'stem','humanities','social_science','arts','business','undecided'
  )),
  nationality_region       text not null check (nationality_region in (
    'us_domestic','us_international','uk_home','uk_international',
    'asia','middle_east','europe','africa','latam','oceania','other'
  )),
  nationality_country      text check (nationality_country ~ '^[A-Z]{2}$'),
  target_school_id         uuid references commons_db.school(id),
  admission_outcome        text not null check (admission_outcome in ('admitted','waitlisted','rejected')),
  extraction_confidence    numeric(3,2) not null check (extraction_confidence between 0 and 1),
  first_gen_status         boolean,
  legacy_status            boolean,
  recruited_athlete        boolean,
  decision_round           text check (decision_round in ('ea','ed','rd','rea','ucas')),
  application_year         integer check (application_year between 2015 and 2030),
  check (sat_score is not null or act_score is not null),
  created_at               timestamptz not null default now()
);

create index training_profile_outcome_idx on admissions.training_profile (admission_outcome);
create index training_profile_source_idx on admissions.training_profile (source_type);
create index training_profile_country_idx on admissions.training_profile (nationality_country);
create index training_profile_created_idx on admissions.training_profile (created_at desc);

alter table admissions.training_profile enable row level security;
-- No policies: service-role only (pipeline writes, not user-facing).


-- === 00000000000008_admissions_extraction_audit.sql ===
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


-- === 00000000000009_admissions_scrape_requests.sql ===
-- =============================================================================
-- 00000000000009_admissions_scrape_requests.sql
-- =============================================================================
--
-- Scrape request tracking. Dedup + status tracking for the pipeline.
--
-- Source: supabase/migrations/DRAFTS.md §9.
-- Status: UNGATED — Day 5 go/no-go requires live data.
-- =============================================================================

set search_path = admissions, public;

create table admissions.scrape_requests (
  id              uuid primary key default gen_random_uuid(),
  source_platform text,
  source_uri      text not null,
  subreddit       text,
  status          text not null default 'pending',
  requested_at    timestamptz not null default now(),
  fetched_at      timestamptz,
  http_status     integer,
  body_hash       text,
  error           text,
  retry_count     integer not null default 0
);

create index scrape_requests_platform_idx on admissions.scrape_requests (source_platform);
create index scrape_requests_status_idx on admissions.scrape_requests (status);
create unique index scrape_requests_uri_uniq on admissions.scrape_requests (source_uri);

alter table admissions.scrape_requests enable row level security;
-- No policies: service-role only.


-- === 00000000000010_admissions_are_cache.sql ===
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


-- === 00000000000011_wellbeing_session_log.sql ===
-- =============================================================================
-- 00000000000011_wellbeing_session_log.sql
-- =============================================================================
--
-- Wellbeing conversation log.
--
-- Important privacy property: we store `content_hash` and
-- `content_length` here, NOT the raw message body. That is enough
-- to:
--
--   - detect duplicate/looped messages
--   - monitor length-distribution drift
--   - correlate a crisis flag with a turn index
--
-- but does NOT create a liability if the database is compromised
-- or subpoenaed. Raw text for a specific crisis session is a
-- manual data-pull workflow — not continuous storage.
--
-- The `crisis_keyword_hit` column is set by the A_die crisis-check
-- prompt slot (runs in parallel with the main chat call). A hit
-- writes an AuditEvent ADIE_CRISIS_FLAG_RAISED and enqueues an
-- audit_alerts job; the partial index on that column makes the
-- "recent crisis flags" query efficient.
--
-- Source: supabase/migrations/DRAFTS.md §11.
-- Status: parallel-safe (not training-data-gated).
-- =============================================================================

set search_path = wellbeing, public;

create table wellbeing.session_log (
  id                 uuid primary key default gen_random_uuid(),
  session_id         uuid not null references wellbeing.sessions(id) on delete cascade,
  turn_index         integer not null,
  role               text not null check (role in ('student','adie','system')),
  content_hash       text not null,
  content_length     integer not null,
  crisis_keyword_hit boolean not null default false,
  created_at         timestamptz not null default now(),
  unique (session_id, turn_index)
);

create index session_log_session_idx on wellbeing.session_log (session_id);
create index session_log_crisis_idx on wellbeing.session_log (created_at desc) where crisis_keyword_hit = true;


-- === 00000000000012_rls_policies.sql ===
-- =============================================================================
-- 00000000000012_rls_policies.sql
-- =============================================================================
--
-- Row Level Security for every user-facing table.
--
-- ### Rule of thumb
--
--   * User-facing table  → RLS on + `*_self` policy keyed on
--                           current_setting('request.jwt.claims',true)::jsonb ->> 'sub'
--   * Internal-only table → RLS on + ZERO policies. This denies all
--                           reads via the anon/authenticated keys,
--                           but the service role still has access
--                           (service role bypasses RLS by design).
--   * Public reference   → RLS on + `*_public_read` policy with
--                           `using (true)`.
--
-- Wellbeing is the strongest case: ALL three wellbeing tables are
-- internal-only. Wellbeing reads/writes always go through the
-- wellbeing service role, which is a separate Supabase service key
-- per isolation-model.md Layer 3. The schema is never queried with
-- an end-user JWT.
--
-- ### Gated tables
--
-- training_profile, extraction_audit, and scrape_requests (drafts 7,
-- 8, 9) are 🚦 — they do not have files in this directory yet. When
-- those land, their RLS is "enable + zero policies" (service-role
-- only), added as part of the same PR that creates the tables.
--
-- Source: supabase/migrations/DRAFTS.md §12.
-- Status: parallel-safe (not training-data-gated).
-- =============================================================================

-- ─── admissions ──────────────────────────────────────────────────
alter table admissions.users       enable row level security;
alter table admissions.sessions    enable row level security;
alter table admissions.cef_draft   enable row level security;
alter table admissions.cef_version enable row level security;
alter table admissions.are_cache   enable row level security;
alter table admissions.audit_event enable row level security;

-- users: each user can read their own row
create policy users_self_read on admissions.users
  for select
  using (id = (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')::uuid);

-- cef_draft: user sees / writes only their own drafts
create policy cef_draft_self on admissions.cef_draft
  for all
  using (user_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')::uuid)
  with check (user_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')::uuid);

-- cef_version: user sees / writes only their own versions
create policy cef_version_self on admissions.cef_version
  for all
  using (user_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')::uuid)
  with check (user_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')::uuid);

-- are_cache: user SELECTs only their own rows. Writes come from the
-- service role (worker), not from a user JWT, so there is no write
-- policy here — RLS denies writes to the anon/authenticated roles.
create policy are_cache_self on admissions.are_cache
  for select
  using (user_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')::uuid);

-- sessions: user SELECTs only their own sessions
create policy sessions_self on admissions.sessions
  for select
  using (user_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')::uuid);

-- audit_event: no policies. service-role only.
-- (RLS on + no policies = all reads denied to non-service-role keys.)

-- ─── wellbeing ───────────────────────────────────────────────────
-- All three tables are internal-only. Service role only.
alter table wellbeing.wellbeing_users enable row level security;
alter table wellbeing.sessions         enable row level security;
alter table wellbeing.session_log      enable row level security;
-- (No policies — every read/write goes through the wellbeing
-- service-role client from src/db/supabase/service-clients.ts.)

-- ─── commons_db ──────────────────────────────────────────────────
alter table commons_db.school       enable row level security;
alter table commons_db.gdpr_actions enable row level security;

-- school: world-readable reference data. The one intentional
-- exception to "RLS hides everything" — a logged-out visitor
-- browsing the school list is a legitimate flow.
create policy school_public_read on commons_db.school
  for select
  using (true);

-- gdpr_actions: service-role only.
