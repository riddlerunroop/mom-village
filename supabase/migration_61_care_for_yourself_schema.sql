-- Care for Yourself — the seven-day personal-care rhythm module.
-- See CLAUDE.md's 2026-09-18 "Care for Yourself" entry for the full
-- product spec (Roop's own, verbatim) and the four confirmed decisions:
--   - she writes all 210 real Care Notes herself; Claude only builds the
--     plumbing (this schema + the rotation logic + the UI), seeded here
--     with 7 clearly-flagged placeholder notes so the feature is
--     demonstrable before her real content exists.
--   - this module fully replaces the old generic per-week
--     care_chart_week_content.care_for_yourself text field everywhere a
--     mother actually sees her chart (same "full structural replacement"
--     precedent as Reset-of-the-day replacing the old mood-mapped Reset).
--   - Saturday ("My care day") gets its own dedicated 30-note bank
--     (CARE-MYCARE-001..030), not a "revisit another category" mechanic.
--   - built for web and native together in this same session.
--
-- Two tables:
--   care_for_yourself_notes — the content bank itself. Read-only for
--     authenticated users, authored only via migration (same convention
--     as reset_activities/monthly_chart_content) — no write policy at all.
--   user_care_completions — one soft "made time for me" tick per user per
--     day per category. No streak logic anywhere — this table only ever
--     supports a gentle weekly count, never a target/score, matching this
--     project's standing non-punitive design principle.
--
-- Rotation-without-repeat is handled entirely in code (see
-- src/lib/careForYourselfCalculator.ts / mobile/lib/careForYourselfCalculator.ts)
-- via a deterministic per-user shuffle + a week-index pick — so no "seen"
-- history table is needed: each mother gets her own fixed pseudo-random
-- ordering of a category's notes, and which position shows "today" simply
-- advances by one every time that weekday comes around. That already
-- satisfies "a different, unused note every occurrence, no repeats until
-- the whole bank cycles" without any extra state to write or maintain.

create table if not exists care_for_yourself_notes (
  id text primary key,                          -- e.g. 'CARE-FACE-014'
  category text not null check (category in ('hair', 'face', 'handsfeet', 'body', 'groom', 'feelgood', 'mycare')),
  note_number int not null,                      -- 1-30 (or more later), position within its category
  content_type text not null check (content_type in ('KNOW', 'CARE', 'RITUAL', 'FEEL')),
  headline text not null,
  care_note text not null,
  tiny_action text,                              -- optional, per spec ("Today: ...")
  safety_flag text not null default 'placeholder' check (safety_flag in ('placeholder', 'draft', 'reviewed', 'approved')),
  last_reviewed_date date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (category, note_number)
);

alter table care_for_yourself_notes enable row level security;

create policy "Authenticated users can read care_for_yourself_notes"
  on care_for_yourself_notes for select
  to authenticated
  using (true);

create table if not exists user_care_completions (
  user_id uuid not null references auth.users(id) on delete cascade,
  completed_date date not null,
  category text not null,
  note_id text references care_for_yourself_notes(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (user_id, completed_date, category)
);

alter table user_care_completions enable row level security;

create policy "Users can manage their own care completions"
  on user_care_completions for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
