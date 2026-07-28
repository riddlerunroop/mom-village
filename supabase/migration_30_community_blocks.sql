-- MOM VILLAGE — MIGRATION 30
-- Community safeguards, per Roop's 2026-07-28 review: real block controls
-- alongside the report flow (migration_22). A block is personal and
-- private — it filters what the blocking mother sees, and isn't visible to
-- (or actionable by) the blocked mother, same non-confrontational spirit as
-- most block features.

create table user_blocks (
  blocker_id uuid references profiles(id) not null,
  blocked_id uuid references profiles(id) not null,
  created_at timestamptz default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

alter table user_blocks enable row level security;

create policy "A mother manages her own block list" on user_blocks
  for all using (auth.uid() = blocker_id);
