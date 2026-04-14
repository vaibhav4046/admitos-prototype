# Scaffold delta 03 — ARE: XGBoost + Haiku hybrid

> **Source of truth:** Andy's Full Project Kickoff Brief (2026-04-09 15:43 BST).
> **Trigger:** Brief specifies ARE as a two-layer hybrid — XGBoost prediction layer computing per-school admission probability, then Claude Haiku 4.5 turning that probability into a student-facing narrative using a controlled vocabulary. Output is label-only: `strongly_aligned | competitive | developing | gap_identified`. Zero percentages surfaced to students.
> **Status:** Design doc, not yet applied. Blocked on Andy's approval of `docs/training-data-plan.md` and on the training data itself (chicken-and-egg: the XGBoost layer needs the training set from `docs/training-data-plan.md` to exist before it can be trained).

## Why this architecture, specifically

Andy's brief rules out three alternatives that we should be explicit about so we don't drift back toward them mid-build:

1. **Pure LLM ARE.** Ask Claude to read a CEF + school and output an alignment label directly. Rejected because: (a) LLMs do not calibrate probabilities well, (b) every request costs cents and scales per-student, (c) the label becomes a function of prompt phrasing more than of student stats, (d) we can't A/B the model without human labelling.

2. **Pure XGBoost ARE.** Train XGBoost on the training set, surface a numeric probability, done. Rejected because: (a) the brief explicitly forbids surfacing percentages, (b) students need narrative explanations of *why* the label came out where it did, (c) the narrative has to be culturally appropriate for a nervous student, which XGBoost can't do.

3. **Pure rule engine.** Look up Common Data Set percentiles, do a naive comparison, spit out a label. Rejected because: (a) CDS data is a year old, (b) it can't capture the interaction between GPA and EC strength, (c) it can't handle the "strong stats wrong major" case.

The hybrid is the only architecture that gives us **calibrated probabilities** (XGBoost), **controlled output vocabulary** (labels, not text), and **kind, explanatory narrative** (Haiku) without coupling any of the three concerns.

## The two layers

### Layer 1 — XGBoost prediction layer

