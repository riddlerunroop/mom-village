-- Budget Planner improvements, 2026-07-28 (item 9 off Roop's review backlog).
-- Lets a mother save her Budget Planner answers and revisit/update them later,
-- instead of losing everything the moment she navigates away or closes the tab.
-- One row per user (she only needs one live plan at a time); the pure
-- calculation itself stays stateless in budgetCalculator.ts, we just persist
-- her *inputs* here and recompute on load — so the numbers always reflect
-- the latest calculator logic, never a stale saved total.

create table if not exists user_budget_plan (
  user_id uuid primary key references auth.users(id) on delete cascade,
  inputs jsonb not null,
  updated_at timestamptz not null default now()
);

alter table user_budget_plan enable row level security;

create policy "Users can view own budget plan"
  on user_budget_plan for select
  using (auth.uid() = user_id);

create policy "Users can insert own budget plan"
  on user_budget_plan for insert
  with check (auth.uid() = user_id);

create policy "Users can update own budget plan"
  on user_budget_plan for update
  using (auth.uid() = user_id);

create policy "Users can delete own budget plan"
  on user_budget_plan for delete
  using (auth.uid() = user_id);
