-- Added 2026-07-30 — Razorpay integration, first build pass (test mode).
-- Covers all three payment flows Roop confirmed in scope: the ₹299/month
-- membership subscription, individual/bundle book purchases (₹249 /
-- ₹849), and the standalone ₹49 budget map. All three are one-time or
-- recurring payments processed through Razorpay; the tables below are
-- written to only by the webhook handler (src/app/api/razorpay/webhook/
-- route.ts) using the service-role client, never directly by a browser —
-- matches this project's own client can only ever see, never forge, its
-- own purchase state.

-- ============ APP CONFIG (tiny key/value store) ============
-- Used to cache the Razorpay Plan ID for the ₹299/month membership after
-- it's created on first use (see src/app/api/razorpay/subscription/
-- create/route.ts) — avoids either hardcoding a plan_id that differs
-- between test/live mode, or asking Roop to create it by hand in the
-- Razorpay dashboard and paste it into an env var. No RLS policies at
-- all (fully locked) — only ever read/written by server routes using the
-- service-role client, never by anything a browser can trigger.
create table if not exists app_config (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);
alter table app_config enable row level security;

-- ============ BOOK PURCHASES ============
-- Replaces schema.sql's original book_purchases table for this feature —
-- that one referenced a books(id) foreign key from an early, never-wired-up
-- scaffold (the real Library is static content in src/lib/library.ts, keyed
-- by slug, not a DB table). This new table matches how the app actually
-- identifies books.
create table if not exists user_book_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  book_slug text, -- null when is_bundle = true (bundle covers every book)
  is_bundle boolean not null default false,
  razorpay_order_id text not null,
  razorpay_payment_id text,
  amount_paid numeric(10,2) not null,
  status text not null check (status in ('created', 'paid', 'failed')) default 'created',
  created_at timestamptz not null default now()
);
alter table user_book_purchases enable row level security;

create policy "user_book_purchases_select_own" on user_book_purchases
  for select using (auth.uid() = user_id);

-- No insert/update policy for regular users — a purchase row is only ever
-- created by the order/create route (using her own authenticated session,
-- status 'created') and only ever flipped to 'paid'/'failed' by the
-- webhook handler (service-role client, bypasses RLS entirely). Since the
-- order/create route runs server-side with her session, it still needs an
-- insert policy scoped to her own user_id:
create policy "user_book_purchases_insert_own" on user_book_purchases
  for insert with check (auth.uid() = user_id);

-- ============ BUDGET MAP PURCHASES ============
create table if not exists user_budget_map_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  razorpay_order_id text not null,
  razorpay_payment_id text,
  amount_paid numeric(10,2) not null,
  status text not null check (status in ('created', 'paid', 'failed')) default 'created',
  created_at timestamptz not null default now()
);
alter table user_budget_map_purchases enable row level security;

create policy "user_budget_map_purchases_select_own" on user_budget_map_purchases
  for select using (auth.uid() = user_id);

create policy "user_budget_map_purchases_insert_own" on user_budget_map_purchases
  for insert with check (auth.uid() = user_id);

-- ============ WEBHOOK EVENT LOG (idempotency) ============
-- Razorpay can and does retry webhook deliveries. This table records every
-- event id we've already processed so a retried delivery is a no-op
-- instead of double-crediting a purchase or double-extending a
-- subscription period. No RLS policies — service-role only.
create table if not exists razorpay_webhook_events (
  event_id text primary key,
  event_type text not null,
  payload jsonb,
  processed_at timestamptz not null default now()
);
alter table razorpay_webhook_events enable row level security;

-- ============ SUBSCRIPTIONS — extend the existing table ============
-- schema.sql already has `subscriptions` (user_id, status, plan,
-- razorpay_subscription_id, current_period_end) with select-only RLS for
-- the owner — exactly what src/lib/subscription.ts already reads. Nothing
-- to add there. This column lets the webhook handler match an incoming
-- subscription.* event back to the right row without a second lookup.
alter table subscriptions add column if not exists razorpay_plan_id text;

-- A unique constraint on razorpay_subscription_id lets the webhook handler
-- safely upsert (onConflict: razorpay_subscription_id) instead of
-- inserting a fresh row on every renewal event — the first
-- subscription.activated creates the row, every subsequent
-- subscription.charged (monthly renewal) updates that same row's
-- current_period_end. Nullable/unique still allows any number of rows
-- that have never had a Razorpay subscription attached (there shouldn't
-- be any going forward, but this doesn't force a backfill of old rows).
alter table subscriptions add constraint subscriptions_razorpay_subscription_id_key
  unique (razorpay_subscription_id);

-- subscriptions currently has no insert/update policy at all (by design —
-- only Roop could write to it directly). The webhook handler uses the
-- service-role client, which bypasses RLS entirely, so no new policy is
-- needed here either.
