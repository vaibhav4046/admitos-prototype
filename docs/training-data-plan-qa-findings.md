# QA validation pass — `docs/training-data-plan.md`

> **Purpose.** Second-pass review of the Week 0 training data plan against Andy's Full Project Kickoff Brief. Looking for gaps, weak justifications, missing edge cases, and anything a sharp reviewer would bounce the plan for. Every finding below has a **severity** (🔴 blocker / 🟡 should-fix / 🟢 nice-to-have) and a **suggested fix**.
>
> **Scope.** Read as "the author's own ruthless second pass" — nothing here is a re-write request, each finding is a surgical change.

---

## Summary

- **3 blocker-severity findings** — should be fixed before Andy sees v1.
- **9 should-fix findings** — fix in v1 if cheap, otherwise in v2 after Andy's review.
- **6 nice-to-have findings** — park for later, mention if asked.

The plan is structurally sound. The data flow, the schema, the confidence thresholds, the audit surfaces, the timeline, the go/no-go gates, and the failure-mode section all hold up. Fixing the three blockers below is what takes it from "solid draft" to "ready for Andy's signature".

---

## 🔴 Blockers (3)

### B1. Weeks 1–2 capacity conflict with Andy's M1 foundation milestone
**Where:** §8.2 + §8.3 (Week 1: 500 records, Week 2: 2,000 records) vs. Andy's brief (Weeks 1–2 = M1 foundation milestone — auth, CEF, 3-schema DB, BullMQ).

**Problem:** Both the training data pipeline and the Phase 1 application foundation are scheduled on the same calendar weeks, and both have Vaibhav as the single owner. The plan does not acknowledge this overlap. Andy will notice immediately and the plan will bounce on capacity grounds before he even reads §4.

**Fix:** Add a new §8.0 "Capacity and parallel tracks" subsection that states explicitly:
- The pipeline repo (`unioffer-training-pipeline`) is a separate codebase and can accept capacity from 30% of the working day during Weeks 1–2.
- The 70% remaining capacity goes to M1 foundation work in the main app repo.
- Given that split, the Week 1 target is **300 records** (not 500) and the Week 2 target is **1,500 records** (not 2,000).
- Coverage catches up in Weeks 3–4 when M1 is behind us.
- Alternatively: Andy can choose to delay M1 by one week to let Week 1 be a pure data-collection burst. This is his call, not mine, and I should ask it explicitly as a sixth open question in §9.

### B2. `commons_db.school` table is an unacknowledged precondition
**Where:** §2.1 `target_school_id` field + §5.1 FK `references commons_db.school(id)` + §5.3 pre-insert check #2.

**Problem:** The entire pipeline assumes the `commons_db.school` table exists with every US Top-50 and UK Top-10 school pre-populated. The plan never states this assumption, never says who populates it, and never says when. If Andy signs off the plan on Day 0 and I start scraping on Day 4, I hit the first FK violation and the scraper halts.

**Fix:** Add a new Day 0.5 deliverable to §8.1:
> Day 0.5 | `commons_db.school` seed table populated with the 50 US Top-50 + 10 UK Oxbridge/Top-10 + 60 additional Top-100 safety schools (120 rows). Source: IPEDS for US + UCAS institution register for UK. One-time seed script committed to the app repo. | School rows queryable via `select count(*) from commons_db.school` returning ≥120

Then add a line to the §9 open questions: "Do you already have a canonical school list, or do I assemble one from IPEDS + UCAS?"

### B3. "Perfect stats + rejection" flag is a weak heuristic that will drop real students
**Where:** §4.4 final bullet — *"No record has 'perfect' stats + a rejected outcome at a school with >30% admit rate (likely troll/fake) — flagged for manual review, not auto-rejected"*.

**Problem:** This heuristic embeds a belief that doesn't hold. Real students with perfect stats absolutely do get rejected at Top-50 schools, and the presence of them in the training set is exactly what the XGBoost model needs in order to learn that stats are necessary but not sufficient. The 30% admit-rate threshold doesn't fix this — the entire US Top-50 has schools above 30% admit rate (Wisconsin-Madison, UIUC, UT Austin) where perfect-stat rejections are real and informative.

Also, "manual review not auto-rejected" sounds defensible on paper but in practice with 6,000 records there will be no manual review — the queue will silently grow and these rows will never land in the training set.

