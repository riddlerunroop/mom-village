-- MOM VILLAGE — MIGRATION 2
-- Adds: twin/multiples support to baby needs, and the full Weekly Care Chart
-- (personalized mom-centric weekly content, separate from the baby-centric Monthly Chart).
-- Run this in Supabase SQL Editor after schema.sql.

-- ============ TWINS / MULTIPLES SUPPORT ============
-- How many babies this pregnancy/delivery involves — changes gear needs, budget, and milestone pacing.
alter table profiles add column if not exists baby_count int default 1 check (baby_count >= 1);

-- Let Monthly Chart content branch for singleton vs. multiples, same pattern as delivery_type.
alter table monthly_chart_content add column if not exists baby_count_type text
  check (baby_count_type in ('single', 'multiples', 'any')) default 'any';

-- ============ HER CARE PROFILE (the quiz) ============
-- Health flags can be multiple ("select all"), so stored as an array.
create table user_care_profile (
  user_id uuid references profiles(id) primary key,
  health_flags text[] default '{}',  -- e.g. {'thyroid', 'diabetes_gd'}; empty array = no flags
  updated_at timestamptz default now()
);

-- Valid health flag values (enforced in application code, not a DB constraint,
-- since arrays don't support check-in-list cleanly): 'thyroid', 'diabetes_gd', 'pcos', 'high_bp'

-- Her daily capacity resets every day — not stored long-term, just today's answer,
-- used to pick which time-tier of content to show her right now.
create table user_daily_checkin (
  user_id uuid references profiles(id) not null,
  checkin_date date not null default current_date,
  time_available text check (time_available in ('5', '15', '30')) not null,
  energy_score int check (energy_score between 1 and 10),
  mood_score int check (mood_score between 1 and 10),
  primary key (user_id, checkin_date)
);

-- ============ WEEKLY CARE CHART CONTENT ============
-- Postpartum week (0 = birth week). Content is authored once, filtered per mom by
-- delivery type, health flag, and her time-available-today answer.
create table weekly_care_chart_content (
  id uuid primary key default gen_random_uuid(),
  week_number int not null,
  section text check (section in ('body', 'food', 'mind')) not null,
  delivery_type text check (delivery_type in ('normal', 'c_section', 'any')) default 'any',
  health_flag text check (health_flag in ('none', 'thyroid', 'diabetes_gd', 'pcos', 'high_bp')) default 'none',
  time_option text check (time_option in ('5', '15', '30', 'any')) default 'any',
  title text not null,
  body text not null,
  video_ref text,              -- HeyGen video identifier/URL, added later
  mantra text,                 -- this week's short affirmation line
  sort_order int default 0
);

-- Her progress through the Care Chart — separate from Monthly Chart progress,
-- since these run on entirely different clocks (week vs. month).
create table user_care_progress (
  user_id uuid references profiles(id) not null,
  content_id uuid references weekly_care_chart_content(id) not null,
  completed boolean default false,
  completed_at timestamptz,
  primary key (user_id, content_id)
);

-- ============ ROW LEVEL SECURITY ============
alter table user_care_profile enable row level security;
alter table user_daily_checkin enable row level security;
alter table user_care_progress enable row level security;

create policy "Users manage their own care profile" on user_care_profile
  for all using (auth.uid() = user_id);

create policy "Users manage their own daily checkins" on user_daily_checkin
  for all using (auth.uid() = user_id);

create policy "Users manage their own care progress" on user_care_progress
  for all using (auth.uid() = user_id);
