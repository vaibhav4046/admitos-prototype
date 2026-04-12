# Supabase migration drafts (M1)

> **Status.** DRAFT ONLY. This file is markdown, not SQL, so it
> does NOT run under `pnpm db:reset`. When each section is ready
> to apply, copy the SQL into a numbered `.sql` file in this
> directory.
>
> **Gate.** Sections marked 🚦 are training-data-adjacent and do
> NOT get turned into `.sql` files until Andy approves
> `docs/training-data-plan.md`. All other sections are parallel-safe
> under the Week 0 gate.
>
> **Authored.** 2026-04-09 in the Cowork design session.
> **Executed by.** Claude Code on the local Windows machine.
>
> **Source of truth.** Andy's Full Project Kickoff Brief
> (2026-04-09 15:43 BST) + `docs/training-data-plan.md` +
> `docs/isolation-model.md` + `docs/architecture.md`.

---

## 0. Conventions for every migration in this repo

1. Every table has `id uuid primary key default gen_random_uuid()`
   unless it is a junction table.
2. Every table has `created_at timestamptz not null default now()`.
3. Every mutable table has `updated_at timestamptz not null default now()`
   and a `BEFORE UPDATE` trigger to keep it fresh.
4. All timestamps are `timestamptz`, never plain `timestamp`.
5. All enum values are lowercase snake_case.
6. Every user-facing table has RLS enabled (policies live in a
   separate migration — §12 below).
7. Cross-schema foreign keys are allowed ONLY from `admissions` →
   `commons_db`. No other cross-schema FK is permitted.
8. Every migration starts with `set search_path = <schema>, public`
   so the DDL is unambiguous about which schema it's touching.

---

## 1. `00000000000001_admissions_core.sql` — admissions core (parallel-safe)

```sql
-- admissions core: users, sessions
set search_path = admissions, public;

create schema if not exists admissions;

create table admissions.users (
  id           uuid primary key default gen_random_uuid(),
  email        text not null unique,
  display_name text,
  role         text not null check (role in ('student','counsellor','admin')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index users_email_idx on admissions.users (lower(email));

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
```

---

## 2. `00000000000002_wellbeing_core.sql` — wellbeing core (parallel-safe)

```sql
-- wellbeing schema is physically isolated from admissions.
-- NO foreign keys into admissions.users. Wellbeing has its own
-- user table keyed by an opaque token that the middleware maps
-- from an admissions session at request time.
set search_path = wellbeing, public;

create schema if not exists wellbeing;

create table wellbeing.wellbeing_users (
  id                 uuid primary key default gen_random_uuid(),
  opaque_token_hash  text not null unique,  -- HMAC of the mapping token, pepper in env
  created_at         timestamptz not null default now()
);

create table wellbeing.sessions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references wellbeing.wellbeing_users(id) on delete cascade,
  started_at   timestamptz not null default now(),
  ended_at     timestamptz,
  crisis_flag  boolean not null default false
);

create index sessions_user_idx on wellbeing.sessions (user_id);
```

---

## 3. `00000000000003_commons_db_core.sql` — commons_db core (parallel-safe)

```sql
-- commons_db schema: reference data shared across admissions and wellbeing.
-- Only admissions may FK into commons_db. wellbeing reads via query, never FK.
set search_path = commons_db, public;

create schema if not exists commons_db;

create table commons_db.school (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,    -- e.g. 'harvard', 'oxford-keble'
  display_name  text not null,
  country       text not null check (country in ('us','uk')),
  region        text,                     -- state (US) or country (UK)
  tier          text not null check (tier in ('us_top50','uk_oxbridge','uk_top10','us_top100','uk_general','other')),
  admit_rate             numeric(5,4) check (admit_rate between 0 and 1),
  median_sat_25th        integer check (median_sat_25th between 400 and 1600),
  median_sat_75th        integer check (median_sat_75th between 400 and 1600),
  median_gpa_25th        numeric(3,2) check (median_gpa_25th between 0 and 4),
  median_gpa_75th        numeric(3,2) check (median_gpa_75th between 0 and 4),
  ipeds_unitid           text,             -- US only, IPEDS UnitID
  ucas_institution_code  text,             -- UK only, UCAS code
  source_dataset_year    integer not null,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create index school_tier_idx on commons_db.school (tier);
create index school_country_idx on commons_db.school (country);
create unique index school_ipeds_idx on commons_db.school (ipeds_unitid) where ipeds_unitid is not null;
create unique index school_ucas_idx on commons_db.school (ucas_institution_code) where ucas_institution_code is not null;

-- GDPR actions log (used by the training-data takedown pipeline)
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
```

