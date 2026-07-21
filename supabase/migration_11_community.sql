-- MOM VILLAGE — MIGRATION 11
-- Community pillar, scoped 2026-07-21 (Orkut-style discussion forum,
-- confirmed with Roop). This REPLACES the earlier groups-based draft in
-- schema.sql (community_groups / group_members / topics / replies) — that
-- structure required joining a group before posting or reading. Roop's
-- confirmed scope is a single flat forum: the whole app IS the community,
-- any mother can start a thread on anything, no joining step, and search
-- surfaces past discussions on a similar topic. Real profile is shown
-- (mom_name from profiles), not anonymous.
--
-- If migration_11 is run, the old community_groups / group_members / topics
-- / replies tables from schema.sql are unused — drop them if they were ever
-- created in this project. They are NOT referenced by any app code.

drop table if exists replies;
drop table if exists topics;
drop table if exists group_members;
drop table if exists community_groups;

-- ============ COMMUNITY THREADS ============
-- search_doc is a plain column, not a generated column, on purpose:
-- Postgres's to_tsvector(regconfig, text) is STABLE, not IMMUTABLE (the
-- config lookup could theoretically change), and generated columns require
-- an IMMUTABLE expression. A BEFORE INSERT/UPDATE trigger below fills it in
-- instead — same end result, just not enforced at the generated-column
-- level.
create table community_threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null,
  title text not null,
  body text not null,
  tags text[] default '{}',        -- free-text tags she adds when starting a thread
  reply_count int default 0,       -- denormalized, kept in sync via trigger below
  last_activity_at timestamptz default now(),  -- bumped on new reply, used for sort
  created_at timestamptz default now(),
  search_doc tsvector
);

create index community_threads_search_idx on community_threads using gin (search_doc);
create index community_threads_last_activity_idx on community_threads (last_activity_at desc);

create or replace function community_thread_search_doc_update()
returns trigger as $$
begin
  new.search_doc :=
    setweight(to_tsvector('english', coalesce(new.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.body, '')), 'B') ||
    setweight(to_tsvector('english', array_to_string(coalesce(new.tags, '{}'), ' ')), 'A');
  return new;
end;
$$ language plpgsql;

create trigger community_thread_search_doc_trigger
  before insert or update of title, body, tags on community_threads
  for each row execute function community_thread_search_doc_update();

-- ============ COMMUNITY REPLIES ============
create table community_replies (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid references community_threads(id) not null,
  user_id uuid references profiles(id) not null,
  body text not null,
  created_at timestamptz default now()
);

create index community_replies_thread_idx on community_replies (thread_id, created_at);

-- Keep reply_count and last_activity_at on the thread in sync whenever a
-- reply is added — avoids a join + count on every list-page render.
-- SECURITY DEFINER is required here: the community_threads UPDATE policy
-- only allows a thread's own author to update it, but this trigger needs to
-- bump *any* thread whenever a *different* mother replies to it. Scoped
-- tightly to just this one update, with search_path pinned per Postgres's
-- security-definer guidance.
create or replace function bump_community_thread_on_reply()
returns trigger
security definer
set search_path = public
as $$
begin
  update community_threads
  set reply_count = reply_count + 1,
      last_activity_at = new.created_at
  where id = new.thread_id;
  return new;
end;
$$ language plpgsql;

create trigger community_reply_bumps_thread
  after insert on community_replies
  for each row execute function bump_community_thread_on_reply();

-- ============ NAMES VISIBLE ACROSS THE COMMUNITY ============
-- profiles' RLS only lets a mother read her OWN row (auth.uid() = id) —
-- correct, since baby_dob / due_date / city / delivery_type must stay
-- private. But a flat forum with real profiles needs every mother's display
-- name to attribute threads and replies to. Rather than loosen profiles'
-- own RLS, expose ONLY id + mom_name through a narrow view. Created without
-- security_invoker, so it runs as the view owner and isn't subject to
-- profiles' row-owner-only policy — deliberate, and safe because the view
-- itself exposes nothing beyond a first name.
create or replace view community_author_names as
  select id, mom_name from profiles;

grant select on community_author_names to authenticated;

-- ============ ROW LEVEL SECURITY ============
-- Flat forum: every logged-in mother can read every thread/reply (no group
-- gating). She can only create posts as herself, and only edit/delete her
-- own. Moderation/reporting tooling deferred — Roop's explicit call.
alter table community_threads enable row level security;
alter table community_replies enable row level security;

create policy "Any logged-in mother can read all threads" on community_threads
  for select using (auth.role() = 'authenticated');

create policy "A mother can start a thread as herself" on community_threads
  for insert with check (auth.uid() = user_id);

create policy "A mother can edit or delete her own thread" on community_threads
  for update using (auth.uid() = user_id);

create policy "A mother can delete her own thread" on community_threads
  for delete using (auth.uid() = user_id);

create policy "Any logged-in mother can read all replies" on community_replies
  for select using (auth.role() = 'authenticated');

create policy "A mother can reply as herself" on community_replies
  for insert with check (auth.uid() = user_id);

create policy "A mother can delete her own reply" on community_replies
  for delete using (auth.uid() = user_id);
