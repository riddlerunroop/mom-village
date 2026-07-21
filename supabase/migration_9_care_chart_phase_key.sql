-- MOM VILLAGE — MIGRATION 9
-- Adds a stable "phase_key" to weekly_care_chart_content so content can be
-- authored per phase (9 phases spanning pregnancy through the third
-- birthday) instead of per individual week — matches how the content was
-- actually locked (see Weekly Care Chart - All 9 Phases (LOCKED).docx).
-- week_number is kept for sorting/display, but phase_key is what the app
-- actually queries on.

alter table weekly_care_chart_content add column if not exists phase_key text;

alter table weekly_care_chart_content add constraint weekly_care_chart_content_phase_key_check
  check (phase_key in (
    'first_trimester',
    'second_trimester',
    'third_trimester',
    'early_healing',
    'finding_rhythm',
    'rebuilding',
    'settling_into_strength',
    'sustainable_rhythms',
    'rhythm_year_three'
  ));

-- Table is currently empty (content not yet loaded), so it's safe to
-- require phase_key going forward without a backfill step.
alter table weekly_care_chart_content alter column phase_key set not null;
