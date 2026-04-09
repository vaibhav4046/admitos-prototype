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
