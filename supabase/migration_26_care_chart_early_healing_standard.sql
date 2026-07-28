-- MOM VILLAGE — MIGRATION 26
-- Restructures Early healing (0-6wk)'s already-locked, already-verified
-- content into the new strict per-item standard (what to do / how long /
-- why today / what to avoid / optional detail), per Roop's 2026-07-28
-- review. Prototype phase, same "build the hardest/most-tested phase
-- first" pattern used for every earlier Care Chart revision. This is a
-- pure reformatting pass — no new medical claims are introduced; every
-- fact below already exists, verified, in `body` (see migration_16 and
-- migration_10's original seed) and is only being split into the new
-- fields. `body` itself is untouched and still renders as "what to do."

-- ============ BODY ============
update weekly_care_chart_content set
  how_long = '5 minutes',
  why_today = 'Reconnecting gently with your breath and pelvic floor now supports healing without straining anything.',
  what_to_avoid = 'Don''t force the Kegel or hold your breath while doing it — ease off if anything feels uncomfortable.'
  where phase_key = 'early_healing' and section = 'body' and title = 'Breathe and reconnect';

update weekly_care_chart_content set
  how_long = '15 minutes, or less',
  why_today = 'Gentle movement supports circulation and healing without asking your core to do more than it''s ready for.',
  what_to_avoid = 'Don''t push pace or distance — stop if you feel pain, pressure, or increased bleeding.'
  where phase_key = 'early_healing' and section = 'body' and title = 'A slow walk, when you''re ready';

update weekly_care_chart_content set
  how_long = 'up to 30 minutes, only if you feel well',
  why_today = 'Some days you''ll have more capacity than others — this is for those days only, not a target to hit.',
  what_to_avoid = 'Don''t push through tiredness or discomfort just because you have the time today.'
  where phase_key = 'early_healing' and section = 'body' and title = 'A little more, if today allows';

update weekly_care_chart_content set
  how_long = 'as your team advises',
  why_today = 'A caesarean is major surgery — your recovery has its own timeline, separate from a vaginal birth''s.',
  what_to_avoid = 'Avoid lifting beyond your clinician''s advice; roll to your side to get up rather than sitting straight up.',
  detail = 'Stop and call your team for pain, pelvic pressure, incision discomfort, or increasing bleeding.'
  where phase_key = 'early_healing' and section = 'body' and title = 'After caesarean or complications';

update weekly_care_chart_content set
  how_long = 'ongoing, through this phase',
  why_today = 'Your abdominal muscles are still knitting back together — this protects that healing gap.',
  what_to_avoid = 'Skip crunches, sit-ups, and twisting movements for now.',
  detail = 'From around 6 weeks, you can check for this gap yourself — that''s covered in your next phase.'
  where phase_key = 'early_healing' and section = 'body' and title = 'Protect your midline';

-- ============ FOOD ============
update weekly_care_chart_content set
  why_today = 'Iron and protein support tissue healing and rebuilding blood lost during birth.',
  detail = 'Accept help with food if it''s offered — this isn''t the season to also be the one cooking.'
  where phase_key = 'early_healing' and section = 'food' and title = 'Healing meals';

update weekly_care_chart_content set
  why_today = 'Regular, real meals support your own energy through round-the-clock feeds.',
  what_to_avoid = 'A restrictive "breastfeeding diet" or detox — you don''t need either.'
  where phase_key = 'early_healing' and section = 'food' and title = 'If breastfeeding';

update weekly_care_chart_content set
  why_today = 'Catching feeding problems early makes them far easier to resolve.'
  where phase_key = 'early_healing' and section = 'food' and title = 'Breast support';

update weekly_care_chart_content set
  why_today = 'PCOS can slow the hormonal signal that starts full milk production — this isn''t a sign anything''s wrong.',
  what_to_avoid = 'Don''t skip meals — skipped meals make PCOS-related energy dips worse.',
  detail = 'Loop in a lactation consultant early if you''re worried about supply.'
  where phase_key = 'early_healing' and section = 'food' and title = 'If you have PCOS';

-- ============ MIND ============
update weekly_care_chart_content set
  how_long = '5 minutes',
  why_today = 'A short reset of light and air can help even on the hardest days.'
  where phase_key = 'early_healing' and section = 'mind' and title = 'Step outside for a minute';

update weekly_care_chart_content set
  how_long = '15 minutes',
  why_today = 'Rest without a task still helps your body, even if sleep doesn''t come.',
  what_to_avoid = 'Don''t turn this into another task — no phone-scrolling-as-productivity.'
  where phase_key = 'early_healing' and section = 'mind' and title = 'Lie down, task-free';

update weekly_care_chart_content set
  how_long = '30 minutes, if you can',
  why_today = 'Feeling supported, not judged, matters as much as physical rest right now.'
  where phase_key = 'early_healing' and section = 'mind' and title = 'Talk to someone who gets it';

update weekly_care_chart_content set
  why_today = 'Knowing what''s expected versus what needs attention helps you act early, not later.',
  detail = 'See the Safety & Emergency Support page for numbers to call if you need help right now.'
  where phase_key = 'early_healing' and section = 'mind' and title = 'Mental health';

-- ============ SKIN ============
update weekly_care_chart_content set
  why_today = 'Catching infection signs early prevents bigger problems.'
  where phase_key = 'early_healing' and section = 'skin' and title = 'Incision';

update weekly_care_chart_content set
  how_long = '2 minutes',
  why_today = 'This one step does the most to stop pregnancy pigmentation from getting darker.',
  what_to_avoid = 'Skip anything with active ingredients this week.'
  where phase_key = 'early_healing' and section = 'skin' and title = 'Morning: protect and hydrate';

update weekly_care_chart_content set
  how_long = '2 minutes',
  why_today = 'Your skin barrier has enough to manage right now without a new active.',
  what_to_avoid = 'Don''t start a new active ingredient this week — brightening actives can wait.'
  where phase_key = 'early_healing' and section = 'skin' and title = 'Night: cleanse and restore';

-- ============ REDISCOVER ============
update weekly_care_chart_content set
  how_long = '1 minute',
  why_today = 'Proof you were here too, not just baby.'
  where phase_key = 'early_healing' and section = 'rediscover' and title = 'One photo that''s just you';

update weekly_care_chart_content set
  how_long = '1 minute'
  where phase_key = 'early_healing' and section = 'rediscover' and title = 'A line for later';

update weekly_care_chart_content set
  how_long = '2-3 minutes'
  where phase_key = 'early_healing' and section = 'rediscover' and title = 'A song that was yours';
