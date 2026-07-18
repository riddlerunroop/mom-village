-- MOM VILLAGE — MIGRATION 4
-- Tracks whether she's seen the one-time "she's here" welcome moment,
-- shown exactly once when baby's DOB is first entered — whether that
-- happens on day 2 or day 30.

alter table profiles add column if not exists birth_welcome_seen boolean default false;