**Fix:** Remove the heuristic entirely. Replace with: *"No hard heuristic on stats-vs-outcome mismatch. The isolation forest in §4.5 is the only outlier filter and its top 1% is reviewed weekly, not rejected. We accept that some fake records will leak through; the alternative is silently biasing the training set toward the model's preconceptions."*

---

## 🟡 Should-fix (9)

### S1. SAT "step of 10" not enforced in the schema
**Where:** §4.4 plausibility check says "`sat_score`... step of 10" but §5.1 DDL only has `check (sat_score between 400 and 1600)`.

**Fix:** Add `and sat_score % 10 = 0` to the CHECK constraint. Pair with a plausibility rule that rounds to the nearest 10 before insert so a `1499` doesn't get rejected — it gets corrected.

### S2. `extraction_audit.overall_confidence` allows negative values
**Where:** §5.1 — `overall_confidence numeric(3,2) not null`. `numeric(3,2)` gives range -9.99 to 9.99.

**Fix:** Add `check (overall_confidence between 0 and 1)`. Same treatment for `extraction_confidence` on `training_profile`.

### S3. `source_platform` has no check constraint — free text will accumulate typos
**Where:** §5.1 — `source_platform text not null`.

**Fix:** Add a CHECK constraint with the initial allowed set: `check (source_platform in ('reddit_a2c','reddit_chanceme','reddit_6thform','reddit_ukuniversities','cc','tsr'))`. When we add new sources we do it via migration, intentionally, with Andy's visibility.

### S4. Reddit username "hashing" is pseudonymization, not anonymization
**Where:** §2.2 — "Reddit usernames are hashed at ingest and the raw username is never stored."

**Problem:** A SHA-256 of a Reddit username is reversible via rainbow table — someone with the hash can confirm membership. The current language implies stronger protection than we offer.

**Fix:** Two changes:
(a) Use an HMAC with a secret pepper, not a plain hash. Secret lives in env, never in the repo.
(b) Rewrite the §2.2 bullet to say: "Reddit usernames are HMACed with a secret pepper at ingest; this resists bulk rainbow-table attacks but is not true anonymization."

### S5. `admission_outcome` enum doesn't handle deferred-then-decided or withdrawn
**Where:** §2.1 — `admission_outcome` enum is `admitted | waitlisted | rejected`, with "Deferrals mapped to `waitlisted`".

**Problem:** In US admissions, "deferred" means the ED/EA application was pushed to RD and decided then — it is *not* the same as waitlisted. Mapping them together teaches the model that deferrals behave like waitlist outcomes, which is wrong. Also missing: "withdrew application", which is a non-negligible number of posts.

**Fix:** Either:
(a) Expand the enum to include `deferred` and `withdrew`, or
(b) Keep the enum at 3 values but explicitly drop records whose final decision was a deferral or a withdrawal. I recommend (b) for simplicity and ML clarity. Reword §2.1 to say "Posts whose final outcome is 'deferred' or 'withdrawn' are dropped, not mapped."

### S6. Coverage monitoring doesn't check class balance within a school
**Where:** §6.2 thresholds cover total records per school and total admitted per school, but nothing catches the case where a school has 50 records, all admitted and zero rejected.

**Fix:** Add a threshold: *"Any Top-50 school whose record set is > 90% one outcome class — Flag as 'class-imbalanced, do not train school-specific prior'."* A 90/10 split is the minimum for XGBoost to learn a useful boundary at that school.

### S7. Option B in §10 should not be an actual fallback
**Where:** §10 bullet 2 — *"Relax the confidence thresholds from 0.85/0.80 to 0.75/0.70 and accept a lower-quality dataset."*

**Problem:** Relaxing confidence thresholds silently degrades ARE forever. The model doesn't know which rows came in at 0.85 vs 0.75, the eval report doesn't meaningfully reflect it, and we've baked permanent noise into the V1 architecture. This isn't a fallback — it's a silent quality downgrade.

**Fix:** Remove Option B. Replace with a new Option B: *"Temporarily scale up the gold-set calibration (200 → 500 posts) and retry the extraction at the original 0.85/0.80 thresholds — a larger gold set usually improves per-field confidence calibration by enough to recover 5–10% of the reject rate without touching the floor."* This is a real fallback that keeps quality honest.

