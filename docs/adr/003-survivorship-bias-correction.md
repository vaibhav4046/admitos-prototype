# ADR-003: Survivorship Bias Correction

**Status:** Accepted
**Date:** 2026-04-13
**Author:** Vaibhav (AdmitOS Engineering)

## Context

Training data scraped from Reddit (r/ApplyingToCollege, r/chanceme) is
heavily skewed toward admitted outcomes. Users who were accepted are far
more likely to post "chance me" results than those who were rejected.
This creates survivorship bias that, uncorrected, causes the ARE model
to over-predict admission probability.

### Observed bias

Analysis of r/chanceme scrape batches shows:
- Scraped admitted rate for U1 tier schools: ~75-85%
- CDS actual admit rate for U1 tier schools: ~3-7%
- Ratio: 10-25x overrepresentation of admitted outcomes

## Decision

### Detection

A scraping source is flagged as survivorship-biased when:

```
scraped_admit_rate / cds_baseline_admit_rate > 1.5
```

CDS baseline rates are maintained per tier_band in
`lib/training/survivorship-correction.ts`:

| Tier | CDS Baseline |
|------|-------------|
| u1   | 5%          |
| u2   | 9%          |
| u3   | 13%         |
| u4   | 25%         |
| u5   | 40%         |
| l1   | 9%          |
| l2   | 13%         |
| l3   | 15%         |
| l4   | 30%         |

### Correction: Inverse-probability sample weights

For XGBoost training, each record receives a `sample_weight`:

- **Admitted:** `cds_rate / scraped_rate` (down-weight over-represented)
- **Rejected:** `(1 - cds_rate) / (1 - scraped_rate)` (up-weight under-represented)
- **Waitlisted:** `1.0` (neutral — insufficient data to calibrate)

### Safety cap

All sample weights are capped at **3.0** to prevent extreme outliers
(e.g., a single rejected U1 applicant) from dominating the training
signal.

### Integration points

1. `lib/training/survivorship-correction.ts` — detection + weight computation
2. `lib/training/signal-yield.ts` — flags sources with admitted/rejected
   ratio > 1.5x (existing)
3. Python pipeline: `recency_weight.py` computes per-record weights
4. XGBoost training (M1 Week 3): uses `sample_weight` column

## Consequences

- ARE model predictions are calibrated against real CDS admit rates
- Rejected outcomes receive appropriate representation in training
- The 3.0 cap prevents any single record from having outsized influence
- Bias detection runs as part of signal-yield monitoring (existing)
- When CDS data is updated (Week 3 importer), baseline rates should
  be refreshed in `survivorship-correction.ts`
