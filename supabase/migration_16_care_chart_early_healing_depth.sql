-- MOM VILLAGE — MIGRATION 16
-- Deepens Early healing (0-6wk postpartum) content, per Roop's 2026-07-25
-- feedback that Body/Skin guidance read as generic ("take a walk") rather
-- than real, specific solutions. Independently verified against Mayo
-- Clinic, Kaiser Permanente, and PCOS/lactation sources before writing —
-- see chat for full source list. Does not touch Mental health, Incision,
-- or Hair rows, which were already specific and already verified.

-- ============ BODY: named exercises with real technique + reps ============
update weekly_care_chart_content set body =
  'Diaphragmatic breathing: place one hand on your belly, inhale slowly through your nose letting your belly rise, exhale slowly through pursed lips letting it fall. Do 5-6 rounds. If it feels comfortable, add a gentle Kegel: squeeze and lift your pelvic floor for 3-5 seconds, then fully release. 5-8 repetitions is enough for now — this is safe even a few days after a caesarean.'
  where phase_key = 'early_healing' and section = 'body' and title = 'Breathe and reconnect';

update weekly_care_chart_content set body =
  'A short, slow walk when you feel ready — no fixed pace or distance, a few minutes around the room counts. Before or after, try a few pelvic tilts: lying on your back with knees bent, gently flatten your lower back into the floor by tilting your pelvis, hold 5 seconds, repeat 5 times. It''s a small, safe way to start reconnecting your core.'
  where phase_key = 'early_healing' and section = 'body' and title = 'A slow walk, when you''re ready';

-- New: protective guidance on the healing midline. Deliberately does NOT
-- include the diastasis recti self-check itself — that test isn't
-- accurate until roughly 6-8 weeks, so it belongs in the Finding rhythm
-- (6-12wk) phase content, not here.
insert into weekly_care_chart_content
  (week_number, phase_key, section, delivery_type, health_flag, time_option, title, body, sort_order)
values
  (3, 'early_healing', 'body', 'any', 'none', 'any', 'Protect your midline',
   'Your abdominal muscles are still knitting back together, so skip crunches, sit-ups, and twisting movements for now — these can strain the healing gap in your midline, which is common after any pregnancy. Roll onto your side before sitting up from lying down. Once you''re further along, usually from around 6 weeks, you can check for this gap yourself — for now, the gentle breathing and pelvic tilts above are doing the real work.', 5);

-- ============ FOOD: real PCOS-specific guidance ============
insert into weekly_care_chart_content
  (week_number, phase_key, section, delivery_type, health_flag, time_option, title, body, sort_order)
values
  (3, 'early_healing', 'food', 'any', 'pcos', 'any', 'If you have PCOS',
   'Your milk may take a little longer to come in — sometimes an extra day or two — because PCOS can slow the hormonal signal that starts full milk production. It doesn''t mean something is wrong; keep feeding or expressing often, and loop in a lactation consultant early if you''re worried. Try not to skip meals: steady, protein-and-fibre meals through the day help even out the energy dips PCOS can bring during round-the-clock feeds.', 4);

-- ============ SKIN: a real AM/PM routine instead of one vague tip ============
delete from weekly_care_chart_content
  where phase_key = 'early_healing' and section = 'skin' and title = 'Simple care';

insert into weekly_care_chart_content
  (week_number, phase_key, section, delivery_type, health_flag, time_option, title, body, sort_order)
values
  (3, 'early_healing', 'skin', 'any', 'none', 'any', 'Morning: protect and hydrate',
   'A gentle cleanser, a richer moisturiser than usual (sleep-deprived skin dries out faster), and mineral sunscreen with zinc oxide before you''re out in daylight — even a few minutes near a window. This one step does the most to stop any pregnancy pigmentation from getting darker.', 2),
  (3, 'early_healing', 'skin', 'any', 'none', 'any', 'Night: cleanse and restore',
   'Wash gently, moisturise well, and stop there. This isn''t the week to start a new active ingredient — brightening actives are fine to bring in later once things settle, but your skin barrier has enough to manage right now.', 3);

update weekly_care_chart_content set sort_order = 4
  where phase_key = 'early_healing' and section = 'skin' and title = 'Hair';