### S8. CC scraping timeline is unexamined — 1 req / 3s × back-catalogue may not fit
**Where:** §8.2–§8.4 — CC is the source for most of the US Top-50 data in Weeks 2–3 but the plan doesn't do the math on whether the 1 req / 3s rate ceiling can clear the back catalogue in the allotted time.

**Rough math:** 1 req / 3s = 20 req/min = 1,200 req/hr = 28,800 req/day (24/7). But we don't scrape 24/7 (one IP, no rotation, ethical browsing window). Call it 14 hrs/day = 16,800 req/day. To get 4,000 usable US records at a 15% acceptance rate we need ~27,000 raw posts pulled. That's 1.6 days of continuous scraping for CC alone. Tight but fits — if acceptance drops below 10%, it slips. Not captured in the plan.

**Fix:** Add a §3.4.1 "Throughput budget" subsection with the math shown, and add to §6.2 a new threshold: *"CC-scraped records with acceptance < 10% at any 24h window — Hard escalation."*

### S9. No baseline for the isolation forest in week 1
**Where:** §4.5 — "I run an isolation forest over the numeric feature space weekly."

**Problem:** In Week 1 with 500 records the isolation forest is garbage — it hasn't seen enough distribution to flag anything meaningful. We'll either have zero flags (bad), or the first few rows will get flagged simply for being first (worse).

**Fix:** Add to §4.5: *"Isolation forest only runs once the dataset has ≥1,500 records. Before that, outlier review is manual weekly sampling of 10 random rows."*

---

## 🟢 Nice-to-have (6)

### N1. `research_experience` as a bool loses signal
A student with a published Nature paper and a student with "helped a grad student for 3 hours" both get `true`. XGBoost will learn the average. An enum (`none | assistant | program | published`) would keep signal without exploding the feature space. **Recommendation:** park for Phase 2 model refinement — v1 bool is fine.

### N2. Double-major handling is absent
`major_category` is single-valued. Double-major students get mapped to whichever major is listed first in the post. **Recommendation:** accept as v1 limitation; add `secondary_major_category` as an optional enrichment field in a later migration if the model cares.

### N3. `nationality_region` enum is missing Middle East
The enum goes `asia | europe | africa | latam | oceania | other`. Middle East is not Asia in this taxonomy — it's a distinct admissions category. **Recommendation:** add `middle_east` to the enum now, it's free.

### N4. "Real-looking name or school" for minor-data detection is subjective
§2.2 "any self-declared age < 18 combined with a real-looking name or school" — how is "real-looking" detected? **Recommendation:** add a line: *"'Real-looking' = detected by Haiku extraction when the prompt asks 'is there a first name and surname present? is there a named school?'. If yes + age<18, drop."*

### N5. 1Password account ownership not stated
§3.5 mentions "credentials in 1Password" but doesn't say whose 1Password. **Recommendation:** add an open question: "Do we use the AdropEDU 1Password vault, or a new one I create?"

### N6. Deferrals → waitlisted mapping
Covered in S5 but worth reflagging here as a standalone concern if S5 is not adopted: the default in the plan teaches the model wrong physics.

---

## Recommended actions before sending to Andy

1. Fix **B1** (capacity conflict) — critical, this is the first thing Andy will push back on.
2. Fix **B2** (school table precondition) — critical, silently assumes a table that may not exist.
3. Fix **B3** (perfect-stats heuristic) — one line change, eliminates a real bias problem.
4. Fix **S1–S3** (SQL check constraints) — five minutes of SQL, eliminates three future bugs.
5. Fix **S4** (HMAC pepper) — five minutes, eliminates a privacy misstatement.
6. Fix **S5** (deferrals/withdrawn) — ten minutes, eliminates a real model-signal bug.
7. Fix **S6** (class balance) — one row added to the §6.2 table.
8. Fix **S7** (remove Option B) — delete and replace, two minutes.
9. Fix **S8** (throughput math) — five minutes, shows Andy I've done the numbers.
10. Fix **S9** (isolation-forest baseline) — one sentence.
11. Consider **N3** (add `middle_east`) — free and correct.

Everything else (N1, N2, N4, N5) can park until Andy responds or v2.

Estimated cost of the full patch pass: **45–60 minutes** of focused editing.

— Vaibhav (QA pass by Claude, 2026-04-09 ~16:05 BST)
