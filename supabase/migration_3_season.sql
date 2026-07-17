-- MOM VILLAGE — MIGRATION 3
-- Adds seasonal relevance to Monthly Chart content, so advice can differ
-- for monsoon vs. summer vs. winter, on top of the existing month/delivery filters.

alter table monthly_chart_content add column if not exists season text
  check (season in ('summer', 'monsoon', 'winter', 'any')) default 'any';

-- 'any' = timeless advice that applies no matter the season (most content will be this)
-- 'summer' / 'monsoon' / 'winter' = advice specific to that season
-- A mom sees content tagged for her current real-world season, plus anything tagged 'any'
