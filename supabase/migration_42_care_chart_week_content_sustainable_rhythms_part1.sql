-- Care Chart week-by-week rebuild — Sustainable rhythms Part 1 (postpartum
-- weeks 53-78), 2026-07-29. Fifth batch of the postpartum week-by-week
-- build (Early healing weeks 0-6 = migrations 37-38; Finding rhythm weeks
-- 7-12 = migration 39; Rebuilding weeks 13-26 = migration 40; Settling
-- into strength weeks 27-52 = migration 41). No schema changes needed —
-- reuses every column/shape introduced for Early healing as-is.
--
-- This is the first of two batches covering Sustainable rhythms (weeks
-- 53-104, the full second postpartum year) — split into two 26-week
-- batches at Roop's explicit request (via AskUserQuestion, offered
-- against drafting the full 52-week phase at once) to keep batch size
-- consistent with Settling into strength rather than doubling again. Part
-- 2 (weeks 79-104) will pick up directly after this one.
--
-- Week-number convention: same forward count as every prior migration in
-- this series — postpartum week 53 = week_number 93, week 78 = week_number
-- 118 (40 + week, matching week 40 = full term/birth).
--
-- Process: Claude drafted the full 26-week base version first (grounded in
-- ACOG postpartum-exercise guidance and standard progressive-training
-- principles; deliberately did NOT extend the postpartum-depression/
-- anxiety onset-window claim verified for Settling into strength — that
-- verification covers only the first 12 months postpartum, and this batch
-- runs 12-18 months, past that window). Roop ran it past another AI app
-- and sent back "Care Chart — Postpartum Sustainable Rhythms Part 1 —
-- Final Move and Reset Edition." Parsed with the same parser used for
-- Settling into strength — zero further changes needed, doc structure
-- identical, zero stray backslashes in any extracted field. Round-trip
-- validated via the state-machine SQL-literal parser: 52 jsonb blocks,
-- zero errors on the first pass.
--
-- Same pattern as Settling into strength: the doc's "Clinical review
-- basis" and "Editorial implementation notes" sections came back
-- unchanged from Claude's own draft (confirmed by direct comparison,
-- including the deliberate Week 75 wording note below), and the real
-- difference was another full rewrite of the Move pillar's specifics
-- across most weeks — rotating strength, mobility, endurance, connection,
-- restorative and functional formats, matching the doc's own stated
-- intent from the prior batch. Spot-checked a representative sample of
-- weeks (54, 65, 69, 77) for new numeric/clinical claims requiring fresh
-- verification — found none; everything matches standard, non-postpartum-
-- specific strength-and-conditioning practice, no specific numeric
-- protocol requiring independent verification this batch.
--
-- Week 75 ("How are you, really") — Claude's base draft deliberately did
-- NOT label this week's content "postpartum depression/anxiety," since
-- the onset-window claim verified for Settling into strength (CDC,
-- Cleveland Clinic, MAMMI cohort study) covers only the first 12 months
-- postpartum, and this batch runs roughly 12-18 months, past that window.
-- Instead it's framed as a general, ongoing maternal-wellbeing check-in —
-- still real and worth flagging, without asserting a causal link to
-- childbirth this far out. Confirmed the reviewed doc kept Week 75's
-- theme/mantra/priority/journey/notice content byte-for-byte identical to
-- Claude's draft, and its own "Clinical review basis" section explicitly
-- confirms this was read and accepted as a deliberate wording choice, not
-- flagged as needing correction.
--
-- No condition_notes this batch, matching Claude's own draft's note — the
-- established pattern of placing them on a batch's closing week
-- (Rebuilding's week 26, Settling into strength's week 52) was considered
-- for week 78 but nothing genuinely new or condition-specific arose in
-- this batch; existing PCOS/high-BP/GDM/thyroid notes from earlier
-- batches remain the most recent for those flags. Worth reconsidering at
-- the close of Part 2 (week 104), which will mark the full second-year
-- point.
--
-- EDITORIAL LOCALISATION NOTE (carried from the doc itself): emergency
-- numbers, mental-health service access, and terminology require review
-- for each launch country — noted for awareness, not acted on here.
--
-- Also worth noting: this batch was drafted and reviewed in parallel with
-- a separate, still-open strategic conversation with Roop about whether
-- the app needs a persistent, week-independent postpartum-depression/
-- anxiety surface (not tied to any single week's card) plus a possible
-- onboarding mental-health-history flag and check-in pattern escalation —
-- she asked for time to think it over. Nothing in that conversation
-- changes what's in this migration; it's a separate, not-yet-decided piece
-- of future work, flagged here for continuity.
--
-- One genuine parser bug caught and fixed while building this migration:
-- this doc introduced a new global closing block, "Long-term health
-- continuity" (a single combined special-condition note spanning
-- diabetes_gd/high_bp/thyroid in one sentence, sitting after week 78's
-- content but before "Clinical review basis") that no prior batch's doc
-- structure had. The existing parser's `for_your_care_team` terminator
-- didn't anticipate a trailing global section after the last week, so it
-- initially over-captured this new block into week 78's `for_your_care_team`
-- field. Fixed by widening the terminator regex to also stop before
-- "Long-term health continuity", and by extracting that block separately
-- and attaching it to the batch's final week (78) as an additional
-- condition_notes entry tagged `flag: "none"` — same convention already
-- used for notes with no single matching health_flags value (e.g. Early
-- healing week 0's "major blood loss or anaemia" note). Re-validated after
-- the fix: 53 jsonb blocks (up from 52 pre-fix, the new note added), zero
-- errors.
insert into care_chart_week_content (
  week_number, trimester, theme_title, mantra, priority, journey,
  what_you_may_notice, move, nourish, hydration_goal, feeding_comfort,
  rest_support, reset, care_for_yourself, your_corner, support_moment,
  celebrate_this_week, for_your_care_team, condition_notes
) values
(
  93,
  'postpartum',
  'A new rhythm, not a new project',
  'The first year was building something. This year is living in it.',
  'Notice the shift from active recovery to sustained, ongoing rhythm.',
  'Past the first birthday, the framing can change. Some parts of the first year may feel settled; others may still require care, rehabilitation or support. This phase is about sustaining that rhythm through a toddler''s changing needs, not chasing new milestones of your own.',
  ARRAY['A settled sense of your own physical baseline','A toddler whose mobility and demands are changing quickly','Less urgency around your own "recovery," more focus on daily sustainability','Continued pride in the year behind you','A longer view of your own wellbeing starting to feel possible']::text[],
  '{"focus": "Define the smallest movement rhythm you can sustain in this new phase.", "recovery_route": {"vaginal": "", "assisted_tear": "", "caesarean": "", "complications": ""}, "tiers": {"heavy": "Breathe slowly, mobilise your spine and walk for the remainder of five minutes.", "steady": "Walk for 8 minutes, then complete one round of sit-to-stands, wall push-ups and heel raises.", "feeling_good": "Choose 15 minutes of steady movement plus two controlled strength rounds."}, "mood_adjustment": "Heavy: restore. Low: use five minutes. Okay: choose 15. Good: choose 30. Really good: finish with energy left for ordinary life.", "safety": "Stop and seek advice for new or worsening pain, dizziness, faintness, chest pain or unusual breathlessness."}'::jsonb,
  'Keep meals regular and protein-forward — chasing a toddler is real activity too, and your intake should match it.',
  'Continue your regular routine.',
  'Whatever feeding looks like now — weaned, still nursing, or somewhere in between — it''s the right choice if it''s working for you both.',
  'Toddler sleep can still be unpredictable (teething, developmental leaps, new fears) — protected rest remains genuinely necessary.',
  '{"heavy_day": "A hard day doesn''t erase a year of real, sustained work.", "a_little_low": "The shift from \"recovery\" to \"just life now\" can feel oddly disorienting — that''s a real, common feeling.", "okay": "Notice one part of your current rhythm that''s genuinely working well.", "good": "Let today''s steadiness be a real marker of how far you''ve come.", "really_good": "Use today''s energy to set one small intention for this next stretch."}'::jsonb,
  'Take stock of your full self-care routine as you move into this phase, keeping what''s genuinely worked.',
  'Write down what you''re most looking forward to in your toddler''s second year.',
  'Talk with your support person about what support looks like now, a year in.',
  'A full year of real, sustained care is genuinely behind you.',
  'Confirm what routine care, if any, continues at this stage.',
  null
),
(
  94,
  'postpartum',
  'Chasing a mobile toddler',
  'Your fitness doesn''t have to look like a workout to be real.',
  'Recognise toddler-chasing as genuine physical activity, and build around it rather than against it.',
  'A walking, climbing, exploring toddler changes your daily physical demands in real ways — more bending, lifting, crouching and quick movement than the newborn stage required. This week is about recognising that as real activity, and choosing deliberate movement that complements it.',
  ARRAY['More incidental physical activity through the day than you may realise','New aches from bending, lifting and crouching differently than before','A wish for movement that builds strength for these specific demands','Genuine tiredness that''s more "chasing" tired than "newborn" tired','A body that''s adapting to a new kind of physical parenting']::text[],
  '{"focus": "Build strength for lifting, crouching and changing direction.", "recovery_route": {"vaginal": "", "assisted_tear": "", "caesarean": "", "complications": ""}, "tiers": {"heavy": "Practise 6 slow sit-to-stands and 4 supported floor-to-stands per side.", "steady": "Complete two rounds of 8 squats or sit-to-stands, 6 reverse lunges per side and a comfortable carry.", "feeling_good": "Walk for 10 minutes, then complete three controlled rounds of squat, hinge, carry and floor-to-stand patterns."}, "mood_adjustment": "Heavy: practise one pattern. Low: reduce depth. Okay: two rounds. Good: full session. Really good: improve control before adding load.", "safety": "Stop and seek advice for new or worsening pain, dizziness, faintness, chest pain or unusual breathlessness."}'::jsonb,
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  'Continue your regular routine.',
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  '{"heavy_day": "Chasing a toddler all day is real physical work — rest without guilt.", "a_little_low": "New aches from a new stage of physical parenting are common, not a sign of anything wrong.", "okay": "Notice one specific physical demand your daily routine now includes that it didn''t a year ago.", "good": "Let today''s capability feel earned, because it is.", "really_good": "Use today''s energy for a movement session that builds on what your days already ask of you."}'::jsonb,
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  'Note one way your body has adapted to this new stage of parenting.',
  'Ask your support person to take a turn on the chasing today, so you can genuinely rest.',
  'Keeping up with a curious, mobile toddler is real, demanding, ongoing work.',
  'Mention any new or persistent ache from bending, lifting or crouching differently.',
  null
),
(
  95,
  'postpartum',
  'Sleep, unpredictable again',
  'Toddler sleep isn''t always simpler than newborn sleep.',
  'Expect toddler sleep disruptions (teething, developmental leaps, new fears) without assuming something''s wrong with your routine.',
  'Just as one sleep stage settles, toddlerhood often brings new disruptions — teething, developmental leaps, separation anxiety, or a newly discovered fear of the dark. This week is about expecting that honestly, rather than assuming a "regression" means something has gone wrong.',
  ARRAY['New or returning night wakings that don''t match earlier patterns','Frustration that sleep, once settled, has become unpredictable again','Your own sleep debt returning alongside your toddler''s disrupted nights','Reassurance that this is a normal, common stage, not a step backward','Genuine exhaustion that deserves the same care as any earlier sleep-deprived stretch']::text[],
  '{"focus": "Let accumulated sleep — not guilt — set today''s training dose.", "recovery_route": {"vaginal": "", "assisted_tear": "", "caesarean": "", "complications": ""}, "tiers": {"heavy": "Use relaxed breathing, neck and shoulder mobility, and an easy walk.", "steady": "Walk gently for 10 minutes and add 5 minutes of mobility.", "feeling_good": "Use a familiar moderate routine only if concentration, balance and energy feel normal."}, "mood_adjustment": "After a very poor night: restorative movement only. Low: five minutes. Okay: 15. Good or really good: 30 without \"making up\" missed sessions.", "safety": "Stop and seek advice for new or worsening pain, dizziness, faintness, chest pain or unusual breathlessness."}'::jsonb,
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  'Continue your regular routine.',
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  'Trade off night duty with your support person where possible — disrupted toddler sleep deserves the same shared-load approach as newborn sleep did.',
  '{"heavy_day": "Exhaustion from disrupted toddler sleep is just as real as newborn-stage exhaustion — treat it that way.", "a_little_low": "A sleep setback after months of better nights can feel disproportionately discouraging — that''s a common, valid reaction.", "okay": "Notice one adjustment that''s helped, even slightly, with recent sleep disruption.", "good": "Let a genuinely restful night, whenever it happens, feel like real relief.", "really_good": "If sleep has been kind lately, protect whatever''s helping it stay that way."}'::jsonb,
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  'Write down what your ideal night of sleep looks like right now, realistically.',
  'Ask for one specific night of relief this week, even if it''s just a few extra hours.',
  'Navigating another round of disrupted sleep, a year in, is real and exhausting work.',
  'Mention any sleep disruption that''s affecting your daytime functioning significantly.',
  null
),
(
  96,
  'postpartum',
  'Eating as a family',
  'Your own plate matters just as much as the food on theirs.',
  'Notice whether your own eating has kept pace now that meals are shared, family-style affairs.',
  'By now, many toddlers eat family meals rather than separate purees, which changes the whole household''s food rhythm. This week is about making sure your own nutrition hasn''t quietly become an afterthought amid feeding a toddler.',
  ARRAY['Shared family meals becoming the norm','Your own eating happening in rushed bites between feeding a toddler','A wish for meals that are easier to prepare for everyone at once','Genuine enjoyment in sharing food with your growing child','Occasional reminders to actually sit down and eat properly yourself']::text[],
  '{"focus": "Make movement fit naturally around family meals and routines.", "recovery_route": {"vaginal": "", "assisted_tear": "", "caesarean": "", "complications": ""}, "tiers": {"heavy": "Take a five-minute walk after one meal.", "steady": "Walk for 10 minutes, then do one round of squats, incline push-ups and heel raises.", "feeling_good": "Take a 20-minute family walk and add 10 minutes of personal strength or mobility."}, "mood_adjustment": "Heavy: walk briefly or rest. Low: move after one meal. Okay: 15 minutes. Good: 30. Really good: keep the family element enjoyable, not compulsory.", "safety": "Stop and seek advice for new or worsening pain, dizziness, faintness, chest pain or unusual breathlessness."}'::jsonb,
  'Sit down for at least one real meal today, even briefly — your own nutrition still matters as much as your toddler''s.',
  'Continue your regular routine.',
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  '{"heavy_day": "If your own eating has been slipping, that''s common and fixable, not a failing.", "a_little_low": "Feeding a picky toddler while trying to eat well yourself is genuinely hard some days.", "okay": "Notice whether your own meals have kept pace with your actual needs lately.", "good": "Let a shared, unhurried family meal feel like a real, good moment.", "really_good": "Plan one meal this week that''s genuinely easy for the whole family, including you."}'::jsonb,
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  'Write down one thing about mealtimes with your toddler that makes you smile.',
  'Ask for help with meal prep if your own eating has been slipping.',
  'Feeding a growing family, every day, is real and ongoing care.',
  'No specific ask this week.',
  null
),
(
  97,
  'postpartum',
  'A year back at work',
  'If you returned to work, this milestone deserves its own check-in.',
  'If you''ve been back at work roughly a year, honestly assess how that rhythm has actually settled.',
  'For mothers who returned to paid work sometime in the past year, this is a natural point to reflect on how that adjustment has genuinely gone — separate from how it felt in the first few weeks back. If you''re not working outside the home, your own daily rhythm has likely also settled into something different from a year ago.',
  ARRAY['A working rhythm that''s found real stability, or one that still feels effortful','Clarity about what''s working and what isn''t, a year in','Pride in managing work and caregiving simultaneously over a full year','Questions about whether anything about your current arrangement needs to change','A wish for a different balance than the one you currently have']::text[],
  '{"focus": "Undo the repeated positions of paid work and caregiving.", "recovery_route": {"vaginal": "", "assisted_tear": "", "caesarean": "", "complications": ""}, "tiers": {"heavy": "Do shoulder rolls, wrist mobility, 8 heel raises and 6 sit-to-stands.", "steady": "Alternate three minutes of walking with two minutes of posture and mobility work.", "feeling_good": "Walk for 12 minutes, then complete two rounds of rows, incline push-ups, sit-to-stands and calf raises."}, "mood_adjustment": "Heavy: one movement break. Low: easy walk. Okay: 15 minutes. Good: 30. Really good: improve your workstation instead of adding intensity.", "safety": "Stop and seek advice for new or worsening pain, dizziness, faintness, chest pain or unusual breathlessness."}'::jsonb,
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  'Continue your regular routine.',
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  '{"heavy_day": "If work and caregiving still feel unmanageable a year in, that''s real, not a personal failing.", "a_little_low": "A year in and still adjusting is common — there''s no fixed deadline for this to feel easy.", "okay": "Name one specific thing about your current working rhythm that could genuinely be adjusted.", "good": "Notice one part of your current balance that''s actually working well.", "really_good": "Use today''s clarity to raise a specific change with your workplace or household, if one''s needed."}'::jsonb,
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  'Write down how your sense of "balance" has changed over this past year.',
  'Talk honestly with your household about whether the current division of labour is still working, a year in.',
  'A full year of managing work and caregiving together, however it''s gone, is real, sustained work.',
  'No specific ask this week.',
  null
),
(
  98,
  'postpartum',
  'Fitness goals, not just recovery',
  'You''re allowed to want more than ''back to normal'' now.',
  'Set a genuine fitness goal of your own, separate from any recovery framing.',
  'A year on, "recovery" language may no longer fit — or it may still describe part of your reality. If it feels right, fitness can now include goals chosen for you, not only getting back to where you started. This week is an invitation to name what you actually want next, if anything.',
  ARRAY['A wish to build toward something specific, not just maintain','Uncertainty about what a "goal" even looks like now','Genuine capability that''s grown well past where you started','No particular interest in a formal goal, and that''s equally valid','Curiosity about trying something entirely new']::text[],
  '{"focus": "Choose one personal fitness goal and test its fit with real life.", "recovery_route": {"vaginal": "", "assisted_tear": "", "caesarean": "", "complications": ""}, "tiers": {"heavy": "Do the smallest safe version of the activity you want to pursue.", "steady": "Practise one goal-related skill at easy effort for 15 minutes.", "feeling_good": "Complete a goal-specific session at moderate effort, leaving a clear reserve."}, "mood_adjustment": "Heavy: maintain contact with the goal. Low: practise technique. Okay: 15 minutes. Good: 30. Really good: progress only one variable.", "safety": "Stop and seek advice for new or worsening pain, dizziness, faintness, chest pain or unusual breathlessness."}'::jsonb,
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  'Continue your regular routine.',
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  '{"heavy_day": "A new goal can wait for an easier day — today, rest is enough.", "a_little_low": "Not knowing what you want next, fitness-wise or otherwise, is common and not a failure of ambition.", "okay": "Write down one thing you''d genuinely like to build toward physically.", "good": "Let today''s energy go toward exploring what that goal might look like.", "really_good": "Take a real, concrete step toward a new goal today."}'::jsonb,
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  'Note one thing your body can do now that you didn''t expect a year ago.',
  'Share a new goal with your support person so they can help protect time for it.',
  'Wanting more than "recovery" is a real, healthy sign of how far you''ve come.',
  'No specific ask this week.',
  null
),
(
  99,
  'postpartum',
  'When your toddler won''t let go',
  'Separation anxiety is theirs, but the load often lands on you.',
  'Notice the emotional and physical toll of a clingy stage, without treating it as a problem to fix quickly.',
  'Separation anxiety is a normal, common toddler stage, but it can be genuinely draining for the parent it''s directed at — near-constant physical closeness, interrupted routines, and little time alone. This week is about naming that honestly.',
  ARRAY['A toddler who wants to be held, near, or in sight constantly','Genuine physical and emotional fatigue from near-constant closeness','Reduced personal space or time alone, even briefly','Reassurance that this phase, while hard, is developmentally normal and usually temporary','Complicated feelings — love and touched-out exhaustion, both at once']::text[],
  '{"focus": "Use movement to regulate without forcing separation.", "recovery_route": {"vaginal": "", "assisted_tear": "", "caesarean": "", "complications": ""}, "tiers": {"heavy": "Stretch or walk beside your toddler for five minutes.", "steady": "Take a child-led walk or combine play with gentle mobility for 15 minutes.", "feeling_good": "Choose 15 minutes together, then 15 protected minutes for your own routine if support is available."}, "mood_adjustment": "Heavy: stay close and restore. Low: move together. Okay: 15. Good: protected 30. Really good: accept connection without surrendering all personal time.", "safety": "Stop and seek advice for new or worsening pain, dizziness, faintness, chest pain or unusual breathlessness."}'::jsonb,
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  'Continue your regular routine.',
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  '{"heavy_day": "Feeling touched-out and overwhelmed by a clingy toddler is a real, valid feeling, not a failure of patience.", "a_little_low": "This phase can feel isolating even though you''re rarely physically alone — that contradiction is real.", "okay": "Name one small way to get even a few minutes of personal space today.", "good": "Let a calm moment with your toddler today feel good without needing to be constant.", "really_good": "Use today''s patience to try one gentle strategy for easing separation moments."}'::jsonb,
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  'Write down one small thing that''s helped, even slightly, during clingy moments.',
  'Ask your support person to take over for a short stretch so you can have a genuine break.',
  'Meeting a clingy, anxious toddler with patience, even imperfectly, is real, demanding care.',
  'No specific ask this week.',
  null
),
(
  100,
  'postpartum',
  'Skin and self-care, steady state',
  'No news is good news for your routine right now.',
  'Confirm your self-care routine still fits, without needing to change anything.',
  'By this stage, most mothers have a stable, working self-care routine. This is a light week to simply confirm it still fits your life, rather than introduce anything new.',
  ARRAY['A stable, simple self-care routine that''s genuinely stuck','Occasional reminders to actually keep up with it amid a busy toddler stage','A wish for a slightly more indulgent step, if time allows','Confidence in what actually works for you now','No particular changes to report, and that''s a fine, steady place to be']::text[],
  '{"focus": "Use a restorative week for posture, mobility and physical ease.", "recovery_route": {"vaginal": "", "assisted_tear": "", "caesarean": "", "complications": ""}, "tiers": {"heavy": "Mobilise neck, shoulders, wrists, hips and ankles gently.", "steady": "Walk for 7 minutes and use 8 minutes of comfortable mobility.", "feeling_good": "Combine 15 minutes of easy walking with 15 minutes of mobility and light strength."}, "mood_adjustment": "Heavy: breathing and mobility. Low: easy walk. Okay: 15 minutes. Good or really good: stay comfortable rather than stretching aggressively.", "safety": "Stop and seek advice for new or worsening pain, dizziness, faintness, chest pain or unusual breathlessness."}'::jsonb,
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  'Continue your regular routine.',
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  '{"heavy_day": "Skipping your routine today is fine — it will be there tomorrow.", "a_little_low": "A small self-care ritual, even briefly, can be genuinely grounding on a harder day.", "okay": "Confirm your current routine still fits, and drop anything that''s become unnecessary.", "good": "Enjoy a small, unhurried moment of self-care today.", "really_good": "If time allows, add one slightly more indulgent step just because you want to."}'::jsonb,
  'Confirm daily SPF is still part of your routine — the one constant across every stage.',
  'Note one small self-care ritual that''s genuinely made a difference this year.',
  'Ask for ten uninterrupted minutes for your own routine today.',
  'A simple, sustainable self-care routine you''ve actually kept up is a real, ongoing achievement.',
  'No specific ask this week.',
  null
),
(
  101,
  'postpartum',
  'Your relationship, a year on',
  'A year past the newborn stage, worth another honest look.',
  'Check in again, honestly, on your relationship with your partner or closest support person, if relevant to you.',
  'Relationships continue evolving well past the newborn stage. This is a natural point for another honest check-in — how has connection, division of labour and intimacy shifted now that the acute newborn demands are well behind you?',
  ARRAY['A relationship that''s found new stability, or one still adjusting','More capacity for connection than a year ago','Ongoing questions about shared responsibilities as your toddler''s needs change','Gratitude for a partner or support system that''s stayed close','This week may not apply to you at all, and that''s completely fine']::text[],
  '{"focus": "Let shared movement create connection without becoming another obligation.", "recovery_route": {"vaginal": "", "assisted_tear": "", "caesarean": "", "complications": ""}, "tiers": {"heavy": "Walk or stretch together for five minutes — or choose solitude.", "steady": "Take a 15-minute walk-and-talk with logistics put aside.", "feeling_good": "Share 20 minutes of easy movement, then take 10 minutes for individual mobility or strength."}, "mood_adjustment": "Heavy: ask for presence, not exercise. Low: invite company. Okay: short connection. Good or really good: keep performance out of it.", "safety": "Stop and seek advice for new or worsening pain, dizziness, faintness, chest pain or unusual breathlessness."}'::jsonb,
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  'Continue your regular routine.',
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  '{"heavy_day": "If your relationship feels strained today, that''s worth naming honestly, even if you''re not ready to address it yet.", "a_little_low": "A relationship still finding its footing a year on is common, not a sign of failure.", "okay": "Name one specific thing you need more of from your relationship right now.", "good": "Let a good moment of connection today be enough, without needing it to fix everything.", "really_good": "Use today''s warmth to plan a small, real moment of connection this week."}'::jsonb,
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  'Write down one thing that''s genuinely improved in your relationship since the newborn stage.',
  'Have one honest, low-pressure conversation this week about how you''re both doing.',
  'Tending to your relationships, a year on, is still part of tending to yourself.',
  'If relationship strain is affecting your wellbeing significantly, counselling support is a reasonable thing to ask about.',
  null
),
(
  102,
  'postpartum',
  'Money, revisited',
  'A practical check-in, not a deep dive — that lives elsewhere.',
  'A light nudge to revisit your financial plan now that the first year''s costs are clearer.',
  'The first year often brings real financial clarity — you now know what a year of raising your child actually costs, which is useful information for planning ahead. This week is a light prompt, not a deep dive (the fuller financial planning tools live in the Wealth section of this app).',
  ARRAY['A clearer picture of your family''s real monthly costs than a year ago','Questions about savings, childcare costs, or planning for what''s next','Confidence in decisions made so far, or a wish to adjust course','No particular concerns at all, which is also a fine place to be','A reminder that financial planning is ongoing, not a one-time task']::text[],
  '{"focus": "Choose movement that needs little money, equipment or planning.", "recovery_route": {"vaginal": "", "assisted_tear": "", "caesarean": "", "complications": ""}, "tiers": {"heavy": "Walk, climb stairs gently, or complete sit-to-stands for five minutes.", "steady": "Use a no-equipment circuit: squat, wall push, heel raise and marching.", "feeling_good": "Combine a 15-minute walk with three rounds of the no-equipment circuit."}, "mood_adjustment": "Heavy: use one free option. Low: walk. Okay: 15 minutes. Good: 30. Really good: resist buying complexity you do not need.", "safety": "Stop and seek advice for new or worsening pain, dizziness, faintness, chest pain or unusual breathlessness."}'::jsonb,
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  'Continue your regular routine.',
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  '{"heavy_day": "Money worries can wait for an easier day — nothing needs deciding today.", "a_little_low": "Financial stress after a demanding year is common, and worth naming rather than carrying silently.", "okay": "Take five minutes to note your real monthly costs since your child arrived.", "good": "Let a moment of financial clarity feel like real progress, not just a chore.", "really_good": "Use today''s energy to look at the Wealth section''s planning tools if you haven''t already."}'::jsonb,
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  'Note one financial goal you''d like to work toward this year.',
  'Have one honest conversation about money with your partner or household this week.',
  'Managing a family''s finances through a demanding first year is real, ongoing work.',
  'No specific ask this week.',
  null
),
(
  103,
  'postpartum',
  'Going deeper on what''s yours',
  'A hobby you''ve kept alive deserves room to grow.',
  'If you''ve reconnected with a hobby or interest this past year, give it a little more room now.',
  'If earlier weeks helped you reconnect with an interest outside caregiving, this is a good point to let it grow a little further — more time, more ambition, or simply more consistency.',
  ARRAY['A hobby or interest that''s become a real, protected part of your week','A wish to go further with something you''ve only dabbled in so far','More capacity for personal interests than earlier in the year','Guilt that occasionally still surfaces about time spent on yourself','Genuine enjoyment when you do make space for it']::text[],
  '{"focus": "Protect one form of movement that feels unmistakably yours.", "recovery_route": {"vaginal": "", "assisted_tear": "", "caesarean": "", "complications": ""}, "tiers": {"heavy": "Play one song and move until it ends.", "steady": "Choose a solo walk, class practice or favourite routine for 15 minutes.", "feeling_good": "Give 30 minutes to movement chosen for enjoyment, identity or curiosity — not caregiving utility."}, "mood_adjustment": "Heavy: choose soothing familiarity. Low: step outside. Okay: 15 minutes. Good or really good: enjoyment is the measure.", "safety": "Stop and seek advice for new or worsening pain, dizziness, faintness, chest pain or unusual breathlessness."}'::jsonb,
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  'Continue your regular routine.',
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  '{"heavy_day": "A hobby can wait for an easier week — today, rest is enough.", "a_little_low": "Wanting more time for yourself doesn''t make you a less devoted parent.", "okay": "Name one small, specific step to go further with something you enjoy.", "good": "Spend today''s good energy on something creative or personal, guilt-free.", "really_good": "Take a real, concrete step toward growing an interest that''s yours."}'::jsonb,
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  'Write down where you''d like a hobby or interest to go next.',
  'Ask your support person to protect a specific, recurring block of time for this.',
  'Growing something that''s genuinely yours, alongside everything else, is real and good.',
  'No specific ask this week.',
  null
),
(
  104,
  'postpartum',
  'Questions about "next"',
  'Whatever you decide about a next child, it''s your decision to make, on your timeline.',
  'Notice how you''re actually feeling about questions — from yourself or others — about a next child, without pressure to decide anything now.',
  'By this stage, questions about "when''s the next one" often start arriving, whether from family, friends, or your own private thoughts. This week is a space to notice your real feelings, without any pressure to have an answer.',
  ARRAY['Genuine excitement about the idea of another child','No interest at all, and complete confidence in that','Outside pressure or questions that feel intrusive','Uncertainty that itself feels uncomfortable to sit with','A private, evolving sense of what you actually want']::text[],
  '{"focus": "Keep movement steady while big family questions remain unanswered.", "recovery_route": {"vaginal": "", "assisted_tear": "", "caesarean": "", "complications": ""}, "tiers": {"heavy": "Use five minutes of breathing and familiar mobility.", "steady": "Take an easy 15-minute walk without using it to force a decision.", "feeling_good": "Choose a familiar routine at moderate effort and let the question remain separate from the workout."}, "mood_adjustment": "Heavy: seek support, not answers from exercise. Low: walk with someone safe. Okay: familiar 15. Good or really good: no new performance target this week.", "safety": "Stop and seek advice for new or worsening pain, dizziness, faintness, chest pain or unusual breathlessness."}'::jsonb,
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  'Continue your regular routine.',
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  '{"heavy_day": "These questions can wait for an easier day — nothing needs deciding right now.", "a_little_low": "Repeated questions about \"next\" can feel intrusive, even from people who mean well.", "okay": "Notice your honest, current feeling about this, without needing it to be final.", "good": "Let today''s clarity, whatever it is, feel like enough.", "really_good": "If you want to, talk with your partner about where you both stand — no pressure to decide anything."}'::jsonb,
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  'Write down your honest, current thoughts on this, just for yourself.',
  'If outside questions about "next" have felt intrusive, it''s fine to set a boundary about it.',
  'Trusting your own timeline on decisions this personal is a real strength.',
  'If you''re considering another pregnancy, this is a reasonable time to ask about preconception guidance.',
  null
),
(
  105,
  'postpartum',
  'Halfway through this second year',
  'Fifteen months in, and still becoming.',
  'Pause on this halfway point of Part 1 — a marker, not a milestone that needs marking loudly.',
  'Roughly fifteen months postpartum now — halfway between the first birthday and eighteen months. A quiet marker, worth a brief pause to notice how much has settled since the more intense early months.',
  ARRAY['A genuinely settled sense of your own routine and rhythm','Continued small adjustments as your toddler grows and changes','Pride in a sustained, ongoing rhythm rather than any single big moment','A body and mind that feel, overall, steady','Anticipation for the months ahead']::text[],
  '{"focus": "Use the 18-month midpoint as a function review, not an exam.", "recovery_route": {"vaginal": "", "assisted_tear": "", "caesarean": "", "complications": ""}, "tiers": {"heavy": "Repeat your most helpful five-minute routine.", "steady": "Choose a familiar 15-minute walk or circuit and notice comfort and control.", "feeling_good": "Complete a favourite 30-minute routine and note stamina, strength, symptoms and enjoyment."}, "mood_adjustment": "Heavy: reflect without testing. Low: choose a favourite. Okay: 15 minutes. Good or really good: compare only with your own earlier baseline.", "safety": "Stop and seek advice for new or worsening pain, dizziness, faintness, chest pain or unusual breathlessness."}'::jsonb,
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  'Continue your regular routine.',
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  '{"heavy_day": "Even at this settled stage, a hard day is still just a hard day.", "a_little_low": "Quiet stretches without a big milestone to mark can feel strangely uneventful — that''s completely normal.", "okay": "Compare where you are now to a year ago, honestly and specifically.", "good": "Let today''s steadiness be a genuine marker of everything behind you.", "really_good": "Mark this quiet halfway point in a way that feels meaningful to you, however small."}'::jsonb,
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  'Write a short reflection on how the past fifteen months compare to what you expected.',
  'Share this quiet milestone with someone who''s been part of the journey.',
  'Fifteen months of real, sustained rhythm — settled, but still growing.',
  'No specific ask this week.',
  null
),
(
  106,
  'postpartum',
  'Consistency over intensity',
  'The habit that lasts beats the routine that impresses.',
  'Reaffirm consistency as the real goal, over any short-term intensity.',
  'At this stage, the biggest predictor of long-term fitness isn''t any single hard session — it''s whether a routine is sustainable enough to actually continue. This week is a reminder to choose consistency over intensity when the two are in tension.',
  ARRAY['A routine that''s stuck around because it''s genuinely sustainable','Occasional pull toward a more intense approach that''s harder to maintain','Real, cumulative benefit from months of consistent, moderate effort','Confidence in your own pace, separate from anyone else''s','A settled relationship with movement, most days']::text[],
  '{"focus": "Practise repeatability: finish able and willing to return.", "recovery_route": {"vaginal": "", "assisted_tear": "", "caesarean": "", "complications": ""}, "tiers": {"heavy": "Complete one easy round of three familiar movements.", "steady": "Use two controlled rounds at a conversational effort.", "feeling_good": "Complete your usual routine at moderate intensity, stopping with a little reserve."}, "mood_adjustment": "Heavy: maintain the habit. Low: one round. Okay: two. Good: normal session. Really good: do not turn one energetic day into an unsustainable plan.", "safety": "Stop and seek advice for new or worsening pain, dizziness, faintness, chest pain or unusual breathlessness."}'::jsonb,
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  'Continue your regular routine.',
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  '{"heavy_day": "A quiet, low-key day is still consistency, just at a lower volume.", "a_little_low": "Comparing your steady pace to someone else''s intensity rarely helps — yours is the one that lasts.", "okay": "Notice one habit you''ve genuinely sustained for months now.", "good": "Let a good, steady day feel like real, quiet success.", "really_good": "Use today''s energy without abandoning the sustainable pace that''s gotten you here."}'::jsonb,
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  'Note one routine you''ve kept up longer than you expected to.',
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  'A sustainable, consistent routine — the kind that actually lasts — is a real accomplishment.',
  'No specific ask this week.',
  null
),
(
  107,
  'postpartum',
  'Fuel for a busy life',
  'Chasing a toddler all day needs real fuel, not less of it.',
  'Match your food intake to the real, sustained activity level of toddler-chasing life.',
  'Caring for an active toddler is real, sustained physical activity, even if it doesn''t look like a workout. This week is a reminder that your own nutrition needs to genuinely match that demand, not shrink to fit a busy schedule.',
  ARRAY['Genuine hunger and energy needs that match a busy, active day','A tendency to skip or rush your own meals amid a full schedule','Better energy on days you''ve actually eaten enough','A wish for simple, sustaining food that doesn''t take much preparation','Confidence in what actually works for your energy levels']::text[],
  '{"focus": "Pair purposeful strength with enough food and fluid.", "recovery_route": {"vaginal": "", "assisted_tear": "", "caesarean": "", "complications": ""}, "tiers": {"heavy": "Do 8 sit-to-stands, 8 wall push-ups and a posture reset.", "steady": "Walk for 5 minutes, then complete two easy strength rounds.", "feeling_good": "Complete three controlled rounds of squat, push, pull or row, heel raise and carry."}, "mood_adjustment": "Heavy: one round after fuelling. Low: gentle walk. Okay: two rounds. Good: three. Really good: add load only when nourishment, sleep and symptoms support it.", "safety": "Stop and seek advice for new or worsening pain, dizziness, faintness, chest pain or unusual breathlessness."}'::jsonb,
  'Keep two or three simple, protein-forward options on hand for the days that don''t allow for real meal prep.',
  'Continue your regular routine.',
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  '{"heavy_day": "If you''ve been running on too little food, that''s worth fixing today, not judging yourself over.", "a_little_low": "Skipping meals on busy days is common, but it does affect how you feel — worth noticing the pattern.", "okay": "Notice whether your energy dips track with meals you''ve skipped or rushed.", "good": "Let a well-fuelled day feel noticeably different, and remember what got you there.", "really_good": "Use today''s energy to prep something simple for a busier day ahead."}'::jsonb,
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  'Note one simple food that reliably helps your energy through a long day.',
  'Ask for help with meal prep if your own eating has been slipping.',
  'Keeping yourself fuelled through a genuinely demanding, active life is real self-care.',
  'No specific ask this week.',
  null
),
(
  108,
  'postpartum',
  'When patience runs thin',
  'Toddler tantrums test something real in you too.',
  'Notice how toddler tantrums affect your own nervous system, and build in a way to reset.',
  'Toddler tantrums are a normal developmental stage, but they can genuinely wear down a parent''s patience and nervous system over time. This week is about naming that honestly, and building in small ways to reset.',
  ARRAY['Genuine frustration or overwhelm during tantrums, even when you know they''re developmentally normal','A shorter fuse than you''d like on harder days','Relief when you find a strategy that actually helps','Guilt about moments you haven''t handled as calmly as you wanted to','Growing confidence in your ability to stay steady, most of the time']::text[],
  '{"focus": "Use movement to discharge tension safely, not punish yourself.", "recovery_route": {"vaginal": "", "assisted_tear": "", "caesarean": "", "complications": ""}, "tiers": {"heavy": "Unclench your jaw, lower your shoulders, breathe out slowly and walk.", "steady": "Take a brisk-but-comfortable walk, then finish with slow breathing.", "feeling_good": "Choose 20 minutes of rhythmic movement and 10 minutes of mobility or cool-down."}, "mood_adjustment": "Heavy: step away and seek human support if needed. Low: gentle rhythm. Okay: 15 minutes. Good or really good: finish calmer, not depleted.", "safety": "Stop and seek advice for new or worsening pain, dizziness, faintness, chest pain or unusual breathlessness."}'::jsonb,
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  'Continue your regular routine.',
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  '{"heavy_day": "If tantrums have worn you thin today, a few minutes of breathing before responding again can genuinely help.", "a_little_low": "Losing patience sometimes doesn''t undo months of steady, loving care.", "okay": "Notice one strategy that''s actually helped you stay calmer during a tantrum recently.", "good": "Let a calm, well-handled moment today feel like real progress.", "really_good": "Use today''s patience to try one new calming strategy for the next hard moment."}'::jsonb,
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  'Write down one thing that''s helped you stay grounded during a tantrum.',
  'Ask your support person to step in when your patience is genuinely running low.',
  'Staying present through hard toddler moments, even imperfectly, is real, skilled parenting.',
  'No specific ask this week.',
  null
),
(
  109,
  'postpartum',
  'Your own sleep, now',
  'With more predictable nights, your own sleep deserves real attention again.',
  'With toddler nights often more predictable now, turn some attention back to your own sleep hygiene.',
  'If nights have become more predictable, this is a good week to turn attention back to your own sleep habits specifically — not just whether you''re getting interrupted, but whether your own routine actually supports good rest.',
  ARRAY['More predictable nights than earlier in the year','Old habits (later bedtimes, screen use before sleep) that crept in during harder stretches','A wish to reclaim a genuine, restful sleep routine of your own','Noticeably better mood and energy on well-rested days','Confidence that good sleep is achievable again, even amid ongoing parenting demands']::text[],
  '{"focus": "Match movement to your own sleep quality over the whole week.", "recovery_route": {"vaginal": "", "assisted_tear": "", "caesarean": "", "complications": ""}, "tiers": {"heavy": "Use a five-minute daylight walk or restorative mobility.", "steady": "Walk for 10 minutes and add 5 minutes of light strength.", "feeling_good": "Choose a moderate familiar session only when alertness, balance and recovery feel adequate."}, "mood_adjustment": "Heavy: restoration. Low: easy 5--15. Okay: 15. Good: 30. Really good: protect bedtime instead of extending the workout.", "safety": "Stop and seek advice for new or worsening pain, dizziness, faintness, chest pain or unusual breathlessness."}'::jsonb,
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  'Continue your regular routine.',
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  'Reclaim one small piece of your own sleep routine this week — an earlier bedtime, less screen time before bed, or a calmer wind-down.',
  '{"heavy_day": "If sleep still feels elusive even with more predictable nights, that''s worth mentioning to your care team.", "a_little_low": "Rebuilding good sleep habits after a hard stretch takes real, deliberate effort — that''s normal.", "okay": "Choose one specific sleep habit to work on this week.", "good": "Notice how much better a genuinely restful night feels compared to earlier in the year.", "really_good": "Protect whatever''s helping your sleep stay good right now."}'::jsonb,
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  'Write down what your ideal sleep routine looks like now that nights are steadier.',
  'Ask your support person to help protect an earlier bedtime for yourself this week.',
  'Reclaiming your own sleep, on top of everything else, is real, worthwhile care.',
  'Mention any ongoing sleep difficulty that doesn''t seem to improve with more predictable nights.',
  null
),
(
  110,
  'postpartum',
  'Investing in yourself, a little more',
  'You''ve earned room for something a little more.',
  'If time and budget allow, consider one small, real investment in your own care.',
  'By now, many mothers have more capacity — time, energy, sometimes budget — than earlier in the year. This is a gentle nudge to consider one small, genuine investment in your own care, if that''s something you want.',
  ARRAY['A wish for something a little more than your current baseline routine','Genuine hesitation about spending time or money on yourself','More capacity for self-care than a few months ago','Confidence that this isn''t indulgent, but a reasonable part of ongoing care','No particular wish for anything more right now, and that''s equally fine']::text[],
  '{"focus": "Invest in capability with one small, realistic progression.", "recovery_route": {"vaginal": "", "assisted_tear": "", "caesarean": "", "complications": ""}, "tiers": {"heavy": "Practise one strength skill slowly for five minutes.", "steady": "Complete two rounds and add either one repetition or slightly more resistance.", "feeling_good": "Use your regular routine and progress one variable only."}, "mood_adjustment": "Heavy: maintain. Low: technique. Okay: repeat. Good: one progression. Really good: leave repetitions in reserve.", "safety": "Stop and seek advice for new or worsening pain, dizziness, faintness, chest pain or unusual breathlessness."}'::jsonb,
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  'Continue your regular routine.',
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  '{"heavy_day": "An investment in yourself can wait for an easier day — today, rest is enough.", "a_little_low": "Hesitating to spend time or money on yourself is common, but it''s worth questioning that instinct sometimes.", "okay": "Name one small, genuine want for your own care, without judging it.", "good": "Let today''s ease make room to consider something just for you.", "really_good": "If it feels right, take one real step toward that small investment."}'::jsonb,
  'Consider one small, genuine upgrade to your self-care routine — a better product, a treatment, or simply more time.',
  'Write down one thing you''d genuinely enjoy investing in for yourself.',
  'Tell your support person about something you''d like to do for yourself, and ask for their help making room for it.',
  'Investing in your own care, in whatever way fits, is a real and reasonable act of self-respect.',
  'No specific ask this week.',
  null
),
(
  111,
  'postpartum',
  'Your village, reconfigured',
  'Childcare arrangements evolve. So does who''s actually in your corner.',
  'Take stock of how your support network and childcare arrangements have shifted since the earlier months.',
  'Childcare arrangements, family involvement and friendships often shift again around this stage — a return to work settling in, new childcare routines, or simply different people showing up than did in the earliest months. This week is about noticing the current shape of your village.',
  ARRAY['New or evolving childcare arrangements','Relationships that have deepened, and others that have naturally faded','Confidence in your current support network, or a wish for more','Gratitude for whoever''s shown up consistently','A sense that your village looks different now than it did a year ago, and that''s normal']::text[],
  '{"focus": "Use your support network to create protected movement time.", "recovery_route": {"vaginal": "", "assisted_tear": "", "caesarean": "", "complications": ""}, "tiers": {"heavy": "Ask someone to cover one practical task while you take five minutes.", "steady": "Use a genuinely protected 15-minute window without multitasking.", "feeling_good": "Take 30 minutes for your routine while another adult fully owns toddler care or household work."}, "mood_adjustment": "Heavy: ask for rest instead. Low: move with company. Okay: protect 15. Good: protect 30. Really good: keep the handover even if you finish early.", "safety": "Stop and seek advice for new or worsening pain, dizziness, faintness, chest pain or unusual breathlessness."}'::jsonb,
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  'Continue your regular routine.',
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  '{"heavy_day": "If your support network feels thin right now, that''s worth naming, and worth changing where you can.", "a_little_low": "Support looking different now than it did a year ago is normal, even if it''s a little bittersweet.", "okay": "List who''s genuinely part of your current village.", "good": "Send a specific thank-you to someone who''s shown up for you recently.", "really_good": "Use today''s warmth to strengthen one relationship that matters to you."}'::jsonb,
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  'Write down how your support system has changed shape over this past year.',
  'Reach out to reconnect with someone who''s been quietly part of your village.',
  'Building and rebuilding your own village, again and again, is real, ongoing work.',
  'No specific ask this week.',
  null
),
(
  112,
  'postpartum',
  'A bigger project, if you want one',
  'You have a little more runway now. Use it if you want to.',
  'If you''ve been rebuilding a hobby or interest, consider whether it''s time for something a little bigger.',
  'By now, some mothers have enough capacity to consider a bigger personal project — resuming a longer-term goal, learning something new in depth, or restarting a creative pursuit more seriously. This week is an invitation, not a push, to consider that.',
  ARRAY['Genuine capacity for a bigger project than earlier in the year','No interest in taking anything further right now, and that''s fine too','A specific idea that''s been quietly growing','Some hesitation about committing time to something bigger','Curiosity about what you''re actually capable of now']::text[],
  '{"focus": "Prepare your body for a larger personal project without overloading the week.", "recovery_route": {"vaginal": "", "assisted_tear": "", "caesarean": "", "complications": ""}, "tiers": {"heavy": "Mobilise, breathe and identify the project''s first physical demand.", "steady": "Practise one supporting skill — walking, carrying, posture, stamina or strength.", "feeling_good": "Complete a balanced session that supports the project while keeping effort moderate."}, "mood_adjustment": "Heavy: planning counts. Low: practise five minutes. Okay: 15. Good: 30. Really good: progress the project or training, not both at once.", "safety": "Stop and seek advice for new or worsening pain, dizziness, faintness, chest pain or unusual breathlessness."}'::jsonb,
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  'Continue your regular routine.',
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  '{"heavy_day": "A bigger project can wait for an easier week — today, rest is enough.", "a_little_low": "Not feeling ready for something bigger yet doesn''t undo the progress you''ve already made.", "okay": "Name one bigger idea you''ve been quietly considering.", "good": "Spend today''s good energy exploring what that idea could actually look like.", "really_good": "Take a real, concrete first step toward something bigger."}'::jsonb,
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  'Write down one bigger goal you''d genuinely like to work toward.',
  'Ask your support person to help you protect time for a bigger commitment, if you decide to pursue one.',
  'Having the capacity to even consider something bigger is real, hard-won progress.',
  'No specific ask this week.',
  null
),
(
  113,
  'postpartum',
  'Trying something new',
  'A new activity, just because it sounds interesting.',
  'Try one new form of movement or activity, purely out of curiosity.',
  'With a settled routine behind you, this is a good week to try something new — a class, a sport, or an activity you''ve been curious about but haven''t gotten around to. No pressure for it to become a permanent habit.',
  ARRAY['Genuine curiosity about trying something different','A little nervousness about starting something new','Enjoyment in variety after months of a consistent routine','No particular interest in changing things up, and that''s fine too','Confidence that your existing routine will still be there either way']::text[],
  '{"focus": "Try novelty at beginner intensity.", "recovery_route": {"vaginal": "", "assisted_tear": "", "caesarean": "", "complications": ""}, "tiers": {"heavy": "Explore one new movement for five minutes with no pressure to master it.", "steady": "Take a beginner lesson, follow an introductory routine or practise one new skill.", "feeling_good": "Use 20 minutes for the new activity and 10 minutes of familiar cool-down or strength."}, "mood_adjustment": "Heavy: observe or learn. Low: sample briefly. Okay: 15 minutes. Good or really good: curiosity before intensity.", "safety": "Stop and seek advice for new or worsening pain, dizziness, faintness, chest pain or unusual breathlessness."}'::jsonb,
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  'Continue your regular routine.',
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  '{"heavy_day": "Trying something new can wait for an easier week — your established routine is enough today.", "a_little_low": "Nervousness about trying something unfamiliar is normal, not a reason to avoid it.", "okay": "Name one activity you''ve been curious about but haven''t tried.", "good": "Let curiosity guide today''s movement choice, if you''re up for it.", "really_good": "Actually try that new activity today, just to see how it feels."}'::jsonb,
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  'Note how trying something new felt, whether you loved it or not.',
  'Invite your support person to try something new alongside you, if that sounds fun.',
  'Staying curious about your own capability, this far in, is a genuinely good sign.',
  'No specific ask this week.',
  null
),
(
  114,
  'postpartum',
  'The days are long, the years are short',
  'A cliché because it''s true.',
  'Pause on the strange, familiar truth that time both drags and flies in this stage of parenting.',
  'Somewhere around now, many mothers feel the truth of the old saying — the individual days can genuinely drag, but the months and years are moving faster than expected. This week is a gentle pause on that feeling, without needing to do anything about it.',
  ARRAY['A strange mix of feeling both stretched-thin and nostalgic','Surprise at how much your toddler has changed already','Gratitude for the ordinary, unremarkable days as much as the big ones','A wish to remember more of the small daily moments','Genuine contentment with where things are right now']::text[],
  '{"focus": "Choose movement that helps you inhabit the day instead of rushing through it.", "recovery_route": {"vaginal": "", "assisted_tear": "", "caesarean": "", "complications": ""}, "tiers": {"heavy": "Walk slowly and notice five things around you.", "steady": "Take a phone-free 15-minute walk, alone or with your toddler.", "feeling_good": "Combine 20 minutes outdoors with 10 minutes of comfortable mobility."}, "mood_adjustment": "Heavy: pause. Low: step outside. Okay: 15 minutes. Good or really good: let attention — not pace — lead.", "safety": "Stop and seek advice for new or worsening pain, dizziness, faintness, chest pain or unusual breathlessness."}'::jsonb,
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  'Continue your regular routine.',
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  '{"heavy_day": "Even on a long, hard day, this stage is still passing quickly — both things are true at once.", "a_little_low": "Feeling nostalgic for a stage you''re still in is a common, bittersweet feeling.", "okay": "Note one small, ordinary moment from this week you want to remember.", "good": "Let today''s good moment feel worth holding onto.", "really_good": "Use today''s warmth to actually write down or photograph a small memory."}'::jsonb,
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  'Write down one small, ordinary thing about your toddler right now that you don''t want to forget.',
  'Share a small, meaningful moment from this week with someone who''ll appreciate it.',
  'Noticing the small, ordinary moments is its own quiet form of gratitude.',
  'No specific ask this week.',
  null
),
(
  115,
  'postpartum',
  'How are you, really',
  'An ongoing check-in — not only a first-year thing.',
  'An honest check-in on your mental health and wellbeing, well past the newborn stage.',
  'Maternal mental health matters at every stage, not only the first postpartum year. This week is a genuine, no-pressure check-in on how you''re actually doing — without needing to attribute any of it specifically to childbirth this far out, and without dismissing it either.',
  ARRAY['Steady, settled mood most days','New or ongoing low mood, anxiety or irritability that feels worth naming','A specific new stressor — a vigilant, mobile toddler, work demands, or something else entirely','Difficulty finding enjoyment in things that used to feel good','Or nothing concerning at all, which remains a fine, expected outcome']::text[],
  '{"focus": "Let movement support mental wellbeing while real distress receives real care.", "recovery_route": {"vaginal": "", "assisted_tear": "", "caesarean": "", "complications": ""}, "tiers": {"heavy": "Breathe slowly and move toward a person or place where support is available.", "steady": "Walk gently with company or in a familiar setting for 15 minutes.", "feeling_good": "Use an established routine only if it feels supportive and safe."}, "mood_adjustment": "Heavy: contact a person now. Low: move with support. Okay: gentle routine. Good or really good: do not use exercise to dismiss persistent symptoms.", "safety": "Stop and seek advice for new or worsening physical pain, and separately, seek support for any mental-health symptoms regardless of physical safety."}'::jsonb,
  'No specific dietary change is needed for this topic.',
  'Continue your regular routine.',
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  'Protecting rest continues to matter for mood, at every stage of parenting.',
  '{"heavy_day": "If today feels genuinely heavy — hopeless, numb or frightening — tell someone now and seek professional support.", "a_little_low": "Persistent low mood, at any stage of parenting, is worth raising with someone who can help.", "okay": "Rate the last month of your mood and stress levels honestly, not just today.", "good": "If you''re genuinely doing well, that''s real and worth naming.", "really_good": "Check in on someone else in your circle who might be struggling quietly."}'::jsonb,
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  'Write down, honestly, how you''ve actually been feeling over the past month.',
  'Tell someone you trust how you''ve really been feeling.',
  'Checking in on your own wellbeing, at any stage, is real and ongoing self-care.',
  'Ask specifically for a mood and wellbeing check if anything in this week''s list resonated — support is available at any stage of parenting, not only the first year.',
  null
),
(
  116,
  'postpartum',
  'Feeding a family, sustainably',
  'A meal plan that works for everyone, including you.',
  'Build a small, repeatable meal plan that genuinely works for your whole family.',
  'At this stage, feeding a toddler alongside the rest of the household can be genuinely time-consuming. This week is about finding a small set of repeatable, easy meals that work for everyone, so you''re not reinventing dinner every night.',
  ARRAY['A few meals that have become reliable go-tos','A wish for more variety without more effort','Genuine relief when a meal plan actually works smoothly','Occasional mealtime battles that are normal for this stage','Confidence in your household''s overall food rhythm']::text[],
  '{"focus": "Build movement into a sustainable family-food day.", "recovery_route": {"vaginal": "", "assisted_tear": "", "caesarean": "", "complications": ""}, "tiers": {"heavy": "Walk for five minutes while food cooks or after eating.", "steady": "Use a 10-minute walk and one five-minute strength round.", "feeling_good": "Combine a family walk with 10--15 minutes of personal strength or mobility."}, "mood_adjustment": "Heavy: choose the smallest option. Low: walk after one meal. Okay: 15. Good: 30. Really good: keep food and exercise free of compensation.", "safety": "Stop and seek advice for new or worsening pain, dizziness, faintness, chest pain or unusual breathlessness."}'::jsonb,
  'Build a short list of 4-5 meals that work for the whole family, including you, and rotate them without guilt.',
  'Continue your regular routine.',
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  '{"heavy_day": "A repeated, simple meal is still a real, nourishing meal — no need to reinvent dinner every night.", "a_little_low": "Mealtime battles with a toddler are common and exhausting, not a sign you''re doing anything wrong.", "okay": "Write down the meals that already work reliably for your household.", "good": "Let a smooth mealtime today feel like the real win it is.", "really_good": "Use today''s energy to plan a few meals ahead for a busier stretch."}'::jsonb,
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  'Note one meal your toddler has surprised you by loving.',
  'Share meal-planning duties with your household this week.',
  'A sustainable food rhythm for a whole family is real, ongoing planning and care.',
  'No specific ask this week.',
  null
),
(
  117,
  'postpartum',
  'Getting ready for eighteen months',
  'The next marker is close. Not much to prepare, just worth noticing.',
  'Begin noticing the approach of the eighteen-month mark, without needing to prepare for anything in particular.',
  'Eighteen months is a natural developmental marker for your toddler (the Monthly Chart covers what to expect there in detail), and a reasonable point for you to pause on your own rhythm too, before this part of the journey closes.',
  ARRAY['Anticipation for the coming milestone','A settled, confident sense of your current daily rhythm','Pride in how far both of you have come since the first birthday','Curiosity about what the next stretch will bring','No particular feelings at all, which is equally valid']::text[],
  '{"focus": "Take a deliberate lower-load week before the milestone.", "recovery_route": {"vaginal": "", "assisted_tear": "", "caesarean": "", "complications": ""}, "tiers": {"heavy": "Breathe, mobilise and stop at five minutes.", "steady": "Choose easy walking or one light strength circuit.", "feeling_good": "Use 20 minutes of comfortable movement and 10 minutes of recovery mobility."}, "mood_adjustment": "Heavy: rest. Low: 5--15 minutes. Okay: easy 15. Good or really good: keep effort moderate and preserve emotional energy.", "safety": "Stop and seek advice for new or worsening pain, dizziness, faintness, chest pain or unusual breathlessness."}'::jsonb,
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  'Continue your regular routine.',
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  '{"heavy_day": "Milestone anticipation can wait for an easier day — nothing needs marking today.", "a_little_low": "Feeling emotional about time passing is common and doesn''t need justifying.", "okay": "Note one thing you''re looking forward to in the coming months.", "good": "Let anticipation for the milestone feel genuinely exciting.", "really_good": "Use today''s energy for any small reflection or planning that matters to you."}'::jsonb,
  'Keep your established routine unless this week''s focus suggests a useful adjustment.',
  'Write down what you want to remember about this stretch, before the next marker arrives.',
  'Talk with your support person about how far you''ve both come since the first birthday.',
  'Nearly eighteen months of real, sustained care and growth — for both of you.',
  'No specific ask this week.',
  null
),
(
  118,
  'postpartum',
  'Eighteen months',
  'Another real marker, another real thank-you to yourself.',
  'Mark this real milestone — for your toddler, and for the rhythm you''ve sustained to get here.',
  'Eighteen months postpartum, six months into this "sustainable rhythms" phase — a genuine marker worth pausing on. This week closes Part 1 of this phase and looks ahead to the next stretch, built on everything sustained so far.',
  ARRAY['Genuine pride in a settled, sustained rhythm across half a year','Continued small adjustments as your toddler grows and changes','A body and mind that feel steady, most days','Confidence in your own pace and priorities','Real anticipation for the stretch ahead']::text[],
  '{"focus": "Celebrate the rhythm you built and decide what belongs in the next phase.", "recovery_route": {"vaginal": "", "assisted_tear": "", "caesarean": "", "complications": ""}, "tiers": {"heavy": "Choose the five minutes that supported you most in this half-year.", "steady": "Combine a favourite short walk with one favourite strength movement.", "feeling_good": "Create a personal celebration session from movements you genuinely enjoy — without testing or punishment."}, "mood_adjustment": "Heavy: honour the milestone with rest. Low: choose familiarity. Okay: 15 minutes. Good or really good: celebrate through movement only if it feels joyful.", "safety": "Stop and seek advice for new or worsening pain, dizziness, faintness, chest pain or unusual breathlessness."}'::jsonb,
  'No change tied to this week''s topic — keep the sustainable pattern you''ve built.',
  'Continue your regular routine.',
  'Whatever your feeding journey has looked like across this stretch, it''s been real, sustained care.',
  'Keep protecting rest as consistently as you have been.',
  '{"heavy_day": "Even in this milestone week, a hard day is just a hard day — it doesn''t diminish the stretch behind it.", "a_little_low": "Markers like this can stir up more than expected. You''re allowed to feel more than one thing today.", "okay": "Write an honest summary of this half-year — the hard parts and the real progress, together.", "good": "Let today''s steadiness be a genuine marker of everything you''ve sustained.", "really_good": "Mark eighteen months in whatever way feels true to you and your family."}'::jsonb,
  'Take stock of your full self-care routine as you move into the next stretch, keeping what''s genuinely worked.',
  'Write a letter to yourself about this half-year — everything you want to remember.',
  'Thank everyone who''s been part of this stretch, specifically and fully.',
  'Eighteen months of sustained, real care — for your toddler, and for yourself. Worth recognising fully.',
  'Confirm what ongoing care, if any, continues from here, and what to watch for as you move into the next stretch.',
  '[{"flag": "none", "note": "If pregnancy involved gestational diabetes, high blood pressure, pre-eclampsia, thyroid disease or another complication, keep the long-term screening and primary-care plan active. This care does not end at the first birthday."}]'::jsonb
);
