-- Care Chart week-by-week rebuild — Sustainable Rhythms Part 2 content, 2026-07-29.
--
-- Sixth batch of the postpartum week-by-week build (Early healing, Finding
-- rhythm, Rebuilding, Settling into strength, and Sustainable Rhythms Part 1
-- came before this). Covers postpartum weeks 79-104 (roughly 18-24 months),
-- closing at the second birthday and completing Sustainable Rhythms in full
-- (Parts 1 and 2 together = weeks 53-104). No schema changes needed beyond
-- migration_43 (the new mental_health_note column — see that file's header
-- for the full rationale). Week-number convention unchanged: postpartum
-- week 79 = week_number 119, week 104 = week_number 144.
--
-- Claude drafted the full 26-week base version first (see
-- "Care Chart — Sustainable Rhythms Part 2 — Base Draft (Weeks 79-104).md"),
-- deliberately dropping the "Choose your recovery route" block that every
-- earlier postpartum batch carried -- by 18-24 months, vaginal-vs-caesarean
-- physical differences have long resolved for the overwhelming majority of
-- mothers, so the field is simply left out of every week's move jsonb
-- (optional key, same as the schema already allowed). Per Roop's explicit
-- instruction this session ("whatever we are drafting should also include
-- the mental methods for postpartum depression as well"), the base draft
-- also wove real, named coping techniques into every week's Reset section
-- (box breathing, 5-4-3-2-1 grounding, self-compassion breaks, cognitive
-- defusion, opposite action, progressive muscle relaxation) and kept two
-- dedicated general-wellbeing check-in weeks (88 and 100, matching the
-- established pattern from Settling into Strength's weeks 31/46 and
-- Sustainable Rhythms Part 1's week 75) -- still deliberately NOT labelled
-- "postpartum depression," since this batch runs well past the verified
-- 12-month onset window.
--
-- Roop ran the draft through another AI app and sent back "Care Chart —
-- Postpartum Sustainable Rhythms Part 2 — Final Move Reset and Mental
-- Health Edition." This doc's structure differed from every prior batch's
-- in a way that required a new parser (parse_sr2.py, adapted from
-- parse_sr1.py): the reviewed doc's "This week in your recovery," "What you
-- may notice," "Move --- choose by time and mood," and "Reset --- choose
-- your mood" section headers no longer carry a "-----" underline the way
-- every previous doc's did -- confirmed via direct inspection this was a
-- real formatting change in the source doc, not a parsing artifact, since
-- grep found only 2 total dash-underline occurrences in the whole file (both
-- in the front-matter "Persistent foundations"/"Urgent warning signs"
-- sections, not per-week headers). Adjusted every affected regex
-- accordingly. Also caught and fixed one new stray-backslash pattern at
-- week 84 ("thought that\..." in the source docx, a backslash before an
-- ellipsis rather than before an apostrophe/quote/underscore like every
-- prior batch's stray backslashes) -- generalized the cleaning regex to
-- strip a backslash before any of ' " _ or . rather than just the first
-- three. Re-validated after the fix: zero stray backslashes in any of the
-- 26 weeks' extracted fields (double-checked programmatically, not just
-- visually, since json.dumps()'s own escaping of apostrophes in Python
-- repr() output gave a false positive on the first pass).
--
-- The real, substantive difference in this doc, beyond the new mental-
-- health field (see migration_43): the Move pillar was rewritten in all 26
-- weeks (confirmed programmatically -- 0 of 26 weeks left unchanged),
-- following the same pattern as Settling into Strength and Sustainable
-- Rhythms Part 1 -- specific functional-strength patterns (sit-to-stand,
-- hinge, squat, carry, push, row, calf/heel raise) with real rep counts,
-- rotating strength/mobility/balance/endurance/restorative formats. Spot-
-- checked all 26 weeks' Move content for new numeric/clinical claims --
-- found none; everything matches standard, non-postpartum-specific
-- strength-and-conditioning practice, no specific protocol like Rebuilding's
-- running-readiness battery. The Reset pillar's coping techniques from
-- Claude's own draft were kept largely intact by the reviewer, with one
-- genuine clinical improvement: added explicit consent/safety hedging to
-- breathing and body-based techniques not present in Claude's draft (e.g.
-- week 79's box-breathing card now reads "If breath holds feel comfortable,
-- try..." and "Stop if it increases discomfort. This is an optional
-- settling exercise, not treatment" -- appropriate caution since breath-
-- holding techniques aren't universally comfortable, e.g. for some anxiety
-- presentations or respiratory conditions).
--
-- Week 104 (closing week) carries condition_notes -- all four flags
-- (diabetes_gd, high_bp, thyroid, pcos), same "closing-week long-term
-- reminders" pattern as Rebuilding's week 26, Settling into Strength's week
-- 52, and Sustainable Rhythms Part 1's week 78. Confirmed byte-for-byte
-- identical to Claude's own base draft, including the one quantified claim
-- (ADA/ACOG lifelong type-2-diabetes screening every 1-3 years after GDM)
-- independently verified via WebSearch before the base draft was written.
--
-- Content parsed programmatically from the pandoc-converted docx (not
-- hand-transcribed) and round-trip validated via the same state-machine
-- SQL-literal parser used for every prior migration in this series: 53
-- jsonb blocks, zero errors. All 26 week_numbers (119-144) present, no
-- gaps or duplicates. Parens and quotes balanced.
--
-- This closes Sustainable Rhythms in full and reaches the second birthday.
-- Next batch: Your rhythm, year three (postpartum weeks 105-156,
-- week_number 145-196) -- the final phase of the postpartum week-by-week
-- rebuild.

insert into care_chart_week_content (
  week_number, trimester, theme_title, mantra, priority, journey,
  what_you_may_notice, move, nourish, hydration_goal, feeding_comfort,
  rest_support, reset, care_for_yourself, your_corner, support_moment,
  celebrate_this_week, mental_health_note, for_your_care_team, condition_notes
) values
(
  119,
  'postpartum',
  'Toddler Energy, Your Own Fuel',
  'You don''t have to match her pace to keep up with her.',
  'Notice where your own energy actually goes each day, without judging it.',
  'Somewhere around now, "baby" has fully given way to "toddler" — more walking, more climbing, more everything, and a lot more of your own physical energy spent just keeping pace. It''s easy to measure your day only by how tired you are, without noticing where the tiredness is actually coming from.',
  ARRAY['Real physical fatigue from constant supervision and chasing, distinct from sleep debt','Less patience by late afternoon than you''d like','Guilt about wanting a break from someone you love this much','Your own meals and water intake slipping further down the list']::text[],
  '{"focus": "Restore energy rather than competing with toddler energy.", "tiers": {"heavy": "Mobilise shoulders, spine and hips, then walk gently.", "steady": "Take an 8-minute solo walk and complete one round of sit-to-stands, wall push-ups and heel raises.", "feeling_good": "Use 15 minutes of steady movement plus two controlled strength rounds."}, "mood_adjustment": "Heavy: restore. Low: five minutes. Okay: 15. Good: 30. Really good: finish with energy left.", "safety": "No specific caution this week beyond your own limits — this stage is about honoring fatigue, not pushing past it."}'::jsonb,
  'Toddlers eat unpredictably; you don''t have to. Keep a stash of foods you can eat one-handed and without reheating — nuts, boiled eggs, cut fruit — for the days a sit-down meal doesn''t happen.',
  'Fill a bottle you actually like carrying — you''ll drink more from something you enjoy using.',
  'If you''re still breastfeeding at this stage, it may now be occasional or comfort-based rather than nutritional — both are valid for as long as you both want it to continue.',
  'A 20-minute lie-down while she naps (if she still does) is rest, even if you don''t fall asleep.',
  '{"heavy_day": "If breath holds feel comfortable, try a gentle box pattern: breathe in, pause, breathe out, pause. Stop if it increases discomfort. This is an optional settling exercise, not treatment.", "a_little_low": "Try a brief sensory grounding: notice five things you see, four you feel, three you hear, two you smell and one you taste — or use fewer steps if that is easier.", "okay": "A steady day is worth noticing, not just surviving. Say to yourself: \"today was manageable\" — that''s a real, adequate outcome.", "good": "Write down one moment from today you don''t want to forget, even a sentence.", "really_good": "Let yourself actually enjoy it — no \"yes, but.\" A good day doesn''t need a catch."}'::jsonb,
  'A hand cream that smells like something other than baby products — a small, sensory reminder that you exist beyond caregiving.',
  'Ten minutes with something that has nothing to do with parenting — a book, a show, a hobby you used to have.',
  'Ask someone in your circle to take her for one hour this week, no occasion needed.',
  'You''re keeping up with a toddler. That''s genuinely demanding work, physically and mentally.',
  'If low mood, anxiety, numbness, anger, frightening thoughts or feeling unlike yourself is continuing or worsening, open Mental health & support. We can help you choose the next step.',
  'Ongoing fatigue at this stage is common and usually just reflects the real physical demands of toddler care — mention it at your next check-up if it feels disproportionate or isn''t improving with rest.',
  null
),
(
  120,
  'postpartum',
  'Language Explosion & Your Patience',
  'Repeating yourself isn''t failing — it''s how she''s learning.',
  'Notice your own patience threshold this week, without needing to fix it.',
  'Around 18 months, many toddlers start adding words rapidly, along with more insistent (and less clear) communication of what they want. The gap between what she wants to say and what she can say often shows up as frustration — hers and, honestly, yours too.',
  ARRAY['Repeating the same instruction many times a day','Frustration when you can''t understand what she''s asking for','A shorter fuse by evening than you''re proud of','Relief on the days communication clicks a little more easily']::text[],
  '{"focus": "Use rhythm to release tension and create a pause.", "tiers": {"heavy": "Relax your jaw, roll your shoulders and march or walk slowly.", "steady": "Walk to a steady beat for 10 minutes, then cool down for 5.", "feeling_good": "Choose 20 minutes of rhythmic cardio and 10 minutes of mobility."}, "mood_adjustment": "Heavy: soften effort. Low: rhythmic walk. Okay: 15. Good or really good: finish calmer, not depleted.", "safety": "No specific caution this week."}'::jsonb,
  'Protein at breakfast (eggs, yogurt, a lentil-based dish) can help steady your own mood and patience through the morning stretch.',
  'A glass of water before you respond to a frustrating moment — it buys you a few seconds and keeps you from running on empty.',
  'No specific note this week.',
  'If bedtime battles are also part of this stage, a 10-minute wind-down for yourself after she''s down matters as much as her routine does.',
  '{"heavy_day": "If it is safe, pause before responding and deliberately lower your voice or step away briefly. The goal is to create space, not suppress what you feel.", "a_little_low": "Text one person just \"having a rough patch today\" — you don''t owe an explanation to get a response.", "okay": "A body scan: notice, without judging, where you''re holding tension right now. Awareness alone often loosens it slightly.", "good": "Notice one word or sound she said today that made you smile, and hold onto it.", "really_good": "Share the good moment with someone — good days are worth telling, not just having."}'::jsonb,
  'A cool washcloth on your face or neck for a minute — a small physical reset when patience is running thin.',
  'Listen to one song, just for you, uninterrupted if you can manage it.',
  'Ask your partner or a family member to take over bedtime one night this week, even just once.',
  'You''re navigating a stage where communication is genuinely hard for both of you — and you''re still showing up for it.',
  'If low mood, anxiety, numbness, anger, frightening thoughts or feeling unlike yourself is continuing or worsening, open Mental health & support. We can help you choose the next step.',
  'No specific note this week.',
  null
),
(
  121,
  'postpartum',
  'Naps Changing Again',
  'Her sleep changing isn''t you doing something wrong.',
  'Protect a little time for yourself if her naps are shifting or dropping.',
  'Somewhere in the second year, many toddlers transition from two naps to one, or their single nap shortens or becomes inconsistent. If you''d built any part of your day — rest, work, a shower — around nap time, this transition can genuinely disrupt your own rhythm too.',
  ARRAY['Nap timing or length becoming unpredictable','Your own rest window shrinking or disappearing some days','Frustration if you''d relied on that window for something specific','A need to rebuild your day''s structure around a new pattern']::text[],
  '{"focus": "Match movement to the sleep pattern of the whole week.", "tiers": {"heavy": "Use daylight walking and gentle mobility.", "steady": "Walk for 10 minutes and add 5 minutes of light strength.", "feeling_good": "Choose a familiar moderate session only if alertness, balance and recovery feel adequate."}, "mood_adjustment": "Very sleep-deprived: restorative only. Low: 5--15. Okay: 15. Good: 30. Really good: protect rest instead of adding volume.", "safety": "No specific caution this week."}'::jsonb,
  'If nap-time meals or your own eating window shifted too, keep something ready to eat without prep — this transition affects your food timing more than you''d expect.',
  'Keep water within reach wherever you end up parked when the nap window is unpredictable.',
  'No specific note this week.',
  'If you''ve lost your rest window, even lying down without sleeping for 10 minutes during a quiet moment still helps your body.',
  '{"heavy_day": "Try a brief tension release: gently lift your shoulders, hold only if comfortable, then let them soften. Repeat once without straining.", "a_little_low": "Lower today''s expectations on purpose — \"good enough\" is a legitimate standard for a transition week.", "okay": "Notice what''s actually still working in your day, even with the change — it''s usually more than it feels like.", "good": "A genuine good day during a hard transition is worth acknowledging specifically.", "really_good": "Ride it — plan something small you''ll enjoy for tomorrow while the mood is good."}'::jsonb,
  'If your rest window changed, adjust your skincare/self-care routine to whatever new pocket of time actually exists, rather than trying to force the old one.',
  'Ten minutes of something entirely yours, whenever the day happens to offer it.',
  'Tell someone close to you that this transition is disrupting your own rhythm too — it''s a real thing to name out loud.',
  'You''re adapting to a moving target, again — that flexibility is real work.',
  'If low mood, anxiety, numbness, anger, frightening thoughts or feeling unlike yourself is continuing or worsening, open Mental health & support. We can help you choose the next step.',
  'No specific note this week.',
  null
),
(
  122,
  'postpartum',
  'Weaning, Whenever That Looks Like For You',
  'However feeding ends for you both is the right way, if it''s your way.',
  'If weaning is on your mind, notice it''s your decision to make, on your own timeline.',
  'Somewhere in this stretch, many mothers who are still breastfeeding start thinking about weaning — whether led by them, the child, or a mix of both. There''s no "right" time; WHO guidance on continued breastfeeding to two years or beyond is about what''s available, not a deadline every mother needs to meet.',
  ARRAY['Mixed feelings if weaning is starting — relief and loss can coexist','Hormonal shifts as feeding frequency changes','Questions about what emotional connection looks like without feeding','No urge to wean at all, which is equally normal']::text[],
  '{"focus": "Keep movement comfortable through feeding or weaning changes.", "tiers": {"heavy": "Breathe, mobilise the upper back and take a short walk.", "steady": "Walk for 10 minutes and add 5 minutes of posture work.", "feeling_good": "Use your regular routine, adjusting impact and chest-loading for comfort."}, "mood_adjustment": "Heavy: comfort first. Low: gentle walk. Okay: 15. Good: 30 if settled. Really good: do not ignore breast or chest symptoms.", "safety": "No specific caution this week."}'::jsonb,
  'If you''re weaning, your own calorie and hydration needs will shift too — you don''t need to eat less just because you''re feeding less; let your appetite guide you.',
  'Keep drinking to thirst — old feeding-related hydration habits are fine to keep even as feeding changes.',
  'Whether weaning is child-led, mother-led, or somewhere in between, both of you adjusting at your own pace is valid — there''s no fixed "right" way to end feeding.',
  'If feeding was part of your bedtime routine, expect that routine to need rebuilding — that adjustment takes time for both of you.',
  '{"heavy_day": "Try a self-compassion pause: if it feels comfortable, place a hand on your chest and say, ''This is a hard moment. I can respond to myself with kindness.''", "a_little_low": "If weaning brings up grief, that''s valid even if it was your own choice — let yourself feel it without needing to justify it.", "okay": "Notice this transition is happening, without needing to have feelings about it either way.", "good": "If today felt like an easy step in this transition, that''s worth noting.", "really_good": "Celebrate however feeding has gone for you both — any amount, any duration, is a real accomplishment."}'::jsonb,
  'If weaning, your skin and body may shift again with hormones — the same gentle, fragrance-conscious approach from earlier postpartum weeks still applies if things feel sensitive.',
  'Reflect (in your head or in writing) on the feeding journey you''ve had — however it went.',
  'Talk to your partner or a friend about how weaning feels for you — it''s a bigger transition than it''s often given credit for.',
  'However you feed or fed your child, you''ve shown up for it. That''s what matters.',
  'If low mood, anxiety, numbness, anger, frightening thoughts or feeling unlike yourself is continuing or worsening, open Mental health & support. We can help you choose the next step.',
  'If you have questions about weaning pace or your own symptoms during this transition, your doctor or a lactation consultant can help either way.',
  null
),
(
  123,
  'postpartum',
  'Tantrums and Your Own Nervous System',
  'Her big feelings don''t require you to have big feelings too.',
  'Find one calming technique that works for you before you need it in the moment.',
  'Tantrums are a normal part of toddler development — a still-developing brain meeting big feelings with no mature way yet to regulate them. They can still be genuinely hard to be around, especially in public or when you''re already stretched thin.',
  ARRAY['Your own frustration rising alongside hers','Embarrassment in public settings, even though tantrums are developmentally normal','Exhaustion after a tantrum-heavy day','Moments of real patience you''re proud of, too']::text[],
  '{"focus": "Build a physical pause between activation and response.", "tiers": {"heavy": "Step back safely, exhale slowly and release your hands and jaw.", "steady": "Walk briskly for 8 minutes, then use 7 minutes of slower breathing and mobility.", "feeling_good": "Choose 20 minutes of rhythmic movement and a 10-minute cool-down."}, "mood_adjustment": "Heavy: secure safety and ask for help. Low: regulate gently. Okay: 15. Good or really good: stop before depleted.", "safety": "No specific caution this week."}'::jsonb,
  'Low blood sugar makes everyone''s patience shorter — yours included. Keep a snack on hand for yourself, not just her.',
  'A glass of water after a hard moment, for you — the same regulation trick that works for toddlers works for adults too.',
  'No specific note this week.',
  'Tantrums are draining in a way that''s hard to explain to anyone who hasn''t lived it — rest after a hard day isn''t optional, it''s necessary.',
  '{"heavy_day": "Box breathing again, this time before you respond to her, not just for yourself later: in for 4, hold for 4, out for 4. It helps regulate your own nervous system so you can stay steady for hers.", "a_little_low": "Remind yourself: her tantrum is about her brain development, not your parenting. That''s not a platitude, it''s what the research actually shows.", "okay": "Notice you handled today''s moments reasonably well, even if imperfectly.", "good": "If you stayed calm through a hard moment today, that''s a real skill you''re building.", "really_good": "Notice your own growing capacity to stay steady — it''s genuinely gotten easier since the early months."}'::jsonb,
  'A cool drink or splash of water on your face after a hard moment — a small physical reset.',
  'Ten minutes of something calming just for you, especially after a tantrum-heavy day.',
  'If tantrums are wearing on you, tell your partner or a trusted person specifically what would help — even just five minutes to yourself after a hard one.',
  'Staying steady through someone else''s big feelings, again and again, is real emotional labor.',
  'If low mood, anxiety, numbness, anger, frightening thoughts or feeling unlike yourself is continuing or worsening, open Mental health & support. We can help you choose the next step.',
  'No specific note this week.',
  null
),
(
  124,
  'postpartum',
  'The House You Actually Live In',
  'A lived-in home is evidence of a life being lived, not a failure.',
  'Let go of one standard about your home that isn''t serving you right now.',
  'Toddlers create mess at a pace that can feel relentless, and many mothers carry an old standard for what a "put-together" home should look like that simply doesn''t fit this stage of life. This week is about noticing that gap without letting it become another source of guilt.',
  ARRAY['A home that looks different from how you''d like it to','Guilt about the state of things, even though it reflects a full, active life','Less energy for tidying than you used to have','Occasional relief when you let a standard go']::text[],
  '{"focus": "Strengthen the movements your real home repeatedly requires.", "tiers": {"heavy": "Do 6 sit-to-stands, 6 hinges and a gentle carry.", "steady": "Complete two rounds of squat, hinge, wall push and carry patterns.", "feeling_good": "Walk for 10 minutes, then complete three controlled functional-strength rounds."}, "mood_adjustment": "Heavy: one pattern. Low: one round. Okay: two. Good: three. Really good: improve form before load.", "safety": "No specific caution this week."}'::jsonb,
  'Meals don''t need to be elaborate this week — simple, real food that gets everyone fed matters more than a tidy kitchen.',
  'No specific note this week.',
  'No specific note this week.',
  'Choosing rest over tidying, at least sometimes, is a legitimate choice — not laziness.',
  '{"heavy_day": "Cognitive defusion: when the thought \"my house is a mess and that means I''m failing\" shows up, try saying \"I''m having the thought that...\" before it — a real technique for creating distance from an unhelpful thought.", "a_little_low": "Compare your home to your own life five years ago, not to anyone else''s — most homes with young children look lived-in, not staged.", "okay": "Notice one corner of your home that feels okay to you, even amid the rest.", "good": "If you tackled one small thing today, note it without needing to have done more.", "really_good": "Enjoy any progress without immediately raising the bar for tomorrow."}'::jsonb,
  'Skip a chore today in favor of five minutes of something for you — the dishes will still be there.',
  'Sit in your favorite corner of your home, mess and all, for a few minutes.',
  'If a messy home is a source of tension with a partner or family member, a short honest conversation about shared expectations can help more than trying harder alone.',
  'A messy home usually means a full, active life happening in it. That''s worth something.',
  'If low mood, anxiety, numbness, anger, frightening thoughts or feeling unlike yourself is continuing or worsening, open Mental health & support. We can help you choose the next step.',
  'No specific note this week.',
  null
),
(
  125,
  'postpartum',
  'Movement That''s Just for You',
  'Your body doesn''t owe anyone a project. It''s already carried you both this far.',
  'Choose movement this week based only on what you enjoy, not what you think you should be doing.',
  'By now, most of the structured "postpartum recovery" milestones are well behind you. This week is a deliberate pause to ask what movement actually feels good to you now — not as recovery, not as a project, just as something that''s yours.',
  ARRAY['Old ideas about "getting your body back" resurfacing','A body that''s changed and is still capable','Genuine enjoyment in movement you''d forgotten you liked','No particular interest in structured exercise, which is also fine']::text[],
  '{"focus": "Protect movement chosen for you, not only for caregiving function.", "tiers": {"heavy": "Move to one song or take a five-minute solo walk.", "steady": "Choose a favourite activity for 15 minutes with no toddler-related objective.", "feeling_good": "Give 30 minutes to movement selected for enjoyment, identity or curiosity."}, "mood_adjustment": "Heavy: soothing familiarity. Low: step outside. Okay: 15. Good or really good: enjoyment is the measure.", "safety": "No specific caution this week."}'::jsonb,
  'Eat in a way that fuels whatever movement you''re choosing, without any language of restriction or "earning" food.',
  'No specific note this week.',
  'No specific note this week.',
  'Rest is also a valid answer to "what movement do I want this week" — even choosing stillness is a choice about your body.',
  '{"heavy_day": "If body image thoughts feel heavy this week, try the box breathing technique from earlier weeks, and remind yourself your body''s job was never to look a certain way — it kept two people alive.", "a_little_low": "Write down one thing your body has done for you this week that had nothing to do with appearance — walked, held, carried, rested.", "okay": "Notice your body without judging it, just for a moment — neutral is a valid place to be.", "good": "Enjoy whatever movement felt good today, fully, without qualifying it.", "really_good": "Let a good movement day be simply good — no need to turn it into a new commitment or standard."}'::jsonb,
  'Wear something that feels genuinely comfortable and like you, regardless of size or fit compared to before.',
  'Revisit a hobby, sport, or activity that was yours before motherhood, even for a few minutes.',
  'Ask someone to join you in whatever movement you choose this week, if company would help.',
  'Your body has done extraordinary things. It''s allowed to just be yours again too.',
  'If low mood, anxiety, numbness, anger, frightening thoughts or feeling unlike yourself is continuing or worsening, open Mental health & support. We can help you choose the next step.',
  'If body image concerns are significantly affecting your eating, mood, or daily life, that''s worth raising directly with your doctor — support exists beyond what this app can offer.',
  null
),
(
  126,
  'postpartum',
  'Illness Season & Your Own Immunity',
  'Catching everything she brings home isn''t a personal failing — it''s exposure.',
  'Take your own symptoms as seriously as you take hers.',
  'Toddlers in daycare, playgroups, or just around other children bring home illness often, and mothers frequently catch what their child has — partly from close contact, partly from a body that''s been running on less rest for a long stretch. Caring for a sick toddler while unwell yourself is one of the harder combinations in this stage.',
  ARRAY['Catching colds or stomach bugs more often than you used to','Pushing through your own illness because there''s no obvious backup','Slower recovery than pre-motherhood, most likely from cumulative fatigue','Guilt about resting while she still needs care']::text[],
  '{"focus": "Use a recovery dose during illness-heavy weeks.", "tiers": {"heavy": "Breathe, mobilise gently and stop if unwell.", "steady": "Take an easy walk only if you feel well enough; otherwise use restorative mobility.", "feeling_good": "Resume a familiar moderate routine only after acute symptoms have settled and energy is returning."}, "mood_adjustment": "Fever, significant illness or dizziness: rest and seek appropriate advice. Recovery is not lost training.", "safety": "Avoid pushing through fever, significant fatigue, or any symptoms your doctor would want to know about — rest and recover fully before resuming normal activity."}'::jsonb,
  'Simple, easy-to-digest food and fluids if you''re unwell — this isn''t the week to worry about elaborate meals for yourself.',
  'Extra fluids if you or your toddler are sick — illness increases fluid needs for both of you.',
  'If you''re breastfeeding and unwell, in most common illnesses (colds, stomach bugs) it''s safe to continue — check with your doctor if you''re unsure or on new medication.',
  'Ask for backup this week if you''re sick — caring for a toddler while unwell yourself is genuinely one of the harder combinations, and asking for help here is not optional, it''s necessary.',
  '{"heavy_day": "If you''re running on empty from illness (yours or hers), a short self-compassion break — hand on heart, \"this is genuinely hard right now\" — can help before you problem-solve anything.", "a_little_low": "Lower every expectation this week if illness is in the house — survival mode is the appropriate mode, not a failure of one.", "okay": "If you''re recovering and feeling more like yourself, notice that gently, without rushing back to full pace.", "good": "A good, healthy day after an illness stretch is worth genuinely appreciating.", "really_good": "Enjoy the return to normal energy — it''s earned."}'::jsonb,
  'If you''re unwell, basic comfort (warm drinks, rest, simple care) is the priority over any usual routine.',
  'Even sick, five minutes of something calming (an audiobook, quiet music) can help.',
  'Actually ask for help this week if illness hits your household — a partner, family member, or friend stepping in for even a few hours matters.',
  'Getting through an illness stretch — yours, hers, or both — with everyone cared for is real work.',
  'If low mood, anxiety, numbness, anger, frightening thoughts or feeling unlike yourself is continuing or worsening, open Mental health & support. We can help you choose the next step.',
  'If you''re frequently catching what your toddler brings home, or recovery feels unusually slow, mention it at your next check-up — persistent run-down immunity is worth a conversation, not just something to push through.',
  null
),
(
  127,
  'postpartum',
  'Screens, Guilt, and Grace',
  'A screen that buys you ten minutes to breathe isn''t a parenting failure.',
  'Make peace with however screens fit into your household right now.',
  'Screen time is one of the more guilt-loaded topics in modern parenting. Whatever your household''s actual pattern looks like, this week is about making a realistic, judgment-free choice rather than chasing an ideal that doesn''t account for your actual day.',
  ARRAY['Guilt about screen time, whatever the amount','Genuine relief from the breaks screens sometimes provide','Comparing your household to others'', often unfairly','A wish for more clarity on what''s "okay"']::text[],
  '{"focus": "Let movement interrupt screen guilt, not compensate for it.", "tiers": {"heavy": "Stand, stretch and look outside for five minutes.", "steady": "Take a phone-free 15-minute walk.", "feeling_good": "Use 20 minutes outdoors and 10 minutes of strength or mobility."}, "mood_adjustment": "Heavy: step away from the screen briefly. Low: fresh air. Okay: 15. Good or really good: no tracking required.", "safety": "No specific caution this week."}'::jsonb,
  'No specific note this week.',
  'No specific note this week.',
  'No specific note this week.',
  'A screen-time window is a legitimate rest window for you too — you don''t have to use every free minute productively.',
  '{"heavy_day": "If screen-time guilt is spiraling, try cognitive defusion again: \"I''m having the thought that I''m a bad parent for this\" — naming the thought as a thought loosens its grip.", "a_little_low": "Remind yourself that a rested, less depleted parent tomorrow is worth more to your child than a screen-free hour today.", "okay": "Notice your household''s actual screen pattern without comparing it to anyone else''s.", "good": "If today''s balance felt right to you, that''s the only standard that matters.", "really_good": "Enjoy a good day without needing to justify how you got there."}'::jsonb,
  'Use a guilt-free screen window for something genuinely restorative for yourself, not just chores.',
  'If she''s engaged with a screen, take five minutes for something entirely yours in the next room.',
  'Talk to your partner about what feels right for your household — a shared decision reduces the guilt either of you carries alone.',
  'You''re making real decisions in a genuinely guilt-loaded area, and that''s harder than it looks from outside.',
  'If low mood, anxiety, numbness, anger, frightening thoughts or feeling unlike yourself is continuing or worsening, open Mental health & support. We can help you choose the next step.',
  'No specific note this week.',
  null
),
(
  128,
  'postpartum',
  'How Are You, Really',
  'You''re allowed to check in on yourself, not just on how things look.',
  'An honest, no-judgment check-in on how you''ve actually been doing lately.',
  'This is a dedicated pause to ask how you''re really doing — not how the household is running or how your toddler is developing, but you. At this stage, new or ongoing symptoms are better approached as maternal mental health rather than automatically attributed to childbirth. Low mood, constant worry or feeling flat for weeks still deserves serious attention at any point in motherhood.',
  ARRAY['Genuinely doing okay, which is worth noticing too, not just hard stretches','A low mood or heaviness that''s lasted longer than a bad week','Feeling like yourself has quietly slipped further away over many months','Uncertainty about whether what you''re feeling is "normal" or worth mentioning to someone']::text[],
  '{"focus": "Use movement as support for wellbeing — not proof that you are fine.", "tiers": {"heavy": "Walk toward a person or place where support is available.", "steady": "Walk gently with company or in a familiar setting.", "feeling_good": "Use an established routine only if it feels supportive and safe."}, "mood_adjustment": "Heavy: contact a person now. Low: move with support. Okay: gentle routine. Good or really good: persistent distress still deserves care.", "safety": "No specific caution this week."}'::jsonb,
  'No specific note this week.',
  'No specific note this week.',
  'No specific note this week.',
  'If you''re genuinely exhausted in a way that rest doesn''t seem to fix, that''s worth mentioning below, not just pushing through.',
  '{"heavy_day": "If today is heavy, and especially if this has been the pattern for weeks rather than days, it''s worth reading a bit more about what ongoing low mood or anxiety in motherhood can look like, and reaching out to your doctor or a trusted person. You don''t have to wait for it to get worse to ask for help.", "a_little_low": "A little low, especially if it''s been more days than not lately, deserves attention — not panic, just honesty with yourself and maybe with someone else.", "okay": "If you''re genuinely okay, that''s worth noticing and trusting, not second-guessing.", "good": "If you''re doing well, notice what''s been helping — it''s useful information for harder weeks later.", "really_good": "A really good stretch is worth celebrating fully, without waiting for the other shoe to drop."}'::jsonb,
  'Whatever your honest answer is this week, treat yourself with the same care you''d offer a friend who told you the same thing.',
  'Take a few minutes to actually sit with the question "how am I, really" — not the version you''d give in a hallway conversation.',
  'If today''s honest check-in surfaced something heavier than you expected, consider using the "Help me prepare to talk to someone" tool in Mental health & support to put it into words for your doctor or someone you trust.',
  'Checking in with yourself honestly, whatever the answer, is a real act of care.',
  'If low mood, anxiety, numbness, anger, frightening thoughts or feeling unlike yourself is continuing or worsening, open Mental health & support. We can help you choose the next step.',
  'If low mood, anxiety, or feeling flat has been going on for weeks rather than days, it''s worth raising directly at your next appointment — motherhood-related mental health support isn''t limited to the first year after birth.',
  null
),
(
  129,
  'postpartum',
  'Connection, Whatever Shape It Takes',
  'Connection doesn''t require a grand gesture — it requires a little attention.',
  'One small, real moment of connection this week — with a partner, a friend, or yourself.',
  'Whether you''re partnered, co-parenting, or parenting solo, the relationships that matter to you can quietly slip down the priority list during the toddler years. This week is about one small, genuine reconnection — not a grand romantic gesture, not a major plan, just real attention.',
  ARRAY['Feeling more like co-managers of logistics than partners or close friends','A wish for more adult connection than your days currently allow','Guilt about wanting time away from parenting to invest elsewhere','Small good moments of connection you may not have noticed']::text[],
  '{"focus": "Create connection through movement if it feels welcome.", "tiers": {"heavy": "Stretch or walk beside someone for five minutes — or choose solitude.", "steady": "Take a 15-minute walk-and-talk without solving logistics.", "feeling_good": "Share 20 minutes of easy movement, then take 10 minutes for your own routine."}, "mood_adjustment": "Heavy: ask for presence. Low: invite company. Okay: short connection. Good or really good: keep performance out of it.", "safety": "No specific caution this week."}'::jsonb,
  'A shared meal, even a simple one, can double as connection time.',
  'No specific note this week.',
  'No specific note this week.',
  'No specific note this week.',
  '{"heavy_day": "If connection feels out of reach this week, that''s okay — a single honest text (\"missing us, even a little\") counts as reaching out.", "a_little_low": "Loneliness in motherhood is common, even for partnered mothers — naming it to someone close is a real first step.", "okay": "Notice one moment of real connection today, even brief.", "good": "If today included a genuine moment with someone who matters to you, let that count for something.", "really_good": "Plan a slightly bigger moment of connection for soon, while the energy is there."}'::jsonb,
  'Connection with yourself counts too — a few minutes doing something you enjoy, alone, is its own form of this week''s theme.',
  'Reflect on one relationship (with a partner, friend, or family member) that could use a little attention, and think of one small step.',
  'Reach out to one person this week specifically to reconnect — not about logistics, just to check in.',
  'Investing in connection, even in small ways, during a demanding stage of life is genuinely worthwhile.',
  'If low mood, anxiety, numbness, anger, frightening thoughts or feeling unlike yourself is continuing or worsening, open Mental health & support. We can help you choose the next step.',
  'No specific note this week.',
  null
),
(
  130,
  'postpartum',
  'Your Changing Body, Still',
  'Your body is still changing. That doesn''t mean something is wrong.',
  'Notice any physical changes you''ve been carrying without mentioning to anyone.',
  'Even a year and a half or more after birth, bodies continue to shift — weight, shape, joint sensations, hair, skin. Some of this is ordinary post-motherhood change; some is worth actually mentioning to a doctor rather than assuming it''s "just part of it."',
  ARRAY['Ongoing changes in body shape, weight, or joints','Symptoms you''ve been quietly living with rather than mentioning','Comparisons to your pre-pregnancy body that may or may not be useful','A body that, overall, feels more like "yours" again, or doesn''t yet']::text[],
  '{"focus": "Train for function and comfort rather than appearance.", "tiers": {"heavy": "Choose one movement that makes daily life easier.", "steady": "Walk for 8 minutes, then practise sit-to-stand, push and carry patterns.", "feeling_good": "Complete a functional circuit of squat, incline push, heel raise, row and light carry."}, "mood_adjustment": "Heavy: choose comfort. Low: avoid tracking if unhelpful. Okay: function. Good or really good: record capability, not appearance.", "safety": "Persistent joint pain, unusual fatigue, or symptoms that concern you are worth raising with your doctor rather than assuming they''re permanent."}'::jsonb,
  'No specific note this week beyond continuing to eat in a way that fuels you, not restricts you.',
  'No specific note this week.',
  'No specific note this week.',
  'No specific note this week.',
  '{"heavy_day": "If body-related thoughts feel heavy, try the self-compassion break again: hand on heart, \"this body has done a lot, and it''s still figuring itself out.\"", "a_little_low": "Write down one physical thing you''ve been putting off mentioning to a doctor, and consider making the call this week.", "okay": "Notice your body neutrally today — neither praising nor criticizing it, just acknowledging it.", "good": "If you feel genuinely good in your body today, let that be enough, without needing an explanation.", "really_good": "Enjoy feeling strong or comfortable in your body — it''s not something to downplay."}'::jsonb,
  'Address one small physical discomfort you''ve been ignoring — even booking the appointment counts as care.',
  'No specific note this week.',
  'Talk to your partner or a friend about any physical changes you''ve been sitting with quietly — you don''t have to carry it alone.',
  'Your body has been through an enormous amount and continues to carry you through daily life. That''s real.',
  'If low mood, anxiety, numbness, anger, frightening thoughts or feeling unlike yourself is continuing or worsening, open Mental health & support. We can help you choose the next step.',
  'If anything physical has felt "off" for a while — pain, fatigue, changes you''ve been assuming are permanent — bring it up specifically at your next visit rather than assuming it''s just part of motherhood now.',
  null
),
(
  131,
  'postpartum',
  'Money and the Toddler Years',
  'Financial stress is real stress. It deserves a real plan, not just worry.',
  'One small, concrete step toward financial clarity this week.',
  'Toddler-stage costs — childcare, food, clothes that are outgrown fast, activities — can add real financial pressure on top of everything else. This week is about turning any financial worry into one small, concrete action rather than letting it stay a background hum of stress.',
  ARRAY['Financial stress specific to this stage''s costs','Avoidance of looking closely at the numbers because it feels overwhelming','Relief once you actually look at something concretely','Comparisons to other families'' spending that may not be useful']::text[],
  '{"focus": "Use a no-cost, low-planning movement session.", "tiers": {"heavy": "Walk, climb stairs gently or practise sit-to-stands.", "steady": "Use a no-equipment circuit: squat, wall push, heel raise and march.", "feeling_good": "Combine a 15-minute walk with three rounds of the circuit."}, "mood_adjustment": "Heavy: one free option. Low: walk. Okay: 15. Good: 30. Really good: resist buying complexity.", "safety": "No specific caution this week."}'::jsonb,
  'No specific note this week.',
  'No specific note this week.',
  'No specific note this week.',
  'No specific note this week.',
  '{"heavy_day": "If money worry feels heavy, name it specifically rather than letting it stay a vague dread — \"I''m worried about childcare costs\" is more manageable than a general sense of doom.", "a_little_low": "One small task (checking a balance, listing this month''s toddler-related costs) can turn worry into information, which is more workable.", "okay": "Notice that financial stress, while real, doesn''t have to be solved today — one step at a time is enough.", "good": "If you took a concrete financial step today, note the relief that came with it.", "really_good": "Use a good, low-stress day to tackle something financial you''ve been avoiding."}'::jsonb,
  'Financial stress affects your body too — a walk or a few minutes of quiet after a money task can help you decompress.',
  'No specific note this week.',
  'If you''re not the one managing household finances, ask for a shared, honest look at the numbers together this week.',
  'Facing financial stress directly, even in a small way, takes real courage.',
  'If low mood, anxiety, numbness, anger, frightening thoughts or feeling unlike yourself is continuing or worsening, open Mental health & support. We can help you choose the next step.',
  'No specific note this week — for structured budgeting help, the Wealth pillar''s planner and schemes directory are built for exactly this.',
  null
),
(
  132,
  'postpartum',
  'Friendships That Have Shifted',
  'Some friendships change shape after motherhood. That''s a shift, not always a loss.',
  'Notice which friendships still feel nourishing, and which don''t, without guilt either way.',
  'Friendships often change after having a child — some deepen, some fade, some become harder to maintain simply because of time and energy. This week is about honestly noticing where your friendships stand now, not where they used to be.',
  ARRAY['Friendships that have naturally drifted since becoming a mother','New friendships formed through motherhood itself','Guilt about not maintaining old friendships as well as you''d like','Relief in friendships that have adapted well to this stage of your life']::text[],
  '{"focus": "Reconnect through movement without forcing a social performance.", "tiers": {"heavy": "Send a message, then stretch or walk for five minutes.", "steady": "Walk with a friend or alone while listening to something familiar.", "feeling_good": "Share 20 minutes of movement and keep 10 minutes for personal mobility or strength."}, "mood_adjustment": "Heavy: connection can be a message. Low: gentle company. Okay: 15. Good or really good: choose the relationship that feels safe.", "safety": "No specific caution this week."}'::jsonb,
  'No specific note this week.',
  'No specific note this week.',
  'No specific note this week.',
  'No specific note this week.',
  '{"heavy_day": "If loneliness or friendship loss feels heavy, remind yourself this shift is common after having a child, not a sign you did anything wrong.", "a_little_low": "Reach out to one friend you''ve been meaning to message — even a short \"thinking of you\" can restart something.", "okay": "Notice your current friendships honestly, without measuring them against your pre-motherhood social life.", "good": "If a friendship felt good today, let yourself enjoy it fully.", "really_good": "Make a plan to see or talk to a friend soon, while the energy for it is there."}'::jsonb,
  'Investing time in a friendship that nourishes you is a form of self-care, not an indulgence.',
  'Reflect on which friendships genuinely fill you up right now, and lean into those.',
  'Reach out to one person this week specifically to maintain or rebuild a connection.',
  'Nurturing friendships during a demanding life stage takes real, ongoing effort.',
  'If low mood, anxiety, numbness, anger, frightening thoughts or feeling unlike yourself is continuing or worsening, open Mental health & support. We can help you choose the next step.',
  'No specific note this week.',
  null
),
(
  133,
  'postpartum',
  'Her Independence, and Yours',
  'Her wanting to do it herself is growth — and so is you loosening your grip.',
  'Let her try one thing herself this week, and notice how it feels to step back a little.',
  'Around this stage, many toddlers push hard for independence — "me do it" — which can be both a proud milestone and a genuinely slower, messier process to allow. It''s also a moment to notice your own independence, which may have been on hold for a long stretch.',
  ARRAY['Pride in her growing independence, mixed with impatience at the slower pace','A pull to just do it for her to save time','Reflection on your own independence and what it currently looks like','A wish for a little more autonomy in your own days']::text[],
  '{"focus": "Practise balance, direction changes and confident floor-to-stand movement.", "tiers": {"heavy": "Do supported balance, 6 sit-to-stands and 4 floor-to-stands per side.", "steady": "Complete two rounds of balance, reverse step, squat and carry patterns.", "feeling_good": "Walk for 10 minutes, then complete three functional rounds with controlled changes of direction."}, "mood_adjustment": "Heavy: use support. Low: reduce range. Okay: two rounds. Good: three. Really good: improve control, not speed.", "safety": "No specific caution this week."}'::jsonb,
  'Letting her attempt to feed herself, however messy, is part of this week''s theme too — it''s okay if meals take longer.',
  'No specific note this week.',
  'No specific note this week.',
  'No specific note this week.',
  '{"heavy_day": "If the slower pace of letting her be independent is testing your patience, box breathing before stepping in can help you wait a beat longer than usual.", "a_little_low": "Notice if you''re craving more independence yourself — that''s worth naming, not dismissing.", "okay": "Notice a moment today where you let go a little, and how that felt.", "good": "If you watched her succeed at something new today, let that pride be fully yours too.", "really_good": "Celebrate her growing independence — and consider what small independence you might reclaim for yourself too."}'::jsonb,
  'Do one thing entirely on your own terms this week, without input or interruption.',
  'Reflect on what independence currently looks like in your own life, and what you''d want more of.',
  'Ask for a stretch of time this week that''s entirely your own, even briefly.',
  'Watching her grow more independent, while nurturing your own, is a real balancing act.',
  'If low mood, anxiety, numbness, anger, frightening thoughts or feeling unlike yourself is continuing or worsening, open Mental health & support. We can help you choose the next step.',
  'No specific note this week.',
  null
),
(
  134,
  'postpartum',
  'Second-Child Thoughts, If They''re On Your Mind',
  'Whatever you decide about another child, or not, is genuinely yours to decide.',
  'If this is on your mind, give it real, honest thought — without pressure either way.',
  'Somewhere in the second year, many families start thinking about whether and when to have another child — or decide firmly that they won''t. Both are completely valid, and the "right" timing (if there is another child) is whatever''s right for you, not a general rule.',
  ARRAY['Genuine excitement or curiosity about another child','Equally genuine certainty that your family feels complete','Pressure from others'' opinions on the topic','Uncertainty, which is also a completely fine place to be']::text[],
  '{"focus": "Keep movement steady while major family questions remain open.", "tiers": {"heavy": "Use breathing and familiar mobility.", "steady": "Take an easy walk without using it to force a decision.", "feeling_good": "Choose a familiar routine at moderate effort, separate from decision-making."}, "mood_adjustment": "Heavy: seek support, not answers from exercise. Low: walk with someone safe. Okay: 15. Good or really good: no new target this week.", "safety": "No specific caution this week."}'::jsonb,
  'No specific note this week.',
  'No specific note this week.',
  'No specific note this week.',
  'No specific note this week.',
  '{"heavy_day": "If this topic feels heavy — whether from pressure, uncertainty, or grief over a decision already made — that''s worth sitting with gently, not rushing past.", "a_little_low": "If others'' opinions on this topic are weighing on you, remember this decision is yours (and your partner''s, if applicable) to make, not anyone else''s.", "okay": "Notice where you honestly stand on this today, without needing a final answer.", "good": "If clarity feels good today, whatever the direction, let that be enough.", "really_good": "Whatever you''ve decided, or are leaning toward, is allowed to feel genuinely good."}'::jsonb,
  'Give yourself permission to not have a final answer yet, if you don''t.',
  'Reflect privately on what you actually want here, separate from what''s expected of you.',
  'If you have a partner, an honest conversation about this — without needing to resolve it in one sitting — can help.',
  'Thinking this through honestly, at your own pace, is exactly the right way to approach it.',
  'If low mood, anxiety, numbness, anger, frightening thoughts or feeling unlike yourself is continuing or worsening, open Mental health & support. We can help you choose the next step.',
  'If you''re actively planning for or against another pregnancy, your doctor can help with timing, spacing, and any relevant health considerations specific to you.',
  null
),
(
  135,
  'postpartum',
  'Bedtime, Revisited',
  'Bedtime routines are allowed to change as she does.',
  'Notice if your current bedtime routine still works, and adjust without guilt if it doesn''t.',
  'Toddler sleep needs and routines shift again around this stage — new resistance to bedtime, new fears, a growing sense of independence that can show up as "I don''t want to." What worked six months ago may need revisiting, and that''s a normal part of this stage, not a regression.',
  ARRAY['Bedtime taking longer or becoming a bigger production than before','New bedtime resistance or requests (extra stories, staying up later)','Your own evening time shrinking as bedtime stretches out','Occasional smooth nights that remind you it''s not always hard']::text[],
  '{"focus": "Release the positions and tension built up around bedtime.", "tiers": {"heavy": "Mobilise neck, shoulders, wrists, hips and ankles.", "steady": "Walk for 7 minutes and use 8 minutes of comfortable mobility.", "feeling_good": "Combine 15 minutes of easy walking with 15 minutes of mobility and light strength."}, "mood_adjustment": "Heavy: mobility only. Low: easy walk. Okay: 15. Good or really good: choose comfort over intensity.", "safety": "No specific caution this week."}'::jsonb,
  'No specific note this week.',
  'No specific note this week.',
  'No specific note this week.',
  'If bedtime is eating into your own wind-down time, consider a shorter version of your evening routine rather than skipping it entirely.',
  '{"heavy_day": "If a long, hard bedtime has left you frayed, box breathing before you do anything else tonight can help you reset before the evening continues.", "a_little_low": "Remind yourself that bedtime struggles are common at this stage and usually pass with small routine adjustments, not a sign of a bigger problem.", "okay": "Notice tonight''s bedtime for what it was, without dreading tomorrow''s in advance.", "good": "An easy bedtime is worth genuinely enjoying, especially if they''ve been rare lately.", "really_good": "Use the extra evening time a smooth bedtime gives you for something you enjoy."}'::jsonb,
  'Once bedtime is done, however it went, give yourself a few minutes before moving to the next task.',
  'No specific note this week.',
  'If bedtime has become a two-person job some nights, ask a partner to take the lead occasionally so you get an earlier evening.',
  'Adjusting to a changing bedtime routine, again, is part of the ongoing work of this stage — and you''re doing it.',
  'If low mood, anxiety, numbness, anger, frightening thoughts or feeling unlike yourself is continuing or worsening, open Mental health & support. We can help you choose the next step.',
  'No specific note this week.',
  null
),
(
  136,
  'postpartum',
  'Career and Re-Entry Thoughts',
  'Whatever you decide about work, it''s allowed to be complicated.',
  'If career thoughts are on your mind, give them real space this week, without a deadline to decide anything.',
  'Whether you paused work, changed direction, or never stopped, the toddler years often bring career and identity questions back to the surface. This week is about giving those thoughts real space, whatever direction they''re pointing.',
  ARRAY['A pull back toward paid work, or toward a different kind of work','Contentment with your current path, which is equally valid','Anxiety about re-entering after a break','Identity questions that go beyond just "job or no job"']::text[],
  '{"focus": "Support work capacity without adding another impossible standard.", "tiers": {"heavy": "Do a posture reset, heel raises and sit-to-stands.", "steady": "Alternate three minutes of walking with two minutes of mobility and posture work.", "feeling_good": "Walk for 12 minutes, then complete two rounds of row, incline push, squat and calf raise."}, "mood_adjustment": "Heavy: one work break. Low: easy walk. Okay: 15. Good: 30. Really good: improve the work setup first.", "safety": "No specific caution this week."}'::jsonb,
  'No specific note this week.',
  'No specific note this week.',
  'No specific note this week.',
  'No specific note this week.',
  '{"heavy_day": "If career uncertainty feels heavy, remember this doesn''t need to be resolved today — one honest thought or one small step is enough for now.", "a_little_low": "If comparison to others'' career paths is weighing on you, remember every path looks different, and yours doesn''t need to match anyone else''s timeline.", "okay": "Notice where you honestly stand on work and career today, without needing certainty.", "good": "If today brought any clarity or a small step forward, let that count.", "really_good": "Whatever direction you''re moving in, let yourself feel good about it fully."}'::jsonb,
  'Whatever you decide about work, remind yourself your worth isn''t measured by employment status.',
  'Spend a few minutes exploring one interest or skill, whether or not it becomes a career step.',
  'Talk to your partner or a trusted friend about what you''re thinking through — outside perspective can help clarify your own.',
  'Thinking honestly about your own path, alongside everything else you''re managing, takes real intention.',
  'If low mood, anxiety, numbness, anger, frightening thoughts or feeling unlike yourself is continuing or worsening, open Mental health & support. We can help you choose the next step.',
  'No specific note this week — the Wealth pillar''s Library book *Creating Your Own Opportunities* covers remote work, career re-entry, and freelancing in depth if you want to go further.',
  null
),
(
  137,
  'postpartum',
  'Boundaries with Family',
  'You can love your family and still say no to them.',
  'Notice one boundary with family that''s been overdue, and consider naming it this week.',
  'As your toddler grows more independent, opinions from extended family about parenting choices — discipline, food, screen time, sleep — often grow louder too. This week is about noticing where a boundary might genuinely help, without needing to overhaul every relationship at once.',
  ARRAY['Unsolicited advice or opinions from family about your parenting choices','Difficulty saying no, even when you want to','Relief when you do set a boundary, even if it felt hard in the moment','Guilt about disappointing people you love']::text[],
  '{"focus": "Use movement to prepare for — not avoid — a boundary conversation.", "tiers": {"heavy": "Walk or breathe slowly before the conversation.", "steady": "Take a 15-minute walk to clarify one sentence you need to say.", "feeling_good": "Use a familiar moderate session, then write the boundary in one clear line."}, "mood_adjustment": "Heavy: postpone if unsafe. Low: move with support. Okay: 15. Good or really good: movement does not replace communication.", "safety": "No specific caution this week."}'::jsonb,
  'No specific note this week.',
  'No specific note this week.',
  'No specific note this week.',
  'No specific note this week.',
  '{"heavy_day": "If a family conflict feels heavy, a short self-compassion break before responding — \"this is hard, and I''m allowed to protect my peace\" — can help you respond from a calmer place.", "a_little_low": "If guilt is showing up around a boundary you''ve set or want to set, remind yourself that a boundary is about your own wellbeing, not a rejection of the person.", "okay": "Notice today''s family interactions honestly, without needing to fix every dynamic at once.", "good": "If a boundary was respected today, or a conversation went better than expected, note that.", "really_good": "Enjoy a family interaction that felt genuinely easy today."}'::jsonb,
  'Practicing one small "no" this week, even privately in your own head first, builds the muscle for when you need it out loud.',
  'Reflect on which family dynamic could use a boundary, and what that boundary might sound like in your own words.',
  'If setting a boundary alone feels hard, ask your partner to back you up or set it together.',
  'Protecting your own choices as a parent, even against loving intentions, is a genuine act of strength.',
  'If low mood, anxiety, numbness, anger, frightening thoughts or feeling unlike yourself is continuing or worsening, open Mental health & support. We can help you choose the next step.',
  'No specific note this week.',
  null
),
(
  138,
  'postpartum',
  'The Mental Load, Named',
  'Carrying it all in your head is real work, even when no one sees it.',
  'Name one piece of the mental load out loud to someone this week.',
  'The "mental load" — remembering appointments, tracking what''s running low, anticipating needs before they become problems — is often invisible work that falls disproportionately on mothers. This week is about naming it, not necessarily solving it all at once.',
  ARRAY['Constantly tracking things others in the household don''t seem to notice','Exhaustion that isn''t physical, but from carrying so much mentally','Frustration when the invisible work goes unacknowledged','Relief when someone else takes something off your list, even briefly']::text[],
  '{"focus": "Externalise the mental load and keep training simple.", "tiers": {"heavy": "Write down the next three tasks, then move for the remaining time.", "steady": "Choose one simple 15-minute walk or circuit with no decisions required.", "feeling_good": "Repeat a saved 30-minute routine rather than designing a new one."}, "mood_adjustment": "Heavy: list and rest. Low: five minutes. Okay: 15. Good: 30. Really good: use extra capacity to reduce tomorrow''s load.", "safety": "No specific caution this week."}'::jsonb,
  'No specific note this week.',
  'No specific note this week.',
  'No specific note this week.',
  'Mental rest matters as much as physical rest — even ten minutes without needing to track or plan anything counts.',
  '{"heavy_day": "If the mental load feels overwhelming, write it all down — externalizing a running list out of your head and onto paper is a real technique for reducing the cognitive weight of carrying it silently.", "a_little_low": "Naming the mental load out loud to your partner or a friend, even without asking them to fix it, can lighten it simply by being seen.", "okay": "Notice today''s mental load honestly, without needing to reduce it right now.", "good": "If someone shared the load today, notice and appreciate that.", "really_good": "Enjoy a day where the mental load felt lighter, and notice what made it so."}'::jsonb,
  'Delegate one thing this week, even imperfectly done by someone else, to lighten your own load.',
  'No specific note this week.',
  'Have a direct conversation with your partner or household about dividing the mental load, not just the physical tasks.',
  'Carrying the mental load of a household and a toddler is real, demanding work — even when it''s invisible to others.',
  'If low mood, anxiety, numbness, anger, frightening thoughts or feeling unlike yourself is continuing or worsening, open Mental health & support. We can help you choose the next step.',
  'No specific note this week.',
  null
),
(
  139,
  'postpartum',
  'Preparing for the Second Birthday',
  'You don''t have to make this milestone bigger than you have energy for.',
  'Plan the second birthday around what you actually have capacity for, not what you think it should look like.',
  'Second birthdays can carry a lot of pressure — comparisons, expectations, social media versions of what a "proper" celebration looks like. This week is about planning something genuinely manageable for you, whatever scale that means.',
  ARRAY['Pressure to plan something elaborate','Relief in choosing something simple instead','Reflection on how much has changed in two years','Practical logistics (guest list, food, timing) competing for your energy']::text[],
  '{"focus": "Keep movement familiar while birthday preparation adds demand.", "tiers": {"heavy": "Choose five minutes that reduces tension.", "steady": "Walk for 10 minutes and mobilise for 5.", "feeling_good": "Use a familiar 30-minute routine with no progression."}, "mood_adjustment": "Heavy: rest. Low: walk. Okay: 15. Good: 30. Really good: save energy for life outside training.", "safety": "No specific caution this week."}'::jsonb,
  'No specific note this week.',
  'No specific note this week.',
  'No specific note this week.',
  'No specific note this week.',
  '{"heavy_day": "If birthday planning feels like pressure, remind yourself a two-year-old won''t remember the scale of the celebration — what matters is that you''re both there and it doesn''t drain you.", "a_little_low": "If comparison to others'' celebrations is weighing on you, choose the version that fits your actual capacity, not theirs.", "okay": "Notice where planning stands today, without needing it finished.", "good": "If a piece of planning came together easily today, enjoy that.", "really_good": "Look forward to the celebration, whatever shape it takes."}'::jsonb,
  'Keep the planning simple enough that you''ll actually enjoy the day itself, not just survive planning it.',
  'No specific note this week.',
  'Delegate at least one piece of the planning or the day itself to someone else.',
  'You''re about to mark two years of mothering through everything this journey has held. That''s genuinely worth pausing for.',
  'If low mood, anxiety, numbness, anger, frightening thoughts or feeling unlike yourself is continuing or worsening, open Mental health & support. We can help you choose the next step.',
  'No specific note this week.',
  null
),
(
  140,
  'postpartum',
  'How Are You, Really',
  'Two years in, checking in on yourself is still allowed — maybe more than ever.',
  'A second honest check-in, this time with two years of perspective behind it.',
  'Landing close to the second birthday, this is another dedicated pause to ask how you''re really doing, now with two full years of motherhood behind you. At two years, ongoing symptoms are better approached as maternal mental health rather than automatically attributed to childbirth. Persistent low mood, anxiety or depletion still deserves serious attention.',
  ARRAY['A genuine sense of having found your footing, worth acknowledging','Lingering heaviness or exhaustion that hasn''t really lifted','Pride mixed with tiredness when you look back at the last two years','Uncertainty about whether what you''re feeling is worth mentioning to someone']::text[],
  '{"focus": "Let movement support mental wellbeing while real distress receives real care.", "tiers": {"heavy": "Breathe slowly and move toward support.", "steady": "Walk gently with company or in a familiar setting.", "feeling_good": "Use an established routine only if it feels supportive and safe."}, "mood_adjustment": "Heavy: seek human help now. Low: move with support. Okay: gentle routine. Good or really good: do not use exercise to dismiss symptoms.", "safety": "No specific caution this week."}'::jsonb,
  'No specific note this week.',
  'No specific note this week.',
  'No specific note this week.',
  'If exhaustion has felt constant rather than tied to a hard week, that''s worth mentioning below, not just accepting as permanent.',
  '{"heavy_day": "If today is heavy, and this has been a longer pattern, it''s worth reading more about what ongoing low mood or anxiety can look like at this stage, and talking to your doctor or someone you trust. Two years in is not too late to ask for support.", "a_little_low": "A little low, if it''s been the pattern more often than not lately, deserves honest attention, not dismissal because \"it''s been a while now.\"", "okay": "If you''re genuinely okay, trust that — you don''t need to search for a problem that isn''t there.", "good": "If you''re doing well, notice what''s gotten you here — it''s real, hard-won progress.", "really_good": "A really good place, two years in, is worth celebrating fully and without qualification."}'::jsonb,
  'Whatever your honest answer is this week, offer yourself the same care you''d offer a close friend who told you the same thing.',
  'Take a few minutes to actually reflect on the last two years — the hard parts and the good ones, honestly.',
  'If this check-in surfaced something heavier than expected, the "Help me prepare to talk to someone" tool in Mental health & support can help you put it into words.',
  'Two years of showing up, in whatever way you have, is a real and significant thing.',
  'If low mood, anxiety, numbness, anger, frightening thoughts or feeling unlike yourself is continuing or worsening, open Mental health & support. We can help you choose the next step.',
  'If low mood, anxiety, or persistent exhaustion has been ongoing, raise it directly at your next appointment — support for maternal mental health doesn''t have an expiry date at one year, or two.',
  null
),
(
  141,
  'postpartum',
  'Toddler Safety, Next Phase',
  'Her growing capability means new things to think about, not new things to fear.',
  'Do one safety check appropriate to her current stage — climbing, reach, curiosity.',
  'As she becomes more mobile, capable, and curious, safety considerations shift again — higher reach, more climbing, more interest in things that weren''t accessible before. This week is a practical, not anxious, pass through what''s changed.',
  ARRAY['New climbing or reaching abilities opening up new risks','A sense of "we already baby-proofed this" needing an update','Increased curiosity about things like stoves, stairs, or outdoor spaces','Confidence in how much safety awareness you''ve already built']::text[],
  '{"focus": "Build carrying, balance and quick-direction capacity without rushing.", "tiers": {"heavy": "Practise supported balance, 6 hinges and a comfortable carry.", "steady": "Complete two rounds of hinge, carry, step-back and calf raise.", "feeling_good": "Walk for 10 minutes, then complete three controlled functional rounds."}, "mood_adjustment": "Heavy: one pattern. Low: supported work. Okay: two rounds. Good: three. Really good: control before speed.", "safety": "No specific caution this week."}'::jsonb,
  'No specific note this week.',
  'No specific note this week.',
  'No specific note this week.',
  'No specific note this week.',
  '{"heavy_day": "If safety-checking feels like one more anxious task, remember this is practical maintenance, not a sign anything''s wrong — a few minutes of attention now buys real peace of mind later.", "a_little_low": "No specific note this week.", "okay": "Notice her growing capability with some pride, alongside the practical adjustments it asks of you.", "good": "If a safety update went smoothly today, that''s one less thing to worry about.", "really_good": "Enjoy feeling on top of this stage''s practical demands."}'::jsonb,
  'No specific note this week.',
  'No specific note this week.',
  'Ask a partner or family member to help with this week''s safety pass — a second set of eyes catches things you might miss.',
  'Staying a step ahead of her growing abilities, safety-wise, is quiet but real parenting work.',
  'If low mood, anxiety, numbness, anger, frightening thoughts or feeling unlike yourself is continuing or worsening, open Mental health & support. We can help you choose the next step.',
  'No specific note this week.',
  null
),
(
  142,
  'postpartum',
  'Your Support System, Audited',
  'Knowing who you can actually call is its own kind of security.',
  'Take honest stock of who''s actually in your corner right now.',
  'This week is a gentle audit — not of your parenting, but of your support system. Who do you actually call on a hard day? Who shows up? Where are the gaps? Knowing the honest answer is useful, whether or not you act on it right away.',
  ARRAY['A support system that''s grown or shifted since early motherhood','Gaps you''d like to fill, or people you''ve leaned on more than you realized','Gratitude for specific people who''ve consistently shown up','A wish for more support than you currently have, which is worth naming']::text[],
  '{"focus": "Let practical support create protected movement time.", "tiers": {"heavy": "Ask someone to cover one task while you take five minutes.", "steady": "Use a genuinely protected 15-minute window.", "feeling_good": "Take 30 minutes for your routine while someone else fully owns toddler care or household work."}, "mood_adjustment": "Heavy: ask for rest instead. Low: move with company. Okay: protect 15. Good: protect 30. Really good: keep the handover.", "safety": "No specific caution this week."}'::jsonb,
  'No specific note this week.',
  'No specific note this week.',
  'No specific note this week.',
  'No specific note this week.',
  '{"heavy_day": "If this audit reveals a thin support system, that''s useful, not shameful, information — it''s the first step toward building it out, even slowly.", "a_little_low": "If you feel unsupported, naming that honestly (to yourself first, then maybe to someone else) is more useful than pretending otherwise.", "okay": "Notice your support system honestly today, gaps and strengths both.", "good": "If someone in your circle showed up for you recently, let yourself feel genuinely grateful.", "really_good": "Reach out and thank someone specifically for the support they''ve given you."}'::jsonb,
  'Reaching out to strengthen one relationship this week is a form of self-care, not a burden on someone else.',
  'No specific note this week.',
  'Write down three people you could call on a genuinely hard day — if that list feels short, this week''s small step is thinking about who could join it.',
  'Building and maintaining a support system, even imperfectly, is real, ongoing work.',
  'If low mood, anxiety, numbness, anger, frightening thoughts or feeling unlike yourself is continuing or worsening, open Mental health & support. We can help you choose the next step.',
  'No specific note this week.',
  null
),
(
  143,
  'postpartum',
  'Looking Back on Two Years',
  'You don''t need to have done it perfectly to have done it well.',
  'Take real stock of the last two years — the hard parts and the ones you''re proud of.',
  'As the second birthday approaches, this week is a genuine pause to look back — not to judge, but to notice how far you''ve both come since those first disorienting weeks.',
  ARRAY['A mix of pride and disbelief looking back at how far you''ve come','Memories of the hardest early stretches resurfacing','Gratitude for people, moments, or your own resilience','A sense that time has moved both impossibly fast and painfully slow']::text[],
  '{"focus": "Use movement as reflection, not a test.", "tiers": {"heavy": "Repeat the five-minute routine that helped you most.", "steady": "Choose a favourite 15-minute walk or circuit and notice what feels familiar.", "feeling_good": "Complete a preferred 30-minute routine and reflect on strength, stamina, symptoms and enjoyment."}, "mood_adjustment": "Heavy: reflect without testing. Low: choose familiarity. Okay: 15. Good or really good: compare only with your own earlier self.", "safety": "No specific caution this week."}'::jsonb,
  'No specific note this week.',
  'No specific note this week.',
  'No specific note this week.',
  'No specific note this week.',
  '{"heavy_day": "If looking back brings up hard memories, that''s valid — you''re allowed to acknowledge how hard parts of this journey genuinely were, alongside how far you''ve come.", "a_little_low": "If nostalgia or grief for the newborn stage shows up, both can coexist with being glad to be past the hardest parts.", "okay": "Notice the last two years honestly, without needing a tidy narrative.", "good": "Let yourself feel genuinely proud of one specific thing from the last two years.", "really_good": "Celebrate how far you''ve both come, fully and without minimizing it."}'::jsonb,
  'Do something this week that marks this milestone just for you — not just for her.',
  'Write down, even briefly, what you''re most proud of from the last two years.',
  'Share a reflection or memory from the last two years with someone who was there for it with you.',
  'Two years of mothering — through everything this journey has held — is genuinely something to be proud of.',
  'If low mood, anxiety, numbness, anger, frightening thoughts or feeling unlike yourself is continuing or worsening, open Mental health & support. We can help you choose the next step.',
  'No specific note this week.',
  null
),
(
  144,
  'postpartum',
  'Happy Second Birthday',
  'Two years in, and you''re both still growing. That''s exactly as it should be.',
  'Mark this milestone in whatever way feels genuinely right for you both.',
  'Two years since birth — a real milestone, for her and for you. This closes out Sustainable Rhythms, the arc that''s carried you through the second postpartum year. Whatever this day looks like for your family, it marks two years of real, ongoing growth, for both of you.',
  ARRAY['A genuine sense of milestone and celebration','Reflection on how much has changed since birth','Continued fatigue and demands, even on a celebration day','Pride in both her growth and your own, over these two years']::text[],
  '{"focus": "Celebrate two years and choose the rhythm that continues.", "tiers": {"heavy": "Choose the five minutes that supported you most.", "steady": "Combine a favourite walk with one favourite strength movement.", "feeling_good": "Create a celebration session from movements you genuinely enjoy — without testing or punishment."}, "mood_adjustment": "Heavy: honour the day with rest. Low: choose familiarity. Okay: 15. Good or really good: celebrate only in the way that feels true.", "safety": "No specific caution this week."}'::jsonb,
  'No specific note this week.',
  'No specific note this week.',
  'No specific note this week.',
  'Celebration days are still tiring days — protect some rest around it, before or after.',
  '{"heavy_day": "If a milestone day feels heavier than expected, that''s a real and common experience — big days can stir up big feelings. Box breathing, or simply naming what you''re feeling to someone close, can help.", "a_little_low": "Mixed feelings on a celebration day are allowed — joy and tiredness, pride and wistfulness can all be true at once.", "okay": "Notice today for what it is — a real milestone, met in whatever way felt right.", "good": "Let yourself enjoy this milestone fully.", "really_good": "Celebrate — genuinely, without qualification. Two years of real, hard, wonderful work deserves that."}'::jsonb,
  'Do something today, however small, that''s specifically for you — not just for the celebration itself.',
  'Take a quiet moment today to acknowledge, just to yourself, everything the last two years have asked of you.',
  'Share this milestone with the people who''ve supported you both along the way.',
  'Happy second birthday to her — and to you, for two years of showing up, again and again, in whatever way you could.',
  'If low mood, anxiety, numbness, anger, frightening thoughts or feeling unlike yourself is continuing or worsening, open Mental health & support. We can help you choose the next step.',
  'No specific note this week beyond the long-term reminders below.',
  '[{"flag": "diabetes_gd", "note": "If your pregnancy involved gestational diabetes, ADA and ACOG guidance recommends ongoing screening for type 2 diabetes every 1 to 3 years, for life — even years out and even if every earlier test came back normal. It''s worth confirming with your doctor when your next screening is due."}, {"flag": "high_bp", "note": "If you had high blood pressure during pregnancy or postpartum, that history is a long-term cardiovascular risk marker worth keeping on your medical record permanently — make sure your regular doctor (not just your OB) knows about it as part of your ongoing care, even years later."}, {"flag": "thyroid", "note": "If you have a thyroid condition, continued monitoring stays relevant well beyond the postpartum window — keep up with your prescribed treatment and routine labs, and don''t assume any new symptoms are automatically unrelated."}, {"flag": "pcos", "note": "If you have PCOS, the toddler years are a reasonable time to revisit your own metabolic and cycle health with your doctor, separate from anything related to pregnancy or breastfeeding."}]'::jsonb
);
