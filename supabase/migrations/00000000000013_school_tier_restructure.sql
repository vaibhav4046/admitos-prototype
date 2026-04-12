-- =============================================================================
-- 00000000000013_school_tier_restructure.sql
-- =============================================================================
--
-- Architecture Directive: restructure school tiers into institution_type
-- (university/lac) and tier_band (u1-u5, l1-l4) per Andy's directive.
--
-- Adds:
--   * institution_type: 'university' or 'lac' (liberal arts college)
--   * tier_band: granular tier (u1-u5 for universities, l1-l4 for LACs)
--   * Materialized view for tier coverage monitoring
--
-- The old `tier` column is kept for backward compatibility during M1.
-- =============================================================================

set search_path = commons_db, public;

-- Add new columns
alter table commons_db.school
  add column if not exists institution_type text
    check (institution_type in ('university', 'lac'));

alter table commons_db.school
  add column if not exists tier_band text
    check (tier_band in ('u1','u2','u3','u4','u5','l1','l2','l3','l4'));

create index if not exists school_institution_type_idx on commons_db.school (institution_type);
create index if not exists school_tier_band_idx on commons_db.school (tier_band);

-- Materialized view: tier coverage summary
-- Refreshed periodically to monitor training data distribution
create materialized view if not exists commons_db.tier_coverage as
select
  institution_type,
  tier_band,
  count(*) as school_count,
  round(avg(admit_rate)::numeric, 4) as avg_admit_rate
from commons_db.school
where institution_type is not null and tier_band is not null
group by institution_type, tier_band
order by institution_type, tier_band;

create unique index if not exists tier_coverage_band_idx
  on commons_db.tier_coverage (institution_type, tier_band);
