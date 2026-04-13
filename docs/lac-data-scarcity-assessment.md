# LAC Data Scarcity Assessment

**Date:** 2026-04-13
**Author:** Vaibhav (AdmitOS Engineering)

## Problem

Liberal Arts Colleges (LACs) have significantly fewer Reddit posts than
large universities. The training pipeline targets 400 minimum usable
profiles per tier_band for model training. LAC tiers (l1-l4) are at
risk of falling below this threshold.

## Data Volume Estimates

Based on r/ApplyingToCollege and r/chanceme scrape analysis:

| Tier | Schools | Est. Reddit posts/school/year | Est. total posts | Usable (12% SYR) | Meets 400? |
|------|---------|------------------------------|-----------------|------------------|------------|
| l1   | 5       | 40-60                        | 200-300         | 24-36            | NO         |
| l2   | 10      | 20-40                        | 200-400         | 24-48            | NO         |
| l3   | 15      | 10-25                        | 150-375         | 18-45            | NO         |
| l4   | 20      | 5-15                         | 100-300         | 12-36            | NO         |

**None of the LAC tiers are projected to meet the 400-profile threshold
from Reddit alone.**

## Mitigation Strategies

### Short-term (M1)

1. **Pool LAC tiers** — Treat l1+l2 as one training cohort and l3+l4
   as another. This roughly doubles the effective sample size.
2. **Lower confidence threshold for LACs** — Accept
   `extraction_confidence >= 0.6` (vs 0.7 for universities) to
   increase yield.
3. **Cross-validate with CDS** — Use published CDS data to supplement
   scraped profiles for LACs with known statistics.

### Medium-term (M2-M3)

4. **College Confidential scraping** — LAC applicants are more active
   on College Confidential than Reddit. Add as a scraping source.
5. **Niche subreddits** — r/LACs, r/LiberalArts (if they exist and
   have sufficient volume).
6. **Transfer learning** — Pre-train on university data, fine-tune on
   LAC data with higher learning rate.

### Long-term

7. **Synthetic data augmentation** — Generate synthetic LAC profiles
   based on CDS distributions, clearly marked as synthetic
   (`source_type = "synthetic_cds"`).
8. **Partnership data** — Work with LAC admissions offices to obtain
   anonymized outcome data (requires legal review).

## Monitoring

The following metrics should be tracked weekly:

- Per-tier-band profile count: `SELECT tier_band, COUNT(*) FROM
  admissions.training_profile GROUP BY tier_band`
- LAC signal yield rate (should flag if < 8% — lower than the
  standard 12% threshold)
- Extraction confidence distribution per tier

## Flags

| Tier | Status | Action Required |
|------|--------|----------------|
| l1   | BELOW_THRESHOLD | Pool with l2 for M1 |
| l2   | BELOW_THRESHOLD | Pool with l1 for M1 |
| l3   | BELOW_THRESHOLD | Pool with l4 for M1 |
| l4   | BELOW_THRESHOLD | Pool with l3 for M1 |

## Decision

For M1, proceed with **pooled LAC tiers** (l1+l2 and l3+l4) and
document the reduced statistical power in model output. The ARE
narrative for LAC schools should include a disclaimer that predictions
are based on limited data.
