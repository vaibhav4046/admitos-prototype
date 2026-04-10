---
# Training data plan — fresh validation pass (Claude Code, Day 0)

> **Purpose.** Second independent pass over `docs/training-data-plan.md` v3 against Andy's 2026-04-09 15:43 BST kickoff brief, *after* the `training-data-plan-qa-findings.md` fixes were already applied. The goal is to catch anything a third reviewer (Andy) would bounce the plan for that the first QA pass missed.
>
> **Scope.** This is NOT a re-review of the items in `training-data-plan-qa-findings.md`. All 12 findings in that doc (B1–B3, S1–S9) have been verified as applied in v3. This pass is **only new findings**.
>
> **Method.** Read the plan section-by-section against Andy's required-fields list and required-sections list from the brief, then sweep for schema gaps, cross-doc drift against `docs/m1-execution-runbook.md`, and internal consistency between §8 detail and §11 summary.
>
> **Severity key.** 🔴 blocker / 🟡 should-fix / 🟢 nice-to-have.

## Summary

- **2 blocker-severity findings** — both internal consistency bugs Andy will notice on a careful read. Fix before sending.
- **5 should-fix findings** — four schema gaps (one of which is load-bearing for Day 0.5) plus one cross-doc drift between runbook and plan. Fix in the same pass as the blockers.
- **4 nice-to-have findings** — polish, park if time-boxed.

Andy's brief required-fields list (10 fields) and required-sections list (5 sections: scraping sources/methodology, data quality/cleaning, schema/validation, coverage monitoring, timeline) are all present and correctly wired. The plan is substantively ready — this pass is finding paper-cuts, not re-opening the data schema.

Estimated cost of the full patch pass: **20–30 minutes** of focused editing on top of what v2 QA already flagged.

---

## Verification of v2 QA findings (confirm applied in v3)

| Finding | Applied in v3? | Where |
| --- | --- | --- |
| B1 — capacity conflict | ✅ | §8.0 now exists with the 70/30 Weeks 1–2 split and revised record targets (300/1,500 instead of 500/2,000) |
| B2 — `commons_db.school` seed precondition | ✅ | §8.1 Day 0.5 row; §9 Q7 |
| B3 — perfect-stats heuristic removed | ✅ | §4.4 final paragraph |
| S1 — SAT step of 10 enforced | ✅ | §5.1 DDL `check (sat_score between 400 and 1600 and sat_score % 10 = 0)` |
| S2 — confidence bounds | ✅ | §5.1 DDL `check (extraction_confidence between 0 and 1)` and `check (overall_confidence between 0 and 1)` |
| S3 — `source_platform` enum check | ✅ | §5.1 DDL `check (source_platform in ('reddit_a2c','reddit_chanceme','reddit_6thform','reddit_ukuniversities','cc','tsr'))` |
| S4 — HMAC pepper language | ✅ | §2.2 bullet 2 |
| S5 — deferrals/withdrawn dropped at ingest | ✅ | §2.1 `admission_outcome` row |
| S6 — class balance threshold | ✅ | §6.2 table row "> 90% of records are one outcome class" |
| S7 — Option B replaced with "scale gold set" | ✅ | §10 Option B |
| S8 — CC throughput math | ✅ | §3.3.1 |
| S9 — isolation-forest baseline threshold | ✅ | §4.5 "≥1,500 records" rule |

All 12 v2 findings are correctly applied. No regressions.

---

## 🔴 New blockers (2)

### NB1. §11 summary says gate 4 is Day 20 — §8.5 detail says Day 21

**Where:** §11 line 637: *"go/no-go checks at Days 5 / 10 / 15 / 20"* vs §8.5 Day 21 row *"**Go / no-go check 4** — hand off the trained model to the ARE integration work"*.

**Problem:** §11 is the "skim in 30 seconds" summary Andy will read first. It lists gate 4 at Day 20. §8.5 detail puts the first training run on Day 20 and the gate on Day 21. Andy reads the summary, expects gate 4 on Day 20, then hits the §8.5 detail and has to reconcile the discrepancy himself. This is exactly the kind of internal inconsistency Andy's brief called out as "surprises are not welcome". The unblock cheat sheet claimed this was fixed in v3; it was not.

**Fix:** Change the last two phrases of §11 to read: *"first training run Day 20, go/no-go checks at Days 5 / 10 / 15 / 21"*. One-character fix (20 → 21 in the last position).

### NB2. `commons_db.school` table schema is referenced but never defined

**Where:** §5.1 DDL has `target_school_id uuid not null references commons_db.school(id)` and §8.1 Day 0.5 row says "populate `commons_db.school` with ~120 rows", but nowhere in the plan is the `commons_db.school` column list specified. What is the primary key? Does it have a `name`? `country`? `is_top_50_us` / `is_top_10_uk` flags? An `admit_rate_cds` reference value?

