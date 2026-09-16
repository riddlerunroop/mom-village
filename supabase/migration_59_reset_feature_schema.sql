-- MOM VILLAGE — MIGRATION 59
-- Reset rebuild, 2026-09-16. Replaces the old mood-matched Reset card (one
-- of five fixed sentences per week, picked by that day's check-in mood —
-- CareWeekContent.tsx's old `ResetContent`/`RESET_KEY_BY_MOOD`) with a
-- genuinely dynamic feature, per Roop's explicit brief: "Need a Reset?"
-- surfaces one small, fun, curated activity from a bank of ~30 cards — a
-- real break from motherhood for a few minutes, not another self-care
-- instruction to complete. See CLAUDE.md for the full design conversation
-- (why badges instead of a streak, why the Gallery stays heart-only with no
-- comments, why sharing isn't algorithmically ranked by default).
--
-- The old `care_chart_week_content.reset` jsonb column is left exactly as
-- it is — not read anymore once the app code for this migration ships, but
-- not deleted either, since stripping 196 weeks' worth of already-locked
-- content for a column nothing reads is a real, unnecessary risk for zero
-- benefit. `ResetContent`/`RESET_KEY_BY_MOOD` in CareWeekContent.tsx are
-- removed from the render path but the type/data aren't touched.

-- ============ RESET ACTIVITIES (the curated bank) ============
-- Content-authored, same "Roop writes it, Claude seeds it via migration,
-- read-only for the app" pattern as every other content table in this
-- project (monthly_chart_content, weekly_care_chart_content, etc.).
create table reset_activities (
  id uuid primary key default gen_random_uuid(),
  card_number int not null unique,   -- 1-30, matches Roop's own numbering —
                                       -- also the order the daily rotation
                                       -- below cycles through
  emoji text not null,
  title text not null,
  body text not null,
  is_active boolean not null default true,  -- lets a card be retired from
                                              -- the daily rotation without
                                              -- deleting it or renumbering
                                              -- every card after it
  created_at timestamptz default now()
);

alter table reset_activities enable row level security;

create policy "Any logged-in mother can read active reset activities"
  on reset_activities for select using (auth.role() = 'authenticated');

-- ============ COMPLETIONS (cumulative badge counting — no streak) ============
-- Deliberately NOT a streak: Roop's explicit call after discussing it
-- directly — a broken streak carries a real "I lost it" feeling even with
-- no visible penalty, which is exactly the wrong note for the one feature
-- in Care meant to have zero stakes. One row per mother per day she taps
-- "I'm doing this" (not per card shown/skipped — skipping is never logged,
-- on purpose, since there's nothing to track about a day she chose to pass
-- on). Total row count for a mother is her all-time Reset count, and it
-- only ever goes up — see src/lib/resetCalculator.ts for the badge
-- thresholds this count is checked against.
create table user_reset_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null,
  completed_date date not null,
  activity_id uuid references reset_activities(id) not null,
  created_at timestamptz default now(),
  unique (user_id, completed_date)
);

create index user_reset_completions_user_idx on user_reset_completions (user_id, completed_date desc);

alter table user_reset_completions enable row level security;

create policy "A mother can read her own reset completions"
  on user_reset_completions for select using (auth.uid() = user_id);

create policy "A mother can log her own reset completion"
  on user_reset_completions for insert with check (auth.uid() = user_id);

-- ============ SHARES ("Share your Reset with the Village") ============
-- Public within the app by design — any logged-in mother, not just the
-- poster or her contacts, per Roop's spec: "any mother can browse other
-- mothers' Reset moments without following them." caption doubles as the
-- text content itself for a text-only share, or an optional note alongside
-- a photo/video/audio share. duration_seconds is recorded for video/audio
-- purely so the 60-second cap (checked client-side before upload, both web
-- and native) has a server-side record of what was actually validated —
-- not re-enforced server-side in this pass.
create table reset_shares (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null,
  activity_id uuid references reset_activities(id),  -- nullable: a share
                                                        -- always starts from
                                                        -- that day's card,
                                                        -- but kept nullable
                                                        -- in case a future
                                                        -- share path doesn't
  media_type text not null check (media_type in ('text', 'photo', 'video', 'audio')),
  media_path text,     -- path within the reset-shares bucket; null for a
                         -- pure text share
  caption text,         -- the text itself (media_type='text') or an
                         -- optional note alongside photo/video/audio
  duration_seconds numeric,
  heart_count int not null default 0,   -- denormalized, same pattern as
                                          -- community_threads.like_count
  is_hidden boolean not null default false,  -- same soft-hide moderation
                                                -- pattern as Community
                                                -- (migration_22) — Roop
                                                -- reviews reports and flips
                                                -- this directly in Supabase
  created_at timestamptz default now(),
  constraint reset_shares_media_check check (
    (media_type = 'text' and media_path is null and caption is not null) or
    (media_type <> 'text' and media_path is not null)
  )
);

create index reset_shares_created_idx on reset_shares (created_at desc);

alter table reset_shares enable row level security;

create policy "Any logged-in mother can read visible reset shares, plus her own hidden ones"
  on reset_shares for select using (
    auth.role() = 'authenticated' and (is_hidden = false or user_id = auth.uid())
  );

create policy "A mother can share as herself"
  on reset_shares for insert with check (auth.uid() = user_id);

create policy "A mother can delete her own reset share"
  on reset_shares for delete using (auth.uid() = user_id);

-- ============ HEARTS ============
-- Heart-tap only, on purpose — no comments, no reply thread, no visible
-- "liked by" list. Keeps the Gallery a browse-and-appreciate space, not a
-- second discussion surface (Community already is that). Same
-- denormalized-count + trigger pattern as community_thread_likes
-- (migration_52).
create table reset_share_hearts (
  share_id uuid references reset_shares(id) not null,
  user_id uuid references profiles(id) not null,
  created_at timestamptz default now(),
  primary key (share_id, user_id)
);

alter table reset_share_hearts enable row level security;

create policy "Any logged-in mother can read reset share hearts"
  on reset_share_hearts for select using (auth.role() = 'authenticated');

create policy "A mother can heart as herself"
  on reset_share_hearts for insert with check (auth.uid() = user_id);

create policy "A mother can remove her own heart"
  on reset_share_hearts for delete using (auth.uid() = user_id);

create or replace function bump_reset_share_heart_count()
returns trigger
security definer
set search_path = public
as $$
begin
  if TG_OP = 'INSERT' then
    update reset_shares set heart_count = heart_count + 1 where id = new.share_id;
    return new;
  elsif TG_OP = 'DELETE' then
    update reset_shares set heart_count = greatest(0, heart_count - 1) where id = old.share_id;
    return old;
  end if;
  return null;
end;
$$ language plpgsql;

create trigger reset_share_heart_insert
  after insert on reset_share_hearts
  for each row execute function bump_reset_share_heart_count();

create trigger reset_share_heart_delete
  after delete on reset_share_hearts
  for each row execute function bump_reset_share_heart_count();

-- ============ REPORTING — extend the existing Community report flow ============
-- Reuses community_reports (migration_22) rather than a parallel table, so
-- Roop reviews everything reportable in the app from one place. The
-- original check constraint named exactly one of thread_id/reply_id —
-- widened to allow exactly one of thread_id/reply_id/reset_share_id.
alter table community_reports add column if not exists reset_share_id uuid references reset_shares(id);

alter table community_reports drop constraint if exists community_reports_target_check;
alter table community_reports add constraint community_reports_target_check check (
  (thread_id is not null and reply_id is null and reset_share_id is null) or
  (thread_id is null and reply_id is not null and reset_share_id is null) or
  (thread_id is null and reply_id is null and reset_share_id is not null)
);

-- ============ STORAGE — RESET SHARES ============
-- A genuine departure from every other bucket in this app: public, not
-- private-per-user, since the whole point is other mothers browsing it.
-- Marking the bucket itself public means the Gallery can render media
-- straight from its public URL with no per-viewer signed-URL step — a real
-- simplification given the Gallery can show many mothers' media on one
-- screen. Upload/delete still restricted to her own folder, same
-- <user_id>/<filename> convention as every private bucket in this project.
insert into storage.buckets (id, name, public)
values ('reset-shares', 'reset-shares', true)
on conflict (id) do update set public = true;

create policy "A mother can upload her own reset share media"
  on storage.objects for insert
  with check (bucket_id = 'reset-shares' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "A mother can delete her own reset share media"
  on storage.objects for delete
  using (bucket_id = 'reset-shares' and (storage.foldername(name))[1] = auth.uid()::text);
