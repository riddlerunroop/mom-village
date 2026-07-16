-- MOM VILLAGE — DATABASE SCHEMA
-- Run this in Supabase SQL Editor (Project → SQL Editor → New query) once your project is created.

-- ============ PROFILES ============
-- One row per mom, linked to Supabase's built-in auth.users (phone OTP login)
create table profiles (
  id uuid references auth.users(id) primary key,
  mom_name text,
  baby_name text,
  baby_dob date,               -- actual DOB once born
  due_date date,                -- used before birth to calculate "Month -3" etc.
  delivery_type text check (delivery_type in ('normal', 'c_section', 'not_yet_delivered')),
  city text,
  rich_mom_level text default 'newbie' check (rich_mom_level in ('newbie', 'didi', 'mentor')),
  created_at timestamptz default now()
);

-- ============ SUBSCRIPTIONS ============
create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null,
  status text check (status in ('active', 'cancelled', 'expired')) default 'active',
  plan text check (plan in ('monthly', 'annual')) not null,
  razorpay_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz default now()
);

-- ============ MONTHLY MILESTONE CHART ============
-- Content is authored once by admin, applies to all moms at that baby-month.
-- month_number can be negative (pregnancy) e.g. -3 to 36 (age 3).
create table monthly_chart_content (
  id uuid primary key default gen_random_uuid(),
  month_number int not null,
  section text check (section in ('money', 'development', 'environment', 'fitness')) not null,
  delivery_type text check (delivery_type in ('normal', 'c_section', 'any')) default 'any',
  title text not null,
  body text not null,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- Tracks which sections/checkboxes each mom has completed, for the progress bar
create table user_month_progress (
  user_id uuid references profiles(id) not null,
  content_id uuid references monthly_chart_content(id) not null,
  completed boolean default false,
  completed_at timestamptz,
  primary key (user_id, content_id)
);

-- ============ FITNESS ============
-- Body / Food / Mind / Life categories, plus opt-in problem-specific tracks
create table fitness_tracks (
  id uuid primary key default gen_random_uuid(),
  category text check (category in ('body', 'food', 'mind', 'life')) not null,
  title text not null,
  description text,
  delivery_type text check (delivery_type in ('normal', 'c_section', 'any')) default 'any',
  duration_minutes int,          -- 5, 30, 45 etc.
  is_opt_in boolean default false, -- true = problem-specific track (diastasis recti, PPD, etc.)
  requires_professional_review boolean default false, -- flags sensitive content (PPD, pelvic floor)
  sort_order int default 0
);

-- ============ BOOKS ============
create table books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text check (category in ('money', 'parenting')) not null,
  price numeric(10,2) not null,
  description text,
  cover_url text,
  content_url text,              -- PDF or ebook file location
  sort_order int default 0
);

create table book_purchases (
  user_id uuid references profiles(id) not null,
  book_id uuid references books(id) not null,
  price_paid numeric(10,2),
  purchased_at timestamptz default now(),
  primary key (user_id, book_id)
);

-- ============ COMMUNITY (Orkut-style group spaces) ============
create table community_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  is_admin_created boolean default false,
  created_by uuid references profiles(id),
  baby_age_min int,              -- for age-matched auto-suggestion
  baby_age_max int,
  created_at timestamptz default now()
);

create table group_members (
  group_id uuid references community_groups(id) not null,
  user_id uuid references profiles(id) not null,
  joined_at timestamptz default now(),
  primary key (group_id, user_id)
);

create table topics (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references community_groups(id) not null,
  user_id uuid references profiles(id) not null,
  title text not null,
  body text,
  created_at timestamptz default now()
);

create table replies (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid references topics(id) not null,
  user_id uuid references profiles(id) not null,
  body text not null,
  created_at timestamptz default now()
);

-- ============ ₹49 BUDGET CALCULATOR (lead capture, no login required) ============
create table budget_map_downloads (
  id uuid primary key default gen_random_uuid(),
  phone text,
  email text,
  due_date date,
  downloaded_at timestamptz default now()
);

-- ============ ROW LEVEL SECURITY ============
-- Every table with personal data must only be readable/writable by its owner.
alter table profiles enable row level security;
alter table subscriptions enable row level security;
alter table user_month_progress enable row level security;
alter table book_purchases enable row level security;
alter table topics enable row level security;
alter table replies enable row level security;
alter table group_members enable row level security;

create policy "Users manage their own profile" on profiles
  for all using (auth.uid() = id);

create policy "Users see their own subscription" on subscriptions
  for select using (auth.uid() = user_id);

create policy "Users manage their own progress" on user_month_progress
  for all using (auth.uid() = user_id);

create policy "Users see their own purchases" on book_purchases
  for select using (auth.uid() = user_id);

create policy "Members can read topics in their groups" on topics
  for select using (
    exists (select 1 from group_members where group_members.group_id = topics.group_id and group_members.user_id = auth.uid())
  );

create policy "Members can post topics in their groups" on topics
  for insert with check (
    exists (select 1 from group_members where group_members.group_id = topics.group_id and group_members.user_id = auth.uid())
  );

create policy "Members can read replies in their groups" on replies
  for select using (
    exists (
      select 1 from topics
      join group_members on group_members.group_id = topics.group_id
      where topics.id = replies.topic_id and group_members.user_id = auth.uid()
    )
  );

create policy "Members can post replies in their groups" on replies
  for insert with check (auth.uid() = user_id);

create policy "Users see their own group memberships" on group_members
  for select using (auth.uid() = user_id);
