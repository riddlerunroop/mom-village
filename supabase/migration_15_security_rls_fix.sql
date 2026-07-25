-- MOM VILLAGE — MIGRATION 15
-- SECURITY FIX. Supabase flagged tables with Row-Level Security disabled —
-- meaning anyone with the project's public anon key (which is NOT secret;
-- it's embedded in every Supabase app's client-side JS bundle by design)
-- could read, edit, or delete every row directly through the API, bypassing
-- the app entirely. This has been true since these tables were first
-- created — not something that broke recently.
--
-- Two groups of tables were affected:
--
-- 1. monthly_chart_content and weekly_care_chart_content — the real,
--    locked Monthly Chart and Care Chart content. Not personal data, but
--    must not be publicly writable (someone could vandalize/delete all of
--    it), and reads should require login, matching every other pillar.
--
-- 2. fitness_tracks, books, book_purchases, budget_map_downloads — early
--    schema.sql tables that were superseded before ever being wired into
--    the app (fitness by weekly_care_chart_content, books by the static
--    Library JSON content, budget_map_downloads by the stateless budget
--    calculator that never writes to it). Nothing in src/ references any
--    of them. Locking them down closes the hole without deleting anything,
--    in case any of this gets revisited later.

-- ============ LIVE CONTENT TABLES ============
alter table monthly_chart_content enable row level security;
alter table weekly_care_chart_content enable row level security;

create policy "Any logged-in mother can read the monthly chart" on monthly_chart_content
  for select using (auth.role() = 'authenticated');

create policy "Any logged-in mother can read the care chart" on weekly_care_chart_content
  for select using (auth.role() = 'authenticated');

-- No insert/update/delete policy for either — content is only ever
-- written by Roop running a migration directly in Supabase's SQL editor,
-- which runs as the table owner and bypasses RLS regardless. The app
-- itself never writes to these tables.

-- ============ UNUSED LEFTOVER TABLES ============
-- No policies at all = default deny for every operation, for every role.
-- Safe, since nothing in the app queries these.
alter table fitness_tracks enable row level security;
alter table books enable row level security;
alter table budget_map_downloads enable row level security;

-- book_purchases already had RLS enabled with a real policy in schema.sql
-- — not part of this issue, left untouched.
