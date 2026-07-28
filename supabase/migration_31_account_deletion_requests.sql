-- MOM VILLAGE — MIGRATION 31
-- Real account-deletion request flow, per Roop's 2026-07-28 review and
-- matching the Privacy Policy's existing promise (deletion within 30 days
-- of a verified request). Same pattern as community_reports — insert-only
-- from the app, no in-app admin panel; Roop reviews and actions requests
-- directly in Supabase, then deletes the user via auth.admin / a manual
-- pass through the DB.
create table account_deletion_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null,
  requested_at timestamptz default now(),
  status text not null default 'pending' check (status in ('pending', 'completed', 'cancelled'))
);

alter table account_deletion_requests enable row level security;

-- She can submit a request and see her own request's status, but only
-- Roop (via the Supabase dashboard, bypassing RLS as the table owner) can
-- update/action it — no update or delete policy for the app itself.
create policy "A mother can request her own account deletion" on account_deletion_requests
  for insert with check (auth.uid() = user_id);

create policy "A mother can see her own deletion request" on account_deletion_requests
  for select using (auth.uid() = user_id);
