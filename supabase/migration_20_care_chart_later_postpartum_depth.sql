-- MOM VILLAGE — MIGRATION 20
-- Same depth + Rediscover treatment as migration_14/16/17/19, now for the
-- four later postpartum phases: Rebuilding (3-6mo), Settling into strength
-- (6-12mo), Sustainable rhythms (1-2yr), Your rhythm year three (2-3yr).
-- Roop's screenshot, 2026-07-27, showed exactly the kind of generic content
-- this fixes: "30 min · 30 min / Your regular routine — whatever 'fit'
-- means for you now." at sustainable_rhythms — the duplicate-badge display
-- bug is fixed separately in care/page.tsx; this migration fixes the
-- underlying generic titles themselves, giving real named strength
-- progression while keeping the good non-prescriptive "whatever fit means"
-- framing that already matched the anti-diet-culture principle, just
-- retitled instead of duplicated. Named exercises (bodyweight squat, glute
-- bridge, forward lunge) independently verified against NASM/ACE technique
-- guidance and postpartum progressive-overload principles; postpartum
-- thyroiditis timing (4-8 months) verified against thyroid.org/ATA — see
-- chat for full source list.

-- ============================================================
-- REBUILDING (3-6mo, week 19)
-- ============================================================

update weekly_care_chart_content set title = 'Check in and reconnect',
  body = 'Pelvic floor: squeeze and lift for up to 10 seconds if that''s comfortable by now, release fully for the same count, 8-10 reps. Core: a gentle pelvic tilt or the modified bird dog from Finding rhythm. All should feel controlled and symptom-free — if something still feels heavy, leaking, or uncomfortable, that''s worth a check with a pelvic-health physio rather than pushing through.'
  where phase_key = 'rebuilding' and section = 'body' and title = '5 min';

update weekly_care_chart_content set title = 'Bodyweight squats',
  body = 'Feet shoulder-width apart, weight in your heels. Lower down as if sitting into a chair, keeping your chest up and knees tracking over (not past) your toes, until thighs are parallel to the floor or as far as feels comfortable. Push through your heels to stand, squeezing your glutes at the top. Start with 2 sets of 10-12 reps.'
  where phase_key = 'rebuilding' and section = 'body' and title = '15 min';

update weekly_care_chart_content set title = 'Glute bridges and a walk',
  body = 'Lying on your back, knees bent, feet flat: push through your feet to lift your hips until your body forms a straight line from shoulders to knees, squeeze your glutes at the top, then lower with control. 3 sets of 10-12 reps. Pair with a walk, or swap in a structured postnatal class or swim if your body''s tolerating the build-up well.'
  where phase_key = 'rebuilding' and section = 'body' and title = '30 min';

update weekly_care_chart_content set
  body = 'There is no universal 12-week return-to-high-intensity deadline. A simple rule for building up: once a set feels easy for its full reps, add a few more reps before adding weight or intensity — one change at a time. Seek advice for pain, heaviness, leaking, doming, dizziness, or unusual fatigue.'
  where phase_key = 'rebuilding' and section = 'body' and title = 'Progression';

insert into weekly_care_chart_content
  (week_number, phase_key, section, delivery_type, health_flag, time_option, title, body, sort_order)
values
  (19, 'rebuilding', 'body', 'any', 'thyroid', 'any', 'If exercise feels unusually hard right now',
   'Somewhere between 4 and 8 months after birth, some mothers develop postpartum thyroiditis — a temporary dip in thyroid function that can bring real fatigue, low mood, and exercise tolerance that feels heavier than the effort should. If you''re pushing through tiredness that doesn''t match how much you''re actually doing, ask your doctor for a thyroid check — a simple blood test. Most mothers recover within a year, often without needing ongoing treatment.', 5);

update weekly_care_chart_content set title = 'Morning',
  body = 'Reassess your routine as hormones settle — hair shedding often peaks around month four and eases gradually after. If breastfeeding, check all prescription or strong active products first, and never apply medicated products to the nipple/areola or anywhere baby may mouth.'
  where phase_key = 'rebuilding' and section = 'skin' and title = 'Routine';

