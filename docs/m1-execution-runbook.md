# M1 day-by-day execution runbook

> **Purpose.** The concrete day-by-day plan Claude Code (or Vaibhav, or
> anyone picking this repo up cold) executes to deliver the Phase 1 / M1
> foundation milestone: auth, CEF, three-schema Supabase, BullMQ, the
> three scaffold deltas, and enough of the training data pipeline to
> exit Week 2 on a green go/no-go.
>
> **Source of truth.** Andy's Full Project Kickoff Brief (2026-04-09
> 15:43 BST) + `docs/training-data-plan.md` + the three scaffold delta
> design docs in `docs/scaffold-deltas/`.
>
> **Status.** Ready to execute the moment Andy approves
> `docs/training-data-plan.md`. Everything in this runbook that is NOT
> marked "post-approval" can start today under the Week 0 gate.
>
> **Owner.** Vaibhav Lalwani, with Claude Code as pair.
>
> **Calendar anchor.** Day 0 = the day Andy replies to the training
> data plan email with the word "approved" (or equivalent). Everything
> else is `Day 0 + N`.

---

## 0. How to use this document

1. Read §1 (rules) before doing anything.
2. Find the current day in §3–§6. Execute everything on that row.
3. At the end of each day, send the WhatsApp update from
   `whatsapp-daily-template.md` using the "Done today" bullets from
   that row.
4. At the end of each week, write the Friday report per Andy's brief.
5. If a go/no-go gate fails, stop and escalate — do NOT carry on to
   the next row hoping it will come right.

## 1. Non-negotiable rules for the whole milestone

These are the rails. Any PR that breaks one of these gets reverted
without discussion.

1. **Week 0 gate is a hard gate.** Until Andy approves
   `docs/training-data-plan.md`, no new *product* code lands against
   the training data surface. Schema migrations, CI jobs, and
   scaffold corrections that don't touch training data are NOT
   gated — see §2 for the allowlist.
2. **The three-schema boundary is sacred.** `admissions`,
   `wellbeing`, and `commons_db` are separate Supabase schemas. No
   cross-schema JOINs. No shared tables. No foreign keys across the
   boundary except the one `commons_db.school(id)` reference.
3. **The `/src/*` seam is enforced in CI.** Once Delta 2 lands,
   every PR runs the `src-layer-boundaries` grep job (see
   `docs/scaffold-deltas/02-src-restructure.md` §CI enforcement).
   Breaking it is a red build.
4. **Banned providers stay banned.** DeepSeek and any future
   additions to `lib/env.ts`'s banned-model list throw at boot. The
   CI grep job enforces it at the repo level. No shortcuts.
5. **No raw training-data post bodies in the repo.** Only hashes and
   metadata. The gold-set scaffold in `tests/fixtures/gold-set/`
   makes this easy to follow — stick to its schema.
6. **Observability day one.** LangSmith + Sentry + PostHog wire-up
   is part of M1, not a "nice to have" saved for later.
7. **Four-check loop before every PR merge:**
   `pnpm typecheck && pnpm test && pnpm lint && pnpm check:isolation`.
   All four green or the PR doesn't merge.
8. **Feature flags for anything risky.** New routes ship behind a
   LaunchDarkly / local env flag if they might leak. Especially true
   for anything that touches the wellbeing surface.

## 2. The Week 0 gate — what's allowed vs what waits

Andy's brief says "before you do anything else" for product work
against the training-data layer. The runbook interprets this narrowly:

### ✅ ALLOWED under the Week 0 gate (parallel work)

- **Delta 1** — Next.js 14 → 15 bump (pure dependency upgrade, cannot
  touch the training-data boundary). Ship this Day 0 or Day 1.
