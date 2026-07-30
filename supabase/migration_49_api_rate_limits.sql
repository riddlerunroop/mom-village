-- Added 2026-07-30 — pre-Razorpay launch audit finding #8 (Important).
-- The three AI-calling routes (vaccination card reading, voice-memory
-- transcription, memory recall) were auth-gated correctly but had no cap on
-- how many times a single logged-in user could call them per day — a
-- logged-in account (or a compromised one) could hammer any of them with no
-- limit, running up the Anthropic/OpenAI bill. This table backs a simple
-- per-user, per-route, per-day counter checked by src/lib/rateLimit.ts
-- before each of those three routes does any real work.

create table if not exists user_api_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  route_key text not null,
  usage_date date not null,
  count int not null default 0,
  primary key (user_id, route_key, usage_date)
);

alter table user_api_usage enable row level security;

-- A user can only ever see/touch her own usage row — matches every other
-- per-user table in this project (user_daily_checkin, user_voice_logs, etc).
create policy "user_api_usage_select_own" on user_api_usage
  for select using (auth.uid() = user_id);

create policy "user_api_usage_insert_own" on user_api_usage
  for insert with check (auth.uid() = user_id);

create policy "user_api_usage_update_own" on user_api_usage
  for update using (auth.uid() = user_id);
