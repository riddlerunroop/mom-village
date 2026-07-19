-- MOM VILLAGE — MIGRATION 6
-- Tracks whether she's seen the one-time second-birthday celebration moment,
-- shown exactly once the first time she opens the app after baby turns two.

alter table profiles add column if not exists birthday_2_seen boolean default false;
