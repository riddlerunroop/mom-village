-- Rediscover — schema for the standalone marketplace module, 2026-09-19.
--
-- Builds the full design worked through with Roop (and cross-checked with
-- another AI reviewer) over several turns: Rediscover leaves the Care Chart
-- entirely and becomes its own top-level module, standing beside Monthly
-- Chart, Care Chart, Wealth, Library, and Community. Community itself is
-- untouched — it only ever links out to Rediscover, never hosts listings.
--
-- Confirmed decisions this schema encodes:
--   1. Mother -> Rediscover Profile -> multiple Listings (a small shop, not
--      one giant listing per mother).
--   2. "What I'm looking for" lives as its own set of Needs per profile,
--      not bolted onto each listing — this is what powers the dedicated
--      Find Collaborators feed as a simple filtered view over Needs.
--   3. Trust signal is positive-only: a Recommendation is a one-time tally
--      entry, never a star rating — there is no way to leave a negative
--      public mark on someone, only to withhold a recommendation. Chosen
--      explicitly over an open 1-5 rating because V1 has no way to verify
--      a transaction actually happened, so an open rating is a real
--      sabotage vector (a rival seller, a Community grudge) with no way to
--      catch it the way a fake report can be caught.
--   4. Real in-app private messaging (Roop's explicit call over the two
--      lighter options — an "I'm interested" signal, or exposing contact
--      info on the profile) — rediscover_conversations/rediscover_messages
--      below.
--   5. Category taxonomy is app-enforced (category_family DB-checked,
--      category itself left as app-controlled text, same convention as
--      user_care_profile.health_flags elsewhere in this project) and
--      DELIBERATELY EXCLUDES legal services, financial/investment
--      advisory, and medical/health-advice categories at launch — Roop's
--      explicit call, confirmed over the safer "ship everything with a
--      disclaimer" alternative. Re-introducing any of those needs her own
--      legal review first, not just an app-code change.
--   6. No fee or commission on anything in V1 — no payment/order table
--      exists here on purpose. Money never touches Mom's Village.
--   7. Reports reuse the same shape as community_reports (nullable
--      per-target-type FK columns + a CHECK that exactly one is set), not
--      a polymorphic target id, for consistency with that table.
--   8. Blocking reuses the existing user_blocks table as-is — no new block
--      table. The app layer filters Rediscover content by her existing
--      blocks the same way Community already does.
--
-- Deliberately NOT built here (see the Rediscover spec doc for the full
-- list): any matching/ranking algorithm, dedicated "Build Together" shared
-- project spaces, a structured "Promote a Mother" marketplace, any
-- verification/badge system, and anything payment-related. All V2/V3.

