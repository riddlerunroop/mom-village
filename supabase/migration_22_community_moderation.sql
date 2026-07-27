-- MOM VILLAGE — MIGRATION 22
-- Community moderation/reporting — explicitly deferred at launch (migration
-- 11), added now per Roop's 2026-07-27 instruction to finish building out
-- the app. Minimum viable version, matching how every other piece of
-- content in this app is reviewed: no in-app admin panel — Roop reviews
-- reports directly in Supabase (Table Editor or a saved SQL query, same
-- workflow as everything else) and hides content with a plain UPDATE. See
-- chat / CLAUDE.md for the review query she can save and reuse.

-- ============ SOFT-HIDE FLAG ============
-- A mother can flag a thread or reply; Roop reviews and hides it herself.
-- Soft-hide rather than delete so nothing is destroyed by mistake and she
-- can always reverse it (set back to false) if a report turns out to be
-- unfounded.
alter table community_threads add column if not exists is_hidden boolean not null default false;
alter table community_replies add column if not exists is_hidden boolean not null default false;

-- Hidden content stops showing up for everyone, including its own author —
-- a real moderation action, not just a personal-view filter.
drop policy if exists "Any logged-in mother can read all threads" on community_threads;
create policy "Any logged-in mother can read visible threads" on community_threads
  for select using (auth.role() = 'authenticated' and is_hidden = false);

drop policy if exists "Any logged-in mother can read all replies" on community_replies;
create policy "Any logged-in mother can read visible replies" on community_replies
  for select using (auth.role() = 'authenticated' and is_hidden = false);

-- ============ REPORTS ============
create table community_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references profiles(id) not null,
  thread_id uuid references community_threads(id),
  reply_id uuid references community_replies(id),
  reason text not null,
  created_at timestamptz default now(),
  constraint community_reports_target_check check (
    (thread_id is not null and reply_id is null) or
    (thread_id is null and reply_id is not null)
  )
);

alter table community_reports enable row level security;

-- Insert-only for regular users, as themselves. No select policy — same
-- pattern as every other content table in this app: Roop reviews as the
-- table owner directly in Supabase, which isn't subject to RLS, rather than
-- this app building its own admin screen.
create policy "A mother can report as herself" on community_reports
  for insert with check (auth.uid() = reporter_id);
