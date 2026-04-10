-- =============================================================================
-- 00000000000009_admissions_scrape_requests.sql
-- =============================================================================
--
-- Scrape request tracking. Dedup + status tracking for the pipeline.
--
-- Source: supabase/migrations/DRAFTS.md §9.
-- Status: UNGATED — Day 5 go/no-go requires live data.
-- =============================================================================

set search_path = admissions, public;

create table admissions.scrape_requests (
  id              uuid primary key default gen_random_uuid(),
  source_platform text,
  source_uri      text not null,
  subreddit       text,
  status          text not null default 'pending',
  requested_at    timestamptz not null default now(),
  fetched_at      timestamptz,
  http_status     integer,
  body_hash       text,
  error           text,
  retry_count     integer not null default 0
);

create index scrape_requests_platform_idx on admissions.scrape_requests (source_platform);
create index scrape_requests_status_idx on admissions.scrape_requests (status);
create unique index scrape_requests_uri_uniq on admissions.scrape_requests (source_uri);

alter table admissions.scrape_requests enable row level security;
-- No policies: service-role only.
