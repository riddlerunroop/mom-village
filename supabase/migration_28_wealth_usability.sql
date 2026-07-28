-- MOM VILLAGE — MIGRATION 28
-- Wealth usability pass, per Roop's 2026-07-28 review: an editable, saving
-- maternity cash-flow planner (replacing the static print-it-yourself
-- worksheet), and a real, saving "what to do first" checklist on the
-- Wealth pages.

-- One row per user: the whole maternity worksheet as a single jsonb blob
-- (item_key -> amount). A jsonb blob rather than one row per line item
-- since the field set is small, fixed, and always read/written together.
create table user_maternity_plan (
  user_id uuid primary key references profiles(id),
  values jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

alter table user_maternity_plan enable row level security;

create policy "A mother manages her own maternity plan" on user_maternity_plan
  for all using (auth.uid() = user_id);

-- Generic small checklist table, reused across both Wealth pages (item_key
-- values are globally unique across pages, e.g. "wealth_check_schemes",
-- "savings_check_buffer" — no page column needed).
create table user_wealth_checklist (
  user_id uuid references profiles(id) not null,
  item_key text not null,
  completed_at timestamptz default now(),
  primary key (user_id, item_key)
);

alter table user_wealth_checklist enable row level security;

create policy "A mother manages her own wealth checklist" on user_wealth_checklist
  for all using (auth.uid() = user_id);
