-- =============================================================================
-- 00000000000014_training_profile_directive_fields.sql
-- =============================================================================
--
-- Architecture Directive: add test-optional tracking, raw credentials,
-- and recency weighting to training_profile.
--
-- New columns:
--   * test_optional_applicant (bool) — if year >= 2020, applicant may
--     have no SAT/ACT due to COVID test-optional policies
--   * raw_credential (jsonb) — stores the original extracted credential
--     data before normalization, per ADR-002 raw snapshot architecture
--   * credential_type (text) — 'sat', 'act', 'both', 'test_optional'
--   * recency_weight (numeric) — time-decay weight for model training:
--     2023+ = 1.0, 2021-22 = 0.7, 2019-20 = 0.4, pre-2019 = excluded
-- =============================================================================

set search_path = admissions, public;

alter table admissions.training_profile
  add column if not exists test_optional_applicant boolean default false;

alter table admissions.training_profile
  add column if not exists raw_credential jsonb;

alter table admissions.training_profile
  add column if not exists credential_type text
    check (credential_type in ('sat', 'act', 'both', 'test_optional'));

alter table admissions.training_profile
  add column if not exists recency_weight numeric(3,2)
    check (recency_weight between 0 and 1);

create index if not exists training_profile_recency_idx
  on admissions.training_profile (recency_weight)
  where recency_weight is not null;

create index if not exists training_profile_credential_type_idx
  on admissions.training_profile (credential_type);
