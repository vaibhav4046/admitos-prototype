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
