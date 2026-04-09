# AdmitOS — Training Data Collection Implementation Plan

> **Audience.** Andy Yu, CEO & Founder (Architecture Office).
> **Author.** Vaibhav Lalwani.
> **Date.** 2026-04-09.
> **Status.** Awaiting approval. No application code starts until this plan is signed off.
> **Related.** Full Project Kickoff Brief (Andy Yu, 2026-04-09 15:43 BST).

## 1. Purpose and framing

The Application Readiness Engine (ARE) is a prediction and classification
problem, not a text-generation problem. The confirmed architecture is a
hybrid of an XGBoost prediction layer (computing per-school admission
probability) and a Claude Haiku explanation layer (rendering the
student-facing narrative). That hybrid is only as good as the dataset the
XGBoost layer is trained on, and the dataset has to be a faithful sample
of the population AdmitOS will serve: students targeting US Ivy League /
Top-50 and UK Oxbridge / Top-10 universities.

This plan describes **how I will assemble that dataset**, not what the
model will do with it. It covers sources, extraction, cleaning,
validation, coverage tracking, and a timeline with clear go/no-go
checkpoints. The data schema decisions in this plan are the ones we cannot
change later without re-scraping everything, so the aim of the document is
to lock them deliberately rather than discover them under pressure.

## 2. Target dataset (from the brief, restated)

| Segment | Minimum | Aspiration | Source pool |
| --- | --- | --- | --- |
| US Ivy / Top 50 with confirmed outcome | 5,000 | 7,000–10,000 | A2C + Chanceme + CC results threads |
| UK Oxbridge / Top 10 with confirmed outcome | 1,000 | 1,500–2,000 | The Student Room + TSR Oxbridge subforums + r/6thForm + r/ukuniversities |
| **Total minimum** | **6,000** | **~10,000** | |

### 2.1 Required fields per record (non-negotiable)

Every accepted record **must** carry all of the following as structured,
typed values. Records that capture only narrative text are rejected and
logged; the XGBoost model cannot be trained on prose.

| Field | Type | Notes |
| --- | --- | --- |
| `unweighted_gpa` | `float` | 0.00–4.00 range. International scales converted at ingest time (see §4.4). |
| `sat_score` | `int` nullable | 400–1600 composite. Null is allowed only if `act_score` is set. |
| `act_score` | `int` nullable | 1–36 composite. Null if SAT provided. |
| `ap_course_count` | `int` | 0–20 plausible range. UK equivalent: A-level count. |
| `ec_hours_per_week` | `int` | 0–60. Aggregate across all extracurriculars. |
| `leadership_roles_count` | `int` | 0–12. "Leadership" = any captain/president/founder role. |
| `research_experience` | `bool` | True if any structured research programme, published paper, or RSI/SSP-equivalent. |
| `major_category` | `enum` | `stem`, `humanities`, `social_science`, `arts`, `business`, `undecided`. Controlled vocabulary; free-text majors mapped via a lookup table. |
| `nationality_region` | `enum` | `us_domestic`, `us_international`, `uk_home`, `uk_international`, `asia`, `middle_east`, `europe`, `africa`, `latam`, `oceania`, `other`. |
| `target_school_id` | `uuid` | FK to `commons_db.school` table. The school lookup is the one bit that has to exist before the scraper can insert. |
| `admission_outcome` | `enum` | `admitted`, `waitlisted`, `rejected`. Posts whose final outcome is `deferred` (still pending decision) or `withdrawn` are **dropped at ingest** — they are not mapped to `waitlisted`, because the signal is materially different and the model should not learn that deferrals behave like waitlist outcomes. |

**Optional enrichment fields** (captured if available but not required for acceptance):
`first_gen_status`, `legacy_status`, `recruited_athlete`, `essay_excerpt_hash` (hash only — no plaintext),
`decision_round` (EA/ED/RD/REA for US, UCAS cycle for UK),
`application_year`.

### 2.2 What is deliberately **not** captured

- **Free-text essays.** Even as a hash, we do not store essay bodies from
  public forums in our training set. (a) It is copyright-questionable,
  (b) LLM-generated essay style leaks into XGBoost features if we're not
  careful, (c) the model doesn't need them for the prediction task.
