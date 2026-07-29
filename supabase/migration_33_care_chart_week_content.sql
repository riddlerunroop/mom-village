-- Care Chart week-by-week rebuild, 2026-07-29.
--
-- Roop's instruction: rebuild the Care Chart from 9 broad phases into true
-- individual weeks, starting from pregnancy week 1, with the same content
-- standard used everywhere else in this app — drafted, run past other AI
-- apps for a second pass, then locked. This migration adds the schema; the
-- content itself is seeded by migration_34 (Second trimester, weeks 14-26,
-- the first batch actually finished) — First trimester (weeks 1-13) is
-- still in its older, simpler locked format and needs the same fuller
-- treatment before it's converted into this table (tracked separately,
-- not done in this pass).
--
-- Deliberately a NEW table, not an extension of weekly_care_chart_content —
-- the content shape is fundamentally different (one rich record per week,
-- not N discrete items per phase), so forcing it into the old row-per-item
-- model would be worse than a clean new table. The Care Chart page falls
-- back to the old phase-based system for any week that doesn't have a row
-- here yet (postpartum, Third trimester, and — for now — First trimester),
-- so nothing breaks for weeks not yet converted.

create table if not exists care_chart_week_content (
  week_number int primary key,           -- forward-counting pregnancy week (1 = week 1 of pregnancy), matches how every mother and clinician already thinks about pregnancy weeks
  trimester text not null check (trimester in ('first', 'second', 'third')),
  theme_title text not null,             -- e.g. "A gentler beginning"
  mantra text not null,                  -- the week's short quote
  priority text not null,                -- "this week's priority" one-liner
  journey text not null,                 -- "this week in your journey" development paragraph
  what_you_may_notice text[] not null default '{}',  -- possibility list, explicitly not a checklist
  move jsonb not null,                   -- { focus, tiers: { heavy, steady, feeling_good }, mood_adjustment, safety }
  nourish text not null,
  hydration_goal text not null,
  reset jsonb not null,                  -- { heavy_day, a_little_low, okay, good, really_good } — mood-mapped, matching the daily check-in's 5 mood options
  care_for_yourself text not null,
  your_corner text not null,             -- renamed Rediscover
  support_moment text not null,          -- "Partner Moment" renamed per the editorial note, for users without a partner/who prefer broader language
  celebrate_this_week text not null,
  for_your_care_team text not null,      -- what to bring up at her next appointment
  condition_notes jsonb,                 -- reserved for future thyroid/PCOS/diabetes-GD/high-BP-specific notes per week — not populated yet, flagged as a known gap
  created_at timestamptz not null default now()
);

alter table care_chart_week_content enable row level security;

-- Read-only from the app; Roop authors/updates this content directly via
-- migrations run in Supabase's SQL editor, same pattern as
-- monthly_chart_content and weekly_care_chart_content.
create policy "Authenticated users can read week content"
  on care_chart_week_content for select
  using (auth.role() = 'authenticated');

-- Completion tracking for the new week-content model. The old
-- user_care_progress table is keyed to weekly_care_chart_content's per-item
-- UUIDs, which don't exist in this richer, one-row-per-week model — so a
-- new table keyed by week_number + a named card_key (e.g. "move",
-- "nourish", "reset"). Same non-punitive daily-completion-history pattern
-- as user_care_progress (migration_25): a fresh "done" state each day, never
-- a streak or score.
create table if not exists user_care_week_progress (
  user_id uuid references profiles(id) not null,
  week_number int not null,
  card_key text not null,
  completed_date date not null default current_date,
  primary key (user_id, week_number, card_key, completed_date)
);

alter table user_care_week_progress enable row level security;

create policy "Users manage their own week progress"
  on user_care_week_progress for all
  using (auth.uid() = user_id);
