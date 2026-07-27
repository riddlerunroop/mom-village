-- MOM VILLAGE — MIGRATION 21
-- "Resume where you left off" for the Library book reader. One row per
-- (user, book) storing the last page index she was on — same leaf-index
-- numbering the flipbook already uses internally (0 = cover, 1..N = content
-- pages, N+1 = end page), so no conversion is needed on either side.

create table if not exists user_reading_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  book_slug text not null,
  page_index integer not null default 0,
  updated_at timestamptz not null default now(),
  unique (user_id, book_slug)
);

alter table user_reading_progress enable row level security;

create policy "Users can view their own reading progress"
  on user_reading_progress for select
  using (auth.uid() = user_id);

create policy "Users can insert their own reading progress"
  on user_reading_progress for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own reading progress"
  on user_reading_progress for update
  using (auth.uid() = user_id);
