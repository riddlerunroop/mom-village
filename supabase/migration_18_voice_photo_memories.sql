-- MOM VILLAGE — MIGRATION 18
-- Voice-log memories + recall, scoped 2026-07-21, built 2026-07-25. A
-- mother can log a short voice note or a photo in the moment (a symptom
-- and what medicine she gave, a milestone like "started walking today"),
-- then later ask the app to recall a memory — it searches her own logged
-- notes, photos, and vaccination timeline and reconstructs an answer.
-- Narrowly scoped: this is memory capture and recall only, not a general
-- chatbot — see the Product scope section of CLAUDE.md.

-- ============ VOICE LOGS ============
create table user_voice_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null,
  audio_path text not null,          -- path within the voice-logs storage bucket
  transcript text not null,          -- always shown to her to review/edit before saving,
                                       -- same principle as the vaccination card extraction —
                                       -- speech-to-text can mishear a medicine name or a date
  logged_at timestamptz default now()
);

create index user_voice_logs_user_idx on user_voice_logs (user_id, logged_at desc);

alter table user_voice_logs enable row level security;

create policy "A mother manages her own voice logs" on user_voice_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============ PHOTO LOGS ============
create table user_photo_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null,
  photo_path text not null,          -- path within the memory-photos storage bucket
  caption text,
  logged_at timestamptz default now()
);

create index user_photo_logs_user_idx on user_photo_logs (user_id, logged_at desc);

alter table user_photo_logs enable row level security;

create policy "A mother manages her own photo logs" on user_photo_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============ STORAGE — VOICE + PHOTO MEMORIES ============
-- Same private-bucket-per-user-folder pattern as vaccination-cards
-- (migration_12): <bucket>/<user_id>/<filename>, policies check that
-- folder name against auth.uid().
insert into storage.buckets (id, name, public)
values ('voice-logs', 'voice-logs', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('memory-photos', 'memory-photos', false)
on conflict (id) do nothing;

create policy "A mother can upload her own voice logs"
  on storage.objects for insert
  with check (bucket_id = 'voice-logs' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "A mother can access her own voice logs"
  on storage.objects for select
  using (bucket_id = 'voice-logs' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "A mother can delete her own voice logs"
  on storage.objects for delete
  using (bucket_id = 'voice-logs' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "A mother can upload her own memory photos"
  on storage.objects for insert
  with check (bucket_id = 'memory-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "A mother can access her own memory photos"
  on storage.objects for select
  using (bucket_id = 'memory-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "A mother can delete her own memory photos"
  on storage.objects for delete
  using (bucket_id = 'memory-photos' and (storage.foldername(name))[1] = auth.uid()::text);
