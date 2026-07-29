-- Care Chart week-by-week rebuild — Rebuilding (postpartum weeks 13-26),
-- 2026-07-29. Third batch of the postpartum week-by-week build (Early
-- healing weeks 0-6 = migrations 37-38; Finding rhythm weeks 7-12 =
-- migration 39). No schema changes needed this batch — reuses every
-- column/shape introduced for Early healing (feeding_comfort, rest_support,
-- move.recovery_route, condition_notes) as-is.
--
-- Week-number convention: same forward count as every prior migration in
-- this series — postpartum week 13 = week_number 53, week 26 = week_number
-- 66 (40 + week, matching week 40 = full term/birth).
--
-- Process: Claude drafted a full 14-week base version first (grounded in
-- ACOG postpartum-exercise guidance, this project's own established
-- diastasis-recti function-over-finger-width consensus from the Finding
-- rhythm batch, plus fresh WebSearch verification this session on
-- postpartum-thyroiditis timing/symptoms and graded postpartum
-- return-to-running guidance). Roop ran it past another AI app and sent
-- back "Care Chart — Postpartum Rebuilding — Final Move and Reset
-- Edition." Parsed programmatically from the pandoc-converted docx (not
-- hand-transcribed) using the same parser built for Early healing/Finding
-- rhythm — doc structure is identical, though this conversion needed two
-- small parser fixes: (1) this docx's pandoc conversion escaped
-- apostrophes/quotes/underscores with a leading backslash far more
-- extensively than prior docs (270+ instances vs. ~12-14 in earlier
-- batches, which fell outside any extracted field and never surfaced) —
-- fixed by stripping backslash-escapes in the parser's clean() step before
-- any other processing, verified zero literal backslashes remain in any
-- extracted field; (2) the mantra quote-marker pattern appeared in this
-- doc as `*\"quote\"*` rather than the prior `*"quote"*` ordering — fixed
-- by widening the regex to accept the escaped-quote position. Round-trip
-- validated via a proper character-by-character state-machine SQL-literal
-- parser (not the faster naive regex, which produced 3 false-positive
-- "errors" on this file's more complex embedded-quote strings — confirmed
-- false positives by re-parsing with the state-machine approach: 29 jsonb
-- blocks, zero real errors).
--
-- The reviewed doc closely matched Claude's own draft in structure and
-- most content; the two areas verified fresh because they were genuinely
-- new or more specific than the base draft:
--
-- Week 19's postpartum-thyroiditis explainer — the doc's own claims
-- (biphasic course in ~two-thirds of cases: thyrotoxic phase 1-4 months
-- postpartum with anxiety/palpitations/insomnia/irritability, hypothyroid
-- phase 4-8 months lasting up to 9-12 months with fatigue/weight
-- gain/constipation/dry skin/low mood/poor exercise tolerance; can occur
-- with no prior thyroid history; most regain normal function within 12-18
-- months, ~20% remain hypothyroid longer term) match what was
-- independently verified this session against the American Thyroid
-- Association and NCBI/StatPearls sources. Confirmed the doc kept this
-- content general-audience and NOT gated behind the `thyroid` health_flag
-- — the same design decision flagged in Claude's own base draft, since
-- postpartum thyroiditis commonly arises with no prior thyroid history and
-- flag-gating would hide it from exactly the mothers who most need it. The
-- doc's own "Editorial implementation notes" section confirms this was a
-- deliberate, reviewed choice, not an oversight.
--
-- Weeks 14-15's running-readiness self-check and walk-run interval
-- content — the doc's specific protocol (10 heel raises, 8 sit-to-stands,
-- 8 step taps per side, 10-second single-leg balance per side as the
-- readiness battery; 8-minute warm-up + four 30-second jog/90-second walk
-- intervals as the walk-run introduction, gated behind "a qualified
-- clinician or pelvic-health professional has supported your return")
-- differs in specifics from Claude's own base draft (which used a
-- shorter, less clinically-sourced battery) but was independently verified
-- this session against the 2019 "Returning to Running Postnatal"
-- physiotherapy guideline and corroborating sources — the doc's battery is
-- a reasonable, slightly more conservative subset of that real,
-- established protocol (full guideline uses 20 reps per strength exercise
-- and a longer impact-tolerance battery; the doc's shorter version keeps
-- the same exercise types and the same jog-30-seconds/walk-60-90-seconds
-- progression pattern). Both weeks correctly keep running framed as
-- optional throughout, consistent with this project's standing "always
-- offered, never pushed" Move philosophy — confirmed explicitly in the
-- doc's own editorial notes.
--
-- Condition notes: only Week 26 carries them in this batch (matching where
-- the reviewed doc places them) — diabetes_gd (confirm postpartum glucose
-- testing was completed, same 4-12 week ACOG-aligned reminder already
-- established in Early healing/Finding rhythm), high_bp (BP follow-up and
-- longer-term cardiovascular risk discussion), and a general thyroid/
-- autoimmune note (continue prescribed treatment, use clinician's testing
-- schedule, don't self-adjust medicine from symptoms alone — distinct from
-- and complementary to Week 19's general-audience thyroiditis education,
-- since this one is specifically for mothers who already have a known
-- thyroid or autoimmune diagnosis). No PCOS note this batch — not present
-- in the reviewed doc for these weeks; PCOS condition notes already exist
-- from Early healing (week 0) and Finding rhythm (week 10).
--
-- EDITORIAL LOCALISATION NOTE (carried from the doc itself): emergency
-- numbers, thyroid-testing access, postpartum contact schedules, and
-- terminology require review for each launch country — noted for
-- awareness, not acted on here (matches this project's existing India-first
-- content elsewhere).
insert into care_chart_week_content (
  week_number, trimester, theme_title, mantra, priority, journey,
  what_you_may_notice, move, nourish, hydration_goal, feeding_comfort,
  rest_support, reset, care_for_yourself, your_corner, support_moment,
  celebrate_this_week, for_your_care_team, condition_notes
) values
(
  53,
  'postpartum',
  'Three months, moving forward',
  'The next stretch is about capacity, not a countdown.',
  'Carry the strength foundation from the last phase into slightly more structured movement.',
  'If low-impact movement has felt settled, this is a reasonable week to add light resistance to your existing strength routine — a resistance band, a filled water bottle, or a light household object for supported carries. If anything still feels unsettled, there''s no rush; the foundation matters more than the timeline.',
  ARRAY['Real, cumulative strength gains since early postpartum','Occasional fatigue that doesn''t always match your sleep that night','A body that feels more capable but still not quite "the same"','Feeding, sleep and routine settling into something more predictable','Renewed interest in activities that felt impossible a month ago']::text[],
  '{"focus": "Add light resistance to your existing strength pattern.", "recovery_route": {"vaginal": "Add light resistance only while your existing bodyweight routine stays symptom-free.", "assisted_tear": "Continue pelvic-floor-focused work; ask specifically before adding resistance if symptoms haven''t fully settled.", "caesarean": "Confirm with your surgical team before adding resistance work that loads the abdomen directly.", "complications": "Let your individual clinical plan continue to set the pace for any new loading."}, "tiers": {"heavy": "Five minutes of breathing, pelvic tilts and 8 bodyweight squats.", "steady": "Walk for 8 minutes, then one round of 10 squats, 10 wall push-ups and 10 heel raises.", "feeling_good": "Walk for 15 minutes, then two rounds of 10 squats (with light resistance if you have it), 10 wall push-ups and 10 heel raises."}, "mood_adjustment": "Heavy: breathing and pelvic tilts only. Low: an easy walk. Okay: the 15-minute option. Good or really good: the full 30 minutes, adding resistance only if last week felt fully symptom-free.", "safety": "Stop and seek advice for new or worsening pain, pelvic heaviness or bulging, leaking, dizziness, faintness, chest pain, unusual breathlessness, calf pain or swelling, or feeling suddenly unwell."}'::jsonb,
  'Keep meals regular with protein at each one. Strength work needs fuel; this isn''t the phase to under-eat while asking more of your body.',
  'Keep a drink within reach through the day, adjusting for activity and climate.',
  'Whatever your feeding method now, comfort and sustainability still matter. A plan that''s quietly become unsustainable deserves a second look, not silent endurance.',
  'Adding movement back into your week doesn''t reduce the need for real rest — if anything, it increases it for a while.',
  '{"heavy_day": "Three months in and still struggling is real, not a failure to keep up. Say so today, to someone who can help.", "a_little_low": "Progress isn''t always visible week to week. Look back a full month instead of just at today.", "okay": "Notice one thing that''s become automatic that used to take real effort.", "good": "Let a good day be simple — no need to prove anything with it.", "really_good": "Enjoy feeling capable without treating it as a new baseline you must maintain every day."}'::jsonb,
  'If your skin routine has stayed simple through early postpartum, this is a reasonable week to build it out further if you want to — daily SPF stays the constant.',
  'Note one thing about this stage of your baby that surprises you.',
  'Ask your support person what they''ve noticed about your energy lately — an outside view can be useful.',
  'Three months of real, sustained recovery work. That''s substantial.',
  'Mention any fatigue, mood change or physical symptom that feels disproportionate to your sleep and workload — worth a first flag now, even if it turns out to be nothing.',
  null
),
(
  54,
  'postpartum',
  'Readiness, not just weeks',
  'A date on the calendar isn''t a fitness test.',
  'If running or higher-impact activity is a goal, check real functional readiness — not just how many weeks have passed.',
  'Time alone doesn''t prepare your body for impact. A short set of functional checks gives a much better picture than a calendar date. This is entirely optional — many mothers have no interest in running, and that''s a completely fine choice too.',
  ARRAY['Curiosity about returning to running or higher-impact exercise, or no interest at all — both are common','Continued gains in walking tolerance and everyday strength','Occasional pelvic or abdominal symptoms with harder efforts','A wish for clearer benchmarks instead of vague reassurance','Steady improvement in day-to-day stamina']::text[],
  '{"focus": "Optional pre-impact foundation check — not a pass/fail test or medical clearance.", "recovery_route": {"vaginal": "If walking 30 minutes continuously feels fully comfortable, this week''s readiness checks are worth trying.", "assisted_tear": "Confirm pelvic-floor readiness with a specialist before attempting impact-readiness checks.", "caesarean": "Confirm abdominal-loading readiness with your surgical or rehabilitation team before impact-readiness checks.", "complications": "Individual clearance should come before any impact-readiness self-check."}, "tiers": {"heavy": "Take five relaxed breaths, then complete 8 sit-to-stands and 8 heel raises using support as needed. Skip the check.", "steady": "Walk for 10 minutes, then try 8 controlled step taps per side and a 10-second supported single-leg balance per side.", "feeling_good": "Walk for 15 minutes, then complete one controlled round of 10 heel raises, 8 sit-to-stands, 8 step taps per side and 10 seconds of supported single-leg balance per side. Note pain, leaking, heaviness, doming, breath-holding or next-day symptoms."}, "mood_adjustment": "Heavy: keep movement restorative. Low: walk only. Okay: use 15 minutes. Good or really good: explore the check only if impact is actually your goal.", "safety": "This check cannot clear you to run. Symptoms, marked side-to-side difference or poor control are useful reasons to continue foundational work and seek pelvic-health or rehabilitation guidance."}'::jsonb,
  'Keep meals regular and include enough carbohydrate and protein to support increasing activity.',
  'Continue regular fluids and drink around exercise and warm weather.',
  'A supportive bra and feeding or expressing before impact may improve comfort for some lactating mothers.',
  'New goals can create pressure. Keep at least one lower-load day between harder sessions.',
  '{"heavy_day": "If even thinking about \"readiness\" feels like pressure today, skip it entirely. There''s no deadline here.", "a_little_low": "If the readiness check didn''t go the way you hoped, that''s information, not a verdict on your recovery.", "okay": "Decide honestly whether running is even something you want — wanting it and not wanting it are equally valid.", "good": "Notice how much more your body can tell you now than it could two months ago.", "really_good": "If today''s check went well, let that be genuinely satisfying without immediately planning next week''s mileage."}'::jsonb,
  'Comfortable, supportive footwear matters more than people expect when returning to any higher-impact movement — worth checking before you need it.',
  'Write down what "getting my body back" actually means to you — it might be different from what you expected before birth.',
  'If you''re excited about a movement goal, tell your support person — sharing it can turn it into something the household plans around, not squeezes in.',
  'Checking your body''s real readiness, rather than guessing, is a form of self-respect.',
  'If any readiness check brought up pain, leaking or heaviness, mention it — a pelvic-health referral at this stage is common and useful, not a setback.',
  null
),
(
  55,
  'postpartum',
  'Walk-run, if that''s your goal',
  'Building tolerance beats chasing distance.',
  'For mothers pursuing running, begin a genuinely gradual walk-run introduction.',
  'If last week''s readiness checks felt comfortable and running is something you want, a walk-run interval approach is the standard, evidence-based way in — never straight into a full run. If running isn''t your goal, this week''s Move options work just as well as pure walking and strength.',
  ARRAY['Excitement or nervousness about trying intervals','No interest in running at all, and that''s equally fine','New muscle awareness in the days after trying something different','Continued steady gains in daily strength and stamina','Pelvic or abdominal symptoms that flag when you''ve done too much, too soon']::text[],
  '{"focus": "Optional impact introduction only after individual readiness assessment; walking and strength remain complete alternatives.", "recovery_route": {"vaginal": "Begin walk-run intervals only if last week''s readiness checks were fully symptom-free.", "assisted_tear": "Hold off on running until a pelvic-health professional has specifically cleared impact activity.", "caesarean": "Hold off on running until your surgical or rehabilitation team has specifically cleared impact activity.", "complications": "Let your individual clinical plan determine timing for any impact activity."}, "tiers": {"heavy": "Walk easily for 5 minutes or choose breathing and mobility. No impact today.", "steady": "Walk for 10 minutes, then complete 5 minutes of step taps, heel raises and easy balance work.", "feeling_good": "If a qualified clinician or pelvic-health professional has supported your return and foundational movement remains symptom-free, warm up for 8 minutes, try four 30-second easy jogs separated by 90 seconds of walking, then cool down. Otherwise use a 20-minute walk plus one light strength round."}, "mood_adjustment": "Heavy or low: restorative movement. Okay: walking and strength. Good or really good: impact is optional and should finish feeling easy, not triumphant or maximal.", "safety": "Stop impact for pain, leaking, heaviness, bulging, bleeding, joint pain or symptoms later that day or the next. Pause the running progression specifically; comfortable lower-impact movement may still be appropriate."}'::jsonb,
  'Eat before or after harder activity according to tolerance; do not use exercise to compensate for food.',
  'Drink around activity and adjust for heat and lactation.',
  'Use supportive clothing and time feeding or expressing for comfort if helpful.',
  'Leave at least a recovery day before repeating impact.',
  '{"heavy_day": "If today isn''t the day for anything new, that''s completely fine — walk-run intervals will still be there next week.", "a_little_low": "If your first attempt felt harder than expected, that''s normal, not a sign anything''s wrong.", "okay": "Notice one honest data point from today''s movement, without judging it.", "good": "Enjoy trying something new without needing to be good at it immediately.", "really_good": "If it went well, resist the urge to double the intervals next time — slow progression protects the gains you''re making."}'::jsonb,
  'A short cool-down and some gentle stretching can make the next day noticeably more comfortable.',
  'Record how it actually felt to move like this again, whatever the feeling was.',
  'Ask someone to hold the baby for the specific window you need for movement — a fixed, protected slot works better than "whenever there''s time."',
  'Trying something new with your body, carefully and without rushing, is exactly the right approach.',
  'Mention any symptoms from the first interval attempt — early feedback shapes a safer progression.',
  null
),
(
  56,
  'postpartum',
  'When baby''s sleep shifts, so does yours',
  'Your rest doesn''t have to be perfect to still count.',
  'Adjust your own rest expectations as your baby''s sleep patterns keep changing.',
  'Around this stage, many babies go through real changes in how they sleep — sometimes better, sometimes suddenly worse. Your own rest often has to keep adapting in response, even as your body continues healing. There''s no fixed schedule your rest is supposed to follow by now.',
  ARRAY['Sleep that improves, then unexpectedly gets harder again','Frustration or exhaustion if you''d expected things to be more settled by now','Physical strength and stamina still improving steadily overall','A wish for predictability that a small baby doesn''t always allow','Moments of real ease alongside genuinely hard stretches']::text[],
  '{"focus": "Match effort to whatever sleep you''re actually getting this week.", "recovery_route": {"vaginal": "No change tied to this week''s topic; continue progressing as tolerated.", "assisted_tear": "Broken sleep can make pelvic-floor symptoms feel worse than they are — worth mentioning at your next check if anything feels like it''s regressed.", "caesarean": "Same as above — fatigue can amplify how symptoms feel; it doesn''t necessarily mean healing has changed.", "complications": "Let your individual plan continue to guide activity, independent of how sleep is going."}, "tiers": {"heavy": "Five minutes of breathing and gentle stretching. Rest matters more than movement today.", "steady": "Walk for 15 minutes at whatever pace feels sustainable.", "feeling_good": "Continue your strength routine or walk-run intervals from the last two weeks if you''re pursuing them and sleep allows."}, "mood_adjustment": "On genuinely exhausted days, scale everything down without guilt — a sleep-deprived body doesn''t recover the same way from hard efforts.", "safety": "Stop and seek advice for new or worsening pain, pelvic heaviness or bulging, leaking, dizziness, faintness, chest pain or unusual breathlessness."}'::jsonb,
  'Fatigue can affect appetite and food choices in both directions. Keep something easy and nourishing available for the hardest days.',
  'Continue your regular routine — fatigue makes it easy to forget, so keep a visible reminder nearby.',
  'If sleep changes are affecting feeding timing or supply, that''s a common ripple effect, not necessarily a separate problem.',
  'Take rest wherever you can find it this week — a short nap or an early night counts, even if it''s not eight consecutive hours.',
  '{"heavy_day": "If exhaustion has you at your limit, ask for real, practical relief today — a full night off, not just a small break.", "a_little_low": "A setback in sleep isn''t a step backward in recovery overall. The two don''t move in lockstep.", "okay": "Name what''s actually helping right now, even if it''s imperfect, and do more of that.", "good": "Notice a genuinely restful moment today and let yourself have it fully.", "really_good": "If sleep has been kind lately, enjoy it without bracing for it to change — it might, and you''ll adapt again like you have before."}'::jsonb,
  'A simplified evening routine — for you, not just the baby — can protect a little of your own wind-down time.',
  'Write down one thing about this unpredictable stretch you''ll actually want to remember.',
  'Ask your support person to take one full night shift this week, even if it''s just once.',
  'Adapting, again, to something you can''t control is real strength — even when it doesn''t feel like it.',
  'If exhaustion feels beyond ordinary tiredness — or is paired with low mood, anxiety or physical symptoms — mention it directly rather than assuming it''s just the baby''s sleep.',
  null
),
(
  57,
  'postpartum',
  'Building real strength',
  'Consistency is doing more than any single hard session.',
  'Progress your strength work a little further, guided by how the last month has felt.',
  'If the last few weeks of light resistance and walking have felt settled, this is a reasonable point to add a little more — slightly heavier resistance, or functional carries using light household items. Progress should still be gradual; more isn''t automatically better.',
  ARRAY['Noticeably more strength than a month ago','Confidence carrying, lifting and moving through the day','Occasional soreness after a harder session, resolving within a day or two','Continued questions about pace, especially if progress feels slow','A body that increasingly feels like your own again, even if changed']::text[],
  '{"focus": "Progress resistance and add functional carrying strength.", "recovery_route": {"vaginal": "Progress resistance gradually while everything stays symptom-free.", "assisted_tear": "Confirm loaded progression with a pelvic-health professional if you haven''t already.", "caesarean": "Confirm loaded progression with your surgical or rehabilitation team if you haven''t already.", "complications": "Individual guidance should continue to shape any strength progression."}, "tiers": {"heavy": "Five minutes of breathing and 8 bodyweight squats.", "steady": "Walk for 10 minutes, then one round of 10 squats, 10 wall push-ups and 10 heel raises with light resistance.", "feeling_good": "Walk for 15 minutes, then two rounds of 10 squats with resistance, 10 push-ups (wall or incline), 10 heel raises, and a 1-minute farmer''s carry holding two water bottles or light weights."}, "mood_adjustment": "Heavy: breathing only. Low: an easy walk. Okay: the 15-minute option. Good or really good: the full 30 minutes.", "safety": "Stop and seek advice for new or worsening pain, pelvic heaviness or bulging, leaking, dizziness, faintness, chest pain or unusual breathlessness."}'::jsonb,
  'Strength gains need consistent fuel, especially protein. Undereating now can stall the very progress you''re working toward.',
  'Continue your regular routine, increasing with activity.',
  'No change tied to this week''s topic.',
  'Harder strength sessions need real recovery time — a full rest day between harder efforts is reasonable, not indulgent.',
  '{"heavy_day": "Strength doesn''t disappear on a hard day. Rest today; it will still be there tomorrow.", "a_little_low": "If progress feels slow, remember that consistency compounds — you''re likely further along than it feels.", "okay": "Pick one specific strength goal for the coming month, small enough to actually reach.", "good": "Notice a task that used to be hard and now feels easy — name it specifically.", "really_good": "Let today''s strength feel earned, because it is."}'::jsonb,
  'If you haven''t already, this is a reasonable stage to reintroduce a slightly more active skincare step, alongside daily SPF as the non-negotiable constant.',
  'Take a photo that captures how capable you feel right now, however that looks.',
  'Share one strength win from this month with your support person — let them celebrate it with you.',
  'Real, visible strength gains, built consistently and safely. That''s exactly how lasting strength is built.',
  'Mention any plateau or persistent limitation — sometimes a small adjustment from a professional unlocks real progress.',
  null
),
(
  58,
  'postpartum',
  'Your energy, revisited',
  'Notice the pattern, not just the day.',
  'Pay attention to your overall energy pattern over the past month, not just today.',
  'Most postpartum fatigue is exactly what it looks like — recovery, disrupted sleep, and the sheer physical work of caring for a baby. But it''s worth genuinely noticing your pattern this week, because next week covers a less commonly discussed reason fatigue can persist even when sleep and workload haven''t changed.',
  ARRAY['Fatigue that mostly tracks with how much sleep you got','Occasional days where tiredness feels heavier than the night before explains','Continued physical strength gains alongside variable energy','Mood that generally tracks with rest and support','Curiosity about whether "just tired" fully explains how you feel']::text[],
  '{"focus": "Continue your established routine, noticing how your energy responds to it.", "recovery_route": {"vaginal": "No change tied to this week''s topic; continue your established progression.", "assisted_tear": "No change tied to this week''s topic.", "caesarean": "No change tied to this week''s topic.", "complications": "Continue following your individual plan."}, "tiers": {"heavy": "Five minutes of breathing and gentle stretching.", "steady": "Walk for 15 minutes at an easy pace.", "feeling_good": "Continue your strength routine or walk-run intervals from recent weeks."}, "mood_adjustment": "Match today''s effort to today''s real energy, not to what last week allowed.", "safety": "Unusually poor exercise tolerance — feeling wiped out by efforts that were comfortable a few weeks ago — is worth noting for next week''s topic, not just pushing through."}'::jsonb,
  'Keep meals regular; note if your appetite has changed noticeably without an obvious reason.',
  'Continue your regular routine.',
  'No change tied to this week''s topic.',
  'Track roughly how much rest you''re actually getting this week — it''ll be useful context for next week.',
  '{"heavy_day": "If today''s heaviness feels different from ordinary tiredness — harder to explain, harder to shake — hold onto that observation.", "a_little_low": "Low mood alongside fatigue is worth naming plainly to someone, not just attributing to \"new parent tiredness.\"", "okay": "Write one honest sentence about your energy this past month.", "good": "Notice what''s genuinely working for your energy right now, and keep doing it.", "really_good": "Enjoy a good-energy day without needing an explanation for it."}'::jsonb,
  'No specific change this week — keep your established routine going.',
  'Note anything about your energy, mood or body that''s felt different lately, even if you can''t explain it yet.',
  'Ask your support person if they''ve noticed any change in your energy or mood over the past month — sometimes others see patterns before we do.',
  'Paying honest attention to your own body''s signals is a genuinely useful skill, not overthinking.',
  'If you noticed anything this week — new fatigue, mood change, palpitations, anxiety, weight change, feeling unusually cold or hot — bring it up specifically at your next contact.',
  null
),
(
  59,
  'postpartum',
  'A hidden reason for fatigue',
  'Not all postpartum exhaustion is just tiredness.',
  'Recognise postpartum thyroiditis as one possible, treatable explanation for symptoms that do not fit your usual pattern.',
  'Postpartum thyroiditis is one possible cause of symptoms that do not fit your usual sleep and workload. It can occur without a previous thyroid diagnosis. Some people first experience a faster-heartbeat, anxious or heat-intolerant phase; others notice a later phase with fatigue, low mood, constipation, dry skin or feeling cold, and some experience only one phase. These symptoms overlap with many postpartum conditions, so they cannot diagnose thyroiditis on their own. A clinician can assess the whole picture and decide which thyroid blood tests and follow-up are appropriate.',
  ARRAY['Fatigue or low exercise tolerance that feels disproportionate to your sleep','Weight change, constipation or dry skin without another clear explanation','Earlier in this window: anxiety, a racing heart, or trouble sleeping that felt out of character','Low mood that doesn''t track with your usual pattern','Or none of this at all — most mothers don''t develop it, and noticing none of these signs needs no action']::text[],
  '{"focus": "Continue your established routine — no change tied to this week''s topic, but notice how your body responds.", "recovery_route": {"vaginal": "No change tied to this week''s topic; continue your established progression.", "assisted_tear": "No change tied to this week''s topic.", "caesarean": "No change tied to this week''s topic.", "complications": "If you have a personal or family history of thyroid or autoimmune conditions, mention it specifically when raising this topic with your care team."}, "tiers": {"heavy": "Five minutes of breathing and gentle stretching.", "steady": "Walk for 15 minutes at an easy pace.", "feeling_good": "Continue your strength routine or walk-run intervals from recent weeks."}, "mood_adjustment": "If today''s fatigue feels unusually heavy or your exercise tolerance has genuinely dropped compared to recent weeks, that''s exactly the pattern worth raising this week — not something to push through to prove a point.", "safety": "Stop and seek advice for new or worsening pain, pelvic heaviness or bulging, leaking, dizziness, faintness, chest pain, palpitations or unusual breathlessness."}'::jsonb,
  'No specific dietary change is needed for this topic — a thyroid concern is diagnosed by a blood test, not by adjusting food.',
  'Continue your regular routine.',
  'No change tied to this week''s topic.',
  'If fatigue has felt unusual, prioritise rest this week while you also raise it with your care team — both matter.',
  '{"heavy_day": "If today''s exhaustion feels like more than tiredness should explain, that''s worth saying plainly, today, to your care team.", "a_little_low": "Learning your fatigue might have a treatable physical cause can bring relief, not just worry — it isn''t a character flaw, and it''s fixable.", "okay": "Decide today whether to raise this at your next contact, or to book a specific appointment if your next visit isn''t soon.", "good": "If none of this describes you, that''s genuinely good news — no action needed, just good to know for later.", "really_good": "Use today''s clarity to actually make the call or send the message, rather than filing it away as \"later.\""}'::jsonb,
  'No change tied to this week''s topic.',
  'Write down, in your own words, how your energy has actually felt over the past month — useful for yourself and for any conversation with your care team.',
  'Ask your support person to help you remember to actually book the test or conversation, if that''s what this week calls for.',
  'Taking your own fatigue seriously enough to investigate it is real self-advocacy.',
  'Describe the pattern and timing of fatigue, palpitations, temperature intolerance, bowel changes, mood symptoms and weight change. Ask whether thyroid testing or another assessment is appropriate.',
  null
),
(
  60,
  'postpartum',
  'Five months, still becoming',
  'You are not the same person you were before birth — and becoming takes time.',
  'Pause and notice how much has genuinely changed since birth — physically, emotionally, and in who you are.',
  'Five months in, most of the acute recovery work is behind you, even as strength-building and adjustment continue. This is a good week to look back rather than only forward — recovery isn''t only measured by symptoms resolving, but by everything you''ve built since.',
  ARRAY['A body that feels increasingly familiar, even where it''s changed','Growing confidence in movement, strength and daily capability','A sense of identity that includes motherhood without being only that','Occasional grief for who you were before, alongside real pride in who you are now','Continued small physical symptoms that are worth naming rather than ignoring']::text[],
  '{"focus": "Continue building on your established strength and, if relevant, running progression.", "recovery_route": {"vaginal": "No change tied to this week''s topic; continue your established progression.", "assisted_tear": "If any symptoms remain unresolved at five months, this is a reasonable week to seek a fresh specialist opinion rather than assume it''s simply how things are now.", "caesarean": "Same as above — persistent scar, numbness or functional limits at five months deserve a fresh look, not resignation.", "complications": "Use this halfway point to check in on your longer-term management plan with your care team."}, "tiers": {"heavy": "Five minutes of breathing and gentle stretching.", "steady": "Walk for 15 minutes, or a light version of your usual strength circuit.", "feeling_good": "Continue your full strength routine or walk-run intervals, progressing gradually if last week felt fully comfortable."}, "mood_adjustment": "Match effort to today''s real capacity, as always.", "safety": "Stop and seek advice for new or worsening pain, pelvic heaviness or bulging, leaking, dizziness, faintness, chest pain or unusual breathlessness."}'::jsonb,
  'No change tied to this week''s topic — keep meals regular and protein-forward.',
  'Continue your regular routine.',
  'No change tied to this week''s topic.',
  'No change tied to this week''s topic — keep protecting rest as consistently as you have been.',
  '{"heavy_day": "Even at the halfway point, a hard day doesn''t erase everything you''ve built. Ask for support today.", "a_little_low": "Grief for who you were, alongside pride in who you''ve become — both can be true without cancelling each other out.", "okay": "Write down three specific things that are genuinely different, and better, since month one.", "good": "Let today''s steadiness be a real marker of how far you''ve come.", "really_good": "Mark this halfway point in a way that feels true to you."}'::jsonb,
  'Do a full comfort audit — clothing, bras, skincare, sleep setup — and change anything that''s still working around an old, healing body rather than your current one.',
  'Write a short letter to yourself at month one — what you''d want her to know now.',
  'Tell your support person one way you''ve changed that you''re genuinely proud of.',
  'Twenty weeks of continuous physical, emotional and practical work deserves recognition.',
  'Raise anything that''s felt unresolved since early postpartum — five months in is a reasonable point to push for a fresh look, not just acceptance.',
  null
),
(
  61,
  'postpartum',
  'Carrying more, comfortably',
  'Strength shows up in how your day actually feels, not just in a workout.',
  'Build strength that shows up in real daily tasks — carrying, lifting, bending, playing.',
  'Your baby is getting heavier and more active to carry, hold and chase. This week''s focus connects gym-style strength work directly to the actual physical demands of your day, which is often more motivating than abstract fitness goals.',
  ARRAY['A heavier baby who wants to be carried differently than before','New physical demands — reaching, bending, more active play','Continued strength gains from recent weeks','Occasional new aches from new movement patterns rather than old injuries','Growing confidence in your body''s daily capability']::text[],
  '{"focus": "Functional strength for carrying, lifting and floor-based play.", "recovery_route": {"vaginal": "No change tied to this week''s topic; continue your established progression.", "assisted_tear": "No change tied to this week''s topic.", "caesarean": "No change tied to this week''s topic.", "complications": "Continue following your individual plan for loaded activity."}, "tiers": {"heavy": "Five minutes of breathing and 8 supported squats.", "steady": "Walk for 8 minutes, then one round of 10 squats, 10 sit-to-stands from the floor (using support as needed) and 10 heel raises.", "feeling_good": "Walk for 15 minutes, then two rounds of 10 squats, 10 floor-to-stand transitions, 10 heel raises and a 1-minute carry using a light, evenly held object."}, "mood_adjustment": "Heavy: breathing only. Low: an easy walk. Okay: the 15-minute option. Good or really good: the full 30 minutes.", "safety": "Stop and seek advice for new or worsening pain, pelvic heaviness or bulging, leaking, dizziness, faintness, chest pain or unusual breathlessness."}'::jsonb,
  'Keep protein consistent — functional strength work benefits from the same fuel as any other training.',
  'Continue your regular routine.',
  'No change tied to this week''s topic.',
  'No change tied to this week''s topic.',
  '{"heavy_day": "If carrying and lifting feel exhausting today, that''s real physical labour, not weakness. Rest is earned, not optional.", "a_little_low": "New aches from new movement patterns can feel discouraging — most settle within a couple of weeks as your body adapts.", "okay": "Notice one specific daily task that''s become physically easier.", "good": "Let today''s capability feel genuinely satisfying.", "really_good": "Use extra energy for active play with your baby — it counts as movement too."}'::jsonb,
  'Check your posture during the tasks you repeat most — carrying, feeding, lifting off the floor — small adjustments prevent cumulative strain.',
  'Note one new thing your baby does now that changes how you move together.',
  'Split the heaviest physical tasks of the day more evenly if you can — carrying, lifting a car seat, floor play.',
  'Real strength, showing up in your actual life, not just in a workout plan.',
  'Mention any specific task that still feels physically difficult or uncomfortable — there''s often a targeted fix.',
  null
),
(
  62,
  'postpartum',
  'Feeding, five months in',
  'However you''re feeding now is exactly the right amount of information anyone needs.',
  'Check in honestly on whether your current feeding plan is still working for you.',
  'Feeding plans commonly shift around this stage — continuing as before, combination feeding, or weaning, often connected to returning to work, milk supply changes, or simply what feels right now. Whatever your plan, its sustainability for you matters as much as anything else.',
  ARRAY['A feeding routine that''s stayed steady, or one that''s changing','Questions about weaning, if that''s on your mind','Physical changes in supply, comfort or your baby''s feeding pattern','Mixed feelings about any feeding transition, whichever direction it goes','Continued strength and stamina gains, independent of feeding method']::text[],
  '{"focus": "Continue your established routine — no change tied to this week''s topic.", "recovery_route": {"vaginal": "No change tied to this week''s topic; continue your established progression.", "assisted_tear": "No change tied to this week''s topic.", "caesarean": "No change tied to this week''s topic.", "complications": "No change tied to this week''s topic."}, "tiers": {"heavy": "Five minutes of breathing and gentle stretching.", "steady": "Walk for 15 minutes, or a light strength circuit.", "feeling_good": "Continue your full strength routine or walk-run intervals."}, "mood_adjustment": "Match effort to today''s real capacity.", "safety": "Stop and seek advice for new or worsening pain, pelvic heaviness or bulging, leaking, dizziness, faintness, chest pain or unusual breathlessness."}'::jsonb,
  'If you''re weaning, your own nutrition needs will shift too — this isn''t automatically a moment to eat less.',
  'If feeding demands are changing, your fluid needs may shift too — let thirst and urine colour guide you.',
  'If a transition feels physically uncomfortable — engorgement while weaning, for instance — ask for guidance on managing it gradually and comfortably.',
  'Feeding transitions can temporarily disrupt sleep in either direction — plan for a rockier week if a big change is happening.',
  '{"heavy_day": "If a feeding decision feels heavy today, you don''t have to finalise it right now. It''s allowed to stay unresolved for a bit.", "a_little_low": "Grief about a feeding transition — in either direction — is a real, valid response, not an overreaction.", "okay": "Name what''s actually working and not working in your current feeding plan, plainly.", "good": "Let a good feeding day, of any kind, simply be good.", "really_good": "If you''re feeling settled in your feeding plan, that''s worth acknowledging — it''s taken real work to get here."}'::jsonb,
  'No change tied to this week''s topic.',
  'Write down how you feel about feeding right now, without editing it to sound more resolved than it is.',
  'If a feeding transition is coming, involve your support person in the practical plan early.',
  'However you''ve fed your baby for five months, that is real, sustained care — full stop, no qualifiers.',
  'Ask for support with any feeding transition you''re considering — weaning, combination feeding, or troubleshooting supply — rather than figuring it out alone.',
  null
),
(
  63,
  'postpartum',
  'Consistency, not perfection',
  'The plan you actually follow beats the perfect one you don''t.',
  'Notice what''s actually sustainable in your routine, and let go of what isn''t.',
  'By now you likely have a rough sense of what movement, rest and food patterns genuinely fit your life — not the ones that look best on paper. This week is about honestly adjusting toward what you''ll actually keep doing.',
  ARRAY['A clearer sense of which routines have actually stuck','Some plans from earlier weeks that quietly fell away, and that''s fine','Continued physical progress, even if inconsistent week to week','Less pressure to follow every suggestion exactly as written','A more settled, personal rhythm emerging']::text[],
  '{"focus": "Keep whatever''s actually been working, and drop what hasn''t.", "recovery_route": {"vaginal": "No change tied to this week''s topic; continue whatever''s been working.", "assisted_tear": "No change tied to this week''s topic.", "caesarean": "No change tied to this week''s topic.", "complications": "Continue following your individual plan."}, "tiers": {"heavy": "Five minutes of whatever feels most restorative today — breathing, stretching, or simply resting.", "steady": "Whatever 15-minute option has actually felt sustainable these past weeks.", "feeling_good": "Your established strength routine or walk-run intervals, exactly as they''ve actually been going — not as originally planned."}, "mood_adjustment": "Let today''s real capacity lead, as always.", "safety": "Stop and seek advice for new or worsening pain, pelvic heaviness or bulging, leaking, dizziness, faintness, chest pain or unusual breathlessness."}'::jsonb,
  'Notice which food habits have actually stuck, and build from there rather than starting over.',
  'Continue whatever''s actually been working.',
  'No change tied to this week''s topic.',
  'Notice which rest strategies have genuinely helped, and protect those specifically.',
  '{"heavy_day": "If nothing about your routine feels like it''s working today, that''s just today — not a verdict on the whole plan.", "a_little_low": "Letting go of a plan that wasn''t sustainable isn''t failure — it''s useful information.", "okay": "Write down what''s actually stuck, honestly, even if it''s less than you''d hoped.", "good": "Appreciate the routine that''s genuinely working, exactly as it is.", "really_good": "Build on today''s momentum without overcomplicating what''s already working."}'::jsonb,
  'Simplify anything in your routine that''s become a chore rather than a support.',
  'Write down the one habit from these past months you''re most glad you kept.',
  'Tell your support person what''s actually been helping — they can keep supporting the right things.',
  'Building a routine that fits your real life, not an idealised one, is a genuine skill.',
  'Mention anything that hasn''t been sustainable so far — there may be a more realistic alternative.',
  null
),
(
  64,
  'postpartum',
  'Nearly six months, more capacity',
  'Notice how much more room you have now.',
  'Recognise the real gains in capacity — physical, emotional and practical — since early postpartum.',
  'Nearly six months in, many mothers have more physical and emotional capacity than they did even two months ago. This week is a deliberate pause to notice that, rather than only focusing on what''s still difficult.',
  ARRAY['Real, cumulative physical strength and stamina','More emotional bandwidth for things beyond survival mode','Occasional reminders that recovery is still ongoing in smaller ways','A body and life that feel more like your own again','Continued questions about what "back to normal" even means now']::text[],
  '{"focus": "Continue your established routine, noticing your progress.", "recovery_route": {"vaginal": "No change tied to this week''s topic; continue your established progression.", "assisted_tear": "No change tied to this week''s topic.", "caesarean": "No change tied to this week''s topic.", "complications": "Continue following your individual plan."}, "tiers": {"heavy": "Five minutes of breathing and gentle stretching.", "steady": "Walk for 15 minutes, or a light strength circuit.", "feeling_good": "Continue your full strength routine or walk-run intervals, progressing gradually."}, "mood_adjustment": "Match effort to today''s real capacity.", "safety": "Stop and seek advice for new or worsening pain, pelvic heaviness or bulging, leaking, dizziness, faintness, chest pain or unusual breathlessness."}'::jsonb,
  'No change tied to this week''s topic.',
  'Continue your regular routine.',
  'No change tied to this week''s topic.',
  'No change tied to this week''s topic.',
  '{"heavy_day": "Even five months in, hard days happen. That doesn''t erase the real progress behind you.", "a_little_low": "If today doesn''t feel like \"more capacity,\" that''s okay — the overall trend is what matters, not any single day.", "okay": "List three things you can do now that you couldn''t at two months.", "good": "Let today''s ease feel like the earned result of months of real work.", "really_good": "Use today''s capacity for something purely for you."}'::jsonb,
  'No change tied to this week''s topic.',
  'Write down what "back to normal" actually means to you now — it''s likely different from what you expected.',
  'Ask your support person to name one change they''ve noticed in you over these five months.',
  'Five months of real, cumulative progress — physical, emotional and practical.',
  'No specific ask this week — a good week to simply confirm nothing feels newly unresolved.',
  null
),
(
  65,
  'postpartum',
  'Approaching six months',
  'The next phase builds on everything you''ve already done.',
  'Look ahead to what changes as you approach the six-month mark.',
  'Six months is a genuine milestone in several ways — for babies, it''s often when complementary foods begin alongside continued breastfeeding, if that''s your feeding method (a topic covered in more depth in the Monthly Chart). For you, it typically means moving from active tissue recovery into a phase more about sustained strength and rhythm.',
  ARRAY['Continued strength gains, closer to a stable new baseline','A baby who''s more mobile, interactive and demanding in new ways','Feeding questions tied to your baby''s approaching six-month mark, if relevant','A sense that the most acute recovery phase is genuinely behind you','Occasional lingering symptoms worth a final check before moving on']::text[],
  '{"focus": "Consolidate your progress ahead of the next phase.", "recovery_route": {"vaginal": "No change tied to this week''s topic; continue your established progression.", "assisted_tear": "If any symptoms remain at all, use this week to schedule a final follow-up rather than letting it quietly continue.", "caesarean": "Same as above — any lingering scar, numbness or functional limit deserves a follow-up now.", "complications": "Confirm your longer-term monitoring plan as you move past six months."}, "tiers": {"heavy": "Five minutes of breathing and gentle stretching.", "steady": "Walk for 15 minutes, or a light strength circuit.", "feeling_good": "Your established strength routine or walk-run intervals."}, "mood_adjustment": "Match effort to today''s real capacity.", "safety": "Stop and seek advice for new or worsening pain, pelvic heaviness or bulging, leaking, dizziness, faintness, chest pain or unusual breathlessness."}'::jsonb,
  'No change tied to this week''s topic.',
  'Continue your regular routine.',
  'If complementary foods are starting for your baby, your own feeding routine may naturally shift too — let it happen gradually.',
  'No change tied to this week''s topic.',
  '{"heavy_day": "Approaching a milestone doesn''t mean today has to feel like a milestone. Rest if you need to.", "a_little_low": "If six months brings up complicated feelings — about time passing, about your baby growing — that''s normal, not ungrateful.", "okay": "Note anything still unresolved that you want to raise before this phase closes.", "good": "Let anticipation for the next stage feel exciting rather than pressured.", "really_good": "Use today''s energy to plan one thing you''re looking forward to in the coming phase."}'::jsonb,
  'No change tied to this week''s topic.',
  'Write down what you want to carry forward from these past six months.',
  'Talk with your support person about what support has looked like so far, and what you both want it to look like next.',
  'You''re one week from a real six-month milestone. That''s worth genuinely acknowledging.',
  'Raise anything unresolved now, before this phase of active postpartum follow-up closes.',
  null
),
(
  66,
  'postpartum',
  'Six months — a real shift',
  'This isn''t an ending. It''s a genuine change in what your body and life need next.',
  'Mark this real milestone, and step into the next phase with a clear sense of how far you''ve come.',
  'Six months marks a real shift from active tissue recovery toward sustained strength, rhythm and identity. Whatever your exact symptoms or timeline, the structured, closely-managed phase of early postpartum care is largely behind you now — ongoing wellbeing becomes the focus from here.',
  ARRAY['A body that feels substantially more capable than six months ago','Genuine pride alongside continued small adjustments','A settled sense of your feeding, sleep and activity rhythm, however it looks','Anticipation for what the next phase of motherhood holds','Complex, mixed emotions about how much has changed']::text[],
  '{"focus": "Mark six months of real progress and look toward sustained, ongoing strength.", "recovery_route": {"vaginal": "If everything has stayed settled, most activities — including higher-impact ones, if pursued gradually — are reasonable to continue building toward now.", "assisted_tear": "Confirm your longer-term pelvic-health plan as you move into ongoing maintenance rather than acute recovery.", "caesarean": "Confirm your longer-term plan for scar and core function as you move into ongoing maintenance.", "complications": "Confirm what ongoing monitoring, if any, continues past this point."}, "tiers": {"heavy": "Five minutes of breathing and gentle stretching.", "steady": "Walk for 15 minutes, or a light version of your strength circuit.", "feeling_good": "Your full established strength routine or walk-run intervals — however far you''ve progressed them."}, "mood_adjustment": "Match effort to today''s real capacity, as always.", "safety": "Stop and seek advice for new or worsening pain, pelvic heaviness or bulging, leaking, dizziness, faintness, chest pain or unusual breathlessness."}'::jsonb,
  'No change tied to this week''s topic — keep the sustainable pattern you''ve built.',
  'Continue your regular routine.',
  'Whatever your feeding plan looks like at six months, it''s the right one if it''s working for you and your baby.',
  'No change tied to this week''s topic — keep protecting rest as consistently as you have been.',
  '{"heavy_day": "Even at six months, a hard day is just a hard day — not a step back from everything you''ve built.", "a_little_low": "Milestones can stir complicated feelings. You''re allowed to feel more than one thing about how far you''ve come.", "okay": "Write a short, honest summary of these six months — the hard parts and the real progress, both.", "good": "Let today''s steadiness be a genuine marker of everything you''ve done.", "really_good": "Mark six months in whatever way feels true to you."}'::jsonb,
  'Take stock of your full self-care routine and keep what''s genuinely working as you move into the next phase.',
  'Write a message to yourself at six months from now — what you hope she''ll know.',
  'Thank your support person specifically for their role in these six months.',
  'Six months of postpartum recovery — physical, emotional and practical — is real, sustained work. Fully worth celebrating.',
  'Confirm what ongoing care, if any, continues past six months, and what to watch for going forward.',
  '[{"flag": "diabetes_gd", "note": "Gestational diabetes: confirm that postpartum glucose testing was completed and that a primary-care plan exists for ongoing diabetes screening."}, {"flag": "high_bp", "note": "High blood pressure or pre-eclampsia: confirm blood-pressure follow-up and discuss longer-term cardiovascular risk reduction with primary care."}, {"flag": "thyroid", "note": "Known thyroid or autoimmune disease: continue prescribed treatment and use the testing schedule set by your clinician; do not change medicine based on symptoms alone."}]'::jsonb
);
