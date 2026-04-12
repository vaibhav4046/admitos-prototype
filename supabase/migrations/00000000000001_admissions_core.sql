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
