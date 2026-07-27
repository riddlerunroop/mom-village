-- MOM VILLAGE — MIGRATION 23
-- Web push notifications, deferred at launch, built now per Roop's
-- 2026-07-27 instruction to finish out the app. This is the subscription
-- storage half of the infrastructure described back when push was first
-- scoped: designed once, meant to serve all three intended use cases
-- (vaccination due-date reminders, weekly Care Chart nudges, monthly chart
-- delivery messages) — only the vaccination reminder is actually wired up
-- to send in this pass; the other two can reuse this same table and
-- src/lib/push.ts later without any schema change.

create table user_push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz default now()
);

create index user_push_subscriptions_user_idx on user_push_subscriptions (user_id);

alter table user_push_subscriptions enable row level security;

create policy "A mother can view her own push subscriptions" on user_push_subscriptions
  for select using (auth.uid() = user_id);

create policy "A mother can add her own push subscription" on user_push_subscriptions
  for insert with check (auth.uid() = user_id);

create policy "A mother can remove her own push subscription" on user_push_subscriptions
  for delete using (auth.uid() = user_id);

-- Tracks the last calendar date we sent a vaccination reminder to each user,
-- so the daily cron job never emails/pushes the same "due today" reminder
-- twice, and so it's cheap to check "did we already run today" without
-- scanning every subscription's notification history.
create table user_vaccination_reminder_log (
  user_id uuid references profiles(id) primary key,
  last_sent_date date not null
);

alter table user_vaccination_reminder_log enable row level security;
-- No policies: this is an internal bookkeeping table written only by the
-- cron route using the service-role key, never read or written by the app
-- on a mother's behalf.