update weekly_care_chart_content set title = 'Evening'
  where phase_key = 'rebuilding' and section = 'skin' and title = 'Retinoids';

insert into weekly_care_chart_content
  (week_number, phase_key, section, delivery_type, health_flag, time_option, title, body, sort_order)
values
  (19, 'rebuilding', 'rediscover', 'any', 'none', 'any', 'Fifteen minutes, fully yours',
   'A step up from the ten minutes of earlier weeks — fifteen minutes of a hobby, a book, or anything that''s just for you, no multitasking.', 1),
  (19, 'rebuilding', 'rediscover', 'any', 'none', 'any', 'Make a plan, not just a wish',
   'Pick one small thing you want to do for yourself in the next month — book it, ask for the help you''ll need, put it on the calendar. Wanting isn''t enough; a plan makes it real.', 2),
  (19, 'rebuilding', 'rediscover', 'any', 'none', 'any', 'Notice who you''re becoming',
   'You''re not who you were before, and you''re not "back" — you''re becoming someone new. Write down one thing about this version of you that you actually like.', 3);

update weekly_care_chart_content set mantra = 'You''re not behind, and you''re not back. You''re becoming.'
  where phase_key = 'rebuilding' and section = 'body' and title = 'Check in and reconnect';

-- ============================================================
-- SETTLING INTO STRENGTH (6-12mo, week 39)
-- ============================================================

update weekly_care_chart_content set title = 'Mobility reset',
  body = 'A quick flow through neck rolls, shoulder rolls, cat-cow, and hip circles — a minute or so each. Enough to loosen up without needing a mat or a plan.'
  where phase_key = 'settling_into_strength' and section = 'body' and title = '5 min';

update weekly_care_chart_content set title = 'Forward lunges or a walk with baby',
  body = 'Step forward with one foot, lowering your back knee toward the floor while keeping your front knee over your ankle, then push back to standing. Alternate legs, 8-10 reps each side. Or a brisk walk with baby in a carrier or stroller — either builds real strength around a mobile baby''s schedule.'
  where phase_key = 'settling_into_strength' and section = 'body' and title = '15 min';

update weekly_care_chart_content set title = 'A structured workout, your choice',
  body = 'Increase intensity gradually if you''re symptom-free — the squats, glute bridges, and lunges from earlier weeks are a solid base to build on, whether that''s more reps, added weight, or a class.'
  where phase_key = 'settling_into_strength' and section = 'body' and title = '30 min';

update weekly_care_chart_content set title = 'Morning',
  body = 'A fuller skincare routine can be reasonable by now; if you''re breastfeeding, check new medicines or strong actives first and keep them away from baby contact. SPF remains a useful daily basic, especially with more outdoor time.'
  where phase_key = 'settling_into_strength' and section = 'skin' and title = 'Routine';

insert into weekly_care_chart_content
  (week_number, phase_key, section, delivery_type, health_flag, time_option, title, body, sort_order)
values
  (39, 'settling_into_strength', 'rediscover', 'any', 'none', 'any', 'Twenty minutes, no baby monitor in hand',
   'If you can arrange it, hand baby off for twenty real minutes and do something that has nothing to do with parenting.', 1),
  (39, 'settling_into_strength', 'rediscover', 'any', 'none', 'any', 'Try something you haven''t done since before baby',
   'A class, a hobby, a place — one thing you used to do regularly and haven''t gotten back to yet. Just once, to see how it feels.', 2),
  (39, 'settling_into_strength', 'rediscover', 'any', 'none', 'any', 'Say out loud what you''re good at',
   'Not as a mother — as yourself. One thing you''re genuinely good at, said plainly, no deflecting.', 3);

update weekly_care_chart_content set mantra = 'Strength is coming back — not to who you were, but to who you are now.'
  where phase_key = 'settling_into_strength' and section = 'body' and title = 'Mobility reset';

-- ============================================================
-- SUSTAINABLE RHYTHMS (1-2yr, week 78)
-- ============================================================