**Problem:** The whole Day 0.5 precondition is "populate the school table" but nobody knows what columns to populate. Vaibhav cannot write `scripts/seed-schools.ts` without guessing, and guessing wrong means the seed needs to be re-run later — which is fine for dev but bad optics for Andy who explicitly said "the data schema decisions made now cannot be changed retroactively without re-scraping everything". The `commons_db.school` schema IS one of those decisions, even though it sits in `commons_db` not `admissions`.

**Fix:** Add a new §5.1.1 (or inline in §5.1) with the `commons_db.school` DDL. Suggested minimum:
```sql
create table commons_db.school (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,           -- stable identifier: 'harvard', 'oxford-uni'
  name            text not null,                  -- display name
  country         text not null check (country in ('us','uk')),
  tier            text not null check (tier in ('us_top_50','uk_top_10','safety')),
  admit_rate_cds  numeric(4,3) null,              -- from Common Data Set, for regional prior
  ipeds_unitid    integer null,                   -- US IPEDS reference
  ucas_code       text null,                      -- UK UCAS reference
  created_at      timestamptz not null default now()
);
create index school_country_tier_idx on commons_db.school(country, tier);
```
The schema can be argued, but *something* needs to exist before Day 0.5 scripting starts. Ask Andy for sign-off on the column list in the same round as the plan approval.

---

## 🟡 New should-fix (5)

### NS1. Missing DB-level unique constraint on `(source_uri, target_school_id)` in `training_profile`

**Where:** §5.1 DDL and §5.3 pre-insert check 3.

**Problem:** §5.3 enforces "no duplicate `(source_uri, target_school_id)` in `training_profile`" in application code via a pre-insert SELECT. This is a TOCTOU race under concurrent workers — two scrapers processing the same post simultaneously can both pass the check and both insert. BullMQ workers are concurrent by design.

**Fix:** Add `unique(source_uri, target_school_id)` (or a unique index) to the `training_profile` DDL. Belt-and-braces: keep the app-level check for early rejection, but the DB is the only reliable chokepoint.

### NS2. Runbook vs plan drift — gate 3 and first XGBoost run days disagree

**Where:** `docs/m1-execution-runbook.md` §5 Day 14 (gate 3) and Day 18 (first XGBoost run) vs `docs/training-data-plan.md` §8.4 Day 15 (gate 3) and §8.5 Day 20 (first XGBoost run).

**Problem:** Andy will read both docs. The plan is the Week 0 contract. The runbook is the day-by-day execution plan. If they drift by 1–2 days on the gate schedule, Andy will question which one is authoritative. The plan is the contract — the runbook should be aligned to it, not vice versa.

**Fix:** Update `docs/m1-execution-runbook.md` §5:
- Day 14 row: drop "Go/no-go check 3" — that's Day 15 per the plan. Day 14 stays as "M1 foundation DONE" only.
- Add a Day 15 row: "Go/no-go check 3 — Andy reviews US ≥ 4,500, UK progress, and M1 completion".
- Day 18 row: move "First XGBoost training run" to Day 20 to match §8.5.
- Day 19 row: shift content to Day 20 (or accept a 2-day slack).

Alternatively: update the plan §8.4/§8.5 to match the runbook's Day 14 / Day 18 schedule, and have it signed off by Andy that way. The runbook's tighter schedule is actually more conservative for Andy's sign-off window — I have a mild preference for this approach.

**Recommendation:** pick one authoritative calendar, update the other. Before sending the plan to Andy.

### NS3. Materialized views in §6.1 don't state which schema they live in

**Where:** §6.1 lists three MVs (`coverage_by_school`, `coverage_by_major`, `coverage_by_outcome_region`) but doesn't qualify them with a schema.

**Problem:** The three-schema isolation rule says no cross-schema references. If these MVs are in a default/public schema and read from `admissions.training_profile`, they either violate the isolation rule at the SQL layer or they have to live inside `admissions`. Unstated, which means a reviewer has to ask.

**Fix:** Add one line to §6.1: *"All three MVs live in the `admissions` schema and are refreshed by a nightly BullMQ job in `/src/workers/handlers/refresh-coverage-views.ts`."*

### NS4. §7 refers to `commons_db.gdpr_actions` — table existence unstated

**Where:** §7 takedown pipeline writes to `commons_db.gdpr_actions`.

**Problem:** This is the second unspecified `commons_db.*` table in the plan (the first being `commons_db.school`). If the table doesn't exist yet, it's another precondition that needs to be scheduled. If it does exist, the plan should say so and cite where it's defined.

**Fix:** Either (a) add `commons_db.gdpr_actions` to the §5 DDL block, or (b) add a line to §7 saying "see `supabase/migrations/00000000000003_commons_db_core.sql` for the `gdpr_actions` DDL" once the migrations are in place. Note: `supabase/migrations/DRAFTS.md` should also be cross-checked for this.

