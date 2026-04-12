# ADR-002: Raw Data Snapshot Architecture

**Status:** Accepted
**Date:** 2026-04-12
**Author:** Vaibhav (AdmitOS Engineering)

## Context

The training pipeline scrapes Reddit posts and extracts structured profiles
via Claude Haiku. The extraction is lossy — the LLM interprets and normalizes
free-text data. If we only store the normalized output, we lose the ability to:

1. Re-extract with improved prompts
2. Debug extraction errors
3. Audit what the original post said vs. what was extracted
4. Train on the raw data with different normalization strategies

## Decision

### Two-layer data architecture

**Layer 1 — Raw snapshots (JSONL)**

- Every scraped post is written as a single JSON line to a date-partitioned
  JSONL file: `data/raw/{source}/{YYYY-MM-DD}.jsonl`
- The raw snapshot contains the full post body, title, author, metadata, and
  a timestamp
- Files are append-only and immutable once written
- No normalization or extraction at this layer

**Layer 2 — Clean profiles (Supabase)**

- Extracted and validated profiles are inserted into `admissions.training_profile`
- Each profile references its source via `source_uri` which can be traced back
  to the raw JSONL snapshot
- The `raw_credential` JSONB column on `training_profile` stores the
  pre-normalization credential data from the extraction step

### JSONL format specification

```jsonl
{"source_url":"https://reddit.com/...","source_type":"reddit","title":"...","body":"...","author":"...","created_utc":1712700000,"scraped_at":"2026-04-10T00:00:00Z"}
```

### Retention policy

- Raw JSONL files are retained indefinitely during M1 (storage is cheap)
- Post-M1, retention will be reviewed based on storage costs and privacy policy
- JSONL files should NOT be committed to git — they go in `data/` which is
  gitignored

## Consequences

- Full auditability of the extraction pipeline
- Ability to re-run extraction with improved prompts without re-scraping
- Storage overhead is minimal (JSONL compresses well, Reddit posts are small)
- The `data/` directory must be backed up separately from git
- `raw_credential` JSONB on training_profile provides a middle ground —
  structured but pre-normalization data alongside the fully normalized columns
