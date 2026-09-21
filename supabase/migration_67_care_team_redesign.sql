-- Care Chart week-by-week — "For Your Care Team" full redesign, all 196 weeks,
-- 2026-09-21. Direct follow-on to migration_66's second-person audit and the
-- 2026-09-21 action-list item #3 ("For your care team" redefinition).
--
-- The card had drifted into "what to tell/ask your doctor" and, by late
-- postpartum, largely collapsed into repeated "No specific ask this week"
-- placeholders (94 of 196 weeks). Roop's redefinition, confirmed and written in
-- full by her: "For Your Care Team" = one small, timely thing the people around
-- her can do this week to make her life safer, easier or better. The care team
-- varies by week -- partner, family, friend, clinician, caregiver, employer,
-- whoever is actually relevant -- and every card answers "who could help me this
-- week, and what exactly can I ask them to do?" Roop deliberately varied WHO
-- across the whole set so the feature teaches building/using a village, rather
-- than becoming "things your husband should do" by default.
--
-- Roop authored all 196 cards herself (a small handful -- 6, 8, 9, 40-45 -- were
-- surfaced back to her from an earlier sample she'd approved). Claude's own
-- contribution was structural (the who/lede/detail split below, matching the
-- sample she signed off on) plus one explicit final pass: every one of the 196
-- cards was checked against that week's real theme_title/journey text. 190 of
-- 196 lined up tightly already -- Roop had gone through the real theme list
-- herself before writing these. 6 read as generic relative to that week's more
-- specific theme and were tightened to reference it directly, keeping her voice
-- and WHO choice: weeks 79 ("nine months, as long as pregnancy" -- now names the
-- milestone instead of a generic invisible-load line), 99 ("when your toddler
-- won't let go" -- now ties to separation anxiety specifically), 116 ("feeding a
-- family, sustainably" -- now about owning a repeatable dinner rotation), 141
-- ("toddler safety, next phase" -- now a room-by-room safety walk-through), 149
-- ("preschool or not preschool" -- now the actual decision, not generic parenting
-- support) and 183 ("screens and boundaries, settled" -- now ties to that settled
-- household rhythm instead of a generic fun-together line).
--
-- Also removes, by rewriting into real cards, two structural problems found while
-- scanning all 196: 7 weeks (131, 136, 152, 159, 176, 188, 192) that were just
-- navigation pointers to another pillar (Wealth planner / a Library book /
-- Community) instead of a real Care Team card -- those pillars are already
-- promoted elsewhere in the app, so nothing is lost; and week 147, which had
-- drifted into child-developmental clinical guidance (a pediatrician referral
-- about potty-training delay) rather than supporting the mother through her
-- people -- now a real Care Team card about family dropping the comparisons.
--
-- Schema: three new nullable columns -- for_your_care_team_who,
-- for_your_care_team_lede, for_your_care_team_detail -- so the card can render a
-- visible WHO tag (Partner / Family / Friend / Care team / etc.) plus one bold
-- short instruction and the concrete detail, matching the reviewed sample.
-- for_your_care_team itself is kept and kept in sync as a plain-text fallback
-- ("{who} -- {lede}: {detail}"), same superseded-but-kept convention as
-- your_corner/care_for_yourself before it -- nothing reading the old column
-- breaks. The six internal buckets Roop defined (SHARE/REST/NOTICE/SPEAK/
-- PROFESSIONAL/PLAN) were editorial-drafting machinery only, per her explicit
-- instruction -- not stored, not shown to the mother.
--
-- Idempotent: safe to rerun, every statement is a plain UPDATE keyed on
-- week_number.

alter table care_chart_week_content
  add column if not exists for_your_care_team_who text,
  add column if not exists for_your_care_team_lede text,
  add column if not exists for_your_care_team_detail text;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / support person',
  for_your_care_team_lede = 'Loop someone in',
  for_your_care_team_detail = 'if you know you''re expecting, choose one trusted person who can be your first call when you need support.',
  for_your_care_team = 'Partner / support person — Loop someone in: if you know you''re expecting, choose one trusted person who can be your first call when you need support.'
where week_number = 1;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / support person',
  for_your_care_team_lede = 'Share the mental load',
  for_your_care_team_detail = 'let one trusted person know what you''re watching, wondering or worrying about instead of carrying it quietly.',
  for_your_care_team = 'Partner / support person — Share the mental load: let one trusted person know what you''re watching, wondering or worrying about instead of carrying it quietly.'
where week_number = 2;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / support person',
  for_your_care_team_lede = 'Keep one person close',
  for_your_care_team_detail = 'early pregnancy can feel strangely private. Choose someone you can message without having to explain everything.',
  for_your_care_team = 'Partner / support person — Keep one person close: early pregnancy can feel strangely private. Choose someone you can message without having to explain everything.'
where week_number = 3;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / support person',
  for_your_care_team_lede = 'Know the urgent plan',
  for_your_care_team_detail = 'make sure you both know where you''d seek care if severe pain, heavy bleeding or fainting happens.',
  for_your_care_team = 'Partner / support person — Know the urgent plan: make sure you both know where you''d seek care if severe pain, heavy bleeding or fainting happens.'
where week_number = 4;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / Family',
  for_your_care_team_lede = 'Take food off her plate—literally',
  for_your_care_team_detail = 'if smells or nausea are starting, let someone else handle cooking or grocery decisions.',
  for_your_care_team = 'Partner / Family — Take food off her plate—literally: if smells or nausea are starting, let someone else handle cooking or grocery decisions.'
where week_number = 5;

update care_chart_week_content set
  for_your_care_team_who = 'Care team',
  for_your_care_team_lede = 'Get care started',
  for_your_care_team_detail = 'know whom you''re seeing for prenatal care and how to reach them between appointments if something worries you.',
  for_your_care_team = 'Care team — Get care started: know whom you''re seeing for prenatal care and how to reach them between appointments if something worries you.'
where week_number = 6;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / Family',
  for_your_care_team_lede = 'Work around the nausea',
  for_your_care_team_detail = 'keep easy foods and fluids she can tolerate nearby; this is not the week to police perfect eating.',
  for_your_care_team = 'Partner / Family — Work around the nausea: keep easy foods and fluids she can tolerate nearby; this is not the week to police perfect eating.'
where week_number = 7;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / Family',
  for_your_care_team_lede = 'If nausea is rough',
  for_your_care_team_detail = 'ask someone else to handle cooking smells or food prep this week.',
  for_your_care_team = 'Partner / Family — If nausea is rough: ask someone else to handle cooking smells or food prep this week.'
where week_number = 8;

update care_chart_week_content set
  for_your_care_team_who = 'Care team',
  for_your_care_team_lede = 'Can''t keep fluids down?',
  for_your_care_team_detail = 'Don''t wait it out—ask your clinician when dehydration needs assessment.',
  for_your_care_team = 'Care team — Can''t keep fluids down?: Don''t wait it out—ask your clinician when dehydration needs assessment.'
where week_number = 9;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / support person',
  for_your_care_team_lede = 'Make evenings easier',
  for_your_care_team_detail = 'take one recurring job off her hands if fatigue, reflux or nausea is making the end of the day harder.',
  for_your_care_team = 'Partner / support person — Make evenings easier: take one recurring job off her hands if fatigue, reflux or nausea is making the end of the day harder.'
where week_number = 10;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / support person',
  for_your_care_team_lede = 'Be her second pair of ears',
  for_your_care_team_detail = 'if screening decisions feel overwhelming, come to the appointment or help her write down the questions first.',
  for_your_care_team = 'Partner / support person — Be her second pair of ears: if screening decisions feel overwhelming, come to the appointment or help her write down the questions first.'
where week_number = 11;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / support person',
  for_your_care_team_lede = 'Know when not to wait',
  for_your_care_team_detail = 'make sure someone close knows that heavy bleeding, severe pain, fainting or serious illness needs prompt care.',
  for_your_care_team = 'Partner / support person — Know when not to wait: make sure someone close knows that heavy bleeding, severe pain, fainting or serious illness needs prompt care.'
where week_number = 12;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / support person',
  for_your_care_team_lede = 'Do the calendar together',
  for_your_care_team_detail = 'put upcoming appointments and important tests somewhere both of you can see them.',
  for_your_care_team = 'Partner / support person — Do the calendar together: put upcoming appointments and important tests somewhere both of you can see them.'
where week_number = 13;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / Family',
  for_your_care_team_lede = 'Don''t assume "better" means energetic',
  for_your_care_team_detail = 'if symptoms are easing, keep sharing the workload instead of handing everything straight back.',
  for_your_care_team = 'Partner / Family — Don''t assume "better" means energetic: if symptoms are easing, keep sharing the workload instead of handing everything straight back.'
where week_number = 14;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / support person',
  for_your_care_team_lede = 'Make discomfort visible',
  for_your_care_team_detail = 'if pain keeps interrupting her day, help her notice the pattern and bring it up rather than normalising it.',
  for_your_care_team = 'Partner / support person — Make discomfort visible: if pain keeps interrupting her day, help her notice the pattern and bring it up rather than normalising it.'
where week_number = 15;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / support person',
  for_your_care_team_lede = 'Don''t DIY reassurance',
  for_your_care_team_detail = 'if she''s worried about symptoms or movement, support her in contacting her care team rather than relying on a home Doppler.',
  for_your_care_team = 'Partner / support person — Don''t DIY reassurance: if she''s worried about symptoms or movement, support her in contacting her care team rather than relying on a home Doppler.'
where week_number = 16;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / Family',
  for_your_care_team_lede = 'Protect her back',
  for_your_care_team_detail = 'take over one job involving repeated lifting, carrying or bending if it''s becoming uncomfortable.',
  for_your_care_team = 'Partner / Family — Protect her back: take over one job involving repeated lifting, carrying or bending if it''s becoming uncomfortable.'
where week_number = 17;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / support person',
  for_your_care_team_lede = 'Come prepared',
  for_your_care_team_detail = 'before an important scan or appointment, write down the two or three things you both most want explained.',
  for_your_care_team = 'Partner / support person — Come prepared: before an important scan or appointment, write down the two or three things you both most want explained.'
where week_number = 18;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / Family',
  for_your_care_team_lede = 'Make food easier',
  for_your_care_team_detail = 'if digestion is uncomfortable, help with meals she tolerates instead of expecting her to cook around everyone else.',
  for_your_care_team = 'Partner / Family — Make food easier: if digestion is uncomfortable, help with meals she tolerates instead of expecting her to cook around everyone else.'
where week_number = 19;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / support person',
  for_your_care_team_lede = 'Learn the warning signs together',
  for_your_care_team_detail = 'severe persistent headache, vision changes or sudden concerning symptoms deserve prompt attention.',
  for_your_care_team = 'Partner / support person — Learn the warning signs together: severe persistent headache, vision changes or sudden concerning symptoms deserve prompt attention.'
where week_number = 20;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / support person',
  for_your_care_team_lede = 'Notice sudden changes',
  for_your_care_team_detail = 'one-sided leg swelling, calf pain or sudden swelling with other symptoms shouldn''t be brushed off as "just pregnancy."',
  for_your_care_team = 'Partner / support person — Notice sudden changes: one-sided leg swelling, calf pain or sudden swelling with other symptoms shouldn''t be brushed off as "just pregnancy."'
where week_number = 21;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / support person',
  for_your_care_team_lede = 'Know who to call',
  for_your_care_team_detail = 'save the maternity-care number now so leaking fluid, bleeding or worrying symptoms don''t trigger a frantic search later.',
  for_your_care_team = 'Partner / support person — Know who to call: save the maternity-care number now so leaking fluid, bleeding or worrying symptoms don''t trigger a frantic search later.'
where week_number = 22;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / Family',
  for_your_care_team_lede = 'Slow the pace without making her ask',
  for_your_care_team_detail = 'if breathlessness or fatigue is increasing, take over one physically demanding household task.',
  for_your_care_team = 'Partner / Family — Slow the pace without making her ask: if breathlessness or fatigue is increasing, take over one physically demanding household task.'
where week_number = 23;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / support person',
  for_your_care_team_lede = 'Help with the follow-through',
  for_your_care_team_detail = 'if a screening test needs another test or appointment, put the next step in the shared calendar.',
  for_your_care_team = 'Partner / support person — Help with the follow-through: if a screening test needs another test or appointment, put the next step in the shared calendar.'
where week_number = 24;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / support person',
  for_your_care_team_lede = 'Listen when she says movement feels different',
  for_your_care_team_detail = 'don''t reassure it away—help her contact her maternity team if she''s concerned.',
  for_your_care_team = 'Partner / support person — Listen when she says movement feels different: don''t reassure it away—help her contact her maternity team if she''s concerned.'
where week_number = 25;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / support person',
  for_your_care_team_lede = 'Share the admin',
  for_your_care_team_detail = 'keep track of the next appointment, pending result or recommended vaccine so she isn''t the only pregnancy project manager.',
  for_your_care_team = 'Partner / support person — Share the admin: keep track of the next appointment, pending result or recommended vaccine so she isn''t the only pregnancy project manager.'
where week_number = 26;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / Family',
  for_your_care_team_lede = 'Prepare for a heavier third trimester',
  for_your_care_team_detail = 'decide now which regular jobs someone else can increasingly own as her body works harder.',
  for_your_care_team = 'Partner / Family — Prepare for a heavier third trimester: decide now which regular jobs someone else can increasingly own as her body works harder.'
where week_number = 27;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / support person',
  for_your_care_team_lede = 'Learn the pattern with her',
  for_your_care_team_detail = 'know when the baby''s usually active so you''ll understand why a clear change matters to her.',
  for_your_care_team = 'Partner / support person — Learn the pattern with her: know when the baby''s usually active so you''ll understand why a clear change matters to her.'
where week_number = 28;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / Family',
  for_your_care_team_lede = 'Take the heavy job',
  for_your_care_team_detail = 'choose one task involving lifting, carrying or prolonged standing and make it somebody else''s responsibility.',
  for_your_care_team = 'Partner / Family — Take the heavy job: choose one task involving lifting, carrying or prolonged standing and make it somebody else''s responsibility.'
where week_number = 29;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / support person',
  for_your_care_team_lede = 'Don''t minimise sudden breathlessness',
  for_your_care_team_detail = 'if it feels severe or comes with chest pain or faintness, help her seek urgent advice.',
  for_your_care_team = 'Partner / support person — Don''t minimise sudden breathlessness: if it feels severe or comes with chest pain or faintness, help her seek urgent advice.'
where week_number = 30;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / support person',
  for_your_care_team_lede = 'Notice what''s sudden',
  for_your_care_team_detail = 'rapidly appearing swelling or swelling with headache or vision changes deserves a same-day call.',
  for_your_care_team = 'Partner / support person — Notice what''s sudden: rapidly appearing swelling or swelling with headache or vision changes deserves a same-day call.'
where week_number = 31;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / support person',
  for_your_care_team_lede = 'Know the preterm plan',
  for_your_care_team_detail = 'make sure you both know whom to call if regular contractions, bleeding or leaking fluid begins early.',
  for_your_care_team = 'Partner / support person — Know the preterm plan: make sure you both know whom to call if regular contractions, bleeding or leaking fluid begins early.'
where week_number = 32;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / support person',
  for_your_care_team_lede = 'Hear her birth preferences',
  for_your_care_team_detail = 'ask what matters most to her in labour—and what she wants you to speak up about if she''s busy coping.',
  for_your_care_team = 'Partner / support person — Hear her birth preferences: ask what matters most to her in labour—and what she wants you to speak up about if she''s busy coping.'
where week_number = 33;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / support person',
  for_your_care_team_lede = 'Own some paperwork',
  for_your_care_team_detail = 'take responsibility for one hospital, insurance, transport or admission task that doesn''t need to sit in her head.',
  for_your_care_team = 'Partner / support person — Own some paperwork: take responsibility for one hospital, insurance, transport or admission task that doesn''t need to sit in her head.'
where week_number = 34;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / support person',
  for_your_care_team_lede = 'Know the plan, not every detail',
  for_your_care_team_detail = 'understand the key decisions from this week''s appointment so she isn''t the only one remembering them.',
  for_your_care_team = 'Partner / support person — Know the plan, not every detail: understand the key decisions from this week''s appointment so she isn''t the only one remembering them.'
where week_number = 35;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / support person',
  for_your_care_team_lede = 'Make the plan real',
  for_your_care_team_detail = 'confirm who drives, who''s on call for other children or pets, and what''s still missing from the hospital bag.',
  for_your_care_team = 'Partner / support person — Make the plan real: confirm who drives, who''s on call for other children or pets, and what''s still missing from the hospital bag.'
where week_number = 36;

update care_chart_week_content set
  for_your_care_team_who = 'Family / Friend',
  for_your_care_team_lede = 'Line up backup',
  for_your_care_team_detail = 'confirm who can step in on short notice once labour starts—and make sure they actually know they''re the backup.',
  for_your_care_team = 'Family / Friend — Line up backup: confirm who can step in on short notice once labour starts—and make sure they actually know they''re the backup.'
where week_number = 37;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / support person',
  for_your_care_team_lede = 'Protect the waiting',
  for_your_care_team_detail = 'help reduce unnecessary plans, visitors and obligations so she doesn''t spend these final days accommodating everyone else.',
  for_your_care_team = 'Partner / support person — Protect the waiting: help reduce unnecessary plans, visitors and obligations so she doesn''t spend these final days accommodating everyone else.'
where week_number = 38;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / support person',
  for_your_care_team_lede = 'Be ready, not panicked',
  for_your_care_team_detail = 'keep phones charged, transport sorted and the maternity number easy to reach.',
  for_your_care_team = 'Partner / support person — Be ready, not panicked: keep phones charged, transport sorted and the maternity number easy to reach.'
where week_number = 39;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / Family',
  for_your_care_team_lede = 'Protect her rest',
  for_your_care_team_detail = 'let one person handle calls, visitors and updates while she recovers.',
  for_your_care_team = 'Partner / Family — Protect her rest: let one person handle calls, visitors and updates while she recovers.'
where week_number = 40;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / support person',
  for_your_care_team_lede = 'Own one night job',
  for_your_care_team_detail = 'nappy changes, burping, settling or bottle prep—don''t wait to be asked each time.',
  for_your_care_team = 'Partner / support person — Own one night job: nappy changes, burping, settling or bottle prep—don''t wait to be asked each time.'
where week_number = 41;

update care_chart_week_content set
  for_your_care_team_who = 'Family / Friend',
  for_your_care_team_lede = 'Bring food, not advice',
  for_your_care_team_detail = 'a meal, laundry load or grocery run is more useful than another opinion.',
  for_your_care_team = 'Family / Friend — Bring food, not advice: a meal, laundry load or grocery run is more useful than another opinion.'
where week_number = 42;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / someone close',
  for_your_care_team_lede = 'Watch her too',
  for_your_care_team_detail = 'if she seems unusually withdrawn, overwhelmed or unlike herself, check in gently and help her reach support if needed.',
  for_your_care_team = 'Partner / someone close — Watch her too: if she seems unusually withdrawn, overwhelmed or unlike herself, check in gently and help her reach support if needed.'
where week_number = 43;

update care_chart_week_content set
  for_your_care_team_who = 'Friend / Family',
  for_your_care_team_lede = 'Give her an hour',
  for_your_care_team_detail = 'hold the baby while she showers, sleeps, walks or does absolutely nothing.',
  for_your_care_team = 'Friend / Family — Give her an hour: hold the baby while she showers, sleeps, walks or does absolutely nothing.'
where week_number = 44;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / support person',
  for_your_care_team_lede = 'Ask this tonight',
  for_your_care_team_detail = '"What is one thing I can completely take off your plate this week?"',
  for_your_care_team = 'Partner / support person — Ask this tonight: "What is one thing I can completely take off your plate this week?"'
where week_number = 45;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / support person',
  for_your_care_team_lede = 'Don''t confuse six weeks with "back to normal"',
  for_your_care_team_detail = 'keep sharing the physical load while her recovery continues at its own pace.',
  for_your_care_team = 'Partner / support person — Don''t confuse six weeks with "back to normal": keep sharing the physical load while her recovery continues at its own pace.'
where week_number = 46;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / support person',
  for_your_care_team_lede = 'Notice what she''s still working around',
  for_your_care_team_detail = 'pain, leaking or discomfort deserves support, not another workaround.',
  for_your_care_team = 'Partner / support person — Notice what she''s still working around: pain, leaking or discomfort deserves support, not another workaround.'
where week_number = 47;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / Family',
  for_your_care_team_lede = 'Create recovery time',
  for_your_care_team_detail = 'give her a protected window for movement, rehabilitation or rest without making her organise the baby first.',
  for_your_care_team = 'Partner / Family — Create recovery time: give her a protected window for movement, rehabilitation or rest without making her organise the baby first.'
where week_number = 48;

update care_chart_week_content set
  for_your_care_team_who = 'Care team',
  for_your_care_team_lede = 'Persistent symptoms deserve assessment',
  for_your_care_team_detail = 'pelvic heaviness, leaking or pain aren''t things she has to silently adapt to.',
  for_your_care_team = 'Care team — Persistent symptoms deserve assessment: pelvic heaviness, leaking or pain aren''t things she has to silently adapt to.'
where week_number = 49;

update care_chart_week_content set
  for_your_care_team_who = 'Partner',
  for_your_care_team_lede = 'Have the contraception conversation together',
  for_your_care_team_detail = 'pregnancy prevention and future plans shouldn''t become her responsibility alone.',
  for_your_care_team = 'Partner — Have the contraception conversation together: pregnancy prevention and future plans shouldn''t become her responsibility alone.'
where week_number = 50;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / Family',
  for_your_care_team_lede = 'Practise the handover',
  for_your_care_team_detail = 'if work is approaching, let someone else manage a full baby routine without her supervising every step.',
  for_your_care_team = 'Partner / Family — Practise the handover: if work is approaching, let someone else manage a full baby routine without her supervising every step.'
where week_number = 51;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / support person',
  for_your_care_team_lede = 'Make follow-up useful',
  for_your_care_team_detail = 'help her list anything still unresolved so "I''m fine" doesn''t accidentally end the conversation.',
  for_your_care_team = 'Partner / support person — Make follow-up useful: help her list anything still unresolved so "I''m fine" doesn''t accidentally end the conversation.'
where week_number = 52;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / someone close',
  for_your_care_team_lede = 'Check the tiredness, not just the baby''s sleep',
  for_your_care_team_detail = 'ask whether she feels ordinary-tired or genuinely unlike herself.',
  for_your_care_team = 'Partner / someone close — Check the tiredness, not just the baby''s sleep: ask whether she feels ordinary-tired or genuinely unlike herself.'
where week_number = 53;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / Family',
  for_your_care_team_lede = 'Protect her movement time',
  for_your_care_team_detail = 'give her a short, interruption-free window to rebuild strength at her own pace.',
  for_your_care_team = 'Partner / Family — Protect her movement time: give her a short, interruption-free window to rebuild strength at her own pace.'
where week_number = 54;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / support person',
  for_your_care_team_lede = 'Believe the feedback',
  for_your_care_team_detail = 'if an activity causes pain, leaking or heaviness, support slowing down instead of pushing through.',
  for_your_care_team = 'Partner / support person — Believe the feedback: if an activity causes pain, leaking or heaviness, support slowing down instead of pushing through.'
where week_number = 55;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / someone close',
  for_your_care_team_lede = 'Ask beyond "tired?"',
  for_your_care_team_detail = 'If exhaustion feels relentless, ask about mood, anxiety and how she''s actually coping.',
  for_your_care_team = 'Partner / someone close — Ask beyond "tired?": If exhaustion feels relentless, ask about mood, anxiety and how she''s actually coping.'
where week_number = 56;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / Family',
  for_your_care_team_lede = 'Take one recurring job completely',
  for_your_care_team_detail = 'partial help still leaves her managing it; full ownership removes mental load.',
  for_your_care_team = 'Partner / Family — Take one recurring job completely: partial help still leaves her managing it; full ownership removes mental load.'
where week_number = 57;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / someone close',
  for_your_care_team_lede = 'Notice persistent changes',
  for_your_care_team_detail = 'unusual fatigue, palpitations, temperature changes or mood shifts are worth mentioning to her care team.',
  for_your_care_team = 'Partner / someone close — Notice persistent changes: unusual fatigue, palpitations, temperature changes or mood shifts are worth mentioning to her care team.'
where week_number = 58;

update care_chart_week_content set
  for_your_care_team_who = 'Care team',
  for_your_care_team_lede = 'Describe the pattern, not just "I''m tired"',
  for_your_care_team_detail = 'timing and accompanying symptoms can help your clinician decide what needs checking.',
  for_your_care_team = 'Care team — Describe the pattern, not just "I''m tired": timing and accompanying symptoms can help your clinician decide what needs checking.'
where week_number = 59;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / support person',
  for_your_care_team_lede = 'Revisit what never got resolved',
  for_your_care_team_detail = 'help her name one postpartum issue she''s simply learned to live around.',
  for_your_care_team = 'Partner / support person — Revisit what never got resolved: help her name one postpartum issue she''s simply learned to live around.'
where week_number = 60;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / Family',
  for_your_care_team_lede = 'Watch the repetitive strain',
  for_your_care_team_detail = 'if carrying, feeding or lifting hurts, change the setup or share more of the physical load.',
  for_your_care_team = 'Partner / Family — Watch the repetitive strain: if carrying, feeding or lifting hurts, change the setup or share more of the physical load.'
where week_number = 61;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / support person',
  for_your_care_team_lede = 'Support the feeding decision',
  for_your_care_team_detail = 'whether she continues, combines or weans, help make the choice workable rather than ideological.',
  for_your_care_team = 'Partner / support person — Support the feeding decision: whether she continues, combines or weans, help make the choice workable rather than ideological.'
where week_number = 62;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / Family',
  for_your_care_team_lede = 'Fix one unsustainable routine',
  for_your_care_team_detail = 'choose the part of the day that consistently breaks her and redesign it together.',
  for_your_care_team = 'Partner / Family — Fix one unsustainable routine: choose the part of the day that consistently breaks her and redesign it together.'
where week_number = 63;

update care_chart_week_content set
  for_your_care_team_who = 'Friend / Family',
  for_your_care_team_lede = 'Give her grown-up company',
  for_your_care_team_detail = 'make one plan where conversation isn''t entirely about feeding, sleep or the baby.',
  for_your_care_team = 'Friend / Family — Give her grown-up company: make one plan where conversation isn''t entirely about feeding, sleep or the baby.'
where week_number = 64;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / support person',
  for_your_care_team_lede = 'Ask what still feels unfinished',
  for_your_care_team_detail = 'six months approaching doesn''t mean every recovery issue should simply be accepted.',
  for_your_care_team = 'Partner / support person — Ask what still feels unfinished: six months approaching doesn''t mean every recovery issue should simply be accepted.'
where week_number = 65;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / Family',
  for_your_care_team_lede = 'Update the support plan',
  for_your_care_team_detail = 'what she needed with a newborn may not be what she needs now—ask again.',
  for_your_care_team = 'Partner / Family — Update the support plan: what she needed with a newborn may not be what she needs now—ask again.'
where week_number = 66;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / support person',
  for_your_care_team_lede = 'Keep care on the calendar',
  for_your_care_team_detail = 'don''t let her appointments disappear just because the baby''s calendar is fuller now.',
  for_your_care_team = 'Partner / support person — Keep care on the calendar: don''t let her appointments disappear just because the baby''s calendar is fuller now.'
where week_number = 67;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / Family',
  for_your_care_team_lede = 'Make progression possible',
  for_your_care_team_detail = 'protect one regular block each week for movement, rehabilitation or something physical she enjoys.',
  for_your_care_team = 'Partner / Family — Make progression possible: protect one regular block each week for movement, rehabilitation or something physical she enjoys.'
where week_number = 68;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / support person',
  for_your_care_team_lede = 'Trade one default-parent job',
  for_your_care_team_detail = 'choose something she automatically handles and make it yours this week.',
  for_your_care_team = 'Partner / support person — Trade one default-parent job: choose something she automatically handles and make it yours this week.'
where week_number = 69;

update care_chart_week_content set
  for_your_care_team_who = 'Partner',
  for_your_care_team_lede = 'Talk before resentment does',
  for_your_care_team_detail = 'name one part of the current workload each of you finds hardest and rebalance it.',
  for_your_care_team = 'Partner — Talk before resentment does: name one part of the current workload each of you finds hardest and rebalance it.'
where week_number = 70;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / someone close',
  for_your_care_team_lede = 'Ask about her mind, not just her energy',
  for_your_care_team_detail = 'persistent anxiety, low mood or feeling unlike herself deserves attention.',
  for_your_care_team = 'Partner / someone close — Ask about her mind, not just her energy: persistent anxiety, low mood or feeling unlike herself deserves attention.'
where week_number = 71;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / Family',
  for_your_care_team_lede = 'Make feeding easier',
  for_your_care_team_detail = 'whatever feeding looks like now, take over the washing, prep, shopping or cleanup around it.',
  for_your_care_team = 'Partner / Family — Make feeding easier: whatever feeding looks like now, take over the washing, prep, shopping or cleanup around it.'
where week_number = 72;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / support person',
  for_your_care_team_lede = 'Protect one uninterrupted sleep opportunity',
  for_your_care_team_detail = 'share the routine so she isn''t automatically on call every time.',
  for_your_care_team = 'Partner / support person — Protect one uninterrupted sleep opportunity: share the routine so she isn''t automatically on call every time.'
where week_number = 73;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / Family',
  for_your_care_team_lede = 'Give her progression room',
  for_your_care_team_detail = 'if she wants to exercise, don''t make childcare another workout she must arrange first.',
  for_your_care_team = 'Partner / Family — Give her progression room: if she wants to exercise, don''t make childcare another workout she must arrange first.'
where week_number = 74;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / someone close',
  for_your_care_team_lede = 'Don''t join the body commentary',
  for_your_care_team_detail = 'protect her from jokes, comparisons or "getting your body back" conversations.',
  for_your_care_team = 'Partner / someone close — Don''t join the body commentary: protect her from jokes, comparisons or "getting your body back" conversations.'
where week_number = 75;

update care_chart_week_content set
  for_your_care_team_who = 'Friend',
  for_your_care_team_lede = 'Invite her somewhere easy',
  for_your_care_team_detail = 'make the plan simple enough that getting out doesn''t require a military operation.',
  for_your_care_team = 'Friend — Invite her somewhere easy: make the plan simple enough that getting out doesn''t require a military operation.'
where week_number = 76;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / Family',
  for_your_care_team_lede = 'Let her leave the house alone',
  for_your_care_team_detail = 'give her one small outing with no baby logistics attached.',
  for_your_care_team = 'Partner / Family — Let her leave the house alone: give her one small outing with no baby logistics attached.'
where week_number = 77;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / support person',
  for_your_care_team_lede = 'Notice what longer days expose',
  for_your_care_team_detail = 'if pain or exhaustion appears only after more activity, help her take it seriously.',
  for_your_care_team = 'Partner / support person — Notice what longer days expose: if pain or exhaustion appears only after more activity, help her take it seriously.'
where week_number = 78;

update care_chart_week_content set
  for_your_care_team_who = 'Partner',
  for_your_care_team_lede = 'Mark this milestone too',
  for_your_care_team_detail = 'you''ve now spent as long recovering as you did pregnant — say so out loud, and split the invisible load that''s kept building the whole way.',
  for_your_care_team = 'Partner — Mark this milestone too: you''ve now spent as long recovering as you did pregnant — say so out loud, and split the invisible load that''s kept building the whole way.'
where week_number = 79;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / Family',
  for_your_care_team_lede = 'Give her fifteen minutes uninterrupted',
  for_your_care_team_detail = 'skincare, a bath or simply quiet—protect it so it isn''t rushed.',
  for_your_care_team = 'Partner / Family — Give her fifteen minutes uninterrupted: skincare, a bath or simply quiet—protect it so it isn''t rushed.'
where week_number = 80;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / Family',
  for_your_care_team_lede = 'Own tomorrow morning',
  for_your_care_team_detail = 'let her wake without immediately becoming the person responsible for everyone.',
  for_your_care_team = 'Partner / Family — Own tomorrow morning: let her wake without immediately becoming the person responsible for everyone.'
where week_number = 81;

update care_chart_week_content set
  for_your_care_team_who = 'Friend / someone close',
  for_your_care_team_lede = 'Ask about something that''s hers',
  for_your_care_team_detail = 'a book, work, clothes, music, gossip—anything that isn''t a baby-status update.',
  for_your_care_team = 'Friend / someone close — Ask about something that''s hers: a book, work, clothes, music, gossip—anything that isn''t a baby-status update.'
where week_number = 82;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / Family',
  for_your_care_team_lede = 'Take the baby out',
  for_your_care_team_detail = 'even thirty quiet minutes at home can feel different when she''s truly off duty.',
  for_your_care_team = 'Partner / Family — Take the baby out: even thirty quiet minutes at home can feel different when she''s truly off duty.'
where week_number = 83;

update care_chart_week_content set
  for_your_care_team_who = 'Partner',
  for_your_care_team_lede = 'Plan one low-effort date',
  for_your_care_team_detail = 'home counts. The point is being together without turning it into another project for her.',
  for_your_care_team = 'Partner — Plan one low-effort date: home counts. The point is being together without turning it into another project for her.'
where week_number = 84;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / Family',
  for_your_care_team_lede = 'Support the feeding transition',
  for_your_care_team_detail = 'take over one practical part so changing how the baby feeds doesn''t become another solo job.',
  for_your_care_team = 'Partner / Family — Support the feeding transition: take over one practical part so changing how the baby feeds doesn''t become another solo job.'
where week_number = 85;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / someone close',
  for_your_care_team_lede = 'Check in properly',
  for_your_care_team_detail = '"Are you enjoying anything lately?" can reveal more than "Are you okay?"',
  for_your_care_team = 'Partner / someone close — Check in properly: "Are you enjoying anything lately?" can reveal more than "Are you okay?"'
where week_number = 86;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / Family',
  for_your_care_team_lede = 'Give her a no-purpose hour',
  for_your_care_team_detail = 'not exercise, errands or catching up—time she doesn''t have to make productive.',
  for_your_care_team = 'Partner / Family — Give her a no-purpose hour: not exercise, errands or catching up—time she doesn''t have to make productive.'
where week_number = 87;

update care_chart_week_content set
  for_your_care_team_who = 'Friend',
  for_your_care_team_lede = 'Bring back an old version of her',
  for_your_care_team_detail = 'suggest something you used to enjoy together before babies became the default topic.',
  for_your_care_team = 'Friend — Bring back an old version of her: suggest something you used to enjoy together before babies became the default topic.'
where week_number = 88;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / support person',
  for_your_care_team_lede = 'Ask what she''s carrying mentally',
  for_your_care_team_detail = 'let her list it without immediately explaining why each thing isn''t a big deal.',
  for_your_care_team = 'Partner / support person — Ask what she''s carrying mentally: let her list it without immediately explaining why each thing isn''t a big deal.'
where week_number = 89;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / Family',
  for_your_care_team_lede = 'Take one weekend routine',
  for_your_care_team_detail = 'breakfast, bath, nap or bedtime—own it from beginning to end.',
  for_your_care_team = 'Partner / Family — Take one weekend routine: breakfast, bath, nap or bedtime—own it from beginning to end.'
where week_number = 90;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / support person',
  for_your_care_team_lede = 'Check the relationship workload',
  for_your_care_team_detail = 'planning affection, dates and conversations shouldn''t belong to one person either.',
  for_your_care_team = 'Partner / support person — Check the relationship workload: planning affection, dates and conversations shouldn''t belong to one person either.'
where week_number = 91;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / Family',
  for_your_care_team_lede = 'Mark the year for her too',
  for_your_care_team_detail = 'celebrate what she has come through, not only the baby''s milestone.',
  for_your_care_team = 'Partner / Family — Mark the year for her too: celebrate what she has come through, not only the baby''s milestone.'
where week_number = 92;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / support person',
  for_your_care_team_lede = 'Put her health back on the list',
  for_your_care_team_detail = 'help her schedule anything she''s been postponing for herself.',
  for_your_care_team = 'Partner / support person — Put her health back on the list: help her schedule anything she''s been postponing for herself.'
where week_number = 93;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / Family',
  for_your_care_team_lede = 'Share the lifting',
  for_your_care_team_detail = 'toddler care gets physically heavier; alternate the carrying, bathing and floor-level jobs.',
  for_your_care_team = 'Partner / Family — Share the lifting: toddler care gets physically heavier; alternate the carrying, bathing and floor-level jobs.'
where week_number = 94;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / support person',
  for_your_care_team_lede = 'Protect one recovery night',
  for_your_care_team_detail = 'if sleep is rough, agree in advance who responds when instead of deciding half-awake.',
  for_your_care_team = 'Partner / support person — Protect one recovery night: if sleep is rough, agree in advance who responds when instead of deciding half-awake.'
where week_number = 95;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / Family',
  for_your_care_team_lede = 'Own the leaving-the-house checklist',
  for_your_care_team_detail = 'snacks, nappies, clothes and water don''t automatically belong to Mum.',
  for_your_care_team = 'Partner / Family — Own the leaving-the-house checklist: snacks, nappies, clothes and water don''t automatically belong to Mum.'
where week_number = 96;

update care_chart_week_content set
  for_your_care_team_who = 'Friend',
  for_your_care_team_lede = 'Make the invitation specific',
  for_your_care_team_detail = '"Coffee Thursday at 11?" is easier to accept than "We should meet sometime."',
  for_your_care_team = 'Friend — Make the invitation specific: "Coffee Thursday at 11?" is easier to accept than "We should meet sometime."'
where week_number = 97;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / Family',
  for_your_care_team_lede = 'Let her finish something',
  for_your_care_team_detail = 'give her thirty uninterrupted minutes for whatever she keeps abandoning halfway.',
  for_your_care_team = 'Partner / Family — Let her finish something: give her thirty uninterrupted minutes for whatever she keeps abandoning halfway.'
where week_number = 98;

update care_chart_week_content set
  for_your_care_team_who = 'Partner',
  for_your_care_team_lede = 'Take the goodbye',
  for_your_care_team_detail = 'if separation anxiety is intense right now, be the one who does drop-offs, handovers or leaving-the-room this week — so she isn''t the only one who can peel away.',
  for_your_care_team = 'Partner — Take the goodbye: if separation anxiety is intense right now, be the one who does drop-offs, handovers or leaving-the-room this week — so she isn''t the only one who can peel away.'
where week_number = 99;

update care_chart_week_content set
  for_your_care_team_who = 'Family / Caregiver',
  for_your_care_team_lede = 'Follow the routine without making her supervise',
  for_your_care_team_detail = 'ask once, write it down and let her step away.',
  for_your_care_team = 'Family / Caregiver — Follow the routine without making her supervise: ask once, write it down and let her step away.'
where week_number = 100;

update care_chart_week_content set
  for_your_care_team_who = 'Partner',
  for_your_care_team_lede = 'Talk about the two of you',
  for_your_care_team_detail = 'if strain is building, address it before every conversation becomes logistics.',
  for_your_care_team = 'Partner — Talk about the two of you: if strain is building, address it before every conversation becomes logistics.'
where week_number = 101;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / Family',
  for_your_care_team_lede = 'Give her a slow start',
  for_your_care_team_detail = 'take the first toddler shift one morning and let her begin the day in her own time.',
  for_your_care_team = 'Partner / Family — Give her a slow start: take the first toddler shift one morning and let her begin the day in her own time.'
where week_number = 102;

update care_chart_week_content set
  for_your_care_team_who = 'Friend / Family',
  for_your_care_team_lede = 'Offer practical help, not "anything you need"',
  for_your_care_team_detail = 'suggest the meal, pickup, babysitting hour or errand you can actually do.',
  for_your_care_team = 'Friend / Family — Offer practical help, not "anything you need": suggest the meal, pickup, babysitting hour or errand you can actually do.'
where week_number = 103;

update care_chart_week_content set
  for_your_care_team_who = 'Partner',
  for_your_care_team_lede = 'Talk about another baby without assumptions',
  for_your_care_team_detail = 'wanting one, not wanting one or not knowing yet are all conversations worth having.',
  for_your_care_team = 'Partner — Talk about another baby without assumptions: wanting one, not wanting one or not knowing yet are all conversations worth having.'
where week_number = 104;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / Family',
  for_your_care_team_lede = 'Protect one thing she looks forward to',
  for_your_care_team_detail = 'make the childcare or household arrangement around it before something "more important" replaces it.',
  for_your_care_team = 'Partner / Family — Protect one thing she looks forward to: make the childcare or household arrangement around it before something "more important" replaces it.'
where week_number = 105;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / support person',
  for_your_care_team_lede = 'Ask what she misses',
  for_your_care_team_detail = 'don''t fix it immediately—first find out what part of her old life she actually wants back.',
  for_your_care_team = 'Partner / support person — Ask what she misses: don''t fix it immediately—first find out what part of her old life she actually wants back.'
where week_number = 106;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / Family',
  for_your_care_team_lede = 'Give her one responsibility-free meal',
  for_your_care_team_detail = 'someone else chooses it, gets it and clears it away.',
  for_your_care_team = 'Partner / Family — Give her one responsibility-free meal: someone else chooses it, gets it and clears it away.'
where week_number = 107;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / support person',
  for_your_care_team_lede = 'Make one plan for her, not the child',
  for_your_care_team_detail = 'a haircut, coffee, class, walk or afternoon that exists because she''d enjoy it.',
  for_your_care_team = 'Partner / support person — Make one plan for her, not the child: a haircut, coffee, class, walk or afternoon that exists because she''d enjoy it.'
where week_number = 108;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / support person',
  for_your_care_team_lede = 'Take persistent sleep trouble seriously',
  for_your_care_team_detail = 'if she''s struggling even when she has the chance to sleep, encourage her to seek support.',
  for_your_care_team = 'Partner / support person — Take persistent sleep trouble seriously: if she''s struggling even when she has the chance to sleep, encourage her to seek support.'
where week_number = 109;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / Family',
  for_your_care_team_lede = 'Back her decision',
  for_your_care_team_detail = 'if she wants to spend on something for herself—a class, treatment or subscription—don''t make her justify whether it''s "necessary."',
  for_your_care_team = 'Partner / Family — Back her decision: if she wants to spend on something for herself—a class, treatment or subscription—don''t make her justify whether it''s "necessary."'
where week_number = 110;

update care_chart_week_content set
  for_your_care_team_who = 'Friend',
  for_your_care_team_lede = 'Send the first message',
  for_your_care_team_detail = 'friendships often fade through exhaustion, not lack of love. Make reconnecting easy.',
  for_your_care_team = 'Friend — Send the first message: friendships often fade through exhaustion, not lack of love. Make reconnecting easy.'
where week_number = 111;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / Family',
  for_your_care_team_lede = 'Give her the empty house if you can',
  for_your_care_team_detail = 'take the child out and leave her home without a list of jobs.',
  for_your_care_team = 'Partner / Family — Give her the empty house if you can: take the child out and leave her home without a list of jobs.'
where week_number = 112;

update care_chart_week_content set
  for_your_care_team_who = 'Partner',
  for_your_care_team_lede = 'Ask what feels unequal',
  for_your_care_team_detail = 'choose one answer and actually change the arrangement rather than only discussing it.',
  for_your_care_team = 'Partner — Ask what feels unequal: choose one answer and actually change the arrangement rather than only discussing it.'
where week_number = 113;

update care_chart_week_content set
  for_your_care_team_who = 'Family / Caregiver',
  for_your_care_team_lede = 'Respect her boundaries',
  for_your_care_team_detail = 'consistency is more helpful than making Mum defend the same parenting decision repeatedly.',
  for_your_care_team = 'Family / Caregiver — Respect her boundaries: consistency is more helpful than making Mum defend the same parenting decision repeatedly.'
where week_number = 114;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / someone close',
  for_your_care_team_lede = 'Notice if she''s disappearing again',
  for_your_care_team_detail = 'persistent flatness, anxiety or withdrawal deserves a real conversation.',
  for_your_care_team = 'Partner / someone close — Notice if she''s disappearing again: persistent flatness, anxiety or withdrawal deserves a real conversation.'
where week_number = 115;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / Family',
  for_your_care_team_lede = 'Own dinner for a week',
  for_your_care_team_detail = 'pick a small rotation of easy meals everyone eats, and take deciding-and-making it off her plate entirely.',
  for_your_care_team = 'Partner / Family — Own dinner for a week: pick a small rotation of easy meals everyone eats, and take deciding-and-making it off her plate entirely.'
where week_number = 116;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / support person',
  for_your_care_team_lede = 'Take over one appointment',
  for_your_care_team_detail = 'if appropriate, manage the booking, travel and details so she isn''t coordinating everything.',
  for_your_care_team = 'Partner / support person — Take over one appointment: if appropriate, manage the booking, travel and details so she isn''t coordinating everything.'
where week_number = 117;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / Family',
  for_your_care_team_lede = 'Ask what support should change now',
  for_your_care_team_detail = 'toddler motherhood needs a different village than newborn motherhood did.',
  for_your_care_team = 'Partner / Family — Ask what support should change now: toddler motherhood needs a different village than newborn motherhood did.'
where week_number = 118;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / Family',
  for_your_care_team_lede = 'Don''t normalise endless exhaustion',
  for_your_care_team_detail = 'create a real rest window first; if fatigue still feels disproportionate, support her in getting it checked.',
  for_your_care_team = 'Partner / Family — Don''t normalise endless exhaustion: create a real rest window first; if fatigue still feels disproportionate, support her in getting it checked.'
where week_number = 119;

update care_chart_week_content set
  for_your_care_team_who = 'Partner',
  for_your_care_team_lede = 'Choose one evening to be off-duty',
  for_your_care_team_detail = 'one parent takes the toddler routine while the other genuinely clocks out.',
  for_your_care_team = 'Partner — Choose one evening to be off-duty: one parent takes the toddler routine while the other genuinely clocks out.'
where week_number = 120;

update care_chart_week_content set
  for_your_care_team_who = 'Friend / Family',
  for_your_care_team_lede = 'Give her a plan worth dressing for',
  for_your_care_team_detail = 'coffee, lunch, a walk or somewhere she enjoys—not another errand.',
  for_your_care_team = 'Friend / Family — Give her a plan worth dressing for: coffee, lunch, a walk or somewhere she enjoys—not another errand.'
where week_number = 121;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / support person',
  for_your_care_team_lede = 'Support weaning without pressure',
  for_your_care_team_detail = 'whatever pace she chooses, help with the practical and emotional transition.',
  for_your_care_team = 'Partner / support person — Support weaning without pressure: whatever pace she chooses, help with the practical and emotional transition.'
where week_number = 122;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / Family',
  for_your_care_team_lede = 'Take over one messy job',
  for_your_care_team_detail = 'bath, mealtime cleanup or the post-playroom disaster—completely.',
  for_your_care_team = 'Partner / Family — Take over one messy job: bath, mealtime cleanup or the post-playroom disaster—completely.'
where week_number = 123;

update care_chart_week_content set
  for_your_care_team_who = 'Partner',
  for_your_care_team_lede = 'Protect couple time from admin',
  for_your_care_team_detail = 'spend twenty minutes together without discussing groceries, schedules or toddler logistics.',
  for_your_care_team = 'Partner — Protect couple time from admin: spend twenty minutes together without discussing groceries, schedules or toddler logistics.'
where week_number = 124;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / someone close',
  for_your_care_team_lede = 'Keep body comments out of care',
  for_your_care_team_detail = 'if she''s struggling with body image, listen without offering diets, comparisons or fixes.',
  for_your_care_team = 'Partner / someone close — Keep body comments out of care: if she''s struggling with body image, listen without offering diets, comparisons or fixes.'
where week_number = 125;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / Family',
  for_your_care_team_lede = 'Give recovery a chance',
  for_your_care_team_detail = 'when illness keeps cycling through the house, share sick-day duties rather than defaulting them to her.',
  for_your_care_team = 'Partner / Family — Give recovery a chance: when illness keeps cycling through the house, share sick-day duties rather than defaulting them to her.'
where week_number = 126;

update care_chart_week_content set
  for_your_care_team_who = 'Friend',
  for_your_care_team_lede = 'Ask her out without the child',
  for_your_care_team_detail = 'even if she says no this time, remind her she''s still invited as herself.',
  for_your_care_team = 'Friend — Ask her out without the child: even if she says no this time, remind her she''s still invited as herself.'
where week_number = 127;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / someone close',
  for_your_care_team_lede = 'Don''t wait for a crisis',
  for_your_care_team_detail = 'weeks of low mood, anxiety or feeling flat are enough reason to help her seek support.',
  for_your_care_team = 'Partner / someone close — Don''t wait for a crisis: weeks of low mood, anxiety or feeling flat are enough reason to help her seek support.'
where week_number = 128;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / Family',
  for_your_care_team_lede = 'Own one planning category',
  for_your_care_team_detail = 'birthdays, groceries, childcare or household supplies—pick one and stop asking her what needs doing.',
  for_your_care_team = 'Partner / Family — Own one planning category: birthdays, groceries, childcare or household supplies—pick one and stop asking her what needs doing.'
where week_number = 129;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / support person',
  for_your_care_team_lede = 'Challenge "this is just motherhood"',
  for_your_care_team_detail = 'if something physical has felt wrong for months, encourage her to bring it up.',
  for_your_care_team = 'Partner / support person — Challenge "this is just motherhood": if something physical has felt wrong for months, encourage her to bring it up.'
where week_number = 130;

update care_chart_week_content set
  for_your_care_team_who = 'Partner',
  for_your_care_team_lede = 'Own one cost conversation',
  for_your_care_team_detail = 'take the lead on one toddler expense—daycare, activities or monthly spending—so the mental load isn''t hers alone.',
  for_your_care_team = 'Partner — Own one cost conversation: take the lead on one toddler expense—daycare, activities or monthly spending—so the mental load isn''t hers alone.'
where week_number = 131;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / Family',
  for_your_care_team_lede = 'Give her one unbooked weekend pocket',
  for_your_care_team_detail = 'don''t fill every free hour with family obligations.',
  for_your_care_team = 'Partner / Family — Give her one unbooked weekend pocket: don''t fill every free hour with family obligations.'
where week_number = 132;

update care_chart_week_content set
  for_your_care_team_who = 'Friend / someone close',
  for_your_care_team_lede = 'Ask what she''s excited about',
  for_your_care_team_detail = 'not what she needs to finish—what she''s actually looking forward to.',
  for_your_care_team = 'Friend / someone close — Ask what she''s excited about: not what she needs to finish—what she''s actually looking forward to.'
where week_number = 133;

update care_chart_week_content set
  for_your_care_team_who = 'Partner',
  for_your_care_team_lede = 'Make family planning shared',
  for_your_care_team_detail = 'if another pregnancy is being considered—or avoided—talk about timing and contraception together.',
  for_your_care_team = 'Partner — Make family planning shared: if another pregnancy is being considered—or avoided—talk about timing and contraception together.'
where week_number = 134;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / Family',
  for_your_care_team_lede = 'Take the toddler somewhere without her',
  for_your_care_team_detail = 'let her decide afterwards whether she rests, works, goes out or does nothing.',
  for_your_care_team = 'Partner / Family — Take the toddler somewhere without her: let her decide afterwards whether she rests, works, goes out or does nothing.'
where week_number = 135;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / support person',
  for_your_care_team_lede = 'Make room for her next thing',
  for_your_care_team_detail = 'if she wants to learn, work or create, protect one small recurring block of time for it.',
  for_your_care_team = 'Partner / support person — Make room for her next thing: if she wants to learn, work or create, protect one small recurring block of time for it.'
where week_number = 136;

update care_chart_week_content set
  for_your_care_team_who = 'Family / Caregiver',
  for_your_care_team_lede = 'Stop checking every decision with Mum',
  for_your_care_team_detail = 'if the plan is already clear, use your judgement and let her mentally clock out.',
  for_your_care_team = 'Family / Caregiver — Stop checking every decision with Mum: if the plan is already clear, use your judgement and let her mentally clock out.'
where week_number = 137;

update care_chart_week_content set
  for_your_care_team_who = 'Partner',
  for_your_care_team_lede = 'Ask what she wants more of',
  for_your_care_team_detail = 'sleep, work, friends, movement, solitude, intimacy, fun—then help make one answer possible.',
  for_your_care_team = 'Partner — Ask what she wants more of: sleep, work, friends, movement, solitude, intimacy, fun—then help make one answer possible.'
where week_number = 138;

update care_chart_week_content set
  for_your_care_team_who = 'Friend',
  for_your_care_team_lede = 'Remember her interests',
  for_your_care_team_detail = 'send the article, song, event or silly thing that made you think of her, not her child.',
  for_your_care_team = 'Friend — Remember her interests: send the article, song, event or silly thing that made you think of her, not her child.'
where week_number = 139;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / someone close',
  for_your_care_team_lede = 'Take persistent exhaustion seriously',
  for_your_care_team_detail = 'help her seek support if low mood, anxiety or fatigue has become her normal.',
  for_your_care_team = 'Partner / someone close — Take persistent exhaustion seriously: help her seek support if low mood, anxiety or fatigue has become her normal.'
where week_number = 140;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / Family',
  for_your_care_team_lede = 'Do the safety walk-through together',
  for_your_care_team_detail = 'as she climbs and reaches further now, go room to room and fix what''s changed — don''t leave her to spot every new hazard alone.',
  for_your_care_team = 'Partner / Family — Do the safety walk-through together: as she climbs and reaches further now, go room to room and fix what''s changed — don''t leave her to spot every new hazard alone.'
where week_number = 141;

update care_chart_week_content set
  for_your_care_team_who = 'Partner',
  for_your_care_team_lede = 'Check the division again',
  for_your_care_team_detail = 'what was fair six months ago may not be fair now—rebalance before resentment builds.',
  for_your_care_team = 'Partner — Check the division again: what was fair six months ago may not be fair now—rebalance before resentment builds.'
where week_number = 142;

update care_chart_week_content set
  for_your_care_team_who = 'Family / Caregiver',
  for_your_care_team_lede = 'Back her in front of the toddler',
  for_your_care_team_detail = 'discuss disagreements privately instead of undermining her boundary in the moment.',
  for_your_care_team = 'Family / Caregiver — Back her in front of the toddler: discuss disagreements privately instead of undermining her boundary in the moment.'
where week_number = 143;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / support person',
  for_your_care_team_lede = 'Ask what she needs now',
  for_your_care_team_detail = 'don''t keep offering newborn-era help to a woman living a completely different stage.',
  for_your_care_team = 'Partner / support person — Ask what she needs now: don''t keep offering newborn-era help to a woman living a completely different stage.'
where week_number = 144;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / Family',
  for_your_care_team_lede = 'Protect one thing that''s hers',
  for_your_care_team_detail = 'a class, work block, walk or hobby deserves a regular place in the family calendar too.',
  for_your_care_team = 'Partner / Family — Protect one thing that''s hers: a class, work block, walk or hobby deserves a regular place in the family calendar too.'
where week_number = 145;

update care_chart_week_content set
  for_your_care_team_who = 'Friend',
  for_your_care_team_lede = 'Plan something small and real',
  for_your_care_team_detail = 'choose the day, time and place so friendship doesn''t live forever in "soon."',
  for_your_care_team = 'Friend — Plan something small and real: choose the day, time and place so friendship doesn''t live forever in "soon."'
where week_number = 146;

update care_chart_week_content set
  for_your_care_team_who = 'Family / Caregiver',
  for_your_care_team_lede = 'Drop the comparisons',
  for_your_care_team_detail = 'if potty training is underway, stop comparing pace with other children—the pressure lands on her too.',
  for_your_care_team = 'Family / Caregiver — Drop the comparisons: if potty training is underway, stop comparing pace with other children—the pressure lands on her too.'
where week_number = 147;

update care_chart_week_content set
  for_your_care_team_who = 'Partner',
  for_your_care_team_lede = 'Own a difficult routine',
  for_your_care_team_detail = 'choose the tantrum-heavy part of the day and become the default parent for it sometimes.',
  for_your_care_team = 'Partner — Own a difficult routine: choose the tantrum-heavy part of the day and become the default parent for it sometimes.'
where week_number = 148;

update care_chart_week_content set
  for_your_care_team_who = 'Partner',
  for_your_care_team_lede = 'Make the preschool decision together',
  for_your_care_team_detail = 'whatever you land on — preschool, daycare, staying home — treat it as a joint call, not one she has to research and decide alone.',
  for_your_care_team = 'Partner — Make the preschool decision together: whatever you land on — preschool, daycare, staying home — treat it as a joint call, not one she has to research and decide alone.'
where week_number = 149;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / support person',
  for_your_care_team_lede = 'Give her a decision-free evening',
  for_your_care_team_detail = 'handle dinner, toddler routine and cleanup without asking her to manage from the sofa.',
  for_your_care_team = 'Partner / support person — Give her a decision-free evening: handle dinner, toddler routine and cleanup without asking her to manage from the sofa.'
where week_number = 150;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / someone close',
  for_your_care_team_lede = 'Don''t let "I''ve learned to live with it" end the story',
  for_your_care_team_detail = 'encourage her to seek help for persistent pain or physical symptoms.',
  for_your_care_team = 'Partner / someone close — Don''t let "I''ve learned to live with it" end the story: encourage her to seek help for persistent pain or physical symptoms.'
where week_number = 151;

update care_chart_week_content set
  for_your_care_team_who = 'Partner',
  for_your_care_team_lede = 'Share the money thinking',
  for_your_care_team_detail = 'choose one family expense or savings decision and work through it together instead of leaving her to research it alone.',
  for_your_care_team = 'Partner — Share the money thinking: choose one family expense or savings decision and work through it together instead of leaving her to research it alone.'
where week_number = 152;

update care_chart_week_content set
  for_your_care_team_who = 'Partner',
  for_your_care_team_lede = 'Talk honestly about another pregnancy',
  for_your_care_team_detail = 'include what another baby would mean for her body, workload, work and support—not only timing.',
  for_your_care_team = 'Partner — Talk honestly about another pregnancy: include what another baby would mean for her body, workload, work and support—not only timing.'
where week_number = 153;

update care_chart_week_content set
  for_your_care_team_who = 'Friend / Family',
  for_your_care_team_lede = 'Offer the useful favour',
  for_your_care_team_detail = 'an hour of childcare can be more restorative than another "you should take time for yourself."',
  for_your_care_team = 'Friend / Family — Offer the useful favour: an hour of childcare can be more restorative than another "you should take time for yourself."'
where week_number = 154;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / Family',
  for_your_care_team_lede = 'Let her say no',
  for_your_care_team_detail = 'back her when she declines a family event, extra commitment or plan because she''s simply had enough.',
  for_your_care_team = 'Partner / Family — Let her say no: back her when she declines a family event, extra commitment or plan because she''s simply had enough.'
where week_number = 155;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / someone close',
  for_your_care_team_lede = 'Notice exhaustion that doesn''t lift',
  for_your_care_team_detail = 'if adequate rest doesn''t help, support her in bringing it up at her next health check.',
  for_your_care_team = 'Partner / someone close — Notice exhaustion that doesn''t lift: if adequate rest doesn''t help, support her in bringing it up at her next health check.'
where week_number = 156;

update care_chart_week_content set
  for_your_care_team_who = 'Partner',
  for_your_care_team_lede = 'Ask what feels repetitive',
  for_your_care_team_detail = 'choose one daily task she is sick of doing and swap it.',
  for_your_care_team = 'Partner — Ask what feels repetitive: choose one daily task she is sick of doing and swap it.'
where week_number = 157;

update care_chart_week_content set
  for_your_care_team_who = 'Family / Caregiver',
  for_your_care_team_lede = 'Make handovers lighter',
  for_your_care_team_detail = 'share important updates without requiring Mum to coordinate every detail between adults.',
  for_your_care_team = 'Family / Caregiver — Make handovers lighter: share important updates without requiring Mum to coordinate every detail between adults.'
where week_number = 158;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / support person',
  for_your_care_team_lede = 'Take her ambition seriously',
  for_your_care_team_detail = 'if she mentions work, a business or a skill she wants to try, help her find time before questioning whether it''ll work.',
  for_your_care_team = 'Partner / support person — Take her ambition seriously: if she mentions work, a business or a skill she wants to try, help her find time before questioning whether it''ll work.'
where week_number = 159;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / someone close',
  for_your_care_team_lede = 'Ask, don''t assume',
  for_your_care_team_detail = 'if she seems persistently low, anxious or exhausted, check in and help her reach professional support if needed.',
  for_your_care_team = 'Partner / someone close — Ask, don''t assume: if she seems persistently low, anxious or exhausted, check in and help her reach professional support if needed.'
where week_number = 160;

update care_chart_week_content set
  for_your_care_team_who = 'Friend',
  for_your_care_team_lede = 'Invite the woman you knew before motherhood',
  for_your_care_team_detail = 'she may have changed, but she hasn''t stopped needing friendship that belongs to her.',
  for_your_care_team = 'Friend — Invite the woman you knew before motherhood: she may have changed, but she hasn''t stopped needing friendship that belongs to her.'
where week_number = 161;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / Family',
  for_your_care_team_lede = 'Share the sick days',
  for_your_care_team_detail = 'when the toddler brings another bug home, recovery and caregiving shouldn''t automatically become her double shift.',
  for_your_care_team = 'Partner / Family — Share the sick days: when the toddler brings another bug home, recovery and caregiving shouldn''t automatically become her double shift.'
where week_number = 162;

update care_chart_week_content set
  for_your_care_team_who = 'Partner',
  for_your_care_team_lede = 'Give her a real weekend break',
  for_your_care_team_detail = 'take responsibility for a substantial block—not twenty minutes between questions.',
  for_your_care_team = 'Partner — Give her a real weekend break: take responsibility for a substantial block—not twenty minutes between questions.'
where week_number = 163;

update care_chart_week_content set
  for_your_care_team_who = 'Family',
  for_your_care_team_lede = 'Ask before advising',
  for_your_care_team_detail = '"Do you want help or do you just need me to listen?" can change the whole conversation.',
  for_your_care_team = 'Family — Ask before advising: "Do you want help or do you just need me to listen?" can change the whole conversation.'
where week_number = 164;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / support person',
  for_your_care_team_lede = 'Put her plan on the calendar',
  for_your_care_team_detail = 'if there''s something she keeps saying she wants to do, help turn "someday" into a date.',
  for_your_care_team = 'Partner / support person — Put her plan on the calendar: if there''s something she keeps saying she wants to do, help turn "someday" into a date.'
where week_number = 165;

update care_chart_week_content set
  for_your_care_team_who = 'Partner',
  for_your_care_team_lede = 'Check the invisible work',
  for_your_care_team_detail = 'who notices supplies running out, appointments coming up and clothes becoming too small? Share that job.',
  for_your_care_team = 'Partner — Check the invisible work: who notices supplies running out, appointments coming up and clothes becoming too small? Share that job.'
where week_number = 166;

update care_chart_week_content set
  for_your_care_team_who = 'Friend / Family',
  for_your_care_team_lede = 'Celebrate something about her',
  for_your_care_team_detail = 'not her parenting—her humour, work, creativity, strength, style or whatever makes her her.',
  for_your_care_team = 'Friend / Family — Celebrate something about her: not her parenting—her humour, work, creativity, strength, style or whatever makes her her.'
where week_number = 167;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / Family',
  for_your_care_team_lede = 'Give her space without requiring a reason',
  for_your_care_team_detail = 'she doesn''t need to be exhausted enough to qualify for time alone.',
  for_your_care_team = 'Partner / Family — Give her space without requiring a reason: she doesn''t need to be exhausted enough to qualify for time alone.'
where week_number = 168;

update care_chart_week_content set
  for_your_care_team_who = 'Partner',
  for_your_care_team_lede = 'Ask what would make home easier',
  for_your_care_team_detail = 'choose one answer you can actually change this month.',
  for_your_care_team = 'Partner — Ask what would make home easier: choose one answer you can actually change this month.'
where week_number = 169;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / support person',
  for_your_care_team_lede = 'Update the village',
  for_your_care_team_detail = 'decide who she can genuinely call now for childcare, practical help, emotional support or an emergency.',
  for_your_care_team = 'Partner / support person — Update the village: decide who she can genuinely call now for childcare, practical help, emotional support or an emergency.'
where week_number = 170;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / Family',
  for_your_care_team_lede = 'Make one morning hers',
  for_your_care_team_detail = 'breakfast, dressing and toddler duty belong to someone else while she starts slowly.',
  for_your_care_team = 'Partner / Family — Make one morning hers: breakfast, dressing and toddler duty belong to someone else while she starts slowly.'
where week_number = 171;

update care_chart_week_content set
  for_your_care_team_who = 'Friend',
  for_your_care_team_lede = 'Make room for an adult conversation',
  for_your_care_team_detail = 'ask about something she thinks, wants or is building—not only what the toddler is doing.',
  for_your_care_team = 'Friend — Make room for an adult conversation: ask about something she thinks, wants or is building—not only what the toddler is doing.'
where week_number = 172;

update care_chart_week_content set
  for_your_care_team_who = 'Partner',
  for_your_care_team_lede = 'Trade the default-parent role',
  for_your_care_team_detail = 'if the child automatically calls for Mum, step in before she has to ask.',
  for_your_care_team = 'Partner — Trade the default-parent role: if the child automatically calls for Mum, step in before she has to ask.'
where week_number = 173;

update care_chart_week_content set
  for_your_care_team_who = 'Family / Caregiver',
  for_your_care_team_lede = 'Respect the house rules',
  for_your_care_team_detail = 'helping should reduce her work, not create another set of boundaries she has to negotiate.',
  for_your_care_team = 'Family / Caregiver — Respect the house rules: helping should reduce her work, not create another set of boundaries she has to negotiate.'
where week_number = 174;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / support person',
  for_your_care_team_lede = 'Ask what she''s postponing for herself',
  for_your_care_team_detail = 'choose one thing and help remove the practical obstacle.',
  for_your_care_team = 'Partner / support person — Ask what she''s postponing for herself: choose one thing and help remove the practical obstacle.'
where week_number = 175;

update care_chart_week_content set
  for_your_care_team_who = 'Partner',
  for_your_care_team_lede = 'Share the future planning',
  for_your_care_team_detail = 'household goals, savings and bigger decisions belong to both adults—not one person''s mental spreadsheet.',
  for_your_care_team = 'Partner — Share the future planning: household goals, savings and bigger decisions belong to both adults—not one person''s mental spreadsheet.'
where week_number = 176;

update care_chart_week_content set
  for_your_care_team_who = 'Friend / Family',
  for_your_care_team_lede = 'Give her somewhere to go alone',
  for_your_care_team_detail = 'offer childcare before suggesting she "get out more."',
  for_your_care_team = 'Friend / Family — Give her somewhere to go alone: offer childcare before suggesting she "get out more."'
where week_number = 177;

update care_chart_week_content set
  for_your_care_team_who = 'Partner',
  for_your_care_team_lede = 'Protect one recurring hour',
  for_your_care_team_detail = 'work, exercise, creativity, rest—whatever she chooses, treat it as a real commitment.',
  for_your_care_team = 'Partner — Protect one recurring hour: work, exercise, creativity, rest—whatever she chooses, treat it as a real commitment.'
where week_number = 178;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / someone close',
  for_your_care_team_lede = 'Listen without fixing',
  for_your_care_team_detail = 'if she says this stage is hard, don''t immediately remind her that it will pass.',
  for_your_care_team = 'Partner / someone close — Listen without fixing: if she says this stage is hard, don''t immediately remind her that it will pass.'
where week_number = 179;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / someone close',
  for_your_care_team_lede = 'Ask, and actually wait for the answer',
  for_your_care_team_detail = '"How are you, really—not just functioning, but underneath that?" Give her room to answer honestly.',
  for_your_care_team = 'Partner / someone close — Ask, and actually wait for the answer: "How are you, really—not just functioning, but underneath that?" Give her room to answer honestly.'
where week_number = 180;

update care_chart_week_content set
  for_your_care_team_who = 'Family / Friend',
  for_your_care_team_lede = 'Offer help before she''s depleted',
  for_your_care_team_detail = 'support works better when she doesn''t have to reach breaking point to deserve it.',
  for_your_care_team = 'Family / Friend — Offer help before she''s depleted: support works better when she doesn''t have to reach breaking point to deserve it.'
where week_number = 181;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / Family',
  for_your_care_team_lede = 'Share the germ-season load',
  for_your_care_team_detail = 'if illnesses keep circulating, alternate the nights, appointments and recovery days where possible.',
  for_your_care_team = 'Partner / Family — Share the germ-season load: if illnesses keep circulating, alternate the nights, appointments and recovery days where possible.'
where week_number = 182;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / Family',
  for_your_care_team_lede = 'Hold the settled rhythm together',
  for_your_care_team_detail = 'if the household''s screen and boundary routine is working, keep reinforcing it as a team so it doesn''t quietly become her job to enforce alone.',
  for_your_care_team = 'Partner / Family — Hold the settled rhythm together: if the household''s screen and boundary routine is working, keep reinforcing it as a team so it doesn''t quietly become her job to enforce alone.'
where week_number = 183;

update care_chart_week_content set
  for_your_care_team_who = 'Family / Caregiver',
  for_your_care_team_lede = 'Let her leave instructions once',
  for_your_care_team_detail = 'don''t repeatedly call Mum to solve problems another capable adult can handle.',
  for_your_care_team = 'Family / Caregiver — Let her leave instructions once: don''t repeatedly call Mum to solve problems another capable adult can handle.'
where week_number = 184;

update care_chart_week_content set
  for_your_care_team_who = 'Friend',
  for_your_care_team_lede = 'Keep inviting her',
  for_your_care_team_detail = 'a few declined plans don''t necessarily mean she no longer wants the friendship.',
  for_your_care_team = 'Friend — Keep inviting her: a few declined plans don''t necessarily mean she no longer wants the friendship.'
where week_number = 185;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / support person',
  for_your_care_team_lede = 'Ask what she wants to grow next',
  for_your_care_team_detail = 'a career, business, skill, friendship, hobby—or simply more breathing room.',
  for_your_care_team = 'Partner / support person — Ask what she wants to grow next: a career, business, skill, friendship, hobby—or simply more breathing room.'
where week_number = 186;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / Family',
  for_your_care_team_lede = 'Give her an ordinary day off',
  for_your_care_team_detail = 'rest doesn''t need a birthday, illness or special occasion.',
  for_your_care_team = 'Partner / Family — Give her an ordinary day off: rest doesn''t need a birthday, illness or special occasion.'
where week_number = 187;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / support person',
  for_your_care_team_lede = 'Share the learning',
  for_your_care_team_detail = 'when a new parenting stage arrives, don''t make Mum the only person expected to research how to handle it.',
  for_your_care_team = 'Partner / support person — Share the learning: when a new parenting stage arrives, don''t make Mum the only person expected to research how to handle it.'
where week_number = 188;

update care_chart_week_content set
  for_your_care_team_who = 'Partner',
  for_your_care_team_lede = 'Revisit the household split',
  for_your_care_team_detail = 'toddler life changes quickly; redistribute what no longer feels fair or workable.',
  for_your_care_team = 'Partner — Revisit the household split: toddler life changes quickly; redistribute what no longer feels fair or workable.'
where week_number = 189;

update care_chart_week_content set
  for_your_care_team_who = 'Family / Friend',
  for_your_care_team_lede = 'Ask what kind of help she actually wants',
  for_your_care_team_detail = 'company, childcare, food, an errand or space can all be care.',
  for_your_care_team = 'Family / Friend — Ask what kind of help she actually wants: company, childcare, food, an errand or space can all be care.'
where week_number = 190;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / support person',
  for_your_care_team_lede = 'Make her plan possible',
  for_your_care_team_detail = 'if she''s building something for herself, take one practical responsibility during the time she works on it.',
  for_your_care_team = 'Partner / support person — Make her plan possible: if she''s building something for herself, take one practical responsibility during the time she works on it.'
where week_number = 191;

update care_chart_week_content set
  for_your_care_team_who = 'Friend / Family',
  for_your_care_team_lede = 'Tell her what she''s built',
  for_your_care_team_detail = 'name specifically what she''s created around herself these three years—a friendship, routine, village or new part of herself.',
  for_your_care_team = 'Friend / Family — Tell her what she''s built: name specifically what she''s created around herself these three years—a friendship, routine, village or new part of herself.'
where week_number = 192;

update care_chart_week_content set
  for_your_care_team_who = 'Partner',
  for_your_care_team_lede = 'Talk about the next chapter',
  for_your_care_team_detail = 'ask what she''d like more of once these intense early years begin to loosen their grip.',
  for_your_care_team = 'Partner — Talk about the next chapter: ask what she''d like more of once these intense early years begin to loosen their grip.'
where week_number = 193;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / Family',
  for_your_care_team_lede = 'Keep the village even when she''s coping well',
  for_your_care_team_detail = 'support shouldn''t disappear simply because she has become good at carrying everything.',
  for_your_care_team = 'Partner / Family — Keep the village even when she''s coping well: support shouldn''t disappear simply because she has become good at carrying everything.'
where week_number = 194;

update care_chart_week_content set
  for_your_care_team_who = 'Partner / someone close',
  for_your_care_team_lede = 'Notice her, not just her competence',
  for_your_care_team_detail = 'ask what she needs before assuming she''s fine because she manages.',
  for_your_care_team = 'Partner / someone close — Notice her, not just her competence: ask what she needs before assuming she''s fine because she manages.'
where week_number = 195;

update care_chart_week_content set
  for_your_care_team_who = 'Her whole care team',
  for_your_care_team_lede = 'Keep caring for the mother too',
  for_your_care_team_detail = 'the three-year journey may be closing here, but her health, rest, relationships, ambitions and need for support don''t end with it.',
  for_your_care_team = 'Her whole care team — Keep caring for the mother too: the three-year journey may be closing here, but her health, rest, relationships, ambitions and need for support don''t end with it.'
where week_number = 196;
