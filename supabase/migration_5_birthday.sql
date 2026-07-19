-- MOM VILLAGE — MIGRATION 5
-- Tracks whether she's seen the one-time first-birthday celebration moment,
-- shown exactly once the first time she opens the app after baby turns one.

alter table profiles add column if not exists birthday_1_seen boolean default false;
