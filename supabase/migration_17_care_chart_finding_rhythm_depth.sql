-- MOM VILLAGE — MIGRATION 17
-- Same depth + Rediscover treatment as migration_14/16, now for Finding
-- rhythm (6-12wk postpartum). Independently verified against Restore Your
-- Core, NASM, ACOG (via AAFP summary), and Cleveland Clinic/thyroid.org
-- sources — see chat for full source list.

-- ============ BODY: named progression from Early healing ============
update weekly_care_chart_content set title = 'Kegels and breath, a little longer',
  body = 'Continue your pelvic floor work: squeeze and lift for 3-5 seconds as before, but if it feels comfortable, start adding a second to your hold each week, working toward 8-10 seconds. Pair with slow diaphragmatic breathing, exhaling as you lift.'
  where phase_key = 'finding_rhythm' and section = 'body' and title = '5 min';

update weekly_care_chart_content set title = 'Heel slides',
  body = 'Lying on your back, knees bent, feet flat — gently flatten your lower back by tilting your pelvis, then slowly slide one heel out along the floor as you exhale, keeping your lower back pressed down. Slide it back in as you inhale. 10-12 reps each side. If your belly domes or bulges upward, stop and go back to pelvic tilts for now — that''s your body telling you it isn''t ready for this yet.'
  where phase_key = 'finding_rhythm' and section = 'body' and title = '15 min';

update weekly_care_chart_content set title = 'Modified bird dog, if you''re ready',
  body = 'On hands and knees, hands under shoulders, knees under hips, back neutral. Slowly lift one hand a few inches off the ground as you exhale, keeping your hips level and not shifting side to side. Lower and repeat on the other side. 6-8 slow reps each side is plenty — this is about control, not speed. Only move to this once heel slides feel easy and your own team has cleared you for exercise.'
  where phase_key = 'finding_rhythm' and section = 'body' and title = '30 min';

-- New: the self-check itself, correctly timed here (not in Early healing,
-- where it isn't accurate yet).
insert into weekly_care_chart_content
  (week_number, phase_key, section, delivery_type, health_flag, time_option, title, body, sort_order)
values
  (9, 'finding_rhythm', 'body', 'any', 'none', 'any', 'Check your midline',
   'From around 6 weeks, you can check for the ab separation common after pregnancy: lie on your back, knees bent, lift your head slightly (not a full crunch), and press two fingers into your belly button, then a few inches above and below. If you feel a gap wider than two fingers, that''s diastasis recti — very common, not dangerous, and it responds well to the gentle exercises here. If it feels concerning, or you notice bulging along your midline, a pelvic-health physiotherapist can check you properly.', 5);

-- ============ FOOD: real gestational-diabetes-specific guidance ============
insert into weekly_care_chart_content
  (week_number, phase_key, section, delivery_type, health_flag, time_option, title, body, sort_order)
values
  (9, 'finding_rhythm', 'food', 'any', 'diabetes_gd', 'any', 'If you had gestational diabetes',
   'Somewhere between 4 and 12 weeks after birth, get your postpartum glucose test done — a blood sugar check recommended for every mother who had gestational diabetes, not just if something feels off. It''s easy to let this slip while you''re focused on the baby, so it''s worth booking now if you haven''t already. Even with a normal result, a repeat check every few years afterward is worth keeping on your radar.', 4);

-- ============ SKIN: routine continues, one gentle option opens up ============
update weekly_care_chart_content set title = 'Morning: same, plus one option',
  body = 'Keep the gentle cleanser, moisturiser, and mineral SPF from before. If you''d like, this is a reasonable point to introduce one gentle brightening step — vitamin C or niacinamide are both considered safe while breastfeeding — but add only one new thing at a time, and stop if your skin reacts.'
  where phase_key = 'finding_rhythm' and section = 'skin' and title = 'Routine';

insert into weekly_care_chart_content
  (week_number, phase_key, section, delivery_type, health_flag, time_option, title, body, sort_order)
values
  (9, 'finding_rhythm', 'skin', 'any', 'none', 'any', 'Night: same basics',
   'Cleanse, moisturise, stop there. Retinoids and hydroquinone still aren''t breastfeeding-safe, so save those for later if you''re nursing — everything else here is gentle enough to stay consistent with.', 4);

-- ============ REDISCOVER: new pillar for this phase ============
insert into weekly_care_chart_content
  (week_number, phase_key, section, delivery_type, health_flag, time_option, title, body, sort_order)
values
  (9, 'finding_rhythm', 'rediscover', 'any', 'none', 'any', 'Ten minutes of something that was yours',
   'Pick up an old hobby for just ten minutes — a book, a sketch, an instrument, anything that was yours before. It doesn''t have to be good. It just has to be yours again.', 1),
  (9, 'finding_rhythm', 'rediscover', 'any', 'none', 'any', 'Wear something that feels like you',
   'Today, put on one thing — earrings, a colour, anything — that feels like the you from before, not just "mom clothes." Small, but it counts.', 2),
  (9, 'finding_rhythm', 'rediscover', 'any', 'none', 'any', 'Name one thing you''re proud of this week',
   'Say it out loud or write it down: one thing you did well this week, as a person, not just as a mother.', 3);

-- ============ MANTRA ============
update weekly_care_chart_content set mantra = 'You''re not behind. You''re finding your rhythm.'
  where phase_key = 'finding_rhythm' and section = 'body' and sort_order = 1;
