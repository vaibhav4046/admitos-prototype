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