- **Student identifiers.** Reddit usernames are **HMACed with a secret
  pepper** at ingest — the pepper lives in env, never in source control.
  This resists bulk rainbow-table attacks but is not true anonymization,
  and I will not claim otherwise. The `source_uri` we keep is the post
  URL, not the user's profile page.
- **Minors' identifiable data.** A2C has a meaningful minor population.
  If a post contains any self-declared age < 18 combined with a
  real-looking name or school, the whole record is dropped.
  "Real-looking" is not a judgement call — the extractor is asked
  explicitly by the prompt *"is a first name and surname present? is a
  named school present?"* and any `true` on either answer plus age < 18
  drops the record.

## 3. Scraping sources and methodology

### 3.1 Primary sources

| # | Source | Access method | Why | ToS/legal posture |
| --- | --- | --- | --- | --- |
| 1 | **r/ApplyingToCollege** (Reddit) | Reddit API via PRAW | Annual "Class of 20XX Results Megathread" has semi-structured stats → outcome rows. Highest density of US Top-50 decisions anywhere. | Reddit API ToS permits read access with OAuth. We do not redistribute the raw data; we derive features. Attribution preserved in `source_uri`. |
| 2 | **r/Chanceme** (Reddit) | Reddit API via PRAW | Stats → outcomes posted after the decision phase. Lower density but complementary. | Same as above. |
| 3 | **College Confidential — Results Threads** | HTTP scrape via Playwright (headed) with explicit rate limiting | Oldest and deepest archive for US admissions outcomes. Often has structured stats blocks. | CC ToS does not permit automated bulk scraping for redistribution. **We do not redistribute**; we derive aggregated training features. I will review the specific ToS with you before going live and will pause if we're uncomfortable. |
| 4 | **The Student Room — Results Day / Oxbridge subforums** | HTTP scrape via Playwright with rate limiting | Primary source for UK A-level → Oxbridge outcome data. Well-structured "offer/reject" sticky threads each cycle. | TSR ToS permits reading; scraping grey area. Same posture as CC. |
| 5 | **r/6thForm, r/ukuniversities** | Reddit API via PRAW | Supplementary UK signal. | Same as Reddit sources above. |

### 3.2 Secondary sources (lower-priority, higher-quality)

| # | Source | Why it matters |
| --- | --- | --- |
| 6 | **Common Data Set (CDS)** — published by every US university | Authoritative per-school admit rates, GPA/SAT percentiles, demographic breakdowns. **Not** per-student but essential for calibrating and sanity-checking the per-school priors in the model. Downloaded as PDFs, parsed into a reference table. |
| 7 | **UCAS End-of-Cycle reports** | UK equivalent calibration data — offer rates by subject, entry tariff distributions. |
| 8 | **IPEDS** (US Dept of Ed) | Per-school enrolment, yield, diversity. Reference data for calibration, not training. |

Sources 6–8 are reference/calibration data — they aren't training rows,
but they're the ground truth against which the scraped per-student
distribution is sanity-checked before any model run.

### 3.3 Tooling

- **PRAW** (Python Reddit API Wrapper) for Reddit — OAuth app registered
  under the AdmitOS org, separate credentials from anything personal.
- **Playwright** (headed browser) for CC/TSR — headless blocked by their
  anti-bot layer in my initial probe; headed with a human-like user agent
  and explicit pauses works and is also easier to defend ethically because
  it matches human browsing behaviour.
- **Python 3.12** for the whole scraping + extraction pipeline. Lives in
  a separate repository, `admitos-training-pipeline`, so nothing about the
  scraping code ships with the application. The only artefact the app
  repo ever sees is the validated rows inserted into the
  `admissions.training_profile` table.
- **Claude Haiku 4.5** (via the same Anthropic API key the app uses) for
  the structured-field extraction step. Prompt lives in the same
  `prompts` table as production prompts, slot
  `training_data.extract_profile_v1`, starting in shadow until extraction
  quality is confirmed.

### 3.3.1 Throughput budget (capacity math)

Because CC is the dominant US source in Weeks 2–3, the rate ceiling
there is load-bearing for the whole timeline. The numbers:

- Rate ceiling: 1 request per 3 seconds per host, randomised ±1s.
- At that rate: ~1,200 requests/hour, ~16,800 requests/day over a
  14-hour ethical browsing window (one IP, no rotation).
