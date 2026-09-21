-- migration_66_second_person_fixes.sql
--
-- Roop's live review of the native Care Chart (2026-09-21) caught content
-- slipping into third person ("the mother"/"her"/"she") where it should
-- speak to the mother directly, second person ("you"/"your"). A full audit
-- found the bug is concentrated almost entirely in the Nourish postpartum
-- content (migrations 56/57/58) — a templated "Using this shared menu"
-- note repeated across dozens of toddler-feeding weeks, plus a couple of
-- dozen one-off explanatory sentences drafted the same way — and one Care
-- Chart mantra line (migration_46) that broke from the rest of that card's
-- second-person voice.
--
-- This fixes whatever is CURRENTLY LIVE in nourish_week_content, regardless
-- of whether migration 55/56/57 or the later migration_58 rework last wrote
-- a given row — so run this AFTER all of those (it's meant to run last).
--
-- Safe to rerun: every replacement targets one specific, verified phrase,
-- never a blind pronoun swap. Once a phrase is fixed, the WHERE guard for
-- it stops matching, so running this migration twice is a no-op the second
-- time.

do $$
declare
  pairs text[][] := array[
    array['the mother''s dietary vitamin K or taking a maternal supplement', 'your dietary vitamin K or taking a supplement'],
    array['reflect the mother''s diet to some extent', 'reflect your diet to some extent'],
    array['in a mother''s diet can influence', 'in your diet can influence'],
    array['influenced by a mother''s own B12 status', 'influenced by your own B12 status'],
    array['displacing the mother''s own meal', 'displacing your own meal'],
    array['part of the mother''s meals', 'part of your meals'],
    array['nourishment plan for the mother', 'nourishment plan for you'],
    array['describe the mother''s complete meal', 'describe your complete meal'],
    array['Mother''s meal remains a real meal', 'Your meal remains a real meal'],
    array['easy for the mother in the middle of everything to barely eat a proper meal herself', 'easy, in the middle of everything, to barely eat a proper meal yourself'],
    array['for a mother''s body after birth', 'for your body after birth'],
    array['ready-to-eat food for the mother, plus', 'ready-to-eat food for you, plus'],
    array['remain the mother''s meals', 'remain your meals'],
    array['Serve the mother', 'Serve yourself'],
    array['serve the mother', 'serve yourself'],
    array['refers to the mother', 'refers to you'],
    array['apply to her, not the toddler', 'apply to you, not the toddler'],
    array['apply to the mother', 'apply to you'],
    array['for her own needs', 'for your own needs'],
    array['for the mothers who now are, while still very much in the middle of caring for the child they already have', 'for you, if you''re now expecting again, while still very much in the middle of caring for the child you already have'],
    array['that the mother feeding a new baby needed feeding too', 'that you, feeding a new baby, needed feeding too']
  ];
  p text[];
begin
  foreach p slice 1 in array pairs loop
    update nourish_week_content set
      why_it_matters = replace(why_it_matters, p[1], p[2]),
      condition_notes = replace(condition_notes, p[1], p[2]),
      meat_fish_eggs_note = replace(meat_fish_eggs_note, p[1], p[2]),
      using_meals_note = replace(using_meals_note, p[1], p[2]),
      days = replace(days::text, p[1], p[2])::jsonb
    where why_it_matters like '%' || p[1] || '%'
       or condition_notes like '%' || p[1] || '%'
       or meat_fish_eggs_note like '%' || p[1] || '%'
       or using_meals_note like '%' || p[1] || '%'
       or days::text like '%' || p[1] || '%';
  end loop;
end $$;

-- One Care Chart week's mantra (postpartum "What You'd Tell Week-One You")
-- dropped into third person ("She needed... Tell her now") inside an
-- otherwise second-person card.
update care_chart_week_content
set mantra = 'You needed to hear it wouldn''t always feel like this. Tell yourself now.'
where mantra = 'She needed to hear it wouldn''t always feel like this. Tell her now.';
