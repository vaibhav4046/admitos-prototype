-- Migration 15: Make application_year mandatory on training_profile.
--
-- Gap 2 fix: recency-weight depends on application_year to compute
-- time-decay weights. Without NOT NULL, rows with missing years
-- silently get weight=null and are excluded from training, which
-- defeats the purpose of the recency system.
--
-- This migration:
--   1. Backfills any NULL application_year with the current year
--   2. Adds NOT NULL constraint
--   3. Adds CHECK constraint for reasonable year range
--
-- Parallel-safe: no dependency on migrations 13 or 14.

-- Backfill NULLs with 2024 (current dataset year)
update admissions.training_profile
  set application_year = 2024
  where application_year is null;

-- Add NOT NULL constraint
alter table admissions.training_profile
  alter column application_year set not null;

-- Add range check (1990–2030 covers any reasonable dataset)
alter table admissions.training_profile
  add constraint training_profile_application_year_range
  check (application_year between 1990 and 2030);
