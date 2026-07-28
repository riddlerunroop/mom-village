-- MOM VILLAGE — MIGRATION 27
-- Real, saving checkboxes for the Monthly Chart, per Roop's 2026-07-28
-- review ("dashboard scannability" — replace the disabled-looking
-- checkboxes with ones that actually save). Unlike the Care Chart's
-- per-day completion (same content row resurfaces daily within a phase),
-- each Monthly Chart content row is unique to one specific month, so a
-- simple permanent per-user completion is the right model here — no date
-- column needed, checking something off for this month stays checked.

create table user_monthly_chart_progress (
  user_id uuid references profiles(id) not null,
  content_id uuid references monthly_chart_content(id) not null,
  completed_at timestamptz default now(),
  primary key (user_id, content_id)
);

alter table user_monthly_chart_progress enable row level security;

create policy "A mother manages her own monthly chart progress" on user_monthly_chart_progress
  for all using (auth.uid() = user_id);