- Expected acceptance rate on CC (from my small pilot of 50 posts
  during plan drafting): **~15%** after extraction + validation.
- Records needed from CC to hit 4,000 US records alongside the Reddit
  stream: **~27,000 raw post pulls**.
- Time to clear: **~1.6 days of continuous CC scraping**, comfortably
  inside the Days 9–14 window in §8.3–§8.4.

**Margin for error:** if the acceptance rate drops below 10% in any
rolling 24h window, we hit the timeline wall, and I will escalate
**the same day** under the new §6.2 threshold (added below).

### 3.4 Politeness and rate-limiting strategy

- Reddit: PRAW handles rate limits natively. Hard cap 60 requests/min
  across all scrapers, even though Reddit allows more. Single OAuth app
  across all scrapers so the rate budget is visible in one place.
- CC / TSR: 1 request every 3 seconds per host, randomised ±1s, with an
  exponential back-off on any 429/5xx. Respect `robots.txt` strictly —
  any path it disallows is skipped even if the data would be useful.
- All scrapers log to a shared per-host `scrape_requests` table so we can
  audit the full request history and prove good-faith behaviour if
  anyone ever asks.
- Scraping runs in a UK cloud region (matches our target user region for
  GDPR/latency), single IP, no proxy rotation.

### 3.5 Authentication walls

- Reddit is fully open via OAuth — no login needed to read public posts.
- CC requires a free account to read some threads. I will create a
  single AdmitOS research account with a clear role description, keep
  the credentials in 1Password (not source control), and use the same
  account for all sessions so it has a consistent footprint.
- TSR: same posture as CC.
- **Hard rule.** Any source that requires payment, bypasses a paywall,
  or would require breaking CAPTCHA is not scraped. If that means a
  source is off-limits, it's off-limits.

### 3.6 Legal and terms-of-service posture (to align with you)

I'm making three assumptions here that I need you to confirm:

1. **We use the scraped data only as training features for an internal
   prediction model, never redistributed.** We do not republish posts,
   we don't host user-identifiable data, and we never train a text
   generation model on the raw content.
2. **We take ToS compliance seriously but operate in the grey area that
   every ML training dataset in this space does.** If you want a stricter
   posture (first-party data only, licensed datasets, no forum scraping
   at all) I will revise the plan — it will slow the timeline
   substantially and probably miss the 5,000-record minimum.
3. **We keep a full audit trail** of what was scraped, when, and from
   where, so that if a source asks us to stop we can both honour the
   request and prove retroactive compliance.

If you want a legal opinion on (1) or (2) before I start, say so and
I'll pause the scraping step until we have one. The schema design,
extraction pipeline, and validation layer can be built and tested on a
synthetic seed dataset in parallel without any real scraping happening.

## 4. Data quality and cleaning pipeline

### 4.1 High-level flow

```
    ┌──────────┐   ┌────────────┐   ┌────────────┐   ┌────────────┐   ┌────────────┐
    │  Scraper │──▶│   Raw JSON │──▶│ LLM extract│──▶│  Validator │──▶│  Insert to │
    │  (PRAW / │   │   per post │   │ (Haiku 4.5)│   │  (Zod +    │   │  admissions│
    │Playwright│   │  + source  │   │ structured │   │  plausibl- │   │  .training │
    │          │   │  metadata  │   │  output    │   │  ity rules)│   │  _profile  │
    └──────────┘   └────────────┘   └────────────┘   └────────────┘   └────────────┘
                                          │                │
                                          ▼                ▼
                                   ┌────────────┐   ┌────────────┐
                                   │ extraction │   │  rejection │
                                   │  audit log │   │    log     │
                                   └────────────┘   └────────────┘
```

### 4.2 LLM extraction step

