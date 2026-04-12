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
