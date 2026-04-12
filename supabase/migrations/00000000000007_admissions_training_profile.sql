-- =============================================================================
-- 00000000000007_admissions_training_profile.sql
-- =============================================================================
--
-- Training profile table for the ML training data pipeline.
--
-- Each row is one extracted applicant profile from a Reddit/forum post.
-- The Pydantic validator in admitos-training-pipeline ensures every row
-- satisfies these constraints before it hits the DB.
--
-- Source: supabase/migrations/DRAFTS.md §7.
-- Status: UNGATED — Day 5 go/no-go requires live data.
-- =============================================================================

set search_path = admissions, public;

create table admissions.training_profile (
  id                       uuid primary key default gen_random_uuid(),
  source_platform          text,
  source_uri               text,
  source_url               text,
  source_type              text not null default 'reddit',
  source_hash              text,
  author_hmac              text,
  unweighted_gpa           numeric(3,2) not null check (unweighted_gpa between 0 and 4),
  sat_score                integer check (sat_score between 400 and 1600),
  act_score                integer check (act_score between 1 and 36),
  ap_course_count          integer not null check (ap_course_count between 0 and 20),
  ec_hours_per_week        integer not null check (ec_hours_per_week between 0 and 60),
  leadership_roles_count   integer not null check (leadership_roles_count between 0 and 12),
  research_experience      boolean not null,
  major_category           text not null check (major_category in (
    'stem','humanities','social_science','arts','business','undecided'
  )),
  nationality_region       text not null check (nationality_region in (
    'us_domestic','us_international','uk_home','uk_international',
    'asia','middle_east','europe','africa','latam','oceania','other'
  )),
  nationality_country      text check (nationality_country ~ '^[A-Z]{2}$'),
  target_school_id         uuid references commons_db.school(id),
  admission_outcome        text not null check (admission_outcome in ('admitted','waitlisted','rejected')),
  extraction_confidence    numeric(3,2) not null check (extraction_confidence between 0 and 1),
  first_gen_status         boolean,
  legacy_status            boolean,
  recruited_athlete        boolean,
  decision_round           text check (decision_round in ('ea','ed','rd','rea','ucas')),
  application_year         integer check (application_year between 2015 and 2030),
  check (sat_score is not null or act_score is not null),
  created_at               timestamptz not null default now()
);

create index training_profile_outcome_idx on admissions.training_profile (admission_outcome);
create index training_profile_source_idx on admissions.training_profile (source_type);
create index training_profile_country_idx on admissions.training_profile (nationality_country);
create index training_profile_created_idx on admissions.training_profile (created_at desc);

alter table admissions.training_profile enable row level security;
-- No policies: service-role only (pipeline writes, not user-facing).