---

## 4. `00000000000004_commons_db_schools_seed.sql` — school seed (parallel-safe, Day 0.5 precondition)

This one is produced by `scripts/seed-schools.ts` reading from:

- `scripts/seed-data/us-top50.csv` — sourced from IPEDS
- `scripts/seed-data/us-top100-safety.csv` — sourced from IPEDS
- `scripts/seed-data/uk-oxbridge-top10.csv` — sourced from UCAS

The seed script is idempotent: it does `insert ... on conflict (slug) do update`
so re-running doesn't duplicate rows.

**Target row count:** ≥ 120 (50 US Top-50 + 50 US Top-100 safety + 10 UK Oxbridge + 10 UK Top-10 general).

**Hard precondition.** The scraper refuses to start until this
is populated. `scripts/seed-schools.ts` is committed as part of
Day 0.5 of §3 of `docs/m1-execution-runbook.md`.

---

## 5. `00000000000005_admissions_cef.sql` — CEF wizard (parallel-safe)

```sql
set search_path = admissions, public;

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

create table admissions.cef_version (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references admissions.users(id) on delete cascade,
  version       integer not null,
  submitted_at  timestamptz,                     -- null = draft in progress
  payload_hash  text not null,                    -- sha256 of canonicalized payload
  created_at    timestamptz not null default now(),
  unique (user_id, version)
);

create index cef_version_user_idx on admissions.cef_version (user_id);
create index cef_version_submitted_idx on admissions.cef_version (submitted_at) where submitted_at is not null;
```

---

## 6. `00000000000006_admissions_audit_event.sql` — audit trail (parallel-safe)

```sql
set search_path = admissions, public;

create table admissions.audit_event (
  id             uuid primary key default gen_random_uuid(),
  actor_user_id  uuid references admissions.users(id) on delete set null,
  actor_type     text not null check (actor_type in ('user','system','worker','scraper')),
  action         text not null,             -- e.g. 'cef.autosave', 'auth.signin'
  resource_type  text not null,             -- e.g. 'cef_draft', 'session'
  resource_id    uuid,
  request_id     text,                       -- traces a single HTTP request
  ip_hash        text,
  user_agent     text,
  payload        jsonb,                      -- small, structured — never raw PII
  created_at     timestamptz not null default now()
);

create index audit_event_actor_idx on admissions.audit_event (actor_user_id);
create index audit_event_action_idx on admissions.audit_event (action);
create index audit_event_created_idx on admissions.audit_event (created_at desc);
create index audit_event_resource_idx on admissions.audit_event (resource_type, resource_id);
```

---

## 7. 🚦 `00000000000007_admissions_training_profile.sql` — GATED

> **This migration does NOT become a `.sql` file until Andy approves
> `docs/training-data-plan.md`.** It is kept here as a draft so the
> schema is reviewable alongside the plan, but it is not applied.

```sql
set search_path = admissions, public;

create table admissions.training_profile (
  id                       uuid primary key default gen_random_uuid(),
  source_platform          text not null check (source_platform in (
    'reddit_a2c','reddit_chanceme','reddit_6thform','reddit_ukuniversities','cc','tsr'
  )),
  source_uri               text not null,
  source_hash              text not null,        -- sha256 of normalized post body
  author_hmac              text not null,        -- HMAC (peppered) of the username — not reversible in bulk
  unweighted_gpa           numeric(3,2) not null check (unweighted_gpa between 0 and 4),
  sat_score                integer check (sat_score between 400 and 1600 and sat_score % 10 = 0),
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
  target_school_id         uuid not null references commons_db.school(id),
  admission_outcome        text not null check (admission_outcome in ('admitted','waitlisted','rejected')),
  extraction_confidence    numeric(3,2) not null check (extraction_confidence between 0 and 1),
  -- optional enrichment
  first_gen_status         boolean,
  legacy_status            boolean,
  recruited_athlete        boolean,
  decision_round           text check (decision_round in ('ea','ed','rd','rea','ucas')),
  application_year         integer check (application_year between 2015 and 2030),
  -- constraints
  check (sat_score is not null or act_score is not null),
  created_at               timestamptz not null default now()
);

create index training_profile_school_idx on admissions.training_profile (target_school_id);
create index training_profile_outcome_idx on admissions.training_profile (admission_outcome);
create index training_profile_source_idx on admissions.training_profile (source_platform);
create index training_profile_created_idx on admissions.training_profile (created_at desc);
create unique index training_profile_source_hash_uniq on admissions.training_profile (source_platform, source_hash);
```

