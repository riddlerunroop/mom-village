-- Care Chart week-by-week rebuild — Settling into strength (postpartum
-- weeks 27-52), 2026-07-29. Fourth batch of the postpartum week-by-week
-- build (Early healing weeks 0-6 = migrations 37-38; Finding rhythm weeks
-- 7-12 = migration 39; Rebuilding weeks 13-26 = migration 40). No schema
-- changes needed this batch — reuses every column/shape introduced for
-- Early healing (feeding_comfort, rest_support, move.recovery_route,
-- condition_notes) as-is. This is the largest single batch in the series
-- (26 weeks, double the size of any prior batch), closing out the full
-- first postpartum year at the baby's first birthday (week 52).
--
-- Week-number convention: same forward count as every prior migration in
-- this series — postpartum week 27 = week_number 67, week 52 = week_number
-- 92 (40 + week, matching week 40 = full term/birth).
--
-- Process: Claude drafted a full 26-week base version first (grounded in
-- ACOG postpartum-exercise guidance, standard progressive-training
-- principles, and fresh WebSearch verification this session confirming
-- postpartum depression/anxiety can emerge at any point in the first year,
-- not just early on — CDC, Cleveland Clinic, MAMMI cohort study),
-- deliberately drafted in parallel with the Rebuilding batch's external
-- review per Roop's request so both drafts stayed queued. Roop ran it past
-- another AI app and sent back "Care Chart — Postpartum Settling Into
-- Strength — Final Move and Reset Edition." Parsed programmatically using
-- the same parser built for Early healing/Finding rhythm/Rebuilding (the
-- backslash-escape and mantra-quote-order fixes added for the Rebuilding
-- doc carried over cleanly to this doc with zero further changes needed —
-- confirmed zero stray backslashes in any extracted field). Round-trip
-- validated via the state-machine SQL-literal parser established in the
-- Rebuilding batch: 53 jsonb blocks, zero errors on the first pass.
--
-- Unlike prior batches, the reviewed doc's "Clinical review basis" and
-- "Editorial implementation notes" sections came back essentially
-- unchanged from Claude's own base draft (confirmed by direct comparison)
-- — the real, substantive difference in this pass was a full rewrite of
-- the Move pillar's specifics across nearly every week: Claude's base
-- draft had deliberately repeated "continue your established routine" for
-- many weeks (reasoning: a 26-week batch doesn't need 26 distinct workouts
-- to avoid feeling thin, the variety should live in the weekly theme/
-- journey/reset content instead). The reviewed doc disagreed with that
-- call and gave nearly every week its own specific, real movement content
-- instead — rotating strength, mobility, balance, endurance, connection,
-- deload and restorative formats, matching the doc's own stated intent
-- ("choices rotate strength, mobility, balance, endurance and restoration
-- while remaining symptom-led"). None of this rewrite introduced new
-- numeric/clinical claims requiring fresh verification beyond what's
-- already covered by standard, non-postpartum-specific strength-and-
-- conditioning practice (progressive overload, deload weeks) — spot-
-- checked across a representative sample of weeks (28, 33, 34, 35, 38, 39,
-- 42-43, 45) with no red-flag specifics found (no numeric protocols like
-- Rebuilding's running-readiness battery this time).
--
-- Weeks 31 and 46 remain the two dedicated, general-audience mental-health
-- check-ins from Claude's base draft — journey/notice text came back
-- essentially unchanged. One deliberate omission worth flagging: Claude's
-- own draft included a specific incidence statistic ("roughly one in
-- seven mothers experiences depression and about one in ten experiences
-- significant anxiety") that was NOT independently re-verified with a
-- fresh WebSearch this session (only the broader onset-timing claim was).
-- The reviewed doc dropped this specific stat entirely, which resolves the
-- gap conservatively — nothing to verify or correct, the doc simply
-- doesn't make the claim.
--
-- Condition notes: only Week 52 carries them in this batch (matching where
-- the reviewed doc places them, same pattern as Rebuilding's Week 26) —
-- diabetes_gd (keep the long-term screening plan active even if the early
-- postpartum test was normal), high_bp (ensure primary care knows the
-- pregnancy history and reviews cardiovascular risk over time), and a
-- general thyroid/autoimmune note (continue medicines/testing as
-- prescribed, new symptoms deserve reassessment). No PCOS note this batch
-- — not present in the reviewed doc for these weeks; PCOS condition notes
-- already exist from Early healing (week 0) and Finding rhythm (week 10).
--
-- EDITORIAL LOCALISATION NOTE (carried from the doc itself): emergency
-- numbers, mental-health service access, and terminology require review
-- for each launch country — noted for awareness, not acted on here.
--
-- This closes the "Rebuilding through Settling into strength" arc
-- (postpartum weeks 0-52, the first full year). Next batch: Sustainable
-- rhythms (postpartum weeks 53-104, year one to two) — a different kind of
-- phase (established rhythm rather than active building), per the
-- reviewed doc's own note, to be scoped and paced with Roop before
-- drafting.
insert into care_chart_week_content (
  week_number, trimester, theme_title, mantra, priority, journey,
  what_you_may_notice, move, nourish, hydration_goal, feeding_comfort,
  rest_support, reset, care_for_yourself, your_corner, support_moment,
  celebrate_this_week, for_your_care_team, condition_notes
) values
(
  67,
  'postpartum',
  'Six months, new phase',
  'You''re not starting over. You''re building on everything already behind you.',
  'Step into this next phase with a clear sense of your established routine.',
  'Six months in, most of your routine — movement, feeding, rest — has likely found some real rhythm, even if it''s still evolving. This phase is less about active recovery and more about sustaining and building on what you''ve established.',
  ARRAY['A body that feels substantially more like your own again','An established, if imperfect, daily rhythm','Continued strength gains, closer to feeling like a stable new baseline','A more mobile, interactive baby changing your day-to-day demands','Anticipation for the year ahead']::text[],
  '{"focus": "Consolidate a simple full-body baseline you can repeat.", "recovery_route": {"vaginal": "Continue progressing toward whatever activity level you''re aiming for, symptom-led as always.", "assisted_tear": "If anything remains unresolved, keep pursuing it — six months is not a deadline for symptoms to have disappeared.", "caesarean": "Same as above — ongoing scar or core symptoms deserve continued attention, not resignation.", "complications": "Confirm your longer-term management plan as you move fully into this phase."}, "tiers": {"heavy": "Take five relaxed breaths, then do 8 sit-to-stands and 8 heel raises.", "steady": "Walk for 7 minutes; complete one round of 8 sit-to-stands, 8 wall push-ups and 10 heel raises.", "feeling_good": "Walk for 12--15 minutes; complete two controlled rounds of the strength set."}, "mood_adjustment": "Heavy: one movement plus breathing. Low: walk gently. Okay: use 15 minutes. Good: use 30. Really good: improve control rather than adding load.", "safety": "Stop and seek advice for new or worsening pain, pelvic heaviness or bulging, leaking, dizziness, faintness, chest pain or unusual breathlessness."}'::jsonb,
  'Keep meals regular and protein-forward, matched to your current activity level.',
  'Continue your regular routine.',
  'Whatever your feeding plan looks like at six months, it''s the right one if it''s working for you and your baby.',
  'Protected rest remains genuinely necessary, even as things feel more settled.',
  '{"heavy_day": "Even six months in, hard days happen — that doesn''t erase everything you''ve built.", "a_little_low": "New phases can stir up complicated feelings alongside real progress. Both are allowed.", "okay": "Name what''s working well in your current routine, and one thing you''d like to build on.", "good": "Let today''s steadiness be a genuine marker of how far you''ve come.", "really_good": "Use today''s energy to set one intention for the months ahead."}'::jsonb,
  'Take stock of your full routine and simplify anything that''s become a chore.',
  'Write down what you''re most looking forward to in the coming months.',
  'Talk with your support person about what support looks like now, six months in.',
  'Six months of real, sustained work is genuinely behind you.',
  'Confirm what ongoing care, if any, continues from here.',
  null
),
(
  68,
  'postpartum',
  'Progressing toward full intensity',
  'Build load gradually — your goal, your pace.',
  'If pursuing higher-intensity training or running, progress it gradually and specifically.',
  'If you''ve been building toward running or more intense training, this is a reasonable stage to progress further — still gradually, still guided by symptoms. If you''re not chasing intensity, continued consistency at your current level is just as valid a goal.',
  ARRAY['Growing tolerance for longer or harder efforts, if you''re building toward them','No interest in pushing intensity, and that''s an equally fine choice','Occasional new soreness as you progress, resolving within a day or two','Continued confidence in your body''s daily capability','Questions about what "goal" even makes sense for you right now']::text[],
  '{"focus": "Progress one variable — time, repetitions or resistance.", "recovery_route": {"vaginal": "Progress load or intensity gradually, no more than a small increase at a time.", "assisted_tear": "Confirm higher-intensity readiness with a pelvic-health professional if you haven''t already.", "caesarean": "Confirm higher-intensity readiness with your surgical or rehabilitation team if you haven''t already.", "complications": "Individual guidance should continue to shape any intensity progression."}, "tiers": {"heavy": "Choose one familiar exercise and complete two easy sets.", "steady": "Walk for 7 minutes; add one strength round with 2 more repetitions than last week.", "feeling_good": "Use your usual 30-minute routine and increase only one variable modestly."}, "mood_adjustment": "Heavy: maintain. Low: reduce volume. Okay: repeat last week. Good or really good: make one small progression and reassess tomorrow.", "safety": "Stop and seek advice for new or worsening pain, pelvic heaviness or bulging, leaking, dizziness, faintness, chest pain or unusual breathlessness."}'::jsonb,
  'Match food intake to your actual training load — more activity generally means more fuel needed, not less.',
  'Increase gradually with any increase in activity.',
  'No change tied to this week''s topic.',
  'Harder efforts need real recovery time between them.',
  '{"heavy_day": "Progress isn''t lost by resting today. It will still be there tomorrow.", "a_little_low": "If progress feels slow, remember consistency compounds even when it doesn''t feel dramatic.", "okay": "Set one small, specific target for the coming weeks.", "good": "Notice real gains without needing to chase more immediately.", "really_good": "Enjoy today''s capability without overcommitting for next time."}'::jsonb,
  'No change tied to this week''s topic.',
  'Note one thing your body can do now that would have surprised you six months ago.',
  'Share a specific goal with your support person so they can help you protect the time for it.',
  'Building strength deliberately and sustainably, at your own pace.',
  'Mention any plateau or persistent limitation — a small professional adjustment can unlock real progress.',
  null
),
(
  69,
  'postpartum',
  'Who you are, beyond caregiving',
  'Motherhood is part of your identity, not the whole of it.',
  'Reconnect with one part of your identity that exists outside caregiving.',
  'By now many mothers have settled into a caregiving rhythm so thoroughly that other parts of identity — work, hobbies, friendships, ambitions — can feel distant. This week is a deliberate nudge back toward them, however small the step.',
  ARRAY['A wish to reconnect with pre-baby interests or goals','Uncertainty about who you are now, separate from "mother"','Continued physical steadiness alongside this identity work','Guilt about wanting time or focus outside caregiving','Genuine excitement about parts of yourself re-emerging']::text[],
  '{"focus": "Use movement to reconnect with identity, not only fitness.", "recovery_route": {"vaginal": "", "assisted_tear": "", "caesarean": "", "complications": ""}, "tiers": {"heavy": "Play one song and move, stretch or walk until it ends.", "steady": "Take a 15-minute walk somewhere that feels like your own choice.", "feeling_good": "Choose your preferred activity for 20 minutes, then add 10 minutes of easy strength or mobility."}, "mood_adjustment": "Heavy: quiet mobility. Low: daylight walk. Okay: choose something familiar. Good or really good: choose enjoyment before metrics.", "safety": "Stop and seek advice for new or worsening pain, pelvic heaviness or bulging, leaking, dizziness, faintness, chest pain or unusual breathlessness."}'::jsonb,
  'No change tied to this week''s topic.',
  'Continue your regular routine.',
  'No change tied to this week''s topic.',
  'No change tied to this week''s topic.',
  '{"heavy_day": "If reconnecting with yourself feels like one more task today, let it wait. It isn''t going anywhere.", "a_little_low": "Feeling unsure who you are now is common, not a sign something''s wrong.", "okay": "Name one thing you used to enjoy and haven''t done in months. Consider one small way back to it.", "good": "Spend today''s good energy on something that''s just for you.", "really_good": "Take one concrete step toward reconnecting with an old interest or goal."}'::jsonb,
  'No change tied to this week''s topic.',
  'Write down who you were before, and one part of her you want to bring forward.',
  'Ask your support person to protect a specific block of time for something that''s just yours.',
  'Making space for your full identity is good for you and, ultimately, for your baby too.',
  'No specific ask this week.',
  null
),
(
  70,
  'postpartum',
  'Your relationship, revisited',
  'A partnership can need tending too, not just the baby.',
  'Check in honestly on your relationship with your partner or closest support person, if relevant to you.',
  'Relationships often shift significantly in the first year after a baby — sometimes growing closer, sometimes under real strain from exhaustion and changed roles. Naming this honestly, if it applies to you, is more useful than assuming things will simply sort themselves out.',
  ARRAY['Closeness with a partner that''s grown or, at times, strained','Reduced time or energy for the relationship compared to before','Questions about intimacy, connection or shared responsibilities','Gratitude for support received, alongside real fatigue','This week may not apply to you at all, and that''s completely fine']::text[],
  '{"focus": "Build connection through shared movement if that feels supportive.", "recovery_route": {"vaginal": "", "assisted_tear": "", "caesarean": "", "complications": ""}, "tiers": {"heavy": "Take a five-minute walk or stretch alone or with someone safe.", "steady": "Walk and talk for 15 minutes, or complete a short independent circuit.", "feeling_good": "Share a 20-minute walk, then do 10 minutes of individual strength or mobility."}, "mood_adjustment": "Heavy: choose privacy or company according to need. Low: ask someone to join. Good: use movement for conversation without turning it into problem-solving.", "safety": "Stop and seek advice for new or worsening pain, pelvic heaviness or bulging, leaking, dizziness, faintness, chest pain or unusual breathlessness."}'::jsonb,
  'No change tied to this week''s topic.',
  'Continue your regular routine.',
  'No change tied to this week''s topic.',
  'No change tied to this week''s topic.',
  '{"heavy_day": "If your relationship feels strained today, that''s worth naming to yourself honestly, even if you''re not ready to address it yet.", "a_little_low": "Feeling distant from a partner after a baby is common, not a sign the relationship is failing.", "okay": "Name one specific thing you need more of from your relationship right now.", "good": "Let a good moment of connection today be enough, without needing it to fix everything.", "really_good": "Use today''s warmth to plan a small, real moment of connection this week."}'::jsonb,
  'No change tied to this week''s topic.',
  'Write down one thing you appreciate about your support system right now.',
  'Have one honest, low-pressure conversation this week about how you''re both doing.',
  'Tending to your relationships is part of tending to yourself.',
  'If relationship strain is affecting your wellbeing significantly, counselling support is a reasonable thing to ask about.',
  null
),
(
  71,
  'postpartum',
  'Checking in on your mind',
  'This can start now, too — not just in the early weeks.',
  'A dedicated, honest check-in on your mental health — wherever you are in the first year.',
  'Postpartum depression and anxiety are usually associated with the earliest weeks after birth, but they can genuinely begin at any point in the first year — including right now, at six or seven months. This week is a deliberate, no-pressure check-in, regardless of how you''ve felt so far.',
  ARRAY['Steady, settled mood most days','Or new low mood, anxiety, irritability or numbness that feels different from before','Persistent worry that feels hard to switch off','Difficulty finding enjoyment in things that used to feel good','Or nothing concerning at all — most mothers won''t recognise themselves in this list, and that''s the expected, good outcome']::text[],
  '{"focus": "Use movement as support for mood — not treatment or proof.", "recovery_route": {"vaginal": "", "assisted_tear": "", "caesarean": "", "complications": ""}, "tiers": {"heavy": "Step outside or near a window, breathe slowly and walk for up to five minutes.", "steady": "Take an easy, familiar 15-minute walk with no performance target.", "feeling_good": "Choose a comfortable established routine only if it feels supportive; otherwise use the shorter option."}, "mood_adjustment": "Heavy: contact a person, not a workout plan. Low: gentle movement with company. Okay or better: keep effort familiar and emotionally neutral.", "safety": "Stop and seek advice for new or worsening physical pain, and separately, seek support for any mental-health symptoms below regardless of physical safety."}'::jsonb,
  'No specific dietary change is needed for this topic.',
  'Continue your regular routine.',
  'No change tied to this week''s topic.',
  'Persistent low mood and disrupted sleep can reinforce each other — protecting rest matters for your mind as much as your body.',
  '{"heavy_day": "If today feels genuinely heavy — hopeless, numb, or frightening in your own thoughts — tell someone now and seek professional support. This is treatable, and asking for help is not a failure at any point in the year.", "a_little_low": "Persistent low mood, even without a crisis, is worth naming to your care team — you don''t have to wait until it gets worse.", "okay": "Take a moment to honestly rate the last two weeks of your mood and anxiety, not just today.", "good": "If you''re genuinely doing well, that''s worth noticing and naming too — not everything this week has to be about a problem.", "really_good": "Use today''s clarity to check in on anyone else in your circle who might be struggling quietly."}'::jsonb,
  'No change tied to this week''s topic.',
  'Write down, honestly, how your mood has actually been over the past month — useful for yourself and for any conversation with your care team.',
  'Tell someone you trust how you''ve really been feeling, not just the version you usually share.',
  'Checking in on your mental health, at any point in the year, is real self-care — not an overreaction.',
  'Ask specifically for a mood and anxiety check if anything in this week''s list resonated — postpartum mental-health support is available well beyond the earliest weeks.',
  null
),
(
  72,
  'postpartum',
  'Feeding, settling into its shape',
  'However this looks now, it''s had months of real work behind it.',
  'Check in on your own nutrition as your feeding routine has settled into its longer-term shape.',
  'By seven months, most feeding routines — breastfeeding, combination, formula, or fully weaned — have found a stable pattern. This week is about your own nutrition keeping pace with whatever that pattern actually is now.',
  ARRAY['A stable, established feeding routine','Continued questions about your own nutritional needs, especially if still breastfeeding','Appetite and energy patterns that have found their own rhythm','Occasional reminders to eat properly amid a busy day','Confidence in whatever feeding choices you''ve made']::text[],
  '{"focus": "Pair strength with adequate fuelling.", "recovery_route": {"vaginal": "", "assisted_tear": "", "caesarean": "", "complications": ""}, "tiers": {"heavy": "Do 8 sit-to-stands, 8 wall push-ups and a short posture reset.", "steady": "Walk for 5 minutes, then complete two easy strength rounds.", "feeling_good": "Complete three controlled rounds of sit-to-stands, wall or incline push-ups, heel raises and supported rows with a band if available."}, "mood_adjustment": "Heavy: one round. Low: walking. Okay: two rounds. Good: three. Really good: add resistance only if food, sleep and symptoms support it.", "safety": "Stop and seek advice for new or worsening pain, pelvic heaviness or bulging, leaking, dizziness, faintness, chest pain or unusual breathlessness."}'::jsonb,
  'If still breastfeeding, your own nutrition needs remain real — protein, iron and overall energy still matter, not just your baby''s intake.',
  'Continue your regular routine, adjusted for feeding demands if relevant.',
  'If any part of your current feeding routine still feels physically uncomfortable, it''s still worth raising, however long it''s been going on.',
  'No change tied to this week''s topic.',
  '{"heavy_day": "If feeding still feels like a struggle at this stage, that''s real and worth support, not something you should have \"figured out\" by now.", "a_little_low": "However your feeding journey has gone, comparing it to someone else''s rarely helps. Yours is the one that matters.", "okay": "Notice whether your own meals have been keeping pace with your actual needs lately.", "good": "Let a settled feeding routine feel like the real accomplishment it is.", "really_good": "Acknowledge how far your feeding journey has come, whatever shape it''s taken."}'::jsonb,
  'No change tied to this week''s topic.',
  'Write down one thing about feeding your baby that you''re proud of, regardless of method.',
  'Ask for help with meal prep if your own eating has been slipping amid a busy routine.',
  'Seven months of feeding your baby, in whatever way has worked, is real and sustained care.',
  'Mention any ongoing feeding discomfort or nutrition concerns, even if they''ve been present a while.',
  null
),
(
  73,
  'postpartum',
  'Sleep, still evolving',
  'Better sleep for your baby doesn''t always mean better sleep for you yet.',
  'Notice your own sleep debt honestly, separate from how your baby is sleeping.',
  'Many babies begin sleeping in longer stretches around this age, but your own sleep debt doesn''t disappear the moment your baby''s does — old habits, lingering vigilance, and simple exhaustion can take longer to resolve.',
  ARRAY['A baby sleeping better, with your own sleep improving more slowly','Difficulty falling back asleep even when the baby doesn''t wake you','Ongoing tiredness that doesn''t fully track with hours slept','Gradual improvement in your own rest over recent weeks','Relief alongside lingering exhaustion, both at once']::text[],
  '{"focus": "Match training load to accumulated sleep — not one better night.", "recovery_route": {"vaginal": "", "assisted_tear": "", "caesarean": "", "complications": ""}, "tiers": {"heavy": "Choose breathing, neck mobility and a brief walk.", "steady": "Walk for 10 minutes and add 5 minutes of gentle mobility.", "feeling_good": "Use a moderate strength or aerobic session only if concentration, balance and energy feel normal."}, "mood_adjustment": "Severely sleep-deprived: restorative movement only. Steady: 15 minutes. Well-rested: 30 minutes without compensating for missed sessions.", "safety": "Stop and seek advice for new or worsening pain, pelvic heaviness or bulging, leaking, dizziness, faintness, chest pain or unusual breathlessness."}'::jsonb,
  'No change tied to this week''s topic.',
  'Continue your regular routine.',
  'No change tied to this week''s topic.',
  'If your baby''s sleep has improved, protect the resulting extra time for your own rest first, before anything else.',
  '{"heavy_day": "If exhaustion still feels overwhelming even as your baby sleeps better, that''s worth mentioning — it may be more than simple sleep debt.", "a_little_low": "Your own sleep recovering more slowly than your baby''s is common, not a sign anything''s wrong.", "okay": "Notice one specific change in your sleep over the past month, better or worse.", "good": "Let a genuinely restful night, whenever it happens, feel like real progress.", "really_good": "If sleep has been kind lately, protect the routine that''s helping it stay that way."}'::jsonb,
  'No change tied to this week''s topic.',
  'Write down what your ideal night of sleep looks like right now, realistically.',
  'Ask your support person to take one extra night shift or early morning, even now that things feel more settled.',
  'However your sleep is going, you''ve navigated months of real sleep disruption already.',
  'Mention any ongoing sleep difficulty that doesn''t seem to be improving, especially alongside low mood or anxiety.',
  null
),
(
  74,
  'postpartum',
  'Progressive strength',
  'Small, steady increases beat occasional big pushes.',
  'Apply a genuine progressive-overload principle to your strength routine — small, steady increases over time.',
  'If you''ve been strength training consistently, this is a good week to think about progression more deliberately: a few more repetitions, slightly more resistance, or one more round — never everything at once.',
  ARRAY['Real strength gains that have compounded over recent months','A body that adapts more predictably to gradual increases now','Occasional plateaus, which are a normal part of any training journey','Continued confidence in your body''s capability','A clearer sense of your own pace and preferences']::text[],
  '{"focus": "Practise progressive overload without changing everything at once.", "recovery_route": {"vaginal": "", "assisted_tear": "", "caesarean": "", "complications": ""}, "tiers": {"heavy": "Complete one slow round of your three core strength movements.", "steady": "Complete two rounds, adding either 1--2 repetitions or a small resistance increase.", "feeling_good": "Complete three rounds at controlled effort, changing only one training variable."}, "mood_adjustment": "Heavy: maintain technique. Low: reduce a round. Okay: repeat. Good: progress one variable. Really good: leave repetitions in reserve.", "safety": "Stop and seek advice for new or worsening pain, pelvic heaviness or bulging, leaking, dizziness, faintness, chest pain or unusual breathlessness."}'::jsonb,
  'Consistent protein intake continues to support strength gains.',
  'Continue your regular routine.',
  'No change tied to this week''s topic.',
  'Recovery time between harder sessions remains part of the progression, not separate from it.',
  '{"heavy_day": "A plateau or a rest day doesn''t undo months of real progress.", "a_little_low": "If progress feels slow, remember it''s been compounding even when it doesn''t feel dramatic week to week.", "okay": "Choose one specific, small progression to attempt this week.", "good": "Notice a real strength gain and name it specifically.", "really_good": "Let today''s capability feel earned, because it is."}'::jsonb,
  'No change tied to this week''s topic.',
  'Note one physical thing you can do now that felt impossible eight months ago.',
  'Share a specific strength win with your support person.',
  'Deliberate, sustainable progress — the kind that actually lasts.',
  'Mention any persistent plateau or discomfort with progression.',
  null
),
(
  75,
  'postpartum',
  'Your body, your own terms',
  'Your body did something extraordinary. It doesn''t owe anyone a specific shape now.',
  'Notice how you''re actually talking to yourself about your body, and gently challenge any of it that isn''t kind.',
  'Eight months in, body-image pressure can resurface — sometimes from other people, sometimes from your own expectations. This week is a deliberate pause on that, separate from the fitness and strength content elsewhere in this chart.',
  ARRAY['Pride in your body''s capability alongside complicated feelings about its appearance','Comparison to your pre-pregnancy body, or to other mothers','Genuine self-acceptance that''s grown over these months','Comments from others about your body that land unevenly','A body that looks and feels different, in ways both wanted and unwanted']::text[],
  '{"focus": "Train for function and feeling rather than appearance.", "recovery_route": {"vaginal": "", "assisted_tear": "", "caesarean": "", "complications": ""}, "tiers": {"heavy": "Choose one movement that makes daily life feel easier.", "steady": "Walk for 8 minutes, then practise sit-to-stand, push and carry patterns.", "feeling_good": "Complete a functional circuit: sit-to-stands, incline push-ups, heel raises and a light carry."}, "mood_adjustment": "Heavy: choose comfort. Low: avoid mirrors or tracking if unhelpful. Okay: focus on function. Good or really good: record what felt capable, not how it looked.", "safety": "Stop and seek advice for new or worsening pain, pelvic heaviness or bulging, leaking, dizziness, faintness, chest pain or unusual breathlessness."}'::jsonb,
  'Food remains fuel, not penance. This isn''t a week to restrict in response to body-image thoughts.',
  'Continue your regular routine.',
  'No change tied to this week''s topic.',
  'No change tied to this week''s topic.',
  '{"heavy_day": "If body-image thoughts feel loud and unkind today, that deserves compassion, not silence — tell someone if it''s weighing on you.", "a_little_low": "Complicated feelings about a changed body are common and valid, even amid real gratitude for what it did.", "okay": "Notice one thing your body has done for you today, separate from how it looks.", "good": "Let a good body-image day simply be good, without needing to justify it.", "really_good": "Use today''s confidence to challenge one unkind thought you''d normally let slide."}'::jsonb,
  'Wear something today that actually fits and feels good on your current body, not your old one.',
  'Write down one thing about your changed body you''ve come to appreciate.',
  'If someone''s comments about your body have been unhelpful, it''s fine to say so plainly.',
  'Treating your body with real kindness is its own form of recovery.',
  'If body-image distress feels significant or persistent, mention it — support exists for this specifically.',
  null
),
(
  76,
  'postpartum',
  'As the village changes shape',
  'Support looks different now, and that''s allowed.',
  'Notice how your support network has shifted since the earliest weeks, and adjust deliberately.',
  'The intense, hands-on help common in the first weeks often fades by now, even though real needs continue. This week is about naming what support actually looks like today, rather than assuming it should look the same as it did at the start.',
  ARRAY['Less frequent help than in early postpartum, even though needs continue','A more independent daily routine that''s mostly working','Occasional moments where more support would genuinely help','Gratitude for people who''ve stayed closely involved','A wish for connection that looks different from practical help — friendship, conversation, company']::text[],
  '{"focus": "Let support make movement more available.", "recovery_route": {"vaginal": "", "assisted_tear": "", "caesarean": "", "complications": ""}, "tiers": {"heavy": "Ask someone to hold the practical load while you take five minutes.", "steady": "Use a protected 15-minute movement window without multitasking.", "feeling_good": "Take 30 minutes for your routine while another person fully owns baby care or household work."}, "mood_adjustment": "Heavy: ask for rest instead. Low: move with company. Okay: protect 15 minutes. Good: protect 30. Really good: keep the handover even if you finish early.", "safety": "Stop and seek advice for new or worsening pain, pelvic heaviness or bulging, leaking, dizziness, faintness, chest pain or unusual breathlessness."}'::jsonb,
  'No change tied to this week''s topic.',
  'Continue your regular routine.',
  'No change tied to this week''s topic.',
  'No change tied to this week''s topic.',
  '{"heavy_day": "If support has quietly disappeared and you''re struggling, it''s fine to ask for it back, directly.", "a_little_low": "Feeling less supported than before, even as things objectively get easier, is a real and valid feeling.", "okay": "Name one specific kind of support you could genuinely use more of right now.", "good": "Notice who''s genuinely shown up for you these past months, and let yourself feel that fully.", "really_good": "Reach out to someone in your circle just to reconnect, not because you need something."}'::jsonb,
  'No change tied to this week''s topic.',
  'Write down who has surprised you with their support this year.',
  'Ask directly for the specific kind of support you actually need now, rather than the kind that was offered in the early weeks.',
  'Building and adapting your own village is real, ongoing work.',
  'No specific ask this week.',
  null
),
(
  77,
  'postpartum',
  'Your working rhythm',
  'If you''ve returned to work, this is worth a real check-in — not just an assumption it''s fine.',
  'Honestly assess how your working rhythm — inside or outside the home — is actually going.',
  'Many mothers have returned to paid work by this stage, often with real adjustment still ongoing. If you''re not working outside the home, your daily rhythm has likely also shifted meaningfully by now. Either way, this week is about checking whether the current balance is genuinely working.',
  ARRAY['A working rhythm that''s settled, or one that still feels difficult','Guilt, relief, or a mix of both about your current arrangement','Physical fatigue tied to juggling work and caregiving demands','Questions about whether anything needs to change','Pride in managing a genuinely demanding stretch of life']::text[],
  '{"focus": "Counter the repeated positions of paid and unpaid work.", "recovery_route": {"vaginal": "", "assisted_tear": "", "caesarean": "", "complications": ""}, "tiers": {"heavy": "Do 5 shoulder rolls, 8 heel raises, 6 sit-to-stands and relaxed breathing.", "steady": "Alternate 3 minutes of walking with posture and mobility breaks for 15 minutes.", "feeling_good": "Walk for 12 minutes, then complete two rounds of incline push-ups, sit-to-stands and shoulder-blade squeezes."}, "mood_adjustment": "Heavy: one posture break. Low: gentle walk. Okay: 15 minutes. Good: 30. Really good: improve the workday setup instead of adding a harder session.", "safety": "Stop and seek advice for new or worsening pain, pelvic heaviness or bulging, leaking, dizziness, faintness, chest pain or unusual breathlessness."}'::jsonb,
  'No change tied to this week''s topic.',
  'Continue your regular routine.',
  'If pumping or feeding logistics around work still feel unresolved, it''s worth troubleshooting further, however long you''ve been managing it.',
  'Juggling work and caregiving is genuinely demanding — rest remains a real need, not a luxury.',
  '{"heavy_day": "If work and caregiving feel unmanageable today, that''s real, not a personal failing.", "a_little_low": "Guilt about working, or about not working, is common in both directions — it doesn''t mean you''re doing it wrong.", "okay": "Name one specific thing about your current rhythm that could genuinely be adjusted.", "good": "Notice one part of your current balance that''s actually working well.", "really_good": "Use today''s clarity to raise a specific change with your workplace or household, if one''s needed."}'::jsonb,
  'No change tied to this week''s topic.',
  'Write down how your sense of "balance" has changed since before the baby.',
  'Talk honestly with your partner or household about whether the current division of labour is actually working.',
  'Managing work and caregiving simultaneously, however it looks, is real, demanding work.',
  'No specific ask this week.',
  null
),
(
  78,
  'postpartum',
  'Building endurance',
  'Longer efforts, built the same gradual way as everything before them.',
  'If building endurance — for running or another activity — progress duration gradually.',
  'If you''ve been building toward longer runs, sessions or activities, this week is about extending duration specifically, using the same gradual, symptom-led approach as every prior progression in this journey.',
  ARRAY['Growing endurance for longer efforts, if that''s a goal','No interest in longer sessions, and that''s equally valid','Continued strength alongside any endurance work','Occasional fatigue that signals a need to hold steady rather than progress','Real satisfaction in sustained physical capability']::text[],
  '{"focus": "Build endurance by adding time gradually.", "recovery_route": {"vaginal": "", "assisted_tear": "", "caesarean": "", "complications": ""}, "tiers": {"heavy": "Walk easily for 5 minutes.", "steady": "Use 12 minutes of conversational walking plus 3 minutes of mobility.", "feeling_good": "Choose 20--25 minutes of steady low-impact activity and 5--10 minutes of cool-down or strength."}, "mood_adjustment": "Heavy: restore. Low: maintain duration. Okay: 15 minutes. Good: 30. Really good: increase duration modestly, not intensity and duration together.", "safety": "Stop and seek advice for new or worsening pain, pelvic heaviness or bulging, leaking, dizziness, faintness, chest pain or unusual breathlessness."}'::jsonb,
  'Longer efforts need matched fuelling — don''t extend duration while also cutting food.',
  'Increase gradually alongside any duration increase.',
  'No change tied to this week''s topic.',
  'Longer efforts need proportionally more recovery time.',
  '{"heavy_day": "Holding steady, or resting, is a valid choice — not every week has to add more.", "a_little_low": "If endurance feels slow to build, remember it''s genuinely one of the slower-building forms of fitness.", "okay": "Choose one small, specific extension to attempt this week.", "good": "Notice real endurance gains and name them specifically.", "really_good": "Let today''s stamina feel like the real, earned result of months of consistency."}'::jsonb,
  'No change tied to this week''s topic.',
  'Note how your relationship with movement has changed since early postpartum.',
  'Share an endurance goal with your support person if you have one.',
  'Building real, sustainable endurance — the kind that lasts.',
  'Mention any symptoms that appear specifically with longer efforts.',
  null
),
(
  79,
  'postpartum',
  'Nine months — as long as pregnancy',
  'You''ve now spent as long recovering as you spent growing your baby.',
  'Pause on this real, symbolic marker — nine months postpartum, matching the length of pregnancy itself.',
  'There''s something worth noticing about reaching nine months postpartum — you''ve now spent as long in recovery and adjustment as you spent pregnant. Both are real, significant spans of time, and this one deserves the same recognition.',
  ARRAY['A genuine sense of how far you''ve come since birth','Continued small physical or emotional adjustments, even this far in','Pride alongside occasional wistfulness for how quickly time has moved','A settled sense of your current routine and rhythm','Anticipation for the final stretch toward the first birthday']::text[],
  '{"focus": "Use the nine-month marker as a function check, not a test.", "recovery_route": {"vaginal": "", "assisted_tear": "", "caesarean": "", "complications": ""}, "tiers": {"heavy": "Choose your most helpful five-minute routine from the year.", "steady": "Repeat a favourite 15-minute walk or circuit and notice what feels easier.", "feeling_good": "Complete a familiar 30-minute routine, comparing function only with your own earlier baseline."}, "mood_adjustment": "Heavy: acknowledge capacity without testing it. Low: choose a favourite. Okay: 15 minutes. Good or really good: reflect before progressing.", "safety": "Stop and seek advice for new or worsening pain, pelvic heaviness or bulging, leaking, dizziness, faintness, chest pain or unusual breathlessness."}'::jsonb,
  'No change tied to this week''s topic.',
  'Continue your regular routine.',
  'No change tied to this week''s topic.',
  'No change tied to this week''s topic.',
  '{"heavy_day": "Nine months in, a hard day is still just a hard day — not a step back from real progress.", "a_little_low": "Milestones can stir complicated feelings alongside real pride. Both belong.", "okay": "Compare where you are now to nine months ago, honestly and specifically.", "good": "Let today''s steadiness be a genuine marker of everything behind you.", "really_good": "Mark this nine-month point in a way that feels meaningful to you."}'::jsonb,
  'No change tied to this week''s topic.',
  'Write a short reflection: nine months pregnant, and now nine months on the other side.',
  'Share this milestone with someone who was there for the pregnancy too.',
  'Nine months of postpartum life, matching nine months of pregnancy — both real, both significant.',
  'No specific ask this week.',
  null
),
(
  80,
  'postpartum',
  'Skin, settled routine',
  'Whatever''s been working, keep it — this isn''t a week that needs a change.',
  'Confirm your skin and self-care routine still fits your current life.',
  'By ten months, your skin and self-care needs have likely settled into a rhythm distinct from pregnancy or early postpartum. This is a light week to simply confirm your routine still makes sense, rather than introducing anything new.',
  ARRAY['A stable, simple self-care routine','Skin that''s mostly settled from any pregnancy-related changes','Occasional reminders to actually keep up with your own routine','A wish for a slightly more indulgent step, if time allows','Confidence in what actually works for you now']::text[],
  '{"focus": "Restore mobility around repetitive carrying and caregiving.", "recovery_route": {"vaginal": "", "assisted_tear": "", "caesarean": "", "complications": ""}, "tiers": {"heavy": "Mobilise neck, shoulders, wrists, hips and ankles gently.", "steady": "Walk for 7 minutes, then use 8 minutes of comfortable mobility.", "feeling_good": "Combine 15 minutes of walking with 15 minutes of mobility and light strength."}, "mood_adjustment": "Heavy: mobility only. Low: slow walk. Okay: 15 minutes. Good: 30. Really good: stay within comfortable range instead of stretching aggressively.", "safety": "Stop and seek advice for new or worsening pain, pelvic heaviness or bulging, leaking, dizziness, faintness, chest pain or unusual breathlessness."}'::jsonb,
  'No change tied to this week''s topic.',
  'Continue your regular routine.',
  'No change tied to this week''s topic.',
  'No change tied to this week''s topic.',
  '{"heavy_day": "Skipping your routine on a hard day is fine — it will be there tomorrow.", "a_little_low": "A small self-care ritual, even briefly, can be genuinely grounding on a harder day.", "okay": "Confirm your current routine still fits, and drop anything that''s become unnecessary.", "good": "Enjoy a small, unhurried moment of self-care today.", "really_good": "If time allows, add one slightly more indulgent step just because you want to."}'::jsonb,
  'Confirm daily SPF is still part of your routine — the one constant across every stage.',
  'Note one small self-care ritual that''s genuinely made a difference this year.',
  'Ask for ten uninterrupted minutes for your own routine today.',
  'A simple, sustainable self-care routine you''ve actually kept up is a real achievement.',
  'No specific ask this week.',
  null
),
(
  81,
  'postpartum',
  'Small moments of connection',
  'Connection doesn''t need a big occasion.',
  'Build in one small, deliberate moment of connection with someone who matters to you.',
  'As routines settle, it''s easy for connection with partners, friends and family to happen only by accident, if at all. This week is about making one small piece of it deliberate.',
  ARRAY['A wish for more connection than your current routine allows','Genuine closeness with the people around you','Busyness that''s crowded out relationships outside caregiving','A body and mind with more capacity for connection than a few months ago','Gratitude for the people who''ve stayed close this year']::text[],
  '{"focus": "Use movement as a small point of connection.", "recovery_route": {"vaginal": "", "assisted_tear": "", "caesarean": "", "complications": ""}, "tiers": {"heavy": "Walk or stretch beside someone for five minutes — or choose solitude.", "steady": "Take a 15-minute connection walk without phones if that feels welcome.", "feeling_good": "Share 20 minutes of easy movement, then take 10 minutes for your own strength or mobility."}, "mood_adjustment": "Heavy: ask for presence, not exercise. Low: invite company. Okay: short connection. Good or really good: protect conversation from logistics.", "safety": "Stop and seek advice for new or worsening pain, pelvic heaviness or bulging, leaking, dizziness, faintness, chest pain or unusual breathlessness."}'::jsonb,
  'No change tied to this week''s topic.',
  'Continue your regular routine.',
  'No change tied to this week''s topic.',
  'No change tied to this week''s topic.',
  '{"heavy_day": "Connection can wait for an easier day — today, focus on rest.", "a_little_low": "Feeling disconnected from others is common this year, not a personal failing.", "okay": "Reach out to one person today, just to say hello.", "good": "Let today''s ease make space for a real conversation with someone.", "really_good": "Plan a specific moment of connection for this week, and protect it."}'::jsonb,
  'No change tied to this week''s topic.',
  'Write down who you''ve missed connecting with this year, and one small way back to them.',
  'Plan one small, shared moment with your partner or closest support person this week.',
  'Making space for connection, even in small doses, matters.',
  'No specific ask this week.',
  null
),
(
  82,
  'postpartum',
  'A deload week',
  'Sometimes the most productive thing is deliberately less.',
  'Take a genuinely lighter week, on purpose, to support ongoing progress.',
  'Regular lighter weeks are part of any sustainable training pattern — not a sign of losing momentum, but a deliberate way to keep progressing without burning out. This week is a permission slip to scale back on purpose.',
  ARRAY['Genuine benefit from a lighter week, physically and mentally','Some discomfort with the idea of deliberately doing less','Continued baseline strength, even with reduced effort this week','A useful reset before pushing further afterward','Relief at an explicitly lower-pressure week']::text[],
  '{"focus": "Take a deliberate lighter week to absorb progress.", "recovery_route": {"vaginal": "", "assisted_tear": "", "caesarean": "", "complications": ""}, "tiers": {"heavy": "Breathing and gentle mobility only.", "steady": "Use about half your usual volume at easy effort.", "feeling_good": "Choose 20 minutes of comfortable movement plus 10 minutes of mobility; avoid maximal work."}, "mood_adjustment": "Every mood: finish fresher than you started. A deload is planned recovery, not lost progress.", "safety": "Stop and seek advice for new or worsening pain, pelvic heaviness or bulging, leaking, dizziness, faintness, chest pain or unusual breathlessness."}'::jsonb,
  'No change tied to this week''s topic.',
  'Continue your regular routine.',
  'No change tied to this week''s topic.',
  'Use the reduced training load this week to prioritise extra rest.',
  '{"heavy_day": "A deload week matched with a hard day is completely fine — just rest more than usual.", "a_little_low": "Deliberately doing less isn''t a step backward — it''s part of a smarter, more sustainable approach.", "okay": "Notice how a lighter week actually feels, physically and mentally.", "good": "Enjoy the lower pressure without needing to fill it with something else.", "really_good": "Let today''s ease be genuinely restorative, not a missed opportunity."}'::jsonb,
  'Use extra time this week for a longer, unhurried self-care moment.',
  'Note how it feels to deliberately do less for once.',
  'Use this lighter week to spend unhurried time with your baby or your support person, without a fitness goal attached.',
  'Recognising when to scale back is as much a skill as knowing when to push.',
  'No specific ask this week.',
  null
),
(
  83,
  'postpartum',
  'Back to building',
  'Rested, and ready to add back in.',
  'Return to your regular training rhythm after last week''s deliberate lighter week.',
  'Coming off a lighter week, many people feel noticeably stronger and more capable. This week is about returning to your established routine, using that freshness productively rather than immediately overdoing it.',
  ARRAY['Renewed energy and strength after a lighter week','A body that responds well to the return of regular training','Continued steady progress overall','Occasional temptation to push harder than usual to "make up" for the lighter week — worth resisting','Growing confidence in your own training rhythm']::text[],
  '{"focus": "Return from the lighter week without jumping levels.", "recovery_route": {"vaginal": "", "assisted_tear": "", "caesarean": "", "complications": ""}, "tiers": {"heavy": "Complete one easy strength round.", "steady": "Use two rounds at the load you managed before the deload.", "feeling_good": "Resume the established routine at normal — not increased — volume."}, "mood_adjustment": "Heavy: stay restorative. Low: one round. Okay: two. Good: usual routine. Really good: wait until next week before progressing.", "safety": "Stop and seek advice for new or worsening pain, pelvic heaviness or bulging, leaking, dizziness, faintness, chest pain or unusual breathlessness."}'::jsonb,
  'No change tied to this week''s topic.',
  'Continue your regular routine.',
  'No change tied to this week''s topic.',
  'No change tied to this week''s topic.',
  '{"heavy_day": "Even coming off a rest week, a hard day is still a hard day — scale back as needed.", "a_little_low": "Returning to routine after a break can feel harder than expected — that''s normal, not a setback.", "okay": "Notice how last week''s lighter load affected how you feel today.", "good": "Enjoy the renewed energy without overcommitting to it.", "really_good": "Use today''s strength productively, at your established level."}'::jsonb,
  'No change tied to this week''s topic.',
  'Note whether last week''s lighter approach changed how you feel about your routine.',
  'No change tied to this week''s topic.',
  'Using rest strategically, then returning to consistent effort, is real training wisdom.',
  'No specific ask this week.',
  null
),
(
  84,
  'postpartum',
  'A creative or personal revival',
  'A small return to something that''s just yours.',
  'Revive one creative or personal interest, even in a small way.',
  'Hobbies and creative interests are often among the first things set aside after a baby, and among the last to return. This week is a gentle nudge to bring one small piece of that back.',
  ARRAY['A wish to reconnect with a hobby or creative interest','Uncertainty about where to even start again','More time or energy available than a few months ago','Guilt about spending time on something "just for you"','Genuine enjoyment when you do make space for it']::text[],
  '{"focus": "Bring creativity and play into movement.", "recovery_route": {"vaginal": "", "assisted_tear": "", "caesarean": "", "complications": ""}, "tiers": {"heavy": "Move to one song, stretch freely or take a playful walk.", "steady": "Choose dance, yoga-inspired mobility, outdoor walking or another enjoyable option for 15 minutes.", "feeling_good": "Use 20 minutes of enjoyable movement and 10 minutes of strength that supports it."}, "mood_adjustment": "Heavy: soothing movement. Low: music or fresh air. Okay: play for 15 minutes. Good or really good: choose curiosity over tracking.", "safety": "Stop and seek advice for new or worsening pain, pelvic heaviness or bulging, leaking, dizziness, faintness, chest pain or unusual breathlessness."}'::jsonb,
  'No change tied to this week''s topic.',
  'Continue your regular routine.',
  'No change tied to this week''s topic.',
  'No change tied to this week''s topic.',
  '{"heavy_day": "A creative revival can wait for an easier week — today, rest is enough.", "a_little_low": "Wanting time for yourself doesn''t make you a less devoted parent.", "okay": "Name one small, specific step back toward a hobby you''ve missed.", "good": "Spend today''s good energy on something creative or personal, guilt-free.", "really_good": "Take a real, concrete step toward reviving something that''s just yours."}'::jsonb,
  'No change tied to this week''s topic.',
  'Write down one hobby or interest you want to make more room for.',
  'Ask your support person to protect a specific block of time for this.',
  'Making room for your own interests is good for you, not selfish.',
  'No specific ask this week.',
  null
),
(
  85,
  'postpartum',
  'Feeding, further along',
  'Wherever your feeding journey is now, it''s still yours to shape.',
  'Revisit your feeding plan honestly, whatever stage it''s reached.',
  'By this stage, many feeding journeys are evolving further — full weaning, continued breastfeeding alongside a wider diet, or a stable combination approach. This week is about checking the plan still genuinely fits, not about any particular "right" outcome.',
  ARRAY['A stable feeding pattern, or one still in transition','Questions about continuing, adjusting or ending a feeding method','Confidence in decisions made so far','Occasional pressure from others about what you "should" be doing by now','A body that''s adapted well to your current pattern']::text[],
  '{"focus": "Keep activity comfortable through feeding transitions.", "recovery_route": {"vaginal": "", "assisted_tear": "", "caesarean": "", "complications": ""}, "tiers": {"heavy": "Use breathing, upper-back mobility and a short walk.", "steady": "Walk for 10 minutes and add 5 minutes of posture work.", "feeling_good": "Choose your regular routine, adjusting impact or chest-loading for comfort."}, "mood_adjustment": "Heavy: comfort first. Low: gentle walk. Okay: 15 minutes. Good: 30 if feeding changes feel settled. Really good: do not ignore breast or chest discomfort.", "safety": "Stop and seek advice for new or worsening pain, pelvic heaviness or bulging, leaking, dizziness, faintness, chest pain or unusual breathlessness."}'::jsonb,
  'If your feeding method is changing, your own nutrition needs may shift too — adjust gradually alongside it.',
  'Continue your regular routine, adjusting with any feeding changes.',
  'Any feeding transition deserves gradual, comfortable pacing — for your body as much as your baby''s adjustment.',
  'No change tied to this week''s topic.',
  '{"heavy_day": "If a feeding decision feels heavy today, it doesn''t have to be finalised right now.", "a_little_low": "Outside pressure about feeding choices rarely accounts for your actual situation — your judgment matters most here.", "okay": "Name plainly what''s working and what isn''t in your current feeding plan.", "good": "Let a settled feeding routine, whatever it looks like, feel like the achievement it is.", "really_good": "Trust your own read on what''s right for your feeding journey from here."}'::jsonb,
  'No change tied to this week''s topic.',
  'Write down how your feeding journey has evolved since the very first week.',
  'If outside comments about feeding have been unhelpful, it''s fine to set a boundary about it.',
  'Ten months of feeding decisions, made thoughtfully, deserve real recognition.',
  'Ask for guidance on any feeding transition you''re considering.',
  null
),
(
  86,
  'postpartum',
  'Checking in again',
  'This matters at ten months as much as it did earlier.',
  'A second dedicated mental-health check-in, as the first birthday approaches.',
  'As explained in Week 31, postpartum depression and anxiety can begin at any point in the first year — including this late in it. This second check-in exists deliberately, because a first check-in doesn''t rule out something emerging later.',
  ARRAY['Continued steady mood, or something that''s shifted since Week 31','New anxiety, low mood or irritability that feels different from before','Approaching-milestone feelings — anticipation, grief, or both','Genuine confidence in how far you''ve come emotionally','Or nothing concerning at all, which remains the expected, good outcome']::text[],
  '{"focus": "Let movement support regulation while mental health gets real care.", "recovery_route": {"vaginal": "", "assisted_tear": "", "caesarean": "", "complications": ""}, "tiers": {"heavy": "Take five slow breaths and walk to a place where you can contact someone.", "steady": "Walk gently for 15 minutes with company or in a familiar setting.", "feeling_good": "Use an established routine only if it feels supportive and safe."}, "mood_adjustment": "Heavy: seek human help now. Low: move with support. Okay: gentle routine. Good or really good: do not use exercise to dismiss persistent symptoms.", "safety": "Stop and seek advice for new or worsening physical pain, and separately, seek support for any mental-health symptoms regardless of physical safety."}'::jsonb,
  'No specific dietary change is needed for this topic.',
  'Continue your regular routine.',
  'No change tied to this week''s topic.',
  'Protecting rest continues to matter for mood, this far into the year.',
  '{"heavy_day": "If today feels genuinely heavy — hopeless, numb or frightening — tell someone now and seek professional support, exactly as you would have at week one.", "a_little_low": "Persistent low mood at ten months is just as worth raising as it would have been at ten weeks.", "okay": "Rate the last month of your mood and anxiety honestly, not just today.", "good": "If you''re genuinely doing well, that''s real and worth naming.", "really_good": "Check in on someone else in your circle who might be struggling quietly."}'::jsonb,
  'No change tied to this week''s topic.',
  'Write down, honestly, how your mood has actually been over the past month.',
  'Tell someone you trust how you''ve really been feeling.',
  'Checking in again, even after a first check felt fine, is genuine ongoing self-care.',
  'Ask specifically for a mood and anxiety check if anything in this week''s list resonated.',
  null
),
(
  87,
  'postpartum',
  'Nearly a year',
  'Start thinking about the birthday now, without pressure.',
  'Begin thinking practically and emotionally about the approaching first birthday.',
  'With the first birthday a few weeks away, this is a reasonable time to start any practical planning, if that matters to you, and to begin sitting with the emotional weight of the milestone, which can be significant regardless of how big or small your plans are.',
  ARRAY['Excitement about the upcoming milestone','Complicated feelings about time passing this quickly','Practical planning thoughts, if a celebration matters to you','Pride in reaching this point, alongside genuine disbelief at how fast it went','No particular feelings at all, which is equally valid']::text[],
  '{"focus": "Keep movement steady while birthday planning adds load.", "recovery_route": {"vaginal": "", "assisted_tear": "", "caesarean": "", "complications": ""}, "tiers": {"heavy": "Choose five minutes that reduces tension.", "steady": "Walk for 10 minutes and mobilise for 5.", "feeling_good": "Use a familiar 30-minute routine with no new progression."}, "mood_adjustment": "Heavy: rest. Low: walk. Okay: 15 minutes. Good: 30. Really good: save energy for the life event rather than adding training stress.", "safety": "Stop and seek advice for new or worsening pain, pelvic heaviness or bulging, leaking, dizziness, faintness, chest pain or unusual breathlessness."}'::jsonb,
  'No change tied to this week''s topic.',
  'Continue your regular routine.',
  'No change tied to this week''s topic.',
  'No change tied to this week''s topic.',
  '{"heavy_day": "Milestone planning can wait for an easier day — nothing needs to be decided today.", "a_little_low": "Feeling emotional about time passing is common and doesn''t need justifying.", "okay": "If a celebration matters to you, jot down a simple, low-pressure plan.", "good": "Let anticipation for the birthday feel genuinely exciting.", "really_good": "Use today''s energy for any practical planning that matters to you."}'::jsonb,
  'No change tied to this week''s topic.',
  'Write down what you want to remember about this first year, before the birthday arrives.',
  'Talk with your support person about how you both want to mark the milestone, if at all.',
  'Nearly a full year of this extraordinary work. That''s genuinely remarkable.',
  'No specific ask this week.',
  null
),
(
  88,
  'postpartum',
  'Consolidating your progress',
  'Look at the whole picture, not just today.',
  'Take stock of your overall physical progress across the full year.',
  'With the first birthday close, this is a good week to look at your physical journey as a whole — strength, stamina, and whatever goals you''ve been building toward — rather than just today''s session.',
  ARRAY['Substantial, real physical progress since early postpartum','A body that feels capable and largely familiar again','Continued small, ongoing adjustments, even this far in','Pride in consistent, sustainable effort over many months','Clarity about what you want to keep building toward next']::text[],
  '{"focus": "Review progress through practical benchmarks.", "recovery_route": {"vaginal": "", "assisted_tear": "", "caesarean": "", "complications": ""}, "tiers": {"heavy": "Repeat a favourite five-minute strength sequence.", "steady": "Choose a 15-minute routine from earlier in the year and notice control and comfort.", "feeling_good": "Complete a familiar 30-minute routine and note stamina, strength, symptoms and enjoyment."}, "mood_adjustment": "Heavy: reflect without testing. Low: choose an easy favourite. Okay: 15 minutes. Good or really good: compare only with your own starting point.", "safety": "Stop and seek advice for new or worsening pain, pelvic heaviness or bulging, leaking, dizziness, faintness, chest pain or unusual breathlessness."}'::jsonb,
  'No change tied to this week''s topic.',
  'Continue your regular routine.',
  'No change tied to this week''s topic.',
  'No change tied to this week''s topic.',
  '{"heavy_day": "Even now, a hard day doesn''t undo a year of real progress.", "a_little_low": "If today doesn''t feel like progress, remember the overall trend, not any single day, tells the real story.", "okay": "Write down three specific physical gains from this past year.", "good": "Let today''s capability feel like the earned result of consistent work.", "really_good": "Set one genuine goal for the year ahead."}'::jsonb,
  'No change tied to this week''s topic.',
  'Note the single biggest physical change you''ve noticed this year.',
  'Share your year''s progress with your support person, and thank them for their part in it.',
  'A full year of real, sustained physical progress. That is substantial.',
  'No specific ask this week.',
  null
),
(
  89,
  'postpartum',
  'Everything you''ve carried',
  'This year asked more of you than almost anything ever will again.',
  'Reflect honestly on everything this year has actually required of you.',
  'With the birthday just ahead, this week is for a full, honest reflection — not just the highlights, but everything genuinely hard about this year too. Both belong in the full picture.',
  ARRAY['Pride in everything you''ve managed this year','Genuine grief for parts of it that were hard','A complex mix of emotions that resists easy summary','Relief at reaching this point, alongside excitement for what''s next','A clearer sense of your own resilience than you had a year ago']::text[],
  '{"focus": "Choose the movement habit you want to carry beyond year one.", "recovery_route": {"vaginal": "", "assisted_tear": "", "caesarean": "", "complications": ""}, "tiers": {"heavy": "Do the smallest version of that habit for five minutes.", "steady": "Practise it for 15 minutes at an easy, repeatable level.", "feeling_good": "Build a 30-minute version that fits real life and leaves energy for the day."}, "mood_adjustment": "Heavy: keep the habit tiny. Low: choose familiarity. Okay: practise. Good: build. Really good: resist making the plan more complicated.", "safety": "Stop and seek advice for new or worsening pain, pelvic heaviness or bulging, leaking, dizziness, faintness, chest pain or unusual breathlessness."}'::jsonb,
  'No change tied to this week''s topic.',
  'Continue your regular routine.',
  'No change tied to this week''s topic.',
  'No change tied to this week''s topic.',
  '{"heavy_day": "If this reflection brings up real pain, let it. You don''t have to tie this year up neatly.", "a_little_low": "Grief for the hard parts of this year doesn''t cancel out pride in getting through them.", "okay": "Write down one genuinely hard thing from this year, honestly, without minimising it.", "good": "Write down one genuinely good thing, and let yourself feel it fully.", "really_good": "Let today''s warmth hold space for the whole year — hard parts included."}'::jsonb,
  'No change tied to this week''s topic.',
  'Write the honest, full story of this year — not just the highlights.',
  'Share one hard truth from this year with someone who''ll simply listen.',
  'Everything you carried this year, the easy parts and the hard ones, is real and worth honouring.',
  'No specific ask this week.',
  null
),
(
  90,
  'postpartum',
  'Your village, one year on',
  'Notice who actually showed up.',
  'Take stock of the people who''ve supported you this year, and thank them specifically.',
  'A year in, it''s worth naming who has actually been part of your support system — not who you expected, necessarily, but who genuinely showed up. Gratitude, specifically expressed, tends to strengthen the relationships that matter most.',
  ARRAY['A clearer sense of who your real support system has been','Gratitude for people who showed up in ways you didn''t expect','Some relationships that mattered less than anticipated, and that''s alright','A wish to strengthen certain connections going forward','Pride in building your own version of a village this year']::text[],
  '{"focus": "Share movement or gratitude with someone who supported you.", "recovery_route": {"vaginal": "", "assisted_tear": "", "caesarean": "", "complications": ""}, "tiers": {"heavy": "Take a five-minute gratitude walk or stretch.", "steady": "Walk with a supporter for 15 minutes, or move alone while reflecting.", "feeling_good": "Use 20 minutes for shared movement and 10 minutes for your own strength."}, "mood_adjustment": "Heavy: send a message instead. Low: ask for company. Okay: short walk. Good or really good: let connection — not performance — lead.", "safety": "Stop and seek advice for new or worsening pain, pelvic heaviness or bulging, leaking, dizziness, faintness, chest pain or unusual breathlessness."}'::jsonb,
  'No change tied to this week''s topic.',
  'Continue your regular routine.',
  'No change tied to this week''s topic.',
  'No change tied to this week''s topic.',
  '{"heavy_day": "If this year has felt isolating, that''s worth naming honestly, and worth changing going forward.", "a_little_low": "Realising some relationships mattered less than expected, while others surprised you, is a real and common experience.", "okay": "List three people who genuinely showed up for you this year.", "good": "Send a specific, genuine thank-you to one of them today.", "really_good": "Use today''s warmth to plan how to nurture these relationships going forward."}'::jsonb,
  'No change tied to this week''s topic.',
  'Write down what "village" has actually meant for you this year.',
  'Tell one person specifically what their support meant to you this year.',
  'The village you''ve built, however it looks, has carried real weight this year.',
  'No specific ask this week.',
  null
),
(
  91,
  'postpartum',
  'The final stretch',
  'Nearly there. Let yourself feel whatever this brings up.',
  'Prepare for the birthday, practically and emotionally, however that looks for you.',
  'With one week to go, any final practical preparations can happen now, alongside space for whatever emotions this last stretch brings up — excitement, grief for the baby stage ending, pride, or all of it together.',
  ARRAY['Final practical preparations, if a celebration is planned','A rush of emotion about the year coming to a close','Genuine excitement for the milestone itself','Grief for the newborn and baby stages that are ending','A body and mind that feel, overall, remarkably more capable than a year ago']::text[],
  '{"focus": "Use a lower-load week before the first-year milestone.", "recovery_route": {"vaginal": "", "assisted_tear": "", "caesarean": "", "complications": ""}, "tiers": {"heavy": "Breathe, mobilise and stop at five minutes.", "steady": "Choose easy walking or one light circuit.", "feeling_good": "Use 20 minutes of comfortable movement and 10 minutes of recovery mobility."}, "mood_adjustment": "Heavy: rest. Low: 5--15 minutes. Okay: easy 15. Good or really good: keep effort moderate and preserve emotional energy.", "safety": "Stop and seek advice for new or worsening pain, pelvic heaviness or bulging, leaking, dizziness, faintness, chest pain or unusual breathlessness."}'::jsonb,
  'No change tied to this week''s topic.',
  'Continue your regular routine.',
  'No change tied to this week''s topic.',
  'No change tied to this week''s topic.',
  '{"heavy_day": "If the approaching milestone feels heavy rather than joyful, that''s a real and valid response too.", "a_little_low": "Grief for the baby stage ending, even while excited for what''s next, makes complete sense.", "okay": "Finish any last practical preparations that matter to you, without overcomplicating them.", "good": "Let excitement for the milestone feel uncomplicated today, if that''s how it feels.", "really_good": "Soak in this last week of the baby stage fully."}'::jsonb,
  'No change tied to this week''s topic.',
  'Write down what you want to remember about this very last week of your baby''s first year.',
  'Plan how you want to spend the birthday itself with the people who matter to you.',
  'One week from a full year of real, extraordinary work.',
  'No specific ask this week.',
  null
),
(
  92,
  'postpartum',
  'One year',
  'A full year of becoming, both of you.',
  'Mark this real, full milestone — for your baby, and just as much for you.',
  'One year ago, your body did something extraordinary, and everything since has been its own kind of extraordinary work — healing, adapting, learning, and building a life around a whole new person. This week closes the Rebuilding-through-Settling arc of this journey and opens the next one, built on everything behind you.',
  ARRAY['Genuine pride in a full year of sustained, real work','Complex emotions — joy, grief, relief, disbelief — often all at once','A body that feels substantially, if not identically, like your own again','A settled sense of your own rhythm, identity and capability','Real anticipation for the next stage, for both of you']::text[],
  '{"focus": "Celebrate the routine you built and choose what continues.", "recovery_route": {"vaginal": "If everything has stayed settled, most activities are now reasonable to continue building toward, at your own pace.", "assisted_tear": "Confirm your long-term pelvic-health plan, if anything remains open, as you move into ongoing maintenance.", "caesarean": "Confirm your long-term plan for scar and core function as you move into ongoing maintenance.", "complications": "Confirm what ongoing monitoring, if any, continues past the first year."}, "tiers": {"heavy": "Choose the five minutes that helped you most this year.", "steady": "Combine a favourite short walk with one favourite strength movement.", "feeling_good": "Create a personal celebration session from the movements you genuinely enjoy — no test, punishment or required intensity."}, "mood_adjustment": "Heavy: honour the year with rest. Low: choose a familiar favourite. Okay: 15 minutes. Good or really good: celebrate through movement only if it feels joyful.", "safety": "Stop and seek advice for new or worsening pain, pelvic heaviness or bulging, leaking, dizziness, faintness, chest pain or unusual breathlessness."}'::jsonb,
  'No change tied to this week''s topic — keep the sustainable pattern you''ve built.',
  'Continue your regular routine.',
  'Whatever your feeding journey has looked like across this year, it''s been real, sustained care from start to here.',
  'Keep protecting rest as consistently as you have been — that habit doesn''t expire at the one-year mark.',
  '{"heavy_day": "Even in this milestone week, a hard day is just a hard day — it doesn''t diminish the year behind it.", "a_little_low": "Milestones can stir up more than expected. You''re allowed to feel more than one thing today.", "okay": "Write an honest, full summary of this year — the hard parts and the real progress, together.", "good": "Let today''s steadiness be a genuine marker of everything you''ve built.", "really_good": "Mark this first birthday in whatever way feels true to you and your family."}'::jsonb,
  'Take stock of your full self-care routine as you move into the next phase, keeping what''s genuinely worked.',
  'Write a full-year letter to yourself — everything you want to remember about this journey.',
  'Thank everyone who''s been part of this year, specifically and fully.',
  'One full year of becoming — as a mother, and as yourself. This is real, sustained, extraordinary work, and it deserves to be recognised in full.',
  'Confirm what ongoing care, if any, continues past the one-year mark, and what to watch for as you move forward.',
  '[{"flag": "diabetes_gd", "note": "Gestational diabetes: keep the long-term diabetes-screening plan active even if the early postpartum test was normal."}, {"flag": "high_bp", "note": "High blood pressure or pre-eclampsia: make sure primary care knows this pregnancy history and that cardiovascular risk factors are reviewed over time."}, {"flag": "thyroid", "note": "Thyroid or autoimmune disease: continue medicines and testing as prescribed; new fatigue, palpitations, temperature intolerance or mood change deserves reassessment."}]'::jsonb
);
