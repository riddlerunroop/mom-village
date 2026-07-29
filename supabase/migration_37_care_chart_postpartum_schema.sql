-- Care Chart week-by-week rebuild — postpartum schema extension, 2026-07-29.
--
-- Extends care_chart_week_content (migration_33) to carry the full 0-156-week
-- postpartum span, not just pregnancy weeks 1-39. Two changes:
--
-- 1. The `trimester` check constraint only allowed 'first'/'second'/'third'.
--    Widened to also allow 'postpartum' — used for every week from birth
--    through the third birthday. (Not further split into phase names in this
--    column; the existing carePhaseKey()/carePhaseLabel() logic in
--    weekCalculator.ts already derives the right phase label from the week
--    number for display purposes, so this column only needs to distinguish
--    "still pregnant" from "already born" for any future querying/reporting.)
--
-- 2. Two new nullable text columns, `feeding_comfort` and `rest_support` —
--    the reviewed Early Healing doc (see migration_38) introduced these as
--    two more standard per-week fields alongside the existing nourish/
--    hydration_goal, specific to postpartum recovery (feeding-method comfort
--    and protected-rest guidance). Nullable and additive, same pattern as
--    the how_long/why_today/what_to_avoid/detail columns added to
--    weekly_care_chart_content in migration_25 — pregnancy weeks simply
--    leave these null, no backfill needed, nothing breaks.
--
-- The already-existing `move`/`reset` jsonb columns need no schema change —
-- postpartum weeks add a new `recovery_route` key inside the `move` jsonb
-- blob (delivery-type-branched guidance: vaginal / assisted birth or
-- significant tear / caesarean / complications-restrictions) and jsonb
-- columns don't need a migration to carry a new key.
--
-- The already-existing `condition_notes` jsonb column (reserved, unpopulated
-- since migration_33) is used for real for the first time in migration_38 —
-- also needs no schema change, just starts being populated.

do $$
declare
  con text;
begin
  select conname into con
  from pg_constraint
  where conrelid = 'care_chart_week_content'::regclass
    and contype = 'c'
    and pg_get_constraintdef(oid) like '%trimester%';
  if con is not null then
    execute format('alter table care_chart_week_content drop constraint %I', con);
  end if;
end $$;

alter table care_chart_week_content
  add constraint care_chart_week_content_trimester_check
  check (trimester in ('first', 'second', 'third', 'postpartum'));

alter table care_chart_week_content
  add column if not exists feeding_comfort text,
  add column if not exists rest_support text;