- **Delta 2** — `/src/*` restructure (file-moving refactor; matches
  Andy's brief exactly). Ship this Day 0 through Day 2 as ten small
  PRs.
- **Schema migration drafts** for the three schemas (admissions,
  wellbeing, commons_db). Draft only — do not apply to production
  until Andy green-lights the data plan. Draft files live in
  `supabase/migrations/` with tombstone comments explaining "not
  applied until Week 0 gate lifts".
- **`commons_db.school` seed script** (Day 0.5 deliverable in the
  training plan — this is the unblocker for everything else).
- **Extraction prompt scaffold** (`training_data.extract_profile_v1`)
  drafted in `prompts/` as a shadow-loaded row. No live extraction
  runs until Day 3+.
- **Gold-set labelling infrastructure** (`tests/fixtures/gold-set/`
  already exists — labelling happens on Day 3 anyway).
- **`callLLM` wiring** in `/src/agents/_core/` — part of Phase 1
  scaffolding per the training plan §8.6.
- **CI jobs** (`src-layer-boundaries`, enhanced banned-providers,
  etc.).
- **Documentation** (ADRs, design docs, this runbook).

### ⏸ PAUSED until Week 0 gate lifts

- **Delta 3** — XGBoost hybrid ARE (crosses the training-data
  boundary; the model shape depends on the schema Andy is gating).
  Design doc only until Day 0 of approval.
- **Live scraping runs** — no PRAW/Playwright runs against A2C, CC,
  TSR until Andy signs off.
- **`training_profile` row inserts** — the table may exist (as a
  draft migration) but it gets no rows until approval.
- **Auth, CEF, and BullMQ worker handlers** that read/write the
  training data surface — any product feature that depends on the
  training data schema stays paused.
- **M1 auth / CEF product work** only begins once the gate lifts.
  The scaffold deltas are prep; auth and CEF are the real M1.

---

## 3. Week 0 — days 0 to 0.5 (pre-approval parallel work)

These days run **today and tomorrow**, before Andy's approval. The
goal is to arrive at "Day 0 approved" with the scaffold already
corrected and the infrastructure in place.

### Day 0 (today, 2026-04-09) — send the plan, start the deltas

| Item | Owner | Done when |
| --- | --- | --- |
| Andy email sent (Gmail draft already exists — `r-8206757002027672193`) | Vaibhav | Email sent, thread `19d71be20c52e307` updated |
| Daily WhatsApp update to Andy for today | Vaibhav | Message sent |
| Bundle transferred to Claude Code working dir on local Windows | Vaibhav | `admitos-mvp-platform/` exists in `C:\Users\lalwa\OneDrive\Desktop\claude max work\` |
| Root tombstoned page deleted (`git rm app/page.tsx`) | Claude Code | `git status` clean, `pnpm build` doesn't hit parallel pages error |
| Four-check loop green on baseline | Claude Code | `pnpm typecheck && pnpm test && pnpm lint && pnpm check:isolation` all pass |
| Delta 1 PR opened: Next 14 → 15 bump | Claude Code | PR opened, CI running |

### Day 1 — land Delta 1, start Delta 2

| Item | Owner | Done when |
| --- | --- | --- |
| Delta 1 PR merged | Claude Code | CI green, merged |
| Delta 2 PRs 1–3 opened (empty `/src/` tree, `lib/env.ts` move, `lib/supabase` move) | Claude Code | Each PR CI green |
| Supabase migration drafts committed (admissions, wellbeing, commons_db — see §7) | Claude Code | PR merged with tombstone comment |
| `commons_db.school` seed script drafted | Claude Code | Script compiles; synthetic seed list of 120 rows committed |
| QA validation pass on `docs/training-data-plan.md` done | Claude Code | `docs/training-data-plan-validation.md` exists |
| Daily WhatsApp update to Andy | Vaibhav | Message sent |

### Day 2 — finish the scaffold deltas, prep the extraction prompt

| Item | Owner | Done when |
| --- | --- | --- |
| Delta 2 PRs 4–10 merged (queues split, auth/security/audit, agents chassis, api chassis, workers, app-router shims, CI grep job) | Claude Code | All merged, `src-layer-boundaries` CI job green |
| `training_data.extract_profile_v1` prompt drafted in `/src/agents/_core/prompts/` | Claude Code | Prompt row scaffolded as `active = false` (shadow) |
| `callLLM` router wired with LangSmith trace tags | Claude Code | Synthetic trace appears in LangSmith |
| Delta 3 design doc reviewed one more time and committed as-is (no code) | Vaibhav | `docs/scaffold-deltas/03-are-xgboost-hybrid.md` unchanged but acknowledged in the PR description |
| Daily WhatsApp update to Andy | Vaibhav | Message sent |

### Day 0.5 — the one blocking precondition (runs in parallel with Day 1/2)

| Item | Owner | Done when |
| --- | --- | --- |
| `commons_db.school` seed table populated with ~120 rows (US Top-50 + UK Oxbridge/Top-10 + safety set) | Claude Code + Vaibhav | `select count(*) from commons_db.school` returns ≥ 120 |
| Seed data sourced from IPEDS (US) + UCAS institution register (UK) | Vaibhav | Source CSVs committed under `scripts/seed-data/` |
| `scripts/seed-schools.ts` runs idempotently against a fresh DB | Claude Code | CI runs the script once on `pnpm db:reset` |

**If Andy hasn't replied by end of Day 2, that is fine.** Everything
on Days 0/0.5/1/2 is pre-approval parallel work. Day 3 onward waits
for the green light.

---

## 4. Weeks 1–2 — post-approval M1 core (70% foundation / 30% data)

From here on, every "Day N" is `Day 0 of approval + N`. If Andy
approves on Monday, Day 3 is Tuesday. If he approves Friday, Day 3
is Monday. The runbook is anchored to approval, not to the calendar.

### Day 3 — auth foundation + gold set labelling

| Track | Item | Done when |
| --- | --- | --- |
| M1 foundation | Supabase migrations applied in dev: admissions schema v1 (users, sessions, cef_draft, cef_version, audit_event) | `pnpm db:reset` clean; `supabase db diff` shows zero drift |
| M1 foundation | `/src/services/auth/session.ts` + `/src/api/admissions/auth/signin.ts` wired end-to-end against real Supabase dev | Signin round-trip works in Postman; CSRF + rate-limit both enforced |
| M1 foundation | Row-level security policies drafted for admissions.users + admissions.cef_draft | Policy tests green in `tests/db/rls.test.ts` |
| Data pipeline | Gold set labelling: 200 posts hand-labelled by Vaibhav, committed to `tests/fixtures/gold-set/gold-set-v1.jsonl` | Schema validation passes; 200 rows present |
| Data pipeline | Extraction prompt tuned against gold set; false-accept rate measured | `scripts/calibrate-extraction.py` report committed; thresholds pinned in a new ADR |

### Day 4 — CEF skeleton + first live scrape test

| Track | Item | Done when |
| --- | --- | --- |
| M1 foundation | CEF wizard scaffold: `/src/api/admissions/cef/submit.ts` + autosave route handlers | Autosave round-trip works end-to-end in dev |
| M1 foundation | `/src/db/admissions/cef.ts` — typed repo functions for draft read/write | Unit tests green |
| Data pipeline | Reddit A2C scraper live in dev, PRAW rate-limited (1 req/2s), writing to `scrape_requests` table | 50 test posts scraped, extracted, inserted without a plausibility reject |

### Day 5 — go/no-go gate 1

| Track | Item | Done when |
| --- | --- | --- |
| M1 foundation | CEF wizard page 1 (basic profile) UI live, autosave wired | Manual smoke test green |
| M1 foundation | BullMQ worker registry scaffold in `/src/workers/` | `pnpm worker` boots, connects to dev Redis |
| Data pipeline | Chanceme scraper live; 300 records inserted across A2C + Chanceme | Coverage dashboard shows 300 rows |
| **GATE** | **Go/no-go check 1 — Andy reviews coverage and rejection rate** | **Andy says continue or revise** |

### Day 6 — worker handlers + CEF page 2

| Track | Item | Done when |
| --- | --- | --- |
| M1 foundation | First BullMQ worker handler: `ingest_cef_submission` | Handler dispatches on queue push; idempotent |
| M1 foundation | CEF wizard page 2 (academic profile) UI live | Autosave wired |
| Data pipeline | A2C back-catalogue scrape in progress | Running 1,200 req/hr without errors |

### Day 7 — CEF pages 3–4 + observability pass

| Track | Item | Done when |
| --- | --- | --- |
| M1 foundation | CEF wizard pages 3 (ECs) and 4 (schools) live, autosave wired | Manual smoke test green |
| M1 foundation | Sentry error tracking confirmed wired: a test error surfaces in Sentry UI | Test error visible in Sentry dashboard |
| M1 foundation | PostHog analytics confirmed wired: a test event surfaces in PostHog UI | Test event visible |
| Data pipeline | A2C + Chanceme total ~900 records | Coverage dashboard |

### Day 8 — CEF pages 5–6 + CC scraper prep

| Track | Item | Done when |
| --- | --- | --- |
| M1 foundation | CEF wizard pages 5 (essays slots) and 6 (review) live | Manual smoke test green |
| M1 foundation | CEF submit path dispatches a BullMQ job | End-to-end: submit in UI → worker processes |
| Data pipeline | CC scraper scaffold built in Playwright (not yet run) | Script runs against a single test URL |

### Day 9 — CC scraper live

| Track | Item | Done when |
| --- | --- | --- |
| M1 foundation | Auth session management edge cases: logout, session expiry, concurrent tabs | All three manual smoke tests green |
| M1 foundation | CSRF + rate-limit tests expanded to cover CEF autosave | Test suite green |
| Data pipeline | CC scraper live, first 200 records inserted | Coverage dashboard shows CC rows |

### Day 10 — go/no-go gate 2 + **M1 half-mark**

| Track | Item | Done when |
| --- | --- | --- |
| M1 foundation | Auth + CEF end-to-end smoke test documented in `docs/smoke-tests/m1-week2.md` | Documented and executed clean |
| M1 foundation | Four-check loop + full E2E playwright suite green | CI green on `main` |
| Data pipeline | 1,500 records across A2C + Chanceme + CC | Coverage dashboard |
| **GATE** | **Go/no-go check 2 — Andy reviews coverage, rejection rate, and M1 half-mark** | **Andy says continue or revise** |
| **WEEKLY** | **Friday report to Andy: M1 half-mark, data pipeline status, risks, next week plan** | Report sent by 17:00 BST Friday |

---

## 5. Weeks 3–4 — the capacity flip (30% foundation / 70% data)

At Day 10 M1 foundation is half-done. By Day 14 it should be
fully done. Weeks 3–4 are where the training data pipeline
catches up, ARE integration starts, and Delta 3 finally lands.

### Day 11 — M1 foundation finishing work

| Track | Item | Done when |
| --- | --- | --- |
| M1 foundation | Role guards: student, counsellor, admin | Unit tests green |
| M1 foundation | `/src/api/admissions/auth/signout.ts` hardened | Session deletion audited |
| Data pipeline | CC back-catalogue in progress | 2,500 US records total |

### Day 12 — audit event rollup + wellbeing isolation tests

| Track | Item | Done when |
| --- | --- | --- |
| M1 foundation | `audit_event` aggregation query tested against ≥ 10k synthetic rows | Query returns in < 200ms |
| M1 foundation | Wellbeing isolation guard tested against 12 attack vectors from `docs/isolation-model.md` | All 12 rejected at middleware |
| Data pipeline | CC back-catalogue continues | 3,200 US records |

### Day 13 — Delta 3 first PR + UK scraper prep

| Track | Item | Done when |
| --- | --- | --- |
| M1 foundation | `/src/agents/are/` module scaffold with stub `runAre()` (returns hard-coded `developing`) — Delta 3 PR 1 | CI green, merged |
| M1 foundation | Statistical-prior fallback `predict()` — Delta 3 PR 2 | Brier-score unit test green |
| Data pipeline | TSR scraper scaffold | Script runs against single test URL |

### Day 14 — **M1 foundation DONE** + go/no-go gate 3 (data)

| Track | Item | Done when |
| --- | --- | --- |
| M1 foundation | Full M1 definition of done checklist green (see §8) | All items checked |
| M1 foundation | `docs/m1-complete.md` written and committed | PR merged |
| Data pipeline | 4,000 US records, TSR scraper live, first 500 UK records | Coverage dashboard |
| **GATE** | **Go/no-go check 3 — Andy reviews US ≥ 4,500, UK progress, and M1 completion** | **Andy signs off on M1, greenlights first XGBoost training run** |
| **WEEKLY** | **Friday report to Andy: M1 complete, data pipeline on track** | Report sent |

### Day 15 — Delta 3 ramp + CEF ARE preview wiring

| Track | Item | Done when |
| --- | --- | --- |
| ARE integration | `are.explain_v1` prompt drafted + Haiku call wired (shadow mode) | Shadow trace in LangSmith |
| ARE integration | `/src/api/admissions/are/preview` route handler (returns stub label) | Smoke test green |
| Data pipeline | CC + TSR run in parallel, 4,500 US + 800 UK | Coverage dashboard |

### Day 16 — `are_cache` + UK finish

| Track | Item | Done when |
| --- | --- | --- |
| ARE integration | `admissions.are_cache` migration + `/src/db/admissions/are-cache.ts` helpers | Round-trip cache test green |
| Data pipeline | UK coverage to 1,000 records | Coverage dashboard |

### Day 17 — first training run prep

| Track | Item | Done when |
| --- | --- | --- |
| ARE integration | `calibrate-labels.ts` written with placeholder thresholds | Unit tests green for all 4 labels |
| Data pipeline | 5,000 US minimum hit | Coverage dashboard |
| Data pipeline | Training pipeline repo (`admitos-training-pipeline`) confirmed green | CI passing |

### Day 18 — first XGBoost training run (repo side)

| Track | Item | Done when |
| --- | --- | --- |
| ARE integration | First XGBoost training run executed in `admitos-training-pipeline` | `models/xgboost-are-v0.1.json` produced, metrics committed |
| ARE integration | Calibration curve committed to `admitos-training-pipeline/reports/` | Brier ≤ 0.20, deciles within ±0.05 |

### Day 19 — ONNX export + ARE serving layer

| Track | Item | Done when |
| --- | --- | --- |
| ARE integration | ONNX export + SHAP explainer saved alongside | Both artifacts in Supabase Storage `models/` bucket |
| ARE integration | `onnxruntime-node` wired in `/src/agents/are/predict.ts` | Real model loaded at boot; stub replaced |
| ARE integration | Label boundaries pinned in an ADR based on first training run calibration | ADR committed |

### Day 20 — end-to-end ARE smoke test

| Track | Item | Done when |
| --- | --- | --- |
| ARE integration | CEF → ARE preview → Haiku explanation → UI label happy path green | Full E2E smoke test documented and passing |
| ARE integration | Zero-percentages unit test on the API response envelope | Test green (response contains no numeric probability) |
| Data pipeline | Weekly coverage report to Andy | Report sent |

### Day 21 — go/no-go gate 4 + **end of Week 4**

| Track | Item | Done when |
| --- | --- | --- |
| **GATE** | **Go/no-go check 4 — Andy signs off on model quality for V1** | **Andy says "ship" or "retrain"** |
| **WEEKLY** | **Friday report to Andy: M1 done, data pipeline complete, XGBoost V0.1 trained, ARE integration end-to-end** | Report sent |

---

## 6. Week 5 and beyond (short preview — not in the M1 scope)

M1 ends at Day 14. The data pipeline and ARE integration work
continuing to Day 21 is the M2/M3 ramp. This runbook is explicitly
scoped to M1 + data pipeline. Week 5 M3 (A5 Essay agent + Adie
chat + counsellor dashboard live) is a separate runbook.

---

## 7. Supabase migration order and drafts

The three-schema DB is a hard preconditional dependency for almost
everything else. Here is the order the migrations land, and what
each one contains. Drafts live in `supabase/migrations/` with a
file-level comment explaining "not applied until Week 0 gate lifts"
for anything that touches the training data surface.

### 7.1 Migration order

| Order | File | Schema | Gate |
| --- | --- | --- | --- |
| 1 | `00000000000001_admissions_core.sql` | `admissions` | Parallel-safe |
| 2 | `00000000000002_wellbeing_core.sql` | `wellbeing` | Parallel-safe |
| 3 | `00000000000003_commons_db_core.sql` | `commons_db` | Parallel-safe |
| 4 | `00000000000004_commons_db_schools_seed.sql` | `commons_db` | Parallel-safe (this is the Day 0.5 precondition) |
| 5 | `00000000000005_admissions_cef.sql` | `admissions` | Parallel-safe |
| 6 | `00000000000006_admissions_audit_event.sql` | `admissions` | Parallel-safe |
| 7 | `00000000000007_admissions_training_profile.sql` | `admissions` | **Gated** — draft only until Andy approves data plan |
| 8 | `00000000000008_admissions_extraction_audit.sql` | `admissions` | **Gated** (same) |
| 9 | `00000000000009_admissions_scrape_requests.sql` | `admissions` | **Gated** (same) |
| 10 | `00000000000010_admissions_are_cache.sql` | `admissions` | Parallel-safe (doesn't touch data plan) |
| 11 | `00000000000011_wellbeing_session_log.sql` | `wellbeing` | Parallel-safe |
| 12 | `00000000000012_rls_policies.sql` | all three | Parallel-safe |

See `supabase/migrations/DRAFTS.md` for the actual DDL drafts
(committed to the repo under that name so they don't accidentally
run in `pnpm db:reset`).

### 7.2 Key constraints to carry forward from the training data plan

- `training_profile.sat_score`: `check (sat_score between 400 and 1600 and sat_score % 10 = 0)`
- `training_profile.extraction_confidence`: `check (extraction_confidence between 0 and 1)`
- `training_profile.source_platform`: `check (source_platform in ('reddit_a2c','reddit_chanceme','reddit_6thform','reddit_ukuniversities','cc','tsr'))`
- `extraction_audit.overall_confidence`: `check (overall_confidence between 0 and 1)`
- `admission_outcome`: `check (admission_outcome in ('admitted','waitlisted','rejected'))` — `deferred` and `withdrawn` are dropped at ingest, not stored
- `training_profile.target_school_id` → FK `references commons_db.school(id)`

---

## 8. M1 definition of done (Day 14 checklist)

M1 is done when all of the following are green on `main`:

- [ ] Delta 1 merged: Next.js 15 + React 19, `pnpm build` clean, no deprecation warnings
- [ ] Delta 2 merged: `/src/{api,services,agents,workers,db}` layout, `src-layer-boundaries` CI green
- [ ] Delta 3 PRs 1–2 merged: ARE stub + statistical-prior fallback (XGBoost model not required for M1)
- [ ] Supabase migrations 1–6, 10, 11, 12 applied in dev; migrations 7–9 exist as drafts only if data plan still gated
- [ ] `commons_db.school` seed populated (≥ 120 rows)
- [ ] Auth end-to-end: signin, signout, session persistence, CSRF, rate-limit
- [ ] CEF wizard: 6 pages, autosave wired, submit dispatches a BullMQ job
- [ ] Worker registry: `pnpm worker` boots, connects to Redis, processes the CEF ingest job idempotently
- [ ] Audit event pipeline: every mutating route writes an `audit_event` row
- [ ] RLS policies: applied to all user-facing tables, tested via `tests/db/rls.test.ts`
- [ ] Wellbeing isolation: middleware guard tested against the 12 attack vectors in `docs/isolation-model.md`
- [ ] Observability wired: Sentry test error visible, LangSmith test trace visible, PostHog test event visible
- [ ] Banned providers CI job green
- [ ] Cross-surface imports CI job green
- [ ] `src-layer-boundaries` CI job green
- [ ] Four-check loop green: `pnpm typecheck && pnpm test && pnpm lint && pnpm check:isolation`
- [ ] Full Playwright E2E suite green
- [ ] `docs/m1-complete.md` written, committed, and linked from the Friday Day 14 report

---

## 9. Risk register for the M1 window

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| Andy doesn't approve the data plan by Day 2 | Medium | High — blocks Day 3+ data work | Parallel scaffold deltas (Days 0–2) mean M1 foundation is still progressing; runbook adjusts by pushing "Day 0" rightward without rework |
| Delta 2 PR 5 (bulk services move) breaks more than expected | Low | Medium — 20 min rework per broken PR | Ten small PRs instead of one big-bang; each reverts independently |
| CC scraper hits rate-limit blocks before back-catalogue done | Medium | High — delays 4,000 US records | Rate ceiling at 1 req/3s, throughput math in training plan §3.3.1, daily acceptance-rate alert in §6.2 |
| XGBoost Brier > 0.25 on first training run | Medium | Medium — ships statistical-prior fallback instead, delays true ARE | Fallback seam in `predict.ts` is ready Day 13; swap is 1 PR |
| Wellbeing isolation guard catches a late bug | Low | Critical | 12-vector test suite runs on every PR; manual pen test at Day 12 |
| RLS policy gap leaks CEF drafts cross-user | Low | Critical | `tests/db/rls.test.ts` covers every user-facing table; run on every migration |
| Supabase dev env drift between Vaibhav and Claude Code | Medium | Low | `pnpm db:reset` is the single source of truth; run at start of each day |
| Vaibhav capacity hit by something external (visa, illness) | Low | High | Daily WhatsApp update catches it within 24h; Andy can pull in Simon if needed |

---

## 10. Handoff contract with Claude Code

Claude Code runs on Vaibhav's Windows machine. The contract between
this runbook (authored in the Cowork session) and Claude Code (which
executes it) is:

1. **Cowork authors design.** This runbook, the training data plan,
   the delta design docs, the QA findings, and the migration drafts
   are all authored in Cowork.
2. **Claude Code executes.** Claude Code reads these docs, writes
   the actual code, runs the four-check loop, opens the PRs, and
   writes commits.
3. **Vaibhav coordinates.** Vaibhav reads both sides, resolves
   questions, talks to Andy, and mirrors updates from WhatsApp
   into both sessions.
4. **When Claude Code finishes a day.** Claude Code commits, runs
   the four-check loop green, and WhatsApps Vaibhav the status.
   Vaibhav then tells the Cowork session so it can cross the day's
   items off the runbook.
5. **When Cowork produces a new artifact.** Cowork saves to
   `/sessions/vibrant-magical-babbage/mnt/outputs/admitos-mvp-platform/`
   and the artifact appears in the next bundle rebuild. Vaibhav
   re-transfers the bundle when it's worth doing (typically once
   per day, or when a big new artifact lands).
6. **The outputs folder on Windows is the executable copy.** The
   Cowork copy is the design surface. If they diverge, Claude Code's
   copy wins (it's the one that's been tested). Cowork re-absorbs
   the delta before the next design pass.

---

## 11. What to do if you're reading this cold

If you (future me, or Claude Code after a restart) are picking this
up without context:

1. Start at `docs/training-data-plan.md` — read it end-to-end. That
   is the Andy-approved contract the whole milestone sits on.
2. Then read `docs/scaffold-deltas/01-next14-to-15.md`,
   `02-src-restructure.md`, and `03-are-xgboost-hybrid.md` in order.
3. Then read this runbook §1–§2 — the rules and the gate.
4. Then figure out what day you're on. Check `git log --oneline | head -30`
   to see what's already done, and cross-reference against §3–§5.
5. Pick up from the first uncompleted row. If the gate hasn't lifted
   yet, you're capped at §3 (Week 0 parallel work).
6. When in doubt, stop and WhatsApp Vaibhav. Do not improvise on the
   rules in §1.

---

— Vaibhav (authored in Cowork, 2026-04-09)
