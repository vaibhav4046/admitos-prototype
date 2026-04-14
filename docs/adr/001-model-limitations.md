# ADR-001: Model Limitations & Label Architecture

**Status:** Accepted
**Date:** 2026-04-12
**Author:** Vaibhav (UniOffer Engineering)

## Context

The ARE (Admissions Readiness Evaluator) produces a categorical assessment of
student readiness for each target school. There is a strong temptation to
surface numerical probabilities to students, but this creates legal, ethical,
and UX risks.

## Decision

### No numerical percentages exposed to users

The ARE pipeline computes an internal `p_admit` (probability of admission) for
model training and calibration purposes. This value is **never** exposed to:

- The client-side application
- API responses
- Student-facing reports or narratives
- Any export format accessible to non-system actors

### Categorical labels only

Student-facing output uses exactly four labels:

| Label | Internal p_admit range | Student meaning |
|-------|----------------------|-----------------|
| `strongly_aligned` | >= 0.70 | Strong fit with school's profile |
| `competitive` | 0.45 - 0.69 | Competitive applicant |
| `developing` | 0.25 - 0.44 | Areas to strengthen |
| `gap_identified` | < 0.25 | Significant gaps to address |

### Enforcement points

1. **Database:** `are_cache.p_admit` column exists but is never selected in
   client-facing queries. RLS policies restrict access to service-role only.
2. **API layer:** The `are-cache` DB module strips `p_admit` before returning
   results to API handlers.
3. **Worker:** `are-computation.ts` stores `p_admit` internally but only passes
   the categorical `label` to the narrative generator.

## Consequences

- Students receive qualitative guidance, not probability scores.
- Legal risk from "guaranteed" admission percentages is eliminated.
- Model calibration can still use `p_admit` internally for quality monitoring.
- Label boundaries can be updated via `label_boundary_version` without
  changing the student-facing contract.
