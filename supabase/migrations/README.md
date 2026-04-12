# Migrations

> **Status (M1 Week 1):** all real DDL is **blocked** on Q3 (wellbeing
> isolation mechanism — single-project + role split vs. two projects)
> and on Thread 4 PDF #1 (`prd-v2.pdf`). This directory currently
> holds rationale + helper sketches only. Real migrations land in
> Week 2 once those unblock.

## Layout

```
supabase/migrations/
├── README.md                   ← you are here
├── 00000000000000_helpers.sql  ← shared functions (audit_rpc, now_utc)
├── 20260413000000_admissions_init.sql   ← M1 Week 2
├── 20260413000100_wellbeing_init.sql    ← M1 Week 2
├── 20260413000200_commons_db_init.sql   ← M1 Week 2
└── 20260413000300_audit_event_tables.sql
```

## Schema invariants (Thread 4)

1. There are exactly **three** Postgres schemas: `admissions`,
   `wellbeing`, `commons_db`. Names are non-negotiable.
2. The `audit_event` table exists in both `admissions` and `wellbeing`.
   It does **NOT** exist in `commons_db`. (Commons is read-mostly.)
3. `audit_event` has **no** UPDATE or DELETE RLS policies. Append-only
   forever. The application-layer helper in `lib/audit/log.ts` mirrors
   this.
4. The `prompt_version` table exists in both `admissions` and
   `wellbeing` with a **partial unique index**:
   ```sql
   CREATE UNIQUE INDEX prompt_version_one_active_per_slot
     ON prompt_version (slot)
     WHERE status = 'active';
   ```
5. RLS on application tables is **on by default**. If a table doesn't
   need RLS, write a comment block explaining why.
6. Service-role keys are namespace-scoped. The single Supabase project
   uses three keys (one per schema). The middleware in `middleware.ts`
   rejects any cross-namespace request before it reaches PostgREST.

## Q3 fork

If Andy lands on **Option 1** (two Supabase projects), this whole
directory is replaced with two parallel `supabase/admissions/` and
`supabase/wellbeing/` directories, each with its own
`supabase/config.toml`. Code only needs to change in
`lib/supabase/service-clients.ts` — every other file in the repo is
namespace-agnostic by construction.

If Andy lands on **Option 2** (single project, role split — current
default), the directory layout above is final.
