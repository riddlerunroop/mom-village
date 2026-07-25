-- MOM VILLAGE — MIGRATION 14
-- Adds the "Rediscover" pillar (identity/self, beyond baby logistics) to
-- the Weekly Care Chart, prototyped first on Early healing (0-6 weeks
-- postpartum) — the most exhausted window in the whole journey, and the
-- best test of whether the revamp actually feels warmer, per Roop's
-- 2026-07-24 feedback that the Care Chart module felt generic.
-- Confirmed user-facing naming, 2026-07-25: "Care Step" / "Rediscover"
-- (not "Taaka" / "Soul").

alter table weekly_care_chart_content drop constraint weekly_care_chart_content_section_check;

alter table weekly_care_chart_content add constraint weekly_care_chart_content_section_check
  check (section in ('body', 'food', 'mind', 'skin', 'rediscover'));

-- Retitle the existing time-tiered Body & Mind rows for early_healing —
-- same verified guidance underneath, just given a real Care Step name
-- instead of a raw duration label. Nothing about the 5/15/30 system is
-- lost: time_option is unchanged and still drives which item she sees
-- based on her check-in — it just also now shows as a small badge next
-- to the title, instead of being the title.
update weekly_care_chart_content set title = 'Breathe and reconnect'
  where phase_key = 'early_healing' and section = 'body' and title = '5 min';
update weekly_care_chart_content set title = 'A slow walk, when you''re ready'
  where phase_key = 'early_healing' and section = 'body' and title = '15 min';
update weekly_care_chart_content set title = 'A little more, if today allows'
  where phase_key = 'early_healing' and section = 'body' and title = '30 min';

update weekly_care_chart_content set title = 'Step outside for a minute'
  where phase_key = 'early_healing' and section = 'mind' and title = '5 min';
update weekly_care_chart_content set title = 'Lie down, task-free'
  where phase_key = 'early_healing' and section = 'mind' and title = '15 min';
update weekly_care_chart_content set title = 'Talk to someone who gets it'
  where phase_key = 'early_healing' and section = 'mind' and title = '30 min';

-- This phase's mantra — stored once (on the first Body row) and looked
-- up separately by the page, rather than duplicated across every row.
update weekly_care_chart_content set mantra = 'You don''t have to bounce back. You get to heal.'
  where phase_key = 'early_healing' and section = 'body' and sort_order = 1;

-- New Rediscover Care Steps for early_healing — deliberately tiny asks,
-- since this is the phase with the least energy/time to give.
insert into weekly_care_chart_content
  (week_number, phase_key, section, delivery_type, health_flag, time_option, title, body, sort_order)
values
  (3, 'early_healing', 'rediscover', 'any', 'none', 'any', 'One photo that''s just you',
   'Take one photo today that has nothing to do with the baby — just you, however you look right now. You don''t have to share it or love it. It''s just proof you were here too.', 1),
  (3, 'early_healing', 'rediscover', 'any', 'none', 'any', 'A line for later',
   'Write one sentence about today — how it felt, not what you did. You don''t need more than a sentence, and no one else has to read it.', 2),
  (3, 'early_healing', 'rediscover', 'any', 'none', 'any', 'A song that was yours',
   'Play one song you loved before the baby, just for a minute or two. You don''t have to do anything else while it plays — just let it be yours again.', 3);