---

## 8. 🚦 `00000000000008_admissions_extraction_audit.sql` — GATED

```sql
set search_path = admissions, public;

create table admissions.extraction_audit (
  id                   uuid primary key default gen_random_uuid(),
  training_profile_id  uuid references admissions.training_profile(id) on delete set null,
  source_platform      text not null,
  source_uri           text not null,
  source_hash          text not null,
  model_name           text not null,
  model_version        text not null,
  prompt_slot          text not null,                -- e.g. 'training_data.extract_profile_v1'
  prompt_version       integer not null,
  overall_confidence   numeric(3,2) not null check (overall_confidence between 0 and 1),
  per_field_confidence jsonb not null,               -- { "unweighted_gpa": 0.92, ... }
  status               text not null check (status in (
    'accepted','rejected_low_confidence','rejected_plausibility',
    'rejected_minor','rejected_duplicate','rejected_tos_takedown',
    'rejected_no_outcome'
  )),
  reject_reason        text,
  raw_extraction       jsonb not null,               -- full model output for auditability
  created_at           timestamptz not null default now()
);

create index extraction_audit_status_idx on admissions.extraction_audit (status);
create index extraction_audit_created_idx on admissions.extraction_audit (created_at desc);
create index extraction_audit_profile_idx on admissions.extraction_audit (training_profile_id);
```

---

## 9. 🚦 `00000000000009_admissions_scrape_requests.sql` — GATED

```sql
set search_path = admissions, public;

create table admissions.scrape_requests (
  id              uuid primary key default gen_random_uuid(),
  source_platform text not null,
  source_uri      text not null,
  requested_at    timestamptz not null default now(),
  fetched_at      timestamptz,
  http_status     integer,
  body_hash       text,                              -- sha256 of the body we retrieved
  error           text,
  retry_count     integer not null default 0
);

create index scrape_requests_platform_idx on admissions.scrape_requests (source_platform);
create index scrape_requests_status_idx on admissions.scrape_requests (http_status);
create unique index scrape_requests_uri_uniq on admissions.scrape_requests (source_uri, requested_at);
```

---

## 10. `00000000000010_admissions_are_cache.sql` — ARE cache (parallel-safe)

```sql
set search_path = admissions, public;

create table admissions.are_cache (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references admissions.users(id) on delete cascade,
  school_id        uuid not null references commons_db.school(id),
  cef_version      integer not null,
  model_version    text not null,                       -- e.g. 'xgboost-are-v0.1' or 'statistical-prior-v1'
  label_boundary_version text not null,                 -- ADR id of the boundaries used
  label            text not null check (label in (
    'strongly_aligned','competitive','developing','gap_identified'
  )),
  explanation      text not null,                       -- 80-120 words, Haiku output
  primary_driver   text not null,
  suggestion       text not null,
  -- internal-only — never shipped to the client
  p_admit          numeric(5,4) not null check (p_admit between 0 and 1),
  shap_values      jsonb not null,
  computed_at      timestamptz not null default now(),
  unique (user_id, school_id, cef_version, model_version)
);

create index are_cache_user_idx on admissions.are_cache (user_id);
create index are_cache_school_idx on admissions.are_cache (school_id);
create index are_cache_computed_idx on admissions.are_cache (computed_at desc);
```

---

## 11. `00000000000011_wellbeing_session_log.sql` — wellbeing session log (parallel-safe)

