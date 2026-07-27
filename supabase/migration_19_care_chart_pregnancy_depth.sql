-- MOM VILLAGE — MIGRATION 19
-- Same depth + Rediscover treatment as migration_14/16/17, now for the three
-- pregnancy phases (First, Second, Third trimester). Roop's instruction,
-- 2026-07-27: stop pausing phase-by-phase — build the full treatment across
-- every remaining phase now, review end to end after. Body/Skin were the
-- weakest sections in the original seed; Food/Mind were already reasonably
-- specific and are left mostly as-is. Named exercises independently
-- verified against ACOG (via AAFP/Mayo Clinic summaries) for pregnancy
-- exercise safety, safe core work (cat-cow, standing pelvic tilt, modified
-- bird dog), and the "avoid supine after the first trimester" guidance that
-- becomes a hard rule starting in the second trimester — see chat for
-- source list.

-- ============================================================
-- FIRST TRIMESTER (week -33)
-- ============================================================

update weekly_care_chart_content set title = 'Breathe and connect',
  body = 'Sit or lie comfortably. Breathe in slowly through your nose, letting your belly rise, then exhale fully. Pair with a gentle pelvic-floor check-in: squeeze and lift for 3-5 seconds, then fully release for the same count, 8-10 reps — the release matters as much as the squeeze.'
  where phase_key = 'first_trimester' and section = 'body' and title = '5 min';

update weekly_care_chart_content set title = 'Cat-cow and a walk',
  body = 'On hands and knees, hands under shoulders, knees under hips: as you inhale, drop your belly and lift your head and tailbone (cow); as you exhale, round your spine and tuck your chin (cat). 8-10 slow rounds. Pair with a gentle walk if you feel up to it — both are safe throughout pregnancy and neither asks you to lie on your back.'
  where phase_key = 'first_trimester' and section = 'body' and title = '15 min';

update weekly_care_chart_content set title = 'Choose your movement',
  body = 'A walk, stationary cycling, swimming, or beginner prenatal yoga are all reasonable choices right now — pick whichever you''ll actually enjoy. All three keep you off your back and are easy on a changing sense of balance. If exercise is new to you, start at 10-15 minutes and build up rather than starting at 30.'
  where phase_key = 'first_trimester' and section = 'body' and title = '30 min';

update weekly_care_chart_content set title = 'Morning',
  body = 'Gentle cleanser, broad-spectrum SPF, and — if you''d like — a pregnancy-safe brightening step such as vitamin C or niacinamide.'
  where phase_key = 'first_trimester' and section = 'skin' and title = 'Basics';

update weekly_care_chart_content set title = 'Evening',
  body = 'Cleanse and moisturise. Azelaic acid, benzoyl peroxide, and glycolic acid are commonly considered fine in pregnancy, but confirm anything new with your obstetrician or dermatologist first. Skip retinoids entirely — oral or topical — for the whole pregnancy.'
  where phase_key = 'first_trimester' and section = 'skin' and title = 'Actives';

update weekly_care_chart_content set title = 'Also skip',
  body = 'Peels, large-area or high-strength treatments, and any new prescription product unless your doctor specifically advises it.'
  where phase_key = 'first_trimester' and section = 'skin' and title = 'Avoid';

insert into weekly_care_chart_content
  (week_number, phase_key, section, delivery_type, health_flag, time_option, title, body, sort_order)
values
  (-33, 'first_trimester', 'body', 'any', 'high_bp', 'any', 'If you have high blood pressure',
   'Chronic high blood pressure in pregnancy needs ongoing monitoring, not extra restriction by default — most mothers with well-controlled blood pressure can keep exercising with their doctor''s sign-off. Keep taking any prescribed medication exactly as directed (don''t stop or adjust it yourself), and ask your maternity team whether home blood pressure checks are worth starting this early.', 5),
  (-33, 'first_trimester', 'rediscover', 'any', 'none', 'any', 'One thing that''s still just yours',
   'Pregnancy changes a lot, but not everything has to change yet. Spend a few minutes today on something entirely yours — a show, a hobby, a quiet coffee.', 1),
  (-33, 'first_trimester', 'rediscover', 'any', 'none', 'any', 'Write to your future self',
   'A few lines about how you''re actually feeling right now — before everyone starts asking how the baby''s doing instead of how you are.', 2),
  (-33, 'first_trimester', 'rediscover', 'any', 'none', 'any', 'Say the quiet part',
   'If today felt hard — nausea, fatigue, uncertainty — let yourself say so, even just to yourself. You don''t have to perform excitement every day.', 3);

