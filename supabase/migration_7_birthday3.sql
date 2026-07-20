-- MOM VILLAGE — MIGRATION 7
-- Tracks whether she's seen the one-time third-birthday celebration moment,
-- shown exactly once the first time she opens the app after baby turns three.
-- This is also the send-off moment for the Monthly Chart content journey
-- (pregnancy through age three), which concludes at month 36 / the third
-- birthday. Note: this is distinct from the UNICEF "first 1,000 days" window,
-- which runs conception to the second birthday, not the third.

alter table profiles add column if not exists birthday_3_seen boolean default false;