```sql
set search_path = wellbeing, public;

create table wellbeing.session_log (
  id                uuid primary key default gen_random_uuid(),
  session_id        uuid not null references wellbeing.sessions(id) on delete cascade,
  turn_index        integer not null,
  role              text not null check (role in ('student','adie','system')),
  content_hash      text not null,                      -- we don't store raw content by default
  content_length    integer not null,
  crisis_keyword_hit boolean not null default false,
  created_at        timestamptz not null default now(),
  unique (session_id, turn_index)
);

create index session_log_session_idx on wellbeing.session_log (session_id);
create index session_log_crisis_idx on wellbeing.session_log (created_at desc) where crisis_keyword_hit = true;
```

Note: wellbeing intentionally does NOT store message content in V1.
The `content_hash` + `content_length` is enough to detect
duplication and monitor length distributions without creating a
privacy liability. If a counsellor ever needs raw text for a
specific crisis session, that is a manual data-pull workflow, not
a continuous storage decision.

---

## 12. `00000000000012_rls_policies.sql` — RLS for all user-facing tables (parallel-safe)

```sql
-- Enable RLS + policies for every user-facing table.
-- Internal-only tables (audit_event, scrape_requests, extraction_audit)
-- have RLS enabled with zero policies — only the service role can read.

-- admissions
alter table admissions.users      enable row level security;
alter table admissions.sessions   enable row level security;
alter table admissions.cef_draft  enable row level security;
alter table admissions.cef_version enable row level security;
alter table admissions.are_cache   enable row level security;
alter table admissions.audit_event enable row level security;

-- users: each user can read their own row
create policy users_self_read on admissions.users
  for select using (id = (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')::uuid);

-- cef_draft: user sees only their own drafts
create policy cef_draft_self on admissions.cef_draft
  for all using (user_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')::uuid);

-- cef_version: user sees only their own versions
create policy cef_version_self on admissions.cef_version
  for all using (user_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')::uuid);

-- are_cache: user sees only their own cache rows
create policy are_cache_self on admissions.are_cache
  for select using (user_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')::uuid);

-- sessions: user sees only their own sessions
create policy sessions_self on admissions.sessions
  for select using (user_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')::uuid);

-- audit_event: no policies. service-role only.
-- (RLS enabled = all reads denied to anon/authenticated keys)

-- wellbeing
alter table wellbeing.wellbeing_users enable row level security;
alter table wellbeing.sessions         enable row level security;
alter table wellbeing.session_log      enable row level security;

-- wellbeing users: service role only (the opaque token indirection means
-- we never route a user's JWT through this schema)
-- All three wellbeing tables: RLS enabled, no policies. Service-role only.

-- commons_db
alter table commons_db.school        enable row level security;
alter table commons_db.gdpr_actions  enable row level security;

-- school: world-readable (published reference data)
create policy school_public_read on commons_db.school
  for select using (true);

-- gdpr_actions: service-role only (RLS enabled, no policies)

-- Gated tables (training_profile, extraction_audit, scrape_requests)
-- also get RLS enabled here, all service-role only, when the gate lifts.
```

---

## 13. RLS test plan (lives in `tests/db/rls.test.ts`)

Each policy above must be paired with a test that proves:

1. User A cannot read User B's row.
2. User A can read their own row.
3. The anon key (logged-out user) cannot read any row.
4. The service role can read all rows.
5. The `commons_db.school` table is readable by everyone
   (including anon) — this is the one intentional exception.

Claude Code writes the tests alongside the migration PR. Tests
use `supabase.auth.admin.createUser` to create two test users and
assert the expected visibility for each.

---

## 14. How these drafts become real `.sql` files

1. The migration is **parallel-safe** (no 🚦): copy the SQL block
   from §N into a new file `supabase/migrations/00000000000NN_<name>.sql`.
2. The migration is **gated** (🚦): wait for Andy's approval. When
   the approval lands, do the copy and apply in Day 3 per the
   runbook §4.
3. Run `pnpm db:reset` in dev to apply.
4. Run `pnpm test` to confirm the RLS test suite stays green.
5. Open a PR with just the new migration file(s) — do not edit
   this drafts doc (it stays as the design record).

---

— Vaibhav (Cowork session, 2026-04-09)
