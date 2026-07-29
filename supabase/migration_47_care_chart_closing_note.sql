-- Care Chart week-by-week rebuild — closing note from Mom's Village, 2026-07-29.
--
-- Roop's request when reviewing Your Rhythm Year Three Part 2 (migration_46):
-- add "a short closing note from Mom Village after Week 156 as the final
-- page of the Care Chart — not as another week's content, but as a
-- farewell from the people who built it." Deliberately distinct from
-- Week 156's own reflective content (which is the mother's own moment,
-- authored in her voice/direction) — this is the app's own voice, once,
-- at the true end of the entire 197-week pregnancy-through-third-birthday
-- rebuild.
--
-- One new nullable text column, closing_note, on care_chart_week_content.
-- Runs after migration_46 (which inserts week_number 196) since this
-- migration only UPDATEs that already-inserted row — must not be run
-- before migration_46. Nullable/additive, same pattern as every prior
-- field added to this table (feeding_comfort, rest_support,
-- mental_health_note) — every other week simply leaves it null, and
-- CareWeekContent.tsx only renders the block when it's present, so no
-- other week is affected.

alter table care_chart_week_content add column if not exists closing_note text;

update care_chart_week_content
set closing_note = 'A note from Mom''s Village

We built this chart to walk beside you from the earliest, most uncertain days of pregnancy to this one — 197 weeks, and you showed up for nearly every single one of them.

This is where the weekly chart ends. Not because your journey is over, but because this particular one, yours and hers together in this shape, has reached its close. Everything else we built stays exactly as open to you as always — Community, the Library, and Mental health & support, whenever you need them.

Thank you for letting us walk alongside you. It was never really about the chart. It was about you, showing up, week after week, for her and for yourself.

With real warmth,
The Mom''s Village team'
where week_number = 196;
