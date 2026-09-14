-- Nourish weekly meal-plan content — connects the standalone "Nourish" docx-per-week
-- nutrition series (previously living only as individual .docx files at the
-- mom-village folder root, with no database ingestion at all — see CLAUDE.md's
-- "Nourish content series" section) into the app's Care module for the first time.
--
-- This is a SEPARATE table from care_chart_week_content, which already has a much
-- thinner `nourish` text field (a single plain-text sentence per week, authored
-- directly in the Care Chart SQL migrations, unrelated to this series). That field
-- and this table are two different systems that happen to share the word "Nourish" —
-- see the 2026-09-14 session notes for the full history of that confusion. This
-- migration does not touch care_chart_week_content at all.
--
-- Content source: the locked Nourish docx-per-week series covering the Trimester
-- series (pregnancy weeks 1, 9-40 — weeks 2-8 are a genuine gap, no locked file
-- exists for them anywhere in the project folder as of 2026-09-14, flagged to Roop
-- and deliberately left out rather than fabricated) and the Postpartum series
-- (weeks 1-157, complete, spanning six named phases through three years and beyond).
-- Parsed programmatically from pandoc-converted docx text (not hand-transcribed) —
-- see the ingestion script referenced in CLAUDE.md's next update for exact method.
--
-- Row key is (stage, week_number) — NOT the same numbering as care_chart_week_content's
-- journey_week_number. The app computes which row to show from the mother's actual
-- gestational week (1-40) while pregnant, or weeks-since-birth (1-157) postpartum —
-- see src/lib/nourishCalculator.ts.

create table if not exists nourish_week_content (
  id uuid primary key default gen_random_uuid(),
  stage text not null check (stage in ('pregnancy', 'postpartum')),
  week_number int not null check (week_number > 0),
  trimester text check (trimester in ('first', 'second', 'third')),
  phase_label text,
  theme_title text not null,
  mantra text,
  why_it_matters text,
  condition_notes text,
  meat_fish_eggs_note text,
  using_meals_note text,
  -- One array of 7 day objects, each shaped like:
  -- { day_number, title, notes, breakfast_a, breakfast_b, lunch_a, lunch_b,
  --   nourishment_break_a, nourishment_break_b, dinner_a, dinner_b, still_hungry }
  -- "_b" fields and "still_hungry" may be null on free-choice reflection days
  -- (Day 7 in later-era weeks deliberately has no forced A/B choices, per the
  -- series' own standing content rule).
  days jsonb not null,
  reflection text,
  looking_ahead text,
  created_at timestamptz not null default now(),
  unique (stage, week_number)
);

alter table nourish_week_content enable row level security;

-- Read-only for any logged-in mother, same pattern as care_chart_week_content and
-- monthly_chart_content — Roop authors content via migrations only, no write policy.
create policy "Nourish week content readable by authenticated users"
  on nourish_week_content for select
  using (auth.role() = 'authenticated');

-- Per-mother "which meal did you pick today" tracking — optional, lets the app
-- remember whether she chose A or B for each slot without forcing her to re-decide
-- if she reopens the day. Mirrors user_care_week_progress's shape/intent.
create table if not exists user_nourish_choices (
  user_id uuid not null references auth.users(id) on delete cascade,
  stage text not null check (stage in ('pregnancy', 'postpartum')),
  week_number int not null,
  day_number int not null check (day_number between 1 and 7),
  choice_date date not null default current_date,
  breakfast_choice text check (breakfast_choice in ('a', 'b')),
  lunch_choice text check (lunch_choice in ('a', 'b')),
  nourishment_break_choice text check (nourishment_break_choice in ('a', 'b')),
  dinner_choice text check (dinner_choice in ('a', 'b')),
  primary key (user_id, stage, week_number, day_number, choice_date)
);

alter table user_nourish_choices enable row level security;

create policy "Users manage their own nourish choices"
  on user_nourish_choices for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