update weekly_care_chart_content set mantra = 'You don''t have to feel ready to be doing this right.'
  where phase_key = 'first_trimester' and section = 'body' and title = 'Breathe and connect';

-- ============================================================
-- SECOND TRIMESTER (week -20)
-- ============================================================

update weekly_care_chart_content set title = 'Standing pelvic tilts',
  body = 'Stand with feet hip-width apart, knees soft. Gently tuck your pelvis under, flattening your lower back, hold 3-5 seconds, then release to neutral. 8-10 reps, paired with a pelvic-floor squeeze-and-release as in earlier weeks.'
  where phase_key = 'second_trimester' and section = 'body' and title = '5 min';

update weekly_care_chart_content set title = 'Bird dog, standing or on all fours',
  body = 'On hands and knees, hands under shoulders, knees under hips: slowly extend one arm forward as you exhale, keeping hips level, then return and repeat on the other side (or the opposite leg once that feels steady). 8 slow reps each side. Pair with a brisk, conversational-pace walk.'
  where phase_key = 'second_trimester' and section = 'body' and title = '15 min';

update weekly_care_chart_content set title = 'Swim, cycle, or a class',
  body = 'Swimming, stationary cycling, or a structured prenatal fitness class if it''s comfortable and suited to you — all three are easy on your joints and balance as your centre of gravity shifts.'
  where phase_key = 'second_trimester' and section = 'body' and title = '30 min';

update weekly_care_chart_content set
  body = 'From here on, avoid lying flat on your back to exercise — the weight of the uterus can press on a major blood vessel and make you dizzy or short of breath. Use side-lying, seated, or standing versions of everything above instead. Keep avoiding falls and overheating.'
  where phase_key = 'second_trimester' and section = 'body' and title = 'Note';

-- Keep "Note" sorting last within the section, matching the pattern used
-- everywhere else in this table, by bumping it past the two new rows below.
update weekly_care_chart_content set sort_order = 5
  where phase_key = 'second_trimester' and section = 'food' and title = 'Note';

insert into weekly_care_chart_content
  (week_number, phase_key, section, delivery_type, health_flag, time_option, title, body, sort_order)
values
  (-20, 'second_trimester', 'food', 'any', 'none', 'any', 'Your glucose screening',
   'Most mothers are offered a glucose tolerance test somewhere around 24-28 weeks to screen for gestational diabetes — it''s routine, not a sign anything''s wrong, and worth keeping the appointment even if you feel completely fine.', 3),
  (-20, 'second_trimester', 'food', 'any', 'pcos', 'any', 'If you have PCOS',
   'PCOS raises your chances of gestational diabetes, so don''t skip your glucose screening around 24-28 weeks even if nothing feels different — catching it early makes it very manageable, and most mothers with PCOS go on to have straightforward pregnancies from here.', 4);

update weekly_care_chart_content set title = 'Morning',
  body = 'Gentle cleanser, SPF, and a fragrance-free moisturiser if stretching skin feels itchy. If melasma is showing up, a wide-brimmed hat helps alongside the sunscreen — sun exposure is the main thing that darkens it further.'
  where phase_key = 'second_trimester' and section = 'skin' and title = 'Basics';

update weekly_care_chart_content set title = 'What''s normal'
  where phase_key = 'second_trimester' and section = 'skin' and title = 'Normal changes';

insert into weekly_care_chart_content
  (week_number, phase_key, section, delivery_type, health_flag, time_option, title, body, sort_order)
