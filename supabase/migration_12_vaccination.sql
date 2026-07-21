-- MOM VILLAGE — MIGRATION 12
-- Vaccination tracking, scoped 2026-07-21. Bounded to the 0-3 window like
-- everything else. The actual UIP schedule (which vaccine is due when) is
-- NOT stored in the database — it lives in code at
-- src/lib/vaccinationSchedule.ts, verified directly against the Ministry of
-- Health & Family Welfare's official National Immunization Schedule PDF.
-- This migration only stores what a mother has actually logged: a dose she
-- confirms was given, backed by a photo of the physical card.

-- ============ VACCINATION RECORDS ============
create table user_vaccination_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null,
  occurrence_key text not null,     -- matches DoseOccurrence.occurrenceKey in vaccinationSchedule.ts
  vaccine text not null,            -- denormalized for display/history, survives future schedule-code changes
  dose_label text not null,
  date_given date not null,
  card_photo_path text,             -- path within the vaccination-cards storage bucket
  ai_suggested_vaccine text,        -- what Claude Vision read off the card, kept separate from what she confirmed
  ai_suggested_date date,
  created_at timestamptz default now(),
  unique (user_id, occurrence_key)  -- one confirmed record per dose per mother; re-logging updates it
);

create index user_vaccination_records_user_idx on user_vaccination_records (user_id);

alter table user_vaccination_records enable row level security;

create policy "A mother manages her own vaccination records" on user_vaccination_records
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============ STORAGE — VACCINATION CARD PHOTOS ============
-- Private bucket. Each mother's photos live under a folder named after her
-- own user id (vaccination-cards/<user_id>/<filename>), and the storage
-- policies below check that folder name against auth.uid() — the standard
-- Supabase Storage pattern for per-user private files.
insert into storage.buckets (id, name, public)
values ('vaccination-cards', 'vaccination-cards', false)
on conflict (id) do nothing;

create policy "A mother can upload her own vaccination card photos"
  on storage.objects for insert
  with check (
    bucket_id = 'vaccination-cards'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "A mother can view her own vaccination card photos"
  on storage.objects for select
  using (
    bucket_id = 'vaccination-cards'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "A mother can delete her own vaccination card photos"
  on storage.objects for delete
  using (
    bucket_id = 'vaccination-cards'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