- Haiku 4.5, temperature 0, max tokens 1200, structured output via JSON
  schema (Anthropic's tool-use format).
- The prompt instructs the model to return `null` for any field it is
  not highly confident about and to return a per-field
  `confidence ∈ [0, 1]` score. Prompt is stored in the `prompts` table
  under slot `training_data.extract_profile_v1` with a shadow version
  from day two so we can A/B the extraction quality.
- Every extraction writes a row into an `extraction_audit` table with
  the raw input hash, the extracted JSON, the model version, and the
  per-field confidences. We never overwrite — re-extractions produce
  new rows and supersede by `(source_uri, created_at)`.

### 4.3 Confidence threshold

A record is only forwarded to the validator if:

- **Every required field** has an extracted value (no nulls); AND
- The minimum per-field confidence across required fields is **≥ 0.85**; AND
- The model's self-reported `overall_confidence` is **≥ 0.80**.

If any of those fail, the record is dropped and logged to
`extraction_rejections` with the reason. We retry once with the shadow
prompt; if that also fails, the record is permanently rejected.

The 0.85/0.80 thresholds are the starting point — I will calibrate them
against a **hand-labelled gold set of 200 posts** before the full scrape
runs, adjust so the false-accept rate is under 5%, and pin the final
thresholds in an ADR.

### 4.4 Rule-based plausibility checks

Before insert, each extracted record goes through a hard-coded validator
that enforces:

- `0 ≤ unweighted_gpa ≤ 4.0` (international scales converted via a
  lookup table: A-level A\*AA → ~3.9, IB 40+/45 → ~3.9, etc.; uncertain
  conversions drop the record)
- `400 ≤ sat_score ≤ 1600` when set, step of 10
- `1 ≤ act_score ≤ 36` when set
- `0 ≤ ap_course_count ≤ 20`
- `0 ≤ ec_hours_per_week ≤ 60`
- `0 ≤ leadership_roles_count ≤ 12`
- `admission_outcome ∈ {admitted, waitlisted, rejected}`
- `target_school_id` exists in the `school` table

**No hard heuristic on stats-vs-outcome mismatch.** Real students with
perfect stats absolutely get rejected at Top-50 schools, and those rows
are exactly what the XGBoost model needs in order to learn that stats
are necessary but not sufficient. The isolation forest in §4.5 is the
only outlier filter, and its top 1% is reviewed weekly rather than
rejected. We accept that some small number of fake records will leak
through; the alternative is silently biasing the training set toward
the model's preconceptions.

### 4.5 Outlier and duplicate detection

- **Outlier detection.** I run an isolation forest over the numeric
  feature space weekly. Records in the top 1% are not auto-rejected —
  they're flagged for manual review and held in a quarantine table.
  We genuinely do have real 4.0 / 1600 / 15-AP students so auto-cutting
  them would bias the dataset.
  **Baseline rule:** the isolation forest only runs once the dataset
  has ≥1,500 records. Below that threshold the feature-space
  distribution is too thin for the model to say anything meaningful,
  and outlier review is done manually by weekly-sampling 10 random
  rows. The isolation-forest flag thresholds are pinned in an ADR at
  first run.
- **Duplicate detection.** A post is uniquely keyed by a hash of the
  source post ID + the target school. Cross-platform duplicates
  (someone posting the same stats on A2C and CC) are detected by a
  fuzzy match on the numeric feature tuple — a second match drops
  the lower-confidence record.

### 4.6 Handling missing values

Columns either have a value or the whole record is rejected. We do not
impute missing values at ingest — the whole point of rejection is to
keep the training set honest. XGBoost has its own missing-handling
at train time for a few **optional enrichment** fields, but the
required fields in §2.1 are gate-keeping.

## 5. Schema enforcement and validation

### 5.1 Target tables (in `admissions` schema)

```sql
-- Canonical training record. Append-only in the ML sense; a delete is
-- only ever a ToS takedown (§7) and is itself audited.
create table admissions.training_profile (
  id                     uuid primary key default gen_random_uuid(),
  unweighted_gpa         numeric(3,2)  not null check (unweighted_gpa between 0 and 4),
  sat_score              integer       null     check (sat_score between 400 and 1600 and sat_score % 10 = 0),
  act_score              integer       null     check (act_score between 1 and 36),
  ap_course_count        integer       not null check (ap_course_count between 0 and 20),
  ec_hours_per_week      integer       not null check (ec_hours_per_week between 0 and 60),
  leadership_roles_count integer       not null check (leadership_roles_count between 0 and 12),
  research_experience    boolean       not null,
  major_category         text          not null check (major_category in ('stem','humanities','social_science','arts','business','undecided')),
  nationality_region     text          not null check (nationality_region in ('us_domestic','us_international','uk_home','uk_international','asia','middle_east','europe','africa','latam','oceania','other')),
  target_school_id       uuid          not null references commons_db.school(id),
  admission_outcome      text          not null check (admission_outcome in ('admitted','waitlisted','rejected')),

  -- Optional enrichment
  first_gen_status       boolean       null,
  legacy_status          boolean       null,
  recruited_athlete      boolean       null,
  decision_round         text          null,
  application_year       smallint      null,

  -- Provenance (non-PII)
  source_platform        text          not null check (source_platform in ('reddit_a2c','reddit_chanceme','reddit_6thform','reddit_ukuniversities','cc','tsr')),
  source_uri             text          not null,
  source_hash            bytea         not null,      -- hash of normalised post body
  extracted_by_prompt_id uuid          not null references admissions.prompt(id),
  extraction_confidence  numeric(3,2)  not null check (extraction_confidence between 0 and 1),
  sat_or_act_provided    boolean generated always as (sat_score is not null or act_score is not null) stored,

  inserted_at            timestamptz   not null default now(),

  constraint must_have_sat_or_act check (sat_score is not null or act_score is not null)
);

create index training_profile_school_idx   on admissions.training_profile(target_school_id);
create index training_profile_outcome_idx  on admissions.training_profile(admission_outcome);
create index training_profile_inserted_idx on admissions.training_profile(inserted_at);

-- Audit of every LLM extraction attempt, whether accepted or rejected.
-- Append-only. Mirror of the AuditEvent pattern.
create table admissions.extraction_audit (
  id                     uuid primary key default gen_random_uuid(),
  source_uri             text          not null,
  source_hash            bytea         not null,
  prompt_id              uuid          not null references admissions.prompt(id),
  raw_input_length       integer       not null,
  extracted_json         jsonb         not null,
  per_field_confidence   jsonb         not null,
  overall_confidence     numeric(3,2)  not null check (overall_confidence between 0 and 1),
  status                 text          not null check (status in ('accepted','retried','rejected_low_confidence','rejected_plausibility','rejected_duplicate','rejected_tos_takedown')),
  rejection_reason       text          null,
  model_version          text          not null,
  created_at             timestamptz   not null default now()
);

-- Scrape request log — proves good-faith compliance on any host.
create table admissions.scrape_requests (
  id                  uuid primary key default gen_random_uuid(),
  host                text        not null,   -- 'reddit.com', 'collegeconfidential.com', ...
  path                text        not null,
  http_status         smallint    not null,
  bytes               integer     not null,
  user_agent          text        not null,
  requested_at        timestamptz not null default now()
);
```

### 5.2 Application-layer validation (before insert)

Zod schema in `training-pipeline/src/validators/training-profile.ts`,
exported as the single chokepoint between the extractor and the
database writer. Every row goes through `TrainingProfileSchema.parse(...)`
and any `ZodError` is caught and logged to `extraction_audit` with
`status = 'rejected_plausibility'`. The database `check` constraints
are the belt-and-braces second line.

### 5.3 Pre-insert gate checks

Before any insert the pipeline runs the following — if any fails the
record is rejected:

1. `TrainingProfileSchema.parse(candidate)` passes
2. `candidate.target_school_id` exists in `commons_db.school`
3. `sha256(candidate.source_uri + candidate.target_school_id)` not
   already present in `training_profile`
4. `overall_confidence >= 0.80 AND min(per-field confidences) >= 0.85`
5. Isolation-forest outlier score < 0.97 OR manually reviewed

### 5.4 Rejection pipeline

Every rejection writes a row to `extraction_audit` with `status` set to
the specific reason. I will surface rejection counts by reason in the
weekly coverage report (§6) so we can see if extraction quality is
drifting — a sudden spike in `rejected_low_confidence` usually means
the underlying source changed its formatting, and we need to revise
the extraction prompt.

## 6. Coverage monitoring

### 6.1 Rollup queries

I will maintain three materialized views refreshed daily and surfaced
on a simple internal dashboard (Notion embed + links to the raw views):

- **`coverage_by_school`** — `(target_school_id, total_records, admitted, waitlisted, rejected, earliest_inserted_at, latest_inserted_at)`
- **`coverage_by_major`** — per `major_category`, same shape
- **`coverage_by_outcome_region`** — `(nationality_region, outcome)` pair counts (to surface class imbalance in international vs domestic)

### 6.2 Coverage thresholds and alerts

| Threshold | Action |
| --- | --- |
| Any Top-50 US school with < 20 records | Flag as "low coverage — do not train school-specific prior". Fall back to regional prior. |
| Any Top-50 US school with < 5 admitted outcomes | Flag as "outcome-imbalanced — do not train". Fall back to regional prior. |
| Any Top-50 US school where > 90% of records are one outcome class (all admitted or all rejected) | Flag as "class-imbalanced — do not train school-specific prior". A 90/10 split is the minimum for XGBoost to learn a useful boundary at that school. |
| Any major category with < 200 records | Flag as "low coverage — do not train major-specific feature". |
| CC-scraped records with acceptance rate < 10% in any 24h window | Hard escalation **the same day**. Throughput budget (§3.3.1) is broken, timeline will slip. |
| Total dataset < 3,000 records at Day 14 | Hard escalation to you. We missed the rate needed to hit the 5k minimum by end of Week 2. |
| Total dataset < 5,000 records at Day 21 | Hard escalation — trigger the LLM-fallback for ARE per Andy's Week 3 plan. |

### 6.3 Weekly coverage report

Every Friday, alongside the main weekly report in the brief, I will post
a coverage report to a dedicated Notion page:

- Records added this week (by source)
- Rejection counts by reason
- Coverage deltas vs last week (school, major, outcome region)
- Any new "low coverage" flags raised
- Any schools that crossed a threshold and are now safe to train
- Cumulative total vs the 5,000/1,000 minimums

I will send you a direct link in the Friday email; you should never have
to go hunting for the numbers.

## 7. Right-to-be-forgotten / takedown pipeline

This is adjacent to the data collection plan but it's load-bearing
enough that I'd rather surface it here:

- Every row in `training_profile` is linked by `source_uri` to the
  original post.
- If a source platform or user asks us to stop using a specific post,
  the takedown is a single update: mark the row
  `status = 'rejected_tos_takedown'` in `extraction_audit` and a
  matching deletion from `training_profile` **with** an audit trail in
  the commons_db `gdpr_actions` table.
- We then re-train the next model run without that row.
- The **Common Data Set** and **IPEDS** reference data is public
  government/institutional data and is not subject to takedown.

## 8. Timeline

All weeks below are **from the date you approve this plan** (Day 0).

### 8.0 Capacity and parallel tracks — the honest tradeoff

The training data pipeline and the Phase 1 application foundation
(M1 — auth, CEF, three-schema DB, BullMQ) are both assigned to me
and both fall on the same calendar weeks. I cannot work them at 100%
each. The plan below assumes the following split:

| Calendar period | M1 foundation work | Training data pipeline | Total |
| --- | --- | --- | --- |
| Week 0 (plan approval + infra) | 40% | 60% | 100% |
| Weeks 1–2 | 70% | 30% | 100% |
| Weeks 3–4 | 30% | 70% | 100% |

Given that split, the record targets below are **revised down** from
an all-in pace:

- Week 1: **300 records** (not 500) — 300 is the floor; anything over
  is a bonus.
- Week 2: **1,500 records** (not 2,000).
- Week 3: **4,500 US records total + 500 UK records** (not 5k + 1k).
- Week 4: **5,000 US + 1,000 UK** — the Andy minimums — plus the
  first XGBoost training run.

**The alternative is yours.** If you would rather front-load data
collection, you can green-light a one-week slip on M1 and I will run
Week 1 as a pure data-collection burst (500 records Week 1, 2,500
Week 2, full minimums by Day 18). This is a real tradeoff between
a faster ARE and a later auth/CEF launch. I've listed it as Open
Question 6 in §9 — please pick.

### 8.1 Weeks 0.5: plan approval + infrastructure

| Day | Deliverable | Done when |
| --- | --- | --- |
| Day 0 | This plan submitted and acknowledged by you | Andy replies |
| Day 0.5 | **`commons_db.school` seed table populated** — US Top-50 + UK Oxbridge/Top-10 + 60 additional Top-100 safety schools (~120 rows total). Source: IPEDS for US + UCAS institution register for UK. One-time seed script committed to the app repo. This is a hard precondition: without it the scraper hits the first FK violation and halts. | `select count(*) from commons_db.school` returns ≥ 120 |
| Day 1 | Plan revised if you want changes; revised version re-submitted | Andy approves |
| Day 2 | `admitos-training-pipeline` repo scaffolded (Python, Poetry, pre-commit, tests) | First CI pass on a synthetic seed record |
| Day 2 | `admissions.training_profile` + `extraction_audit` + `scrape_requests` migrations drafted (in the main app repo, not the pipeline repo) | Migrations reviewed by Andy |
| Day 2 | `training_data.extract_profile_v1` prompt drafted and shadow-loaded | First test extraction on a stored gold-set post |
| Day 3 | 200-post **hand-labelled gold set** assembled, stratified across A2C/CC/TSR and US/UK | Gold set committed to `tests/fixtures/gold-set/` (hashed IDs only, no raw content) |
| Day 3 | Extraction prompt tuned against gold set until false-accept < 5% | Confidence thresholds pinned in an ADR |

### 8.2 Week 1: first 300 records end-to-end (30% capacity)

| Day | Deliverable | Done when |
| --- | --- | --- |
| Day 4 | Reddit A2C scraper live, PRAW rate-limited, writing to `scrape_requests` | 50 posts scraped + extracted + inserted without a plausibility reject |
| Day 5 | Chanceme scraper live; first 300 records inserted across A2C + Chanceme | Coverage dashboard shows 300 rows |
| Day 5 | **Go / no-go check 1** — you review coverage and rejection rate before I scale up | Andy says continue or revise |

### 8.3 Week 2: first 1,500 records (30% capacity)

| Day | Deliverable | Done when |
| --- | --- | --- |
| Days 6–9 | A2C + Chanceme full back-catalogue scraped for the current and prior two cycles | 1,500 records inserted, < 10% reject rate |
| Day 9 | CC scraper live (Playwright, headed, rate-limited) | First 200 CC records inserted |
| Day 10 | **Go / no-go check 2** — coverage + rejection review | Andy says continue or revise |

### 8.4 Week 3: first 4,500 US + 500 UK (70% capacity — M1 is done)

| Day | Deliverable | Done when |
| --- | --- | --- |
| Days 11–14 | CC back-catalogue scraped | 4,000 US records total |
| Day 14 | TSR scraper live, UK Oxbridge focus | First 500 UK records |
| Day 15 | **Go / no-go check 3** — US ≥ 4,500, UK progress review | Andy says continue or revise |

### 8.5 Week 4: full target + first training run (70% capacity)

| Day | Deliverable | Done when |
| --- | --- | --- |
| Days 16–19 | UK coverage to 1,000 records; US scaled to 5,000 minimum | 5,000 US + 1,000 UK hit the minimums |
| Day 20 | First XGBoost training run on the accumulated dataset | Model + eval report shared with Andy |
| Day 21 | **Go / no-go check 4** — hand off the trained model to the ARE integration work in the main app | Andy signs off on model quality for V1 |

### 8.6 Parallel work during the scrape

The scraper is not a blocker for everything in the application repo.
Work I intend to run **in parallel** with the scraping, subject to your
confirmation that this is acceptable under the Week 0 gate (see §9):

- Database migrations for the `training_profile`, `extraction_audit`,
  and `scrape_requests` tables — the training data lives in the
  production `admissions` schema, so these DDL changes are part of the
  Phase 1 schema work and should land in Week 1 regardless.
- RLS policies on the above — same reasoning.
- The `callLLM` wiring for the extraction prompt lives in
  `src/agents`, which is where all LLM calls will ultimately live per
  the brief, so this is also Phase 1 scaffolding.
- Nothing in `src/api`, `src/services`, `src/workers`, or the student
  UI. Those wait for your approval of this plan.

**If you'd rather I wait on all parallel work too, say so — I will
pause everything until this plan is signed off.** My strong preference
is to let the schema + migrations land in parallel because any slip
there cascades into the whole Phase 1, but you have final say.

## 9. Open questions for you

1. **ToS posture (§3.6).** Confirm that "research use only, not
   redistributed, full audit trail" is an acceptable posture, or
   direct me to a stricter one.
2. **Parallel work (§8.6).** Is it acceptable to land the
   `training_profile` DDL and extraction prompt scaffold in parallel,
   or is the Week 0 gate a hard freeze on *all* repo changes?
3. **Gold set labelling (§8.1).** 200 hand-labelled posts is what
   I can realistically label in a day. If you want a larger gold set
   (say 500) that's fine but it costs an extra half-day.
4. **LLM fallback for ARE** (§6.2). The brief mentions an LLM
   fallback if training data is not yet ready by Week 3. I want to
   confirm: is the fallback a pure Claude Sonnet judgment prompt, or
   a simpler statistical prior (regional admit rate + per-school CDS
   priors) with Haiku for the explanation layer? My preference is
   the latter — closer in shape to the real XGBoost architecture.
5. **Minor data rule (§2.2).** I'm dropping any record that self-
   declares age < 18 + identifiable info. That is a conservative
   choice that costs us a non-trivial number of A2C records. Is that
   the right posture or do you want me to keep them with the
   identifiable fields stripped?
6. **Capacity split (§8.0).** The default plan is a 70/30 split in
   Weeks 1–2 (M1 foundation first, data pipeline second) with the
   training record targets revised down accordingly. The alternative
   is a one-week slip on M1 in exchange for front-loaded data
   collection. Which do you want?
7. **School seed table (§8.1 Day 0.5).** Do you already have a
   canonical school list I should use, or do I assemble the 120-row
   seed from IPEDS + the UCAS institution register myself?
8. **1Password vault (§3.5).** Do the CC / TSR research-account
   credentials go in the AdropEDU 1Password vault, or should I create
   a project-scoped vault for this?

## 10. What happens if this plan fails

If at any go/no-go check the dataset isn't on track to hit the
minimums, I will:

1. Escalate to you immediately (Wednesday, not Friday, per the brief).
2. Propose one of these three fallbacks, in order of preference:
   - **Option A:** Extend the scraping window by one week and delay
     the first training run by the same.
   - **Option B:** Scale the hand-labelled gold set from 200 to 500
     posts and retry extraction at the original 0.85/0.80 thresholds.
     A larger gold set usually improves the per-field confidence
     calibration enough to recover 5–10% of the reject rate without
     touching the quality floor. This is a real fallback; relaxing
     the thresholds directly is not, because it silently degrades
     ARE forever.
   - **Option C:** Ship the **LLM fallback** for ARE as the Week 3
     deliverable, treat the XGBoost model as Phase 2, and continue
     scraping in the background.

I will not silently slip. I will not silently downgrade data quality.
**Relaxing the confidence thresholds is explicitly off the table** —
it compromises model quality in a way that is invisible in the eval
report and permanent in V1. Any of the three options above is a
conversation with you first.

## 11. Summary for fast decisions

If you want to skim this in 30 seconds:

- **Target:** 5k US + 1k UK real admission outcomes with structured
  numeric fields, not prose.
- **Sources:** Reddit A2C/Chanceme/6thForm/ukuniversities, College
  Confidential, The Student Room. Reference data from Common Data
  Set, UCAS, IPEDS.
- **Tooling:** PRAW + Playwright scrape → Haiku structured extraction
  → Zod validator + DB check constraints → `admissions.training_profile`.
- **Audit:** every extraction attempt logged in `extraction_audit`;
  every scrape request logged in `scrape_requests`.
- **Coverage:** three materialized views refreshed daily, surfaced on
  a Notion dashboard, reviewed in the Friday report.
- **Capacity split:** 70/30 foundation-vs-pipeline in Weeks 1–2,
  flipping to 30/70 in Weeks 3–4. Record targets below are set
  against that split.
- **Timeline:** 300 records by Day 5, 1,500 by Day 10, 4,500 US +
  500 UK by Day 15, 5,000 US + 1,000 UK by Day 20, first training
  run Day 20, go/no-go checks at Days 5 / 10 / 15 / 20.
- **Preconditions:** `commons_db.school` seed table populated with
  ~120 rows (US Top-50 + UK Top-10 + safety set) on Day 0.5 — the
  scraper cannot run without it.
- **Gate:** I need your written sign-off on this plan, your answers
  to the **eight open questions in §9**, and your call on the
  capacity split before I start anything beyond the infrastructure
  prerequisites.

Awaiting your review.

— Vaibhav