**Inputs (from the student's CEF + the target school):**
- Student features: `unweighted_gpa`, `sat_score`, `act_score`, `ap_course_count`, `ec_hours_per_week`, `leadership_roles_count`, `research_experience`, `major_category`, `nationality_region`.
- School features (looked up from `commons_db.school`): `school_id` (one-hot or target-encoded), `admit_rate`, `median_sat_25th`, `median_sat_75th`, `median_gpa_25th`, `median_gpa_75th`.
- Derived features: `sat_percentile_at_school`, `gpa_percentile_at_school`, `stats_composite_zscore`.

**Output:** a single scalar `p_admit ∈ [0, 1]` — the model's estimate of probability of admission for this student at this school.

**Training set:** the `admissions.training_profile` table built by `docs/training-data-plan.md`. Target variable is `admission_outcome == 'admitted'` (binary, with `rejected` and `waitlisted` both counted as non-admitted for the V1 binary model).

**Model family:** XGBoost. Specifically, `xgboost` Python package, `XGBClassifier`, binary logistic objective. Single-model, not a stacked ensemble. Three reasons: (a) XGBoost is the industry baseline for tabular data with mixed numeric and categorical features, (b) it handles missing values natively so the optional enrichment fields in the training plan don't require imputation, (c) it exposes per-feature importance scores which we use to generate the explanation layer.

**Hyperparameters:** tuned via `optuna` against a 5-fold stratified CV on the training set. Starting ranges: `max_depth ∈ [3, 10]`, `learning_rate ∈ [0.01, 0.3]`, `n_estimators ∈ [50, 500]`, `subsample ∈ [0.6, 1.0]`, `colsample_bytree ∈ [0.6, 1.0]`. Held-out test set is 20% of the training data, stratified by school and outcome.

**Target calibration:** Brier score ≤ 0.20 on the held-out test set. Calibration curve deciles all within ±0.05 of the diagonal. If either check fails we don't ship the model — we fall back to LLM-only per §Fallback below.

**Training infrastructure:** lives in `unioffer-training-pipeline` (the separate repo from the training data plan), Python 3.12, Poetry, `scripts/train_xgboost.py`. The trained model is serialized via `xgboost.Booster.save_model()` to `models/xgboost-are-v{version}.json` and uploaded to Supabase Storage under the `models/` bucket with the version pinned in a DB row in `admissions.are_model_version`.

**Serving:** the Node/Express backend loads the latest approved model version on startup via a read-only signed URL from Supabase Storage, and serves inference through a pinned `xgboost-node` or `onnxruntime-node` dependency (see decision table below).

### Layer 2 — Haiku explanation layer

**Input:** the `p_admit` from Layer 1, the student's features, the school's features, and the **top 3 per-feature SHAP values** from the XGBoost model (so Haiku knows which features drove the prediction up and which drove it down).

**Task:** turn the numeric `p_admit` into one of the four labels and a short narrative explanation.

**Label boundaries (starting point, pinned in an ADR at first calibration):**
- `p_admit ≥ 0.70` → `strongly_aligned`
- `0.45 ≤ p_admit < 0.70` → `competitive`
- `0.20 ≤ p_admit < 0.45` → `developing`
- `p_admit < 0.20` → `gap_identified`

These thresholds are **learned, not guessed**. Once the XGBoost model is trained we calibrate the boundaries against the historical distribution of outcomes in the training set so that (for example) `strongly_aligned` actually correlates with a historical admit rate ≥ 70%, not with some arbitrary mental model of what "strongly aligned" feels like. Re-calibrated on every model retrain.

**Prompt structure (high level — full prompt lives in the DB under slot `are.explain_v1`):**
```
You are explaining to a nervous student why their profile received the label [LABEL]
for [SCHOOL]. You have three facts from the statistical model:

- Top upward driver: [feature name] ([SHAP value])
- Top downward driver: [feature name] ([SHAP value])
- Another notable feature: [feature name] ([SHAP value])

Write a short explanation (80–120 words) that:
1. States the label warmly and in plain English
2. Names the two or three specific factors from the SHAP list
3. Suggests one concrete next step the student could take
4. Does NOT include any percentages, probabilities, or numeric scores
5. Does NOT make promises about admission
6. Does NOT use competitive or judgemental language ("you're behind", "you're falling short")

Output JSON: { label: "...", explanation: "...", primary_driver: "...", suggestion: "..." }
```

**Model:** Claude Haiku 4.5. Temperature 0.3 (low but not zero — we want slight variation across students so two students with identical stats don't see identical sentences). Max tokens 400. Structured output via tool-use.

**Why Haiku not Sonnet:** the explanation task is constrained (controlled vocabulary, short output, clear structure) and Haiku handles it well at ~1/4 the cost. Sonnet is reserved for the A5 essay agent where the input is unstructured and the output has to be high-quality prose. Cost matters at ARE scale because every CEF save recomputes ARE for every saved school.

**Storage:** ARE results are cached per `(student_id, school_id, cef_version)` tuple in `admissions.are_cache` so we don't rerun Haiku on every page load. Cache invalidates when the CEF version increments or when a new model version ships.

## The fallback — why it exists and how it kicks in

Andy's brief anticipated that the training data pipeline might not produce a usable dataset by Week 3. The fallback path is:

1. **If the training set has < 3,000 records at Day 14** or **Brier score > 0.25** after calibration, we skip the XGBoost layer entirely for V1.
2. Instead, Layer 1 becomes a **statistical prior lookup**: we compute a naive `p_admit` from Common Data Set percentiles, specifically a logistic regression on `(stats_composite_zscore, school_admit_rate)`. This lives in the same `are.predict()` function signature so the rest of the pipeline doesn't change.
3. Layer 2 (Haiku explanation) is unchanged — it takes `p_admit` plus feature summaries and outputs the same label + narrative.
4. When the training data recovers, we retrain XGBoost and swap it back in without touching the Haiku layer.

This is cleaner than running an LLM-only ARE because the seam between the two layers is stable. The thing swapping in and out is the prediction function, not the whole architecture.

## The seam — how the two layers meet in code

Inside `/src/agents/are/`:

```
/src/agents/are/
  index.ts              — public API: runAre(studentFeatures, school) → AreResult
  predict.ts            — Layer 1 dispatcher: loads the latest model version,
                          calls the XGBoost serving function OR the statistical-prior
                          fallback, returns { p_admit, shap_values }
  explain.ts            — Layer 2: loads the are.explain_v1 prompt, calls Haiku
                          via /src/agents/_core/callLLM, returns { label, explanation, ... }
  calibrate-labels.ts   — pure function: p_admit → label using the ADR-pinned thresholds
  cache.ts              — read/write to admissions.are_cache
  types.ts              — AreResult, AreLabel, AreFeatures, etc.
```

The public API is:
```typescript
export type AreLabel =
  | "strongly_aligned"
  | "competitive"
  | "developing"
  | "gap_identified";

export type AreResult = {
  label: AreLabel;
  explanation: string;           // 80–120 words, student-safe
  primary_driver: string;         // e.g. "GPA"
  suggestion: string;             // e.g. "Consider an additional research project"
  modelVersion: string;           // e.g. "xgboost-are-v1.3" or "statistical-prior-v1"
  computedAt: string;             // ISO timestamp
  // NOT exposed on the client bundle — internal observability only:
  _internal?: {
    pAdmit: number;
    shapValues: Record<string, number>;
    labelBoundaryVersion: string;
  };
};

export async function runAre(
  features: AreFeatures,
  school: School,
): Promise<AreResult>;
```

Critically: `pAdmit` and the SHAP values are **not** shipped to the client — they live inside `_internal` which is stripped in the API route's envelope before the response goes out. That's how we enforce "zero percentages surfaced to students" at the network boundary, not just at the UI layer.

## Decision: XGBoost serving runtime

| Option | Pros | Cons | Decision |
| --- | --- | --- | --- |
| `xgboost-node` | Native Node binding, lowest latency | Unmaintained, Node 20 compatibility shaky | **Reject** |
| Python XGBoost as a sidecar service | Uses the same artifact the training pipeline produces, proven serving path | Adds a deploy target, cross-language JSON serialization overhead | **Reject** (adds a deploy surface Andy doesn't want in V1) |
| `onnxruntime-node` with the XGBoost model converted to ONNX | Mature, actively maintained, Node 20/22 supported, SHAP values need a small wrapper but doable | Conversion step adds a CI job | **Accept** |

**Final choice: ONNX via `onnxruntime-node`.** The training pipeline exports two artifacts per version: `xgboost-are-v{N}.json` (the native XGBoost format, for Python training verification) and `xgboost-are-v{N}.onnx` (the serving format, for Node). Both get uploaded to Supabase Storage. The Node backend only ever loads the ONNX.

SHAP values aren't available out-of-the-box from ONNX inference — we compute them at training time, persist the background dataset, and serve a **precomputed SHAP explainer** alongside the ONNX model. The explainer lives in `xgboost-are-v{N}-shap.json` as a small TreeExplainer pickle converted to JSON. At inference time the serving layer does a second pass through the explainer to get per-feature contributions. Adds ~20ms per call, worth it for explanation quality.

## PR sequence (once training data exists)

This is the longest of the three deltas and can't start until there's a trained model to wire up. Rough ordering:

1. `feat(are): scaffold /src/agents/are module with public types + stub runAre()` — returns a hard-coded `developing` result so the CEF UI has something to integrate against.
2. `feat(are): add statistical-prior predict() fallback path` — enables the CEF + ARE round trip without a trained model, which unblocks M2.
3. `feat(are): add are.explain_v1 prompt slot and explain() layer` — Haiku integration, live in shadow mode first so we can A/B against the hardcoded stub.
4. `feat(are): wire /src/api/admissions/are/preview route handler` — the HTTP seam, sanitizes _internal before response.
5. `feat(are): add admissions.are_cache table and cache.ts` — caching.
6. `chore(training): train first XGBoost model on whatever training data exists at that point` — in the training pipeline repo, not the app repo.
7. `feat(are): add ONNX model loader + serving path` — swap in the real model behind the existing `predict.ts` dispatcher.
8. `feat(are): add calibrate-labels.ts with ADR-pinned thresholds from the first training run` — label boundary ADR written at this point.
9. `chore(are): add LangSmith trace tags and LLM-as-Judge evals on the explain layer` — observability.
10. `docs(are): ADR capturing the hybrid decision, the label boundaries, the fallback contract, and the observability surface`.

## Risk and rollback

**Risk is high** compared to the other two deltas because it's the only one where a wrong architecture choice bakes into V1. Three things to watch:

1. **Training data quality.** If the 5k/1k minimums slip or the class balance is wrong, XGBoost will return calibration scores that look good in training but fail on live students. Mitigated by the fallback path.
2. **Label boundary drift.** If we pick boundaries by feel rather than by calibration, students will see labels that don't match their actual odds and trust in ARE evaporates. Mitigated by the ADR-pinned calibration.
3. **Explanation layer cost.** Haiku is cheap but ARE is called on every CEF save. If we don't cache aggressively, cost runs up. Mitigated by `admissions.are_cache`.

**Rollback:** revert to the statistical-prior fallback. The seam inside `predict.ts` is the only thing that has to change. The explain layer, the cache, the API route, and the UI don't move. This is why the seam exists.

## Definition of done

- `runAre()` callable from a route handler with a student + school input, returning a valid `AreResult`.
- Four labels all reachable via a unit test on `calibrate-labels.ts`.
- `admissions.are_cache` table exists and the cache round-trip works.
- The statistical-prior fallback passes its own Brier-score unit test.
- The ONNX inference path passes a smoke test with a trained model.
- An ADR in `docs/decisions.md` captures the hybrid decision.
- An ADR captures the label boundaries with the calibration numbers.
- LangSmith traces for every ARE call tag both layers (prediction + explanation) so you can see them as a single grouped trace.
- Zero percentages present in the HTTP response envelope — enforced by a unit test on the `/src/api/admissions/are/preview` route.

## Out of scope

- **Multi-school ARE.** V1 runs ARE per (student, school) tuple. Batch computation across all saved schools is a Phase 2 optimization.
- **Explanation A/B testing.** Shadow prompts are supported (the `prompts` table has an `active | shadow | deprecated` lifecycle) but we don't wire a full experiment framework until Phase 2.
- **Student feedback on ARE labels.** Andy's brief mentions an approval loop in Week 5 — that's where students flag "this label feels wrong" and we capture it for retraining. Out of scope for the initial hybrid build.
