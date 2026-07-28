-- MOM VILLAGE — MIGRATION 25
-- Schema changes for the Care module rebuild, per Roop's full site review,
-- 2026-07-28. Three independent changes bundled here since they're all
-- small and all needed for the same rebuild:

-- ============ 1. Daily check-in: 1-10 scale -> 5 labeled choices ============
-- The check-in UI is being rebuilt with 5 labeled energy states and 5
-- labeled mood states (not a bare numeric scale) — narrowing the range to
-- match. Existing rows (if any, from Roop's own testing) are rescaled
-- rather than dropped, so nothing breaks silently.
update user_daily_checkin set energy_score = least(5, greatest(1, ceil(energy_score / 2.0)::int))
  where energy_score is not null;
update user_daily_checkin set mood_score = least(5, greatest(1, ceil(mood_score / 2.0)::int))
  where mood_score is not null;

alter table user_daily_checkin drop constraint if exists user_daily_checkin_energy_score_check;
alter table user_daily_checkin drop constraint if exists user_daily_checkin_mood_score_check;
alter table user_daily_checkin add constraint user_daily_checkin_energy_score_check check (energy_score between 1 and 5);
alter table user_daily_checkin add constraint user_daily_checkin_mood_score_check check (mood_score between 1 and 5);

-- ============ 2. Per-item completion: make it a real daily history ============
-- user_care_progress originally had primary key (user_id, content_id) —
-- meaning a Care Step could only ever be marked done once, permanently,
-- even though the same content row resurfaces every time she picks the
-- same time-available answer within a phase (phases run for weeks). Adding
-- a date column and widening the primary key turns this into a genuine
-- private daily completion history — a fresh "done" state each day,
-- without losing any prior day's record. Never displayed as a streak/score,
-- just a gentle "you showed up on N of the last 7 days" note.
alter table user_care_progress add column if not exists completed_date date;
update user_care_progress set completed_date = coalesce(completed_at::date, current_date)
  where completed_date is null;
alter table user_care_progress alter column completed_date set default current_date;
alter table user_care_progress alter column completed_date set not null;
alter table user_care_progress drop constraint if exists user_care_progress_pkey;
alter table user_care_progress add primary key (user_id, content_id, completed_date);

-- ============ 3. Strict per-item content standard ============
-- New optional fields so every Care Step can carry: what to do (existing
-- `body` column, unchanged), how long, why it matters today, what to
-- avoid, and an optional expandable detail — matching Roop's 2026-07-28
-- content standard. All nullable: existing rows keep rendering exactly as
-- before (just `body`) until they're deliberately restructured phase by
-- phase, same incremental pattern as every other Care Chart content pass.
alter table weekly_care_chart_content add column if not exists how_long text;
alter table weekly_care_chart_content add column if not exists why_today text;
alter table weekly_care_chart_content add column if not exists what_to_avoid text;
alter table weekly_care_chart_content add column if not exists detail text;
