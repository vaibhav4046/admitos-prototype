# AdmitOS MVP Platform

Admissions platform for AdropEDU. Next.js 14 App Router + Supabase (3 schemas) + BullMQ workers + Claude models.

## Architecture — the three non-negotiable rules

1. **Three Supabase schemas, these exact names only**
   - `admissions` — profiles, cases, CEF, essays, schools, DNA, ARE, HITL queue
   - `wellbeing` — Adie conversations, wellbeing signals, crisis events. **Physically isolated** from admissions.
   - `commons_db` — curator-led content feed, engagement events

2. **`AuditEvent` table has NO update / NO delete RLS, ever.**
   - Every mutating API request writes AuditEvent atomically **before** returning
   - If the audit write fails, the entire request rolls back
   - See `lib/audit/log.ts`

3. **Wellbeing ↔ admissions isolation is enforced at SIX layers.**
   See [`docs/isolation-model.md`](docs/isolation-model.md) for the
   full breakdown. Summary:
   1. Next.js route-group layout boundaries
   2. `middleware.ts` referer check for `/api/wellbeing/*`
   3. Three Supabase schemas with three service-role keys (Q3 Option 2 default)
   4. PostHog `adie_*` event name ban (wrapper + ESLint + CI grep + unit tests)
   5. Sentry `wellbeing.content` scrub in all three configs + structured logger
   6. CI + local grep for cross-surface imports (`pnpm check:isolation`)

## Product rules enforced in code

- School Readiness API **never** returns a numerical admission probability percentage (enforced at API level, not UI)
- No `%` figures anywhere in student UI
- No numerical scores on DNA sliders (categorical bands only)
- AI essay feedback is **never auto-applied** — counsellor HITL sign-off required before student sees anything
- **DeepSeek is permanently banned** as a model provider

## Three mandatory systems (Thread 4)

1. **Eval-Driven Development** — LLM-as-Judge runs on every A1 and A5 invocation
2. **3-Layer Observability** — LangSmith (traces) + Sentry (errors) + PostHog (product events)
3. **Prompt Versioning** — DB-backed `active | shadow | deprecated`. No hardcoded system prompts anywhere in the tree.

## Project layout

```
app/
  (admissions)/                 # route group — browser UI for admissions flows
    cef/                        # 7-step CEF wizard
    dashboard/
  (wellbeing)/                  # route group — browser UI for Adie + wellbeing
  api/
    admissions/                 # API routes — use admissions service role
    wellbeing/                  # API routes — use wellbeing service role, NEVER touch admissions
lib/
  env.ts                        # Zod-validated env schema — validated at boot
  supabase/                     # 4 clients: admissions-browser, admissions-server, wellbeing-server, admin
  rls/                          # RLS helper queries (role claims, is_minor, guardian links)
  queues/                       # BullMQ queue name constants + connection helper
  observability/                # LangSmith + Sentry + PostHog shells
  audit/                        # AuditEvent append-only helper (with rollback pattern)
  prompts/                      # DB-backed prompt versioning abstraction
  cef/                          # CEF wizard state machine (fields TBD from PRD V2 PDF)
workers/                        # BullMQ worker processes
supabase/migrations/            # SQL migrations — DDL lives here ONLY
scripts/                        # seed, evals runner, one-off utilities
tests/                          # vitest unit + integration tests
middleware.ts                   # route-group isolation guard (admissions ↔ wellbeing)
```

## Local development

```bash
pnpm install
cp .env.example .env.local      # fill in keys
pnpm db:reset                   # applies all migrations to local Supabase
pnpm dev                        # Next.js dev server on :3000
pnpm worker                     # BullMQ worker (separate terminal)
```

### Pre-push checks (run locally before pushing)

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm check:isolation            # wellbeing ↔ admissions import firewall
```

The same four checks run in CI (`.github/workflows/ci.yml`). Running
them locally first saves a round-trip.

## Milestones

- **M1** — Auth + CEF wizard + 3-schema DB + BullMQ (~40h) — deadline 2026-04-22
- **M2** — A1 DNA + A0 Intake + ARE v1 + School Readiness + ARK seed (~60h) — deadline 2026-05-15
- **M3** — A5 Essay + HITL queue + GDPR + Student Profile Website + demo (~40h) — deadline 2026-06-10

Session logs and M1 design doc live in the workspace at `admitos-workspace/`.

## Current blockers

- **Q3** — wellbeing isolation mechanism undecided; **proceeding on Option 2 (single Supabase project + separate service roles + middleware guard)** as the Friday default
- Thread 4 PDFs still pending manual download; CEF field schema + final DDL deferred until then
