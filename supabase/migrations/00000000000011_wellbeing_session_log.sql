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
