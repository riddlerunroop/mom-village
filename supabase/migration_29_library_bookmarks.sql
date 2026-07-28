-- MOM VILLAGE — MIGRATION 29
-- Library orientation pass, per Roop's 2026-07-28 review: real bookmarks
-- in the book reader, alongside the chapter-contents panel and progress
-- bar (both UI-only, no schema needed).

create table user_book_bookmarks (
  user_id uuid references profiles(id) not null,
  book_slug text not null,
  page_index int not null,
  created_at timestamptz default now(),
  primary key (user_id, book_slug, page_index)
);

alter table user_book_bookmarks enable row level security;

create policy "A mother manages her own bookmarks" on user_book_bookmarks
  for all using (auth.uid() = user_id);
