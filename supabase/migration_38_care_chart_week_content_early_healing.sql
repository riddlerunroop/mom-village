-- Care Chart week-by-week rebuild — Early healing (postpartum weeks 0-6),
-- 2026-07-29. Run migration_37 (schema extension) before this one.
--
-- First batch of the postpartum week-by-week build. Per Roop's explicit
-- instruction, 2026-07-29: mothers get a genuinely unique WEEKLY chart entry
-- for her full three-year tenure with the app (through the child's third
-- birthday) — never dropping to monthly cadence, regardless of how content
-- is authored/batched behind the scenes. Agreed 6-batch plan, matching the
-- existing carePhaseKey phase boundaries: Early healing (weeks 0-6, this
-- migration), Finding rhythm (7-12), Rebuilding (13-26), Settling into
-- strength (27-52), Sustainable rhythms (53-104), Your rhythm year three
-- (105-156) — all still to come.
--
-- Week-number convention: continues the same forward-count pregnancyWeekNumber
-- already uses for pregnancy (week 40 = full term / week of birth), so
-- postpartum week 0 = week_number 40, postpartum week 6 = week_number 46.
-- No collision with pregnancy's weeks 1-39. weekCalculator.ts's helper
-- (renamed journeyWeekNumber, formerly pregnancyWeekNumber, since it now
-- spans the whole pregnancy+postpartum journey) was extended to stop
-- returning null for postpartum weeks, so chart/page.tsx picks this content
-- up automatically wherever a row exists here, falling back to the old
-- phase-based system for weeks 47+ (not converted yet).
--
-- Process: Claude drafted a base version (grounded in ACOG Committee
-- Opinion 736 postpartum-contact timing, the three-stage lochia timeline,
-- baby-blues-vs-PPD timing, and postpartum preeclampsia's up-to-6-week
-- window including in mothers with normal pregnancy blood pressure — all
-- independently verified via WebSearch this session), Roop ran it past
-- another AI app, and sent back "Care Chart — Postpartum Early Healing —
-- Final Move and Reset Edition." Parsed programmatically from the pandoc-
-- converted docx (not hand-transcribed) into structured per-week fields,
-- round-trip validated through the same JSON-escaping path used for every
-- migration in this series — zero errors across all 17 move/reset/
-- condition_notes jsonb blocks.
--
-- The reviewed doc restructured the content shape further than any prior
-- trimester pass: it splits delivery-type guidance into its own "Choose your
-- recovery route" block (four named routes: vaginal birth / assisted birth
-- or significant tear / caesarean birth / complications-restrictions) rather
-- than folding it into Move's time-tiers, and adds two new standard fields
-- (Feeding comfort, Rest support) alongside the existing Nourish/Hydration
-- goal. Mapped as: recovery_route as a new key inside the `move` jsonb
-- blob (no schema change needed for jsonb), feeding_comfort/rest_support as
-- two new nullable text columns (migration_37).
--
-- Delivery-type display design: the app's onboarding/confirm-birth flow only
-- captures 'normal' or 'c_section' (no assisted-birth/tear or complications
-- option) — so there's no stored profile value to auto-select those other
-- two routes. Per this project's established honesty-over-fake-
-- personalization principle (same call made for the Wealth schemes filter
-- and the Budget Planner's insurance note), CareWeekContent.tsx shows the
-- one route matching her actual delivery_type prominently, and offers the
-- other two as self-select options rather than pretending to know which
-- applies.
--
-- Condition-specific notes populate the `condition_notes` jsonb column for
-- real for the first time (reserved on the table since migration_33,
-- unpopulated until now) — only on weeks 0, 1 and 5, matching where the
-- reviewed doc actually places them. Flag keys match the app's real
-- health_flags values from the care-quiz (thyroid / diabetes_gd / pcos /
-- high_bp); the doc's "major blood loss or anaemia" note (week 0) has no
-- matching onboarding-captured flag, so it's tagged flag: "none" — shown to
-- every mother, same as the flag-less "always shown" convention already
-- used in weekly_care_chart_content, since she self-selects by reading
-- whether it applies (the section is headed "If this applies to you").
--
-- Claims independently re-verified this session for content genuinely new
-- to this batch (not already checked in earlier Care Chart passes):
-- pre-existing diabetes insulin/medication needs dropping sharply (50-75%)
-- immediately after placental delivery, requiring individualized dose
-- reduction — confirmed via PMC "Management of Diabetes in the Intrapartum
-- and Postpartum Patient." Everything else in this batch (baby blues timing,
-- the "postpartum care is a process, not one six-week check" framing, the
-- 4-12-week GDM postpartum glucose-screening window, PCOS delayed-milk-
-- supply, postpartum preeclampsia's up-to-6-week window even with normal
-- pregnancy blood pressure, the CDC Hear Her-aligned urgent warning signs)
-- matches claims already independently verified earlier in this project.
--
-- The thyroid note here is deliberately general ("continue treatment,
-- confirm when labs are due, don't blame fatigue on new parenthood") and
-- makes no specific onset-timing claim — consistent with this project's
-- standing decision to defer the detailed postpartum-thyroiditis explainer
-- (4-8 month typical onset) to the Rebuilding batch, not yet built.

insert into care_chart_week_content (
  week_number, trimester, theme_title, mantra, priority, journey,
  what_you_may_notice, move, nourish, hydration_goal, feeding_comfort,
  rest_support, reset, care_for_yourself, your_corner, support_moment,
  celebrate_this_week, for_your_care_team, condition_notes
) values
(
  40,
  'postpartum',
  'Welcome to the fourth trimester',
  'Your only job is to recover, connect and receive care.',
  'Rest, manage pain, watch bleeding and establish the feeding plan that works for you.',
  'The first days after birth are a major physical and emotional transition. Bleeding, uterine cramps, swelling, soreness, exhaustion and intense emotions can coexist. Your recovery will reflect your birth, your health and the support around you — not a universal timeline.',
  ARRAY['Period-like bleeding that gradually changes over time','Cramping, especially during feeding or expressing','Perineal soreness, abdominal-incision discomfort or both','Swelling, sweating, afterpains and profound tiredness','Relief, joy, numbness, sadness, shock — or several feelings together']::text[],
  '{"focus": "Circulation, breathing and safe position changes — not exercise.", "recovery_route": {"vaginal": "Prioritise pain relief, comfortable positions, bladder care and short supported trips around the room.", "assisted_tear": "If you had an assisted birth or significant tear, use pressure-relieving positions and follow the wound, bowel and pelvic-floor plan given by your team.", "caesarean": "Use a log-roll to get out of bed, brace the incision when coughing and follow your discharge instructions for wound care, driving and lifting.", "complications": "After haemorrhage, hypertension, infection, clotting concerns, anaemia or another complication, your individual clinical plan overrides this chart."}, "tiers": {"heavy": "While supported in bed or a chair, take five relaxed breaths, complete 10 ankle pumps per side and gently open and close your hands.", "steady": "Create a recovery window: 5 minutes of breathing and ankle pumps, one assisted bathroom or room walk if advised, then rest in a pressure-free position.", "feeling_good": "Use three short care blocks across 30 minutes: breathing and ankle pumps, a supported position change or micro-walk, and a final comfort check — with rest between each. This is not continuous exercise."}, "mood_adjustment": "Overwhelmed or dizzy: stay supported and call for help. Very sore: choose breathing and circulation only. Steady: add one assisted walk. Feeling brighter: do not use the good hour to test your limits.", "safety": "Stop and seek advice for increased bleeding, new or worsening pain, pelvic heaviness or bulging, wound pulling, dizziness, faintness, chest pain, unusual breathlessness, calf pain or swelling, or feeling suddenly unwell."}'::jsonb,
  'Choose easy, regular food with protein, carbohydrate and fibre when tolerated. Recovery needs energy; this is not the moment to restrict food or pursue weight loss.',
  'Keep a drink within reach and take regular sips. Follow personalised fluid advice if you have blood-pressure, heart, kidney or other medical concerns.',
  'Whatever your feeding method — breast/chest feeding, expressing, formula or combination — comfort and adequate intake matter. Ask for hands-on assessment if feeding hurts, the baby is not transferring milk well or the plan feels unmanageable.',
  'Aim for protected rest opportunities, not perfect sleep. Let another adult handle messages, meals, washing or settling whenever possible.',
  '{"heavy_day": "If everything feels too much, say it plainly: \"I need someone with me.\" Reduce the next hour to pain relief, fluids, food, toileting and rest.", "a_little_low": "Tears and emotional flatness can happen after birth. You do not need to explain them beautifully — tell one safe person that today feels hard.", "okay": "Check four basics: pain, bleeding, bladder and food. Address the one that needs attention, then return to rest.", "good": "Let a good moment stay small. Notice your baby, take a photo or enjoy a warm drink without turning the energy into a task list.", "really_good": "Welcome the joy without pressure to perform gratitude. Ask someone else to protect this moment while you stay physically supported."}'::jsonb,
  'Use prescribed pain relief as directed. Keep the perineum or incision clean and dry according to discharge advice; ask before adding products, herbs or home remedies.',
  'Save one detail from the birth or first meeting — a sound, a sentence, a photo or a feeling. Skipping this is also allowed.',
  'Ask your support person to own the practical layer: medicines log, meals, water, visitors and contacting the care team.',
  'You gave birth. Rest is not a pause from recovery; it is part of it.',
  'Before discharge, confirm who to call day or night, your pain and bowel plan, wound care, feeding support, blood-pressure follow-up if needed, and the timing of your next contact.',
  '[{"flag": "high_bp", "note": "High blood pressure: take medicines and monitor at home exactly as instructed; severe headache, vision change, upper-abdominal pain, sudden swelling or breathlessness needs urgent care."}, {"flag": "none", "note": "Major blood loss or anaemia: follow the iron, blood-test and follow-up plan; worsening dizziness, faintness, racing heart or breathlessness needs prompt assessment."}]'::jsonb
),
(
  41,
  'postpartum',
  'One week in',
  'Healing does not need to look tidy.',
  'Protect recovery while feeding, bleeding and sleep patterns are still changing quickly.',
  'This week can feel physically crowded: milk may come in, breasts or chest may feel full, bleeding continues, and sleep arrives in fragments. "Baby blues" often begin in the first days and usually ease within about two weeks, but distress still deserves attention.',
  ARRAY['Breast or chest fullness, leaking or feeding changes','Ongoing bleeding that may fluctuate with activity','Perineal, pelvic or incision soreness','Constipation, haemorrhoids or discomfort passing urine','Tearfulness, irritability, worry or emotional sensitivity']::text[],
  '{"focus": "Reconnect breath, posture and circulation without chasing distance.", "recovery_route": {"vaginal": "Continue comfortable household movement in short doses; reduce activity if bleeding, pressure or pain increases.", "assisted_tear": "Prioritise bowel comfort and pressure-free rest. Do not force pelvic-floor squeezes if they cause pain, heaviness or difficulty relaxing.", "caesarean": "Continue short, frequent walks as tolerated, protect the incision and follow your individual lifting and wound-care restrictions.", "complications": "Keep monitoring and appointments exactly as advised; anaemia, blood-pressure problems, infection or other complications may change activity and fluid guidance."}, "tiers": {"heavy": "Take five slow breaths, then complete 10 ankle pumps, 5 gentle shoulder rolls each way and one comfortable position change.", "steady": "Walk gently inside for a few minutes, rest, then repeat if symptoms remain settled. Finish with relaxed breathing rather than stretching into discomfort.", "feeling_good": "Use a paced recovery window: two or three brief walks or standing periods separated by seated or lying rest. Total movement may be only 10--15 minutes."}, "mood_adjustment": "Heavy day: breathing and essential trips are enough. Low or sore: use one brief walk. Okay: repeat a short walk after rest. Good or really good: finish while you still feel capable.", "safety": "Stop and seek advice for increased bleeding, new or worsening pain, pelvic heaviness or bulging, wound pulling, dizziness, faintness, chest pain, unusual breathlessness, calf pain or swelling, or feeling suddenly unwell."}'::jsonb,
  'Build the easiest possible plate: dal-rice, khichdi, eggs and toast, curd and fruit, soup with bread, or another familiar combination. Include fibre and prescribed supplements.',
  'Drink regularly rather than tying fluid to every feed. Thirst, climate, medication and feeding method all affect needs; use urine colour and your care plan as practical guides.',
  'Fullness is common as milk production changes. Feed or express according to your plan and remove only enough milk for comfort if advised; repeated extra emptying can worsen oversupply. Fever or a hot, red, painful area needs prompt assessment.',
  'Choose one protected rest block each day while another adult is responsible for the baby. Even quiet lying down can reduce physical load when sleep does not come.',
  '{"heavy_day": "If you feel unable to cope, frightened by your thoughts or disconnected from reality, tell someone now and seek urgent help. You should not be left alone with this.", "a_little_low": "A difficult day does not predict your bond or your future. Ask for company, food or one uninterrupted rest block — whichever would lighten the next hour.", "okay": "Notice whether the basics are being met: pain relief, food, fluids, toileting and rest. Ask for help before one of them becomes urgent.", "good": "Use the steadier mood to connect without performing: hold your baby, step near a window or speak with someone who lets you be honest.", "really_good": "Enjoy the lift while keeping the day gentle. Your body can feel emotionally bright and still need substantial physical recovery."}'::jsonb,
  'For perineal or incision care, follow the plan provided at discharge. Strong nipple or breast/chest pain is a reason for skilled feeding assessment, not something you must endure.',
  'Record one thing that surprised you about the first week — beautiful, difficult or ordinary.',
  'Ask one person to coordinate visitors and updates so you do not have to repeat the story or host.',
  'You made it through seven enormous days. That is a milestone.',
  'Know the date of your early postpartum contact. Ask sooner for worsening pain, wound concerns, urinary or bowel difficulty, feeding problems or mood symptoms.',
  '[{"flag": "pcos", "note": "PCOS: some people experience delayed milk production, but feeding difficulty has many possible causes. Seek early skilled assessment and monitor the baby''s intake, urine, stools and weight rather than waiting on reassurance alone."}, {"flag": "high_bp", "note": "High blood pressure: continue home checks if prescribed and keep the early review arranged by your team — even if blood pressure was normal during pregnancy."}]'::jsonb
),
(
  42,
  'postpartum',
  'The quiet check-in',
  'You deserve care even when everyone is watching the baby.',
  'Notice what is improving, what is not, and where you need more support.',
  'Some discomfort may be easing, but recovery is rarely linear. Bleeding can continue, sleep debt grows and emotional symptoms become important to name. Baby blues should be moving toward improvement; persistent or worsening sadness, anxiety or loss of function deserves prompt care.',
  ARRAY['Bleeding becoming lighter overall, with possible small fluctuations','Tenderness or pulling around healing tissue','Pelvic heaviness, leaking or difficulty emptying bladder or bowel','Ongoing feeding adjustments','A need for more support than you expected']::text[],
  '{"focus": "Build tolerance gently and use symptoms as feedback.", "recovery_route": {"vaginal": "Increase ordinary walking gradually only while pain, bleeding and pelvic pressure remain settled.", "assisted_tear": "Continue pressure management and bowel care; seek review for worsening pain, odour, wound separation or difficulty controlling urine or stool.", "caesarean": "Let comfort guide short walks, but continue the incision and lifting plan from your surgical team.", "complications": "Use clinician-led targets for movement, nutrition, blood pressure, medication and follow-up."}, "tiers": {"heavy": "Take a comfortable indoor walk, or practise five minutes of breathing, ankle pumps and supported standing if walking feels like too much.", "steady": "Alternate 3--5 minutes of easy walking with seated rest. Keep steps short and posture relaxed.", "feeling_good": "Spread 15--20 minutes of gentle movement across a 30-minute window, resting at least once. Stop if bleeding, pain, dizziness or heaviness increases."}, "mood_adjustment": "Heavy: choose circulation in bed or a chair. Low: use daylight and one short walk. Okay: try 15 minutes. Good: add one interval. Really good: keep the same easy effort rather than testing speed.", "safety": "Stop and seek advice for increased bleeding, new or worsening pain, pelvic heaviness or bulging, wound pulling, dizziness, faintness, chest pain, unusual breathlessness, calf pain or swelling, or feeling suddenly unwell."}'::jsonb,
  'Aim for regular meals rather than perfect meals. Include protein and iron-rich foods, especially if you had significant blood loss or were advised to treat anaemia.',
  'Keep a refillable bottle in your main resting area. Constipation, heat and lactation may increase needs; personalised restrictions still come first.',
  'A feeding plan can change. Pain, poor transfer, low output, excessive sleepiness, dehydration concerns or anxiety about intake are reasons to contact the baby''s clinician or a qualified feeding professional.',
  'Trade one household expectation for rest. A clean kitchen is optional; recovery is not.',
  '{"heavy_day": "If you feel hopeless, unsafe or unable to care for yourself, tell someone immediately and contact urgent professional support. You do not have to wait for a scheduled visit.", "a_little_low": "Say what is true without minimising it: \"I am two weeks postpartum and I need more help.\" Choose one person and one specific request.", "okay": "Compare today with three days ago, not with your pre-birth self. Note one improvement and one symptom that needs attention.", "good": "Use the steadier mood to arrange support for the coming week before the need becomes urgent.", "really_good": "Let yourself enjoy a good day without calling recovery complete. Keep rest and pain relief in the plan."}'::jsonb,
  'Use comfortable underwear and clothing that does not rub healing tissue. Continue gentle hygiene; scented washes and unreviewed wound products can irritate.',
  'Take a voice note about what support has helped most. It can guide future weeks better than a perfect journal entry.',
  'Ask a support person to check on you directly — not only ask about the baby.',
  'You noticed your own needs. That is an essential postpartum skill.',
  'Your postpartum care should be ongoing, not saved for one "six-week check." Contact your team now for symptoms, questions or recovery barriers.',
  null
),
(
  43,
  'postpartum',
  'Finding a rhythm — not a routine',
  'A rhythm can flex; a rigid routine can wait.',
  'Protect energy while gently expanding daily movement and support.',
  'You may be doing more while sleeping less. That combination can hide fatigue until it becomes overwhelming. Healing tissue may still feel tender, and pelvic-floor or abdominal symptoms can become clearer as activity increases.',
  ARRAY['Greater walking tolerance — or a need to stay at the same level','Pelvic pressure, leaking, backache or abdominal pulling','Feeding becoming easier, changing or still demanding','Cumulative tiredness and reduced concentration','A desire for ordinary life alongside a need for recovery']::text[],
  '{"focus": "Practise repeatable, symptom-settled movement rather than a workout.", "recovery_route": {"vaginal": "Build time gradually, not distance for its own sake. Increased bleeding, pain or pelvic heaviness means scale back and seek advice if it persists.", "assisted_tear": "Use short steps, supported sitting and symptom-free ranges. Pelvic-floor physiotherapy may help pain, pressure, bladder or bowel symptoms.", "caesarean": "Continue gentle walking and easy posture work while protecting the incision and following surgical restrictions.", "complications": "Let your care team define progression; a slower route is not a failure."}, "tiers": {"heavy": "Walk at home for 3 minutes, then take 2 minutes for shoulder rolls and relaxed rib breathing.", "steady": "Walk gently for 8--10 minutes. Add 5 minutes of supported posture resets and ankle mobility.", "feeling_good": "Complete two 8--10-minute easy walks with a seated rest between them. Use the remaining time for breathing and recovery."}, "mood_adjustment": "Heavy: five minutes or essential movement only. Low: choose fresh air if safe. Okay: one 15-minute session. Good: two short walks. Really good: add consistency, not intensity.", "safety": "Stop and seek advice for increased bleeding, new or worsening pain, pelvic heaviness or bulging, wound pulling, dizziness, faintness, chest pain, unusual breathlessness, calf pain or swelling, or feeling suddenly unwell."}'::jsonb,
  'Create one reliable meal you can eat one-handed or reheat safely. Keep snacks where you actually feed, rest or express — not where an ideal routine says they belong.',
  'Pair drinks with existing anchors such as medicines, meals and settling into your feeding or resting space.',
  'Review comfort and sustainability, not only the baby''s intake. Your feeding method should not require untreated pain, unsafe sleep or complete depletion.',
  'Use a "handover sentence": what the baby needs, what you need, and when you are taking over again. Then step away fully for the agreed rest period.',
  '{"heavy_day": "When sleep loss makes everything feel impossible, do not make major decisions alone. Hand over care, eat or drink, and contact support if distress is escalating.", "a_little_low": "You are not failing because the days blur. Choose one grounding marker: morning light, a shower, fresh clothes or a ten-minute call.", "okay": "Identify the most draining repeated task. Can it be shortened, shared, postponed or done less often?", "good": "Use the steadier mood to create one small rhythm that supports you — breakfast, medication, daylight or a protected rest block.", "really_good": "Spend some energy on identity, not administration. Listen to music, speak to a friend or do something that belongs to you."}'::jsonb,
  'Check posture during feeding, holding and phone use. Bring the baby to you with pillows or support rather than repeatedly curling your body toward the baby.',
  'Choose one ordinary moment to photograph. Postpartum memories do not need to be polished to matter.',
  'Ask someone to take a complete shift or task, including planning and cleanup — not just "help" while you supervise.',
  'You are learning what this new life requires. Learning is progress.',
  'Ask about pelvic-floor or rehabilitation referral for pain, pressure, leaking, bowel symptoms, scar concerns or fear of movement.',
  null
),
(
  44,
  'postpartum',
  'One month, still healing',
  'Progress is real even when "normal" still feels far away.',
  'Support the core and pelvic floor without rushing strength or impact.',
  'At one month, you may look more recovered than you feel. Sleep, feeding, scars, pelvic-floor symptoms and identity shifts can still take up substantial space. This is a useful point to review function rather than compare bodies.',
  ARRAY['Improving stamina with occasional setbacks','Scar sensitivity, numbness, pulling or perineal tenderness','Leaking, pressure, constipation or back discomfort','More confidence with some tasks and less with others','Questions about exercise, sex, driving or work']::text[],
  '{"focus": "Coordinate breathing, deep abdominal support and everyday movement.", "recovery_route": {"vaginal": "If symptoms are settled, continue gradual walking and add gentle breath--pelvic-floor coordination without straining.", "assisted_tear": "Pain-free relaxation matters as much as contraction. Significant tears deserve individual follow-up before loaded exercise.", "caesarean": "Continue mobility and walking; do not treat a closed skin incision as complete internal healing.", "complications": "Return-to-activity decisions should include the condition that complicated pregnancy or birth, not only the number of weeks postpartum."}, "tiers": {"heavy": "Take five relaxed breaths, gently lengthening the exhale. Add 6 comfortable pelvic tilts lying, seated or standing against a wall.", "steady": "Walk for 8 minutes, then practise 5 minutes of breathing, supported posture and 5 slow sit-to-stands if these are pain-free.", "feeling_good": "Walk easily for 15--20 minutes, then add one gentle round of 6--8 sit-to-stands, 8 heel raises and breathing-led pelvic tilts. Rest as needed."}, "mood_adjustment": "Heavy: breathing and posture only. Low: one familiar walk. Okay: add sit-to-stands. Good: use the full 30-minute window. Really good: remain low-impact and symptom-led.", "safety": "Stop and seek advice for increased bleeding, new or worsening pain, pelvic heaviness or bulging, wound pulling, dizziness, faintness, chest pain, unusual breathlessness, calf pain or swelling, or feeling suddenly unwell."}'::jsonb,
  'Keep recovery foods practical: protein at meals, iron-rich foods where advised, fibre for bowel comfort and enough total food for healing and feeding demands.',
  'Drink regularly and increase fluids gradually in heat or with activity. Seek advice if extreme thirst, headache, swelling or urinary symptoms appear.',
  'Feeding discomfort should be improving, not simply becoming familiar. Seek skilled help for persistent nipple pain, breast/chest inflammation, supply concerns or a plan that is harming your wellbeing.',
  'Protect one daily period without baby care, screens or household management — even if it is brief.',
  '{"heavy_day": "If the month mark brings grief, fear or traumatic memories, you are not ungrateful. Tell a trusted person and ask your care team about birth-trauma or mental-health support.", "a_little_low": "Milestones can create pressure to be \"better.\" Replace that question with: What still needs care?", "okay": "Complete a function check: walking, toileting, sleep, feeding comfort, pain and mood. Write down anything limiting daily life.", "good": "Acknowledge one capacity that has returned and one boundary you still need to keep.", "really_good": "Mark one month in a way that honours both effort and complexity — a favourite meal, a photo or a quiet moment."}'::jsonb,
  'Do a comfort audit of bras, pads, underwear, footwear, sleep setup and feeding posture. Change one source of repeated irritation.',
  'Record one thing your postpartum self knows now that your pregnant self did not.',
  'Have a short check-in: What should support look like next month, and who will provide it?',
  'One month is not a deadline. It is evidence of everything you have carried.',
  'Bring persistent pain, leaking, heaviness, wound concerns, mood symptoms and feeding difficulties to your care team; these are care needs, not inconveniences.',
  null
),
(
  45,
  'postpartum',
  'Healing continues',
  'Honesty is more useful than a "fine" answer.',
  'Prepare for postpartum review by noticing function, symptoms and emotional wellbeing.',
  'Many systems still need attention after birth: sleep, mood, pelvic floor, abdominal wall, scars, blood pressure, contraception, feeding, relationships and return to work or exercise. Your visit should be comprehensive and personalised.',
  ARRAY['Questions about whether symptoms are expected','A stronger wish to resume exercise or sex','Ongoing scar, pelvic-floor or bowel symptoms','Changing bleeding or a possible return of menstruation','Anxiety about the upcoming review or being "cleared"']::text[],
  '{"focus": "Gather information from movement instead of trying to pass a test.", "recovery_route": {"vaginal": "Continue symptom-settled walking and gentle strength. Leaking, bulging, pain or increased bleeding are reasons to pause progression.", "assisted_tear": "Write down bowel, bladder, pain, sex and pelvic-pressure concerns so the visit addresses them directly.", "caesarean": "Note incision symptoms, numbness, pulling and functional limits. Ask about lifting, driving, scar care and graded exercise.", "complications": "Bring medication, blood-pressure, anaemia, glucose, infection or specialist follow-up questions; postpartum complications can need care beyond this visit."}, "tiers": {"heavy": "Practise five minutes of breathing, posture and 6 slow sit-to-stands if comfortable.", "steady": "Walk for 10 minutes, then complete 5 minutes of heel raises, wall push-ups and breathing-led pelvic tilts.", "feeling_good": "Use 15--20 minutes of easy walking plus one gentle round of 8 sit-to-stands, 8 wall push-ups, 10 heel raises and comfortable mobility."}, "mood_adjustment": "Heavy: rest and write down symptoms. Low: choose an easy route. Okay: use 15 minutes. Good: add gentle strength. Really good: keep impact and loading out until readiness is individually assessed.", "safety": "Stop and seek advice for increased bleeding, new or worsening pain, pelvic heaviness or bulging, wound pulling, dizziness, faintness, chest pain, unusual breathlessness, calf pain or swelling, or feeling suddenly unwell."}'::jsonb,
  'Prepare for the visit with the facts that affect nutrition: appetite, food access, constipation, blood loss, supplements, cultural preferences and feeding demands.',
  'Keep fluids steady and mention persistent thirst, urinary burning, urgency, very dark urine or difficulty emptying your bladder.',
  'Write down what is working and what is not — comfort, time, sleep, supply, expression, formula preparation or combination feeding. Your wellbeing belongs in the feeding review.',
  'Do not arrive at the visit with a polished answer. Track one typical day of sleep and support so the clinician sees the real load.',
  '{"heavy_day": "If you fear being dismissed, write the exact symptom, how often it happens and what it stops you doing. Bring a support person if that helps you speak freely.", "a_little_low": "You do not have to earn care by being worse. Ongoing distress, pain or exhaustion is enough reason to ask for help.", "okay": "Make a short visit list: body, mood, feeding, sleep, contraception, movement and follow-up. Circle the top three.", "good": "Use the steadier mood to arrange transport, childcare, records or a support person so practical barriers do not silence questions.", "really_good": "Imagine the visit going well: you speak honestly, receive clear options and leave knowing the next step. Write down what would make that possible."}'::jsonb,
  'Prepare your medicine list and questions about wound or scar care, pelvic health, headaches, blood pressure, sex, dryness, contraception and return to work.',
  'Write one sentence beginning: "At my visit, I need someone to understand..."',
  'Ask your support person what they have noticed about your sleep, mood and function; their observations may help, but your account remains central.',
  'Preparing honestly is an act of self-advocacy.',
  'Postpartum care is a process. Ask what follow-up comes after this visit and who owns each referral or unresolved symptom.',
  '[{"flag": "diabetes_gd", "note": "Gestational diabetes: arrange the recommended postpartum glucose test in the 4--12-week window and ask who will review the result and plan ongoing screening."}, {"flag": "diabetes_gd", "note": "Pre-existing diabetes: insulin or medicine needs can change quickly after birth; follow the individual monitoring and medication plan from your diabetes team."}, {"flag": "thyroid", "note": "Known thyroid disease: continue prescribed treatment unless your clinician changes it and confirm when thyroid blood tests are due; fatigue and mood symptoms should not automatically be blamed on new parenthood."}]'::jsonb
),
(
  46,
  'postpartum',
  'A checkpoint — not a finish line',
  'Six weeks is information, not a deadline.',
  'Use assessment to plan a gradual next phase of recovery.',
  'Six weeks is often treated as a finish line, but tissues, strength, sleep and emotional recovery continue far beyond it. A reassuring examination does not automatically mean every body is ready for impact, heavy lifting, intercourse or pre-pregnancy training.',
  ARRAY['Improved function alongside areas that still feel vulnerable','Questions about running, gym work, sex, driving or work','Leaking, heaviness, pain, weakness or abdominal doming','Changing mood, identity and relationship needs','Pride in progress mixed with impatience or grief']::text[],
  '{"focus": "Begin the next phase from today''s function — not from a calendar-based \"clearance.\"", "recovery_route": {"vaginal": "Progress from walking and supported strength only if bleeding, pain, pressure and bladder or bowel symptoms remain settled.", "assisted_tear": "Ask whether healing, pelvic-floor function and scar sensitivity need specialist assessment before impact, loaded strength or penetrative sex.", "caesarean": "Discuss incision and abdominal recovery, lifting, driving and graded strengthening; internal healing continues after the skin closes.", "complications": "Confirm the longer-term plan for blood pressure, glucose, anaemia, mental health, infection, thrombosis or other pregnancy and birth complications."}, "tiers": {"heavy": "Complete five minutes of breathing, posture, pelvic-floor relaxation and 6 slow sit-to-stands if comfortable.", "steady": "Walk for 8 minutes, then do one gentle round of 8 sit-to-stands, 8 wall push-ups and 10 heel raises.", "feeling_good": "Warm up with 10 minutes of easy walking. Add two gentle rounds of sit-to-stands, wall push-ups and heel raises, then cool down. Keep effort conversational."}, "mood_adjustment": "Heavy: keep movement restorative. Low: repeat a familiar option. Okay: use 15 minutes. Good: try 30 minutes. Really good: increase only one variable — time, repetitions or resistance — and reassess symptoms later that day and the next.", "safety": "Stop and seek advice for increased bleeding, new or worsening pain, pelvic heaviness or bulging, wound pulling, dizziness, faintness, chest pain, unusual breathlessness, calf pain or swelling, or feeling suddenly unwell."}'::jsonb,
  'Keep fuelling recovery and any feeding demands. There is no medical need to begin restrictive dieting at this milestone; ask for individual nutrition support if weight, appetite or body image is causing distress.',
  'Continue a regular routine and drink around activity. Personalised medical advice takes priority over generic targets.',
  'Review whether the current feeding plan is physically and emotionally sustainable. Changes in method are care decisions, not measures of devotion.',
  'Recovery plans must account for sleep. A programme that ignores severe sleep deprivation is not personalised enough.',
  '{"heavy_day": "If six weeks arrives and you still feel broken, frightened or unlike yourself, say so directly. This milestone does not cancel your need for treatment and support.", "a_little_low": "Comparison becomes loud around \"clearance.\" Return to your own evidence: symptoms, function, sleep and support — not another person''s timeline.", "okay": "Choose one next-phase goal and one symptom to monitor. Keep the plan small enough to learn from.", "good": "Celebrate what has returned, then ask what foundation will make the next step safer: rest, pelvic-floor care, strength or practical support.", "really_good": "Enjoy the sense of possibility without jumping levels. A gradual return protects the progress you have made."}'::jsonb,
  'Discuss contraception, sexual comfort, pelvic health, scar symptoms, mental health, sleep, feeding, vaccinations or tests, and long-term follow-up after pregnancy complications.',
  'Record a six-week message to yourself: what you survived, what helped and what you want next.',
  'Agree on how practical support will continue after the visible "newborn help" begins to fade.',
  'Six weeks of recovery deserves recognition — and more time.',
  'Ask for a specific graded plan. Pain, leaking, pelvic heaviness or bulging, increased bleeding, dizziness, breathlessness or worsening symptoms need assessment rather than exercise progression.',
  null
);