-- 1. Rediscover Profile — one per mother, opt-in, extends her existing
--    Village identity rather than being a separate account.
create table if not exists user_rediscover_profile (
  user_id uuid primary key references auth.users(id) on delete cascade,
  headline text,
  bio text,
  location text,
  remote_ok boolean not null default false,
  open_to_collaboration boolean not null default false,
  open_to_work boolean not null default false,
  open_to_promotion boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table user_rediscover_profile enable row level security;

create policy "rediscover profiles are readable when active or your own"
  on user_rediscover_profile for select
  to authenticated
  using (is_active or user_id = auth.uid());

create policy "a mother manages her own rediscover profile"
  on user_rediscover_profile for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "a mother updates her own rediscover profile"
  on user_rediscover_profile for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "a mother deletes her own rediscover profile"
  on user_rediscover_profile for delete
  to authenticated
  using (user_id = auth.uid());

-- 2. Listings — the "Showcase" side. Category taxonomy note: category_family
--    is the five broad browsing families; category is the specific tag
--    within it (app-enforced list, not DB-checked, so the taxonomy can grow
--    without a migration — same convention as health_flags). The five
--    families deliberately have no "Legal", "Financial/Investment Advisory"
--    or "Medical/Health Advice" family or tag seeded anywhere in app code.
create table if not exists rediscover_listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_family text not null check (category_family in (
    'products', 'creative_services', 'professional_services',
    'business_operations', 'promotion_creators'
  )),
  category text not null,
  title text not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table rediscover_listings enable row level security;

create policy "listings are readable when active or your own"
  on rediscover_listings for select
  to authenticated
  using (is_active or user_id = auth.uid());

create policy "a mother creates her own listings"
  on rediscover_listings for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "a mother updates her own listings"
  on rediscover_listings for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "a mother deletes her own listings"
  on rediscover_listings for delete
  to authenticated
  using (user_id = auth.uid());

create index if not exists rediscover_listings_user_idx on rediscover_listings(user_id);
create index if not exists rediscover_listings_category_idx on rediscover_listings(category_family, category);

-- 3. Needs — the "what I'm looking for" side, one-to-many per profile so
--    Find Collaborators can be a simple filtered feed over this table using
--    the same category tags as listings (no matching algorithm needed).
create table if not exists rediscover_needs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_family text not null check (category_family in (
    'products', 'creative_services', 'professional_services',
    'business_operations', 'promotion_creators'
  )),
  category text not null,
  note text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table rediscover_needs enable row level security;

create policy "needs are readable when active or your own"
  on rediscover_needs for select
  to authenticated
  using (is_active or user_id = auth.uid());

create policy "a mother creates her own needs"
  on rediscover_needs for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "a mother updates her own needs"
  on rediscover_needs for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "a mother deletes her own needs"
  on rediscover_needs for delete
  to authenticated
  using (user_id = auth.uid());

create index if not exists rediscover_needs_user_idx on rediscover_needs(user_id);
create index if not exists rediscover_needs_category_idx on rediscover_needs(category_family, category);

-- 4. Recommendations — positive-only trust signal, at the profile level
--    (recommending "her", not one specific listing). One row per pair,
--    so it can't be repeated; a mother can remove her own recommendation
--    but there is no way to leave a negative one.
create table if not exists rediscover_recommendations (
  recommender_user_id uuid not null references auth.users(id) on delete cascade,
  recommended_user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (recommender_user_id, recommended_user_id),
  check (recommender_user_id <> recommended_user_id)
);

alter table rediscover_recommendations enable row level security;

create policy "recommendation counts are visible to authenticated users"
  on rediscover_recommendations for select
  to authenticated
  using (true);

create policy "a mother gives her own recommendation"
  on rediscover_recommendations for insert
  to authenticated
  with check (recommender_user_id = auth.uid());

create policy "a mother withdraws her own recommendation"
  on rediscover_recommendations for delete
  to authenticated
  using (recommender_user_id = auth.uid());

-- 5. Saved listings — a private bookmark list, same shape as
--    user_book_bookmarks elsewhere in this project.
create table if not exists user_rediscover_saved_listings (
  user_id uuid not null references auth.users(id) on delete cascade,
  listing_id uuid not null references rediscover_listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

alter table user_rediscover_saved_listings enable row level security;

create policy "a mother manages her own saved listings"
  on user_rediscover_saved_listings for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- 6. Reports — insert-only, same shape as community_reports (nullable
--    per-target-type FK + a CHECK that exactly one is set). No select
--    policy at all: Roop reviews reports directly in Supabase, same
--    workflow as every other report queue in this app.
create table if not exists rediscover_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users(id) on delete cascade,
  listing_id uuid references rediscover_listings(id) on delete cascade,
  need_id uuid references rediscover_needs(id) on delete cascade,
  reported_user_id uuid references auth.users(id) on delete cascade,
  message_id uuid,
  reason text not null,
  created_at timestamptz not null default now(),
  check (
    (case when listing_id is not null then 1 else 0 end) +
    (case when need_id is not null then 1 else 0 end) +
    (case when reported_user_id is not null then 1 else 0 end) +
    (case when message_id is not null then 1 else 0 end) = 1
  )
);

alter table rediscover_reports enable row level security;

create policy "a mother files her own reports"
  on rediscover_reports for insert
  to authenticated
  with check (reporter_id = auth.uid());

-- 7. Private messaging — Roop's explicit call over the two lighter
--    alternatives discussed. One conversation row per pair of mothers
--    (never duplicated, enforced by the unique index below), optionally
--    tied to the listing or need that started it for context.
create table if not exists rediscover_conversations (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references auth.users(id) on delete cascade,
  user_b uuid not null references auth.users(id) on delete cascade,
  related_listing_id uuid references rediscover_listings(id) on delete set null,
  related_need_id uuid references rediscover_needs(id) on delete set null,
  created_at timestamptz not null default now(),
  last_message_at timestamptz not null default now(),
  check (user_a <> user_b)
);

alter table rediscover_conversations enable row level security;

create unique index if not exists rediscover_conversations_pair_idx
  on rediscover_conversations (least(user_a, user_b), greatest(user_a, user_b));

create policy "a mother sees her own conversations"
  on rediscover_conversations for select
  to authenticated
  using (auth.uid() in (user_a, user_b));

create policy "a mother starts a conversation she's part of"
  on rediscover_conversations for insert
  to authenticated
  with check (auth.uid() in (user_a, user_b));

create policy "a mother updates a conversation she's part of"
  on rediscover_conversations for update
  to authenticated
  using (auth.uid() in (user_a, user_b))
  with check (auth.uid() in (user_a, user_b));

create table if not exists rediscover_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references rediscover_conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

alter table rediscover_messages enable row level security;

create policy "a mother reads messages in her own conversations"
  on rediscover_messages for select
  to authenticated
  using (
    exists (
      select 1 from rediscover_conversations c
      where c.id = conversation_id and auth.uid() in (c.user_a, c.user_b)
    )
  );

create policy "a mother sends messages in her own conversations"
  on rediscover_messages for insert
  to authenticated
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from rediscover_conversations c
      where c.id = conversation_id and auth.uid() in (c.user_a, c.user_b)
    )
  );

create policy "a mother marks messages in her own conversations read"
  on rediscover_messages for update
  to authenticated
  using (
    exists (
      select 1 from rediscover_conversations c
      where c.id = conversation_id and auth.uid() in (c.user_a, c.user_b)
    )
  )
  with check (
    exists (
      select 1 from rediscover_conversations c
      where c.id = conversation_id and auth.uid() in (c.user_a, c.user_b)
    )
  );

create index if not exists rediscover_messages_conversation_idx on rediscover_messages(conversation_id, created_at);

-- Keep last_message_at in sync so a conversation list can sort by recency
-- without a per-row subquery, same denormalized-counter pattern already
-- used for community_threads.like_count/reply_count.
create or replace function bump_rediscover_conversation_last_message()
returns trigger as $$
begin
  update rediscover_conversations
  set last_message_at = new.created_at
  where id = new.conversation_id;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists rediscover_messages_bump_conversation on rediscover_messages;
create trigger rediscover_messages_bump_conversation
  after insert on rediscover_messages
  for each row execute function bump_rediscover_conversation_last_message();