values
  (-20, 'second_trimester', 'rediscover', 'any', 'none', 'any', 'Do something just because it sounds fun',
   'Many mothers get a real burst of energy this trimester — if you have it today, spend some of it on something with no purpose except that you''ll enjoy it.', 1),
  (-20, 'second_trimester', 'rediscover', 'any', 'none', 'any', 'Capture how you look and feel right now',
   'A photo or a few lines, just for you — not for anyone else, not for a milestone board. This version of you is worth keeping too.', 2),
  (-20, 'second_trimester', 'rediscover', 'any', 'none', 'any', 'Have one conversation that isn''t about the baby',
   'Call a friend or talk to your partner about something else entirely — work, a show, an old memory. You''re allowed to be more than "expecting" today.', 3);

update weekly_care_chart_content set mantra = 'This is your body doing something extraordinary — and you''re allowed to enjoy it.'
  where phase_key = 'second_trimester' and section = 'body' and title = 'Standing pelvic tilts';

-- ============================================================
-- THIRD TRIMESTER (week -6)
-- ============================================================

update weekly_care_chart_content set title = 'Breathe and release',
  body = 'Sit comfortably, one hand on your belly. As you inhale, let your belly and pelvic floor expand and soften; as you exhale, consciously let your pelvic floor relax and lengthen rather than lifting it. This "letting go" breath is part of labour preparation — your body needs to know how to release, not just contract.'
  where phase_key = 'third_trimester' and section = 'body' and title = '5 min';

update weekly_care_chart_content set title = 'A slow walk and hip openers',
  body = 'A gentle walk, or seated/standing stretches for hips, upper back, and lower back — try a supported deep squat (holding onto something stable) for a few breaths if it feels comfortable, which many find eases lower back and hip tension late in pregnancy.'
  where phase_key = 'third_trimester' and section = 'body' and title = '15 min';

update weekly_care_chart_content set title = 'Yoga or swimming, shortened as needed',
  body = 'Prenatal yoga or swimming may still feel good — shorten sessions and swap positions as balance and energy shift. There''s no need to match your earlier-pregnancy pace; showing up at all counts.'
  where phase_key = 'third_trimester' and section = 'body' and title = '30 min';

insert into weekly_care_chart_content
  (week_number, phase_key, section, delivery_type, health_flag, time_option, title, body, sort_order)
values
  (-6, 'third_trimester', 'body', 'any', 'high_bp', 'any', 'If you have high blood pressure',
   'Blood pressure conditions become more important to watch closely in the third trimester. Keep any home monitoring your team has asked for up to date, keep taking prescribed medication as directed, and treat a severe headache, visual changes (blurring, spots, flashing lights), or swelling that comes on suddenly in your face or hands as reasons to call your maternity team the same day, not wait it out.', 5);

update weekly_care_chart_content set title = 'Marks and comfort'
  where phase_key = 'third_trimester' and section = 'skin' and title = 'Stretch marks';

insert into weekly_care_chart_content
  (week_number, phase_key, section, delivery_type, health_flag, time_option, title, body, sort_order)
values
  (-6, 'third_trimester', 'rediscover', 'any', 'none', 'any', 'Prepare one thing that''s for you, not the baby',
   'Pack something comforting in your hospital bag that''s purely for you — your own pillow, a scent you love, a book you probably won''t read but want nearby anyway.', 1),
  (-6, 'third_trimester', 'rediscover', 'any', 'none', 'any', 'Name what you''re proud of about how you''ve carried this',
   'Pregnancy has asked a lot of you. Name one thing — physical, emotional, anything — that you''re genuinely proud of about how you''ve done it.', 2),
  (-6, 'third_trimester', 'rediscover', 'any', 'none', 'any', 'A quiet ritual before everything changes',
   'A favourite meal, a slow morning, a call with someone who knows you well — whatever feels like closing this chapter gently before the next one starts.', 3);

update weekly_care_chart_content set mantra = 'You don''t have to be fearless. You just have to be ready enough.'
  where phase_key = 'third_trimester' and section = 'body' and title = 'Breathe and release';