### NS5. Extraction prompt has no max input length or truncation policy

**Where:** §4.2 "Haiku 4.5, temperature 0, max tokens 1200".

**Problem:** `max_tokens` bounds the **output**, not the input. A very long A2C post (some megathread comments are >10k tokens) would blow past Haiku's context window or waste tokens with a malformed extraction. The plan doesn't say how the extraction pipeline handles oversize inputs.

**Fix:** Add to §4.2: *"Input posts are truncated to 6,000 characters (~1,500 tokens) at the head of the post; anything longer is truncated with an `[...truncated]` marker. Posts exceeding 30,000 characters are dropped outright and logged to `extraction_audit` with `status='rejected_oversize'` (add this to the enum)."* This also requires updating the `status` enum in §5.1 DDL to include `rejected_oversize`.

---

## 🟢 New nice-to-have (4)

### NN1. `source_hash` column does not record hash algorithm

**Where:** §5.1 `source_hash bytea not null` on both `training_profile` and `extraction_audit`.

**Recommendation:** Add `source_hash_algo text not null default 'sha256'` so a future migration to a different hash algorithm is traceable. Free and costs nothing now.

### NN2. Redundant `sat_or_act_provided` generated column + `must_have_sat_or_act` check

**Where:** §5.1 `training_profile` DDL has both `sat_or_act_provided boolean generated always as (sat_score is not null or act_score is not null) stored` AND `constraint must_have_sat_or_act check (sat_score is not null or act_score is not null)`.

**Recommendation:** Drop one. The check constraint alone is the cleaner choice because the generated column doesn't need to be queried directly (no view depends on it in the current plan). If the column is wanted for query ergonomics, keep both — but mention why in an inline comment.

### NN3. Duplicate detection key wording inconsistent between §4.5 and §5.3

**Where:** §4.5 says "uniquely keyed by a hash of the source post ID + the target school"; §5.3 check 3 says "`sha256(candidate.source_uri + candidate.target_school_id)`".

**Recommendation:** For Reddit these are interchangeable (URL embeds post ID); for CC/TSR they may not be. Standardize on `source_uri` throughout — it's what the DB stores. One-line wording fix in §4.5.

### NN4. `per_field_confidence` jsonb in `extraction_audit` has no documented schema

**Where:** §5.1 `per_field_confidence jsonb not null`.

**Recommendation:** Note inline that the JSONB is `{ "<field_name>": <0.0–1.0>, ... }` with exactly the required-field keys from §2.1. This helps future analytics queries and enables a future check constraint on key shape.

---

## Recommended actions before sending to Andy

In priority order:

1. Fix **NB1** — 20 → 21 in §11 summary. **One-character fix.**
2. Fix **NB2** — add `commons_db.school` DDL to §5.1 (or as §5.1.1). **~10 minutes, needed to unblock Day 0.5.**
3. Fix **NS1** — add `unique(source_uri, target_school_id)` to `training_profile` DDL. **~1 minute.**
4. Fix **NS2** — reconcile runbook and plan calendar drift. Recommend updating runbook §5 to match plan §8.4/§8.5. **~5 minutes.**
5. Fix **NS3** — state MV schema in §6.1. **~1 minute.**
6. Fix **NS4** — add `commons_db.gdpr_actions` to §5 DDL or cross-reference a migration. **~5 minutes.**
7. Fix **NS5** — add input length policy + `rejected_oversize` status enum. **~5 minutes.**
8. Consider **NN1** — add `source_hash_algo`. **Free.**
9. Consider **NN2–NN4** — park unless you want the polish.

**Total estimated fix time: 20–30 minutes**, most of which is NB2 (`commons_db.school` schema decision). If NB2 is a 2-minute decision, the whole pass is 10 minutes.

**Not in scope of this pass:**
- Re-opening decisions already settled in v2 (capacity split, thresholds, source list, heuristic removal).
- Quibbles about tone or wording that don't affect Andy's decision.
- Anything that would change the schema Andy is about to sign off on.

---

## Open questions this pass surfaces (for Vaibhav, not Andy)

1. For **NS2**, which calendar do you want authoritative — the runbook's tighter (Day 14/18) schedule or the plan's (Day 15/20) schedule? I recommend the plan's, since it's the document Andy approves, and backport the runbook.
2. For **NB2**, do you want to ship my suggested `commons_db.school` schema as-is, or do you want to define it yourself first? Mine is a reasonable starting point but you know the AdropEDU context better.
3. Per the runbook §3 Day 1 row, this validation doc is the deliverable. WhatsApp me (via Vaibhav) if you want a re-pass after the fixes land.

— Claude Code, 2026-04-09 (v3 bundle extracted)