update weekly_care_chart_content set title = 'Reset break',
  body = 'A short flow through neck rolls, shoulder rolls, and a few cat-cow rounds — quick enough to fit between toddler demands.'
  where phase_key = 'sustainable_rhythms' and section = 'body' and title = '5 min';

update weekly_care_chart_content set title = 'A walk, workout, or active play with your toddler',
  body = 'A structured 15-minute home workout, a walk, or genuinely active play — squats while lifting your toddler are a real functional exercise (safe if your core and pelvic floor feel strong; stop and check in with a pelvic-health physio if you notice heaviness or leaking), chasing games, or dancing around the living room all count too.'
  where phase_key = 'sustainable_rhythms' and section = 'body' and title = '15 min';

update weekly_care_chart_content set title = 'Whatever "fit" means today',
  body = 'Your regular routine — running, a class, home workouts, sport, whatever you''ve built. There''s no single right answer here; consistency with something you don''t dread beats an "ideal" routine you abandon.'
  where phase_key = 'sustainable_rhythms' and section = 'body' and title = '30 min';

insert into weekly_care_chart_content
  (week_number, phase_key, section, delivery_type, health_flag, time_option, title, body, sort_order)
values
  (78, 'sustainable_rhythms', 'rediscover', 'any', 'none', 'any', 'Thirty minutes, no interruptions',
   'A bigger ask now that there''s a bit more room — half an hour that''s entirely yours, arranged for and protected.', 1),
  (78, 'sustainable_rhythms', 'rediscover', 'any', 'none', 'any', 'Reconnect with a pre-mum interest, properly',
   'Not just a taste of it — pick something back up seriously. Sign up, commit, show up more than once.', 2),
  (78, 'sustainable_rhythms', 'rediscover', 'any', 'none', 'any', 'Answer: who am I outside of mum?',
   'Write a real answer, even a short one. This question resurfacing isn''t a problem to solve — it''s worth actually sitting with.', 3);

update weekly_care_chart_content set mantra = 'Strength now looks like steadiness, not urgency.'
  where phase_key = 'sustainable_rhythms' and section = 'body' and title = 'Reset break';

-- ============================================================
-- YOUR RHYTHM, YEAR THREE (2-3yr, week 130)
-- ============================================================

update weekly_care_chart_content set title = 'Stretch and reset',
  body = 'A short flow through neck rolls, shoulder rolls, and cat-cow — the same quick reset as ever, still worth the five minutes.'
  where phase_key = 'rhythm_year_three' and section = 'body' and title = '5 min';

update weekly_care_chart_content set title = 'A walk or home workout',
  body = 'Pick 3 exercises you actually enjoy and rotate them week to week — squats, lunges, glute bridges, or whatever you''ve found works for you. A routine you''ll stick with beats a "perfect" one you won''t.'
  where phase_key = 'rhythm_year_three' and section = 'body' and title = '15 min';

update weekly_care_chart_content set title = 'Your regular routine, whatever that looks like now',
  body = 'Running, a class, home workouts, sport, or something else entirely — the goal by year three is a routine you keep, not one that looks a particular way.'
  where phase_key = 'rhythm_year_three' and section = 'body' and title = '30 min';

insert into weekly_care_chart_content
  (week_number, phase_key, section, delivery_type, health_flag, time_option, title, body, sort_order)
values
  (130, 'rhythm_year_three', 'rediscover', 'any', 'none', 'any', 'A full hour, guilt-free',
   'If you can find it, take a full hour for yourself this week without treating it as something to earn or apologise for.', 1),
  (130, 'rhythm_year_three', 'rediscover', 'any', 'none', 'any', 'Revisit a goal you set before motherhood',
   'Something you wanted for yourself before baby arrived. Is it still something you want? If so, what''s one small step toward it now?', 2),
  (130, 'rhythm_year_three', 'rediscover', 'any', 'none', 'any', 'Celebrate three years of showing up',
   'However this journey has looked for you, three years of showing up is real. Mark it somehow — even just by naming it to yourself.', 3);

update weekly_care_chart_content set mantra = 'Three years in, you''re not the same woman — and that was never the goal.'
  where phase_key = 'rhythm_year_three' and section = 'body' and title = 'Stretch and reset';
