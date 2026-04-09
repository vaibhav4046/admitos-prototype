# Gold-set labelling scaffold (200 posts)

> **Purpose.** This is the hand-labelled calibration set for the training data extraction prompt. It does NOT ship to production, it does NOT enter the training set, and it NEVER contains raw post bodies — only post IDs, source hashes, and the human-labelled expected extraction output.
>
> **Owner.** Vaibhav Lalwani.
> **Status.** Scaffold only. Labels to be filled in during Day 3 of the Week 0.5 timeline in `docs/training-data-plan.md`, after Andy approves the plan.

## Why a gold set exists

The extraction prompt (`training_data.extract_profile_v1` in the `prompts` table) is a Haiku 4.5 call that reads a raw forum post and returns structured fields. We do not know a priori what confidence thresholds to use for acceptance. The gold set is the thing we calibrate against:

1. A human (Vaibhav) reads 200 real posts and manually extracts the structured fields.
2. The same 200 posts are run through the Haiku extraction prompt.
3. We compare the model's extraction to the human's extraction and compute false-accept and false-reject rates across a sweep of confidence thresholds.
4. We pin the thresholds at the point where false-accept drops below 5% on the gold set and commit them in an ADR.

Without this, the 0.85/0.80 thresholds in `docs/training-data-plan.md` are a guess. With this, they are an evidence-backed choice.

## Stratification

The 200 posts must be stratified across sources and segments so the calibration generalizes. Target distribution:

| Source | Count | Expected variety |
| --- | --- | --- |
| r/ApplyingToCollege results megathread | 70 | US Top-50, wide GPA range, mix of outcomes |
| r/Chanceme | 30 | US Top-50, chance-me format is messier than results threads |
| College Confidential results thread | 40 | US Top-50, different post format from Reddit |
| The Student Room — Oxbridge | 30 | UK Oxbridge offers/rejects, A-level + IB |
| r/6thForm | 15 | UK domestic, A-level |
| r/ukuniversities | 15 | UK general, mix |
| **Total** | **200** | |

Within each source, stratify by outcome class (aim for roughly 1/3 admitted, 1/3 waitlisted, 1/3 rejected in the raw, even though that won't match the real population).

## What we store per row

We do NOT store post bodies. We store:

| Field | Type | Notes |
| --- | --- | --- |
| `gold_id` | `string` | Opaque ID like `gold-a2c-001` through `gold-a2c-070`, `gold-cc-001` through `gold-cc-040`, etc. |
| `source_platform` | `enum` | Same enum as `training_profile.source_platform` |
| `source_uri` | `string` | The URL of the post. Used once at labelling time to fetch the body, then discarded from the fixture at commit time. |
| `source_hash` | `string` | SHA-256 of the normalized post body. Lets us re-pair a live scrape to the gold label without storing the body. |
| `expected.unweighted_gpa` | `float` | The human's best read |
| `expected.sat_score` | `int\|null` | |
| `expected.act_score` | `int\|null` | |
| `expected.ap_course_count` | `int` | |
| `expected.ec_hours_per_week` | `int` | |
| `expected.leadership_roles_count` | `int` | |
| `expected.research_experience` | `bool` | |
| `expected.major_category` | `enum` | |
| `expected.nationality_region` | `enum` | |
| `expected.target_school_id` | `uuid` | Looked up from `commons_db.school` |
| `expected.admission_outcome` | `enum` | |
| `notes` | `string` | Any edge cases the labeller wants to flag |
| `difficulty` | `enum` | `easy`, `medium`, `hard` — how confident the human was |
| `drop_reason` | `enum\|null` | If the post should be rejected, the reason (`minor_detected`, `ambiguous_stats`, `no_outcome`, etc.) |
| `labelled_at` | `timestamp` | ISO string |
| `labelled_by` | `string` | `vaibhav` |

## Files in this fixture directory

```
tests/fixtures/gold-set/
  README.md                   ← this file
  gold-set-v1.schema.json     ← JSON Schema for each row
  gold-set-v1.jsonl           ← one row per line, to be populated by Vaibhav on Day 3
  evaluate.py                 ← script in the training-pipeline repo (NOT here) that reads this
                                file, runs the live extraction prompt against the same posts
                                (refetched by source_uri at eval time), compares per-field,
                                and emits a calibration report
```

## Labelling workflow

1. Open `gold-set-v1.jsonl` in an editor that supports JSON per line.
2. For each stratification bucket, open the source forum in a browser and pick posts that match the criteria.
3. For each post:
   a. Read the post.
   b. Fill in the `expected.*` fields as if you were the ideal extractor.
   c. If the post should be rejected, set `drop_reason` and leave `expected.*` fields as `null`.
   d. Set `difficulty` based on how much you had to squint.
   e. Add notes for anything unusual.
4. At commit time, run the hashing script (see below) to strip raw bodies and compute `source_hash`.
5. Commit `gold-set-v1.jsonl` with only non-PII metadata.
6. Eval run is in the training-pipeline repo, not here.

## Hashing script (pseudocode, lives in training-pipeline repo)

```python
import hashlib, json, re

def normalize(body: str) -> str:
    # strip whitespace, lowercase, collapse multiple spaces
    return re.sub(r'\s+', ' ', body.strip().lower())

def hash_post(body: str) -> str:
    return hashlib.sha256(normalize(body).encode('utf-8')).hexdigest()
```

No raw body is ever committed. If a reviewer needs to verify a label, they re-fetch by `source_uri`, re-hash, and compare to `source_hash`. If the hash matches, the body hasn't changed since labelling.

## Failure modes the gold set catches

- **Prompt drift.** Extraction prompt gets updated, false-accept rate on the gold set jumps. We catch it before shipping.
- **Model drift.** Claude Haiku gets an update, extraction quality shifts. We catch it in the next calibration run.
- **Source format drift.** Reddit or CC changes their post format. Extraction accuracy on one bucket of the gold set drops but others stay stable. We catch which source is broken without having to bisect the whole prompt.
- **Threshold drift.** Someone tries to relax the 0.85/0.80 thresholds without running a calibration. The ADR explicitly forbids this without a new gold-set evaluation.

## Not stored here (and why)

- **Raw post bodies.** Copyright risk and privacy posture. `source_hash` is sufficient to re-pair at eval time.
- **Usernames.** Same reason.
- **Essays.** Already excluded per `docs/training-data-plan.md` §2.2.
- **Timestamps of original posts.** Not needed for calibration.

## What the schema file will look like

See `gold-set-v1.schema.json` in this directory for the JSON Schema the JSONL file is validated against. The schema is the contract — if a row doesn't pass the schema, the evaluation script refuses to run.
