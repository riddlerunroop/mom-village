-- MOM VILLAGE — MIGRATION 52
-- Community enhancements, 2026-08-02. Roop shared a full "how real Orkut
-- Communities worked" brief alongside a mockup of a single Community
-- screen. Reviewed both together and confirmed with her directly: Mom
-- Village stays ONE flat forum — her words, "mom village is a community in
-- itself" — no separate named sub-communities to create/join (that would
-- reverse the deliberate simplification made when Community first shipped,
-- migration_11: "no groups to join"). What DOES carry over from the brief,
-- because it genuinely fits a single forum: pinning an important thread to
-- the top, locking a resolved/heated thread against new replies, real likes
-- (the mockup shows a heart count on its "Trending discussion" card), a
-- private per-mother bookmark list, and simple polls attached to a thread
-- (the brief's own "Which stroller is best?" example). No new roles/ban/
-- community-creation/member-approval system — that part of the brief was
-- explicitly declined in favour of staying simple.

-- ============ PIN / LOCK ============
-- Same "Roop reviews and actions directly in Supabase" pattern as the
-- is_hidden moderation flag added in migration_22 — no in-app moderator
-- panel exists anywhere in this app, so pinning/locking a thread is a
-- plain UPDATE she runs herself. See CLAUDE.md for the exact queries to
-- pin a welcome thread, or lock an old/resolved one.
alter table community_threads add column if not exists is_pinned boolean not null default false;
alter table community_threads add column if not exists is_locked boolean not null default false;

-- ============ LIKES ============
-- A denormalized like_count (same pattern as reply_count from migration_11)
-- plus a join table recording who liked what, so a mother can toggle her
-- own like honestly and the UI never shows a fake/decorative heart count.
alter table community_threads add column if not exists like_count int not null default 0;

create table community_thread_likes (
  thread_id uuid references community_threads(id) not null,
  user_id uuid references profiles(id) not null,
  created_at timestamptz default now(),
  primary key (thread_id, user_id)
);

alter table community_thread_likes enable row level security;

create policy "Any logged-in mother can read like rows" on community_thread_likes
  for select using (auth.role() = 'authenticated');

create policy "A mother can like as herself" on community_thread_likes
  for insert with check (auth.uid() = user_id);

create policy "A mother can remove her own like" on community_thread_likes
  for delete using (auth.uid() = user_id);

create or replace function bump_community_thread_like_count()
returns trigger
security definer
set search_path = public
as $$
begin
  if TG_OP = 'INSERT' then
    update community_threads set like_count = like_count + 1 where id = new.thread_id;
    return new;
  elsif TG_OP = 'DELETE' then
    update community_threads set like_count = greatest(0, like_count - 1) where id = old.thread_id;
    return old;
  end if;
  return null;
end;
$$ language plpgsql;

create trigger community_thread_like_insert
  after insert on community_thread_likes
  for each row execute function bump_community_thread_like_count();

create trigger community_thread_like_delete
  after delete on community_thread_likes
  for each row execute function bump_community_thread_like_count();

-- ============ BOOKMARKS ============
-- Private per-mother saved-for-later list — same shape as the Library's
-- own user_book_bookmarks table (migration_29), just keyed by thread
-- instead of book/page.
create table user_community_bookmarks (
  user_id uuid references profiles(id) not null,
  thread_id uuid references community_threads(id) not null,
  created_at timestamptz default now(),
  primary key (user_id, thread_id)
);

alter table user_community_bookmarks enable row level security;

create policy "A mother can manage her own bookmarks" on user_community_bookmarks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============ SIMPLE POLLS ============
-- Optional, attached 1:1 to a thread when she starts a discussion — the
-- brief's own example ("Which stroller is best? Nuna / Joie / Chicco") is
-- exactly this shape. One vote per mother per poll; voting again changes
-- her vote rather than adding a second one.
create table community_polls (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid references community_threads(id) not null unique,
  question text not null,
  created_at timestamptz default now()
);

create table community_poll_options (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid references community_polls(id) not null,
  label text not null,
  sort_order int not null default 0
);

create table community_poll_votes (
  poll_id uuid references community_polls(id) not null,
  option_id uuid references community_poll_options(id) not null,
  user_id uuid references profiles(id) not null,
  created_at timestamptz default now(),
  primary key (poll_id, user_id)
);

alter table community_polls enable row level security;
alter table community_poll_options enable row level security;
alter table community_poll_votes enable row level security;

create policy "Any logged-in mother can read polls" on community_polls
  for select using (auth.role() = 'authenticated');
create policy "A mother can attach a poll to her own thread" on community_polls
  for insert with check (
    auth.uid() = (select user_id from community_threads where id = thread_id)
  );

create policy "Any logged-in mother can read poll options" on community_poll_options
  for select using (auth.role() = 'authenticated');
create policy "A mother can add options to her own poll" on community_poll_options
  for insert with check (
    auth.uid() = (
      select t.user_id from community_polls p
      join community_threads t on t.id = p.thread_id
      where p.id = poll_id
    )
  );

create policy "Any logged-in mother can read poll votes" on community_poll_votes
  for select using (auth.role() = 'authenticated');
create policy "A mother can vote as herself" on community_poll_votes
  for insert with check (auth.uid() = user_id);
create policy "A mother can change her own vote" on community_poll_votes
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "A mother can remove her own vote" on community_poll_votes
  for delete using (auth.uid() = user_id);
