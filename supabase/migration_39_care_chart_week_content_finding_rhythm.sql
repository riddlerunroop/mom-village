-- Care Chart week-by-week rebuild — Finding rhythm (postpartum weeks 7-12),
-- 2026-07-29. Second batch of the postpartum week-by-week build (Early
-- healing, weeks 0-6, was the first — migrations 37-38). No schema changes
-- needed this batch — reuses every column/shape introduced for Early
-- healing (feeding_comfort, rest_support, move.recovery_route,
-- condition_notes) as-is.
--
-- Week-number convention: same forward count as every prior migration in
-- this series — postpartum week 7 = week_number 47, week 12 = week_number
-- 52 (40 + week, matching week 40 = full term/birth).
--
-- Process: Claude drafted a base version first (grounded in verified
-- claims from this project's own earlier Finding rhythm depth pass on the
-- OLD phase-based system — diastasis recti self-check timing, ACOG
-- postpartum exercise guidance — plus fresh WebSearch verification this
-- session on postpartum menstruation/fertility return timing and ACOG's
-- staged return-to-exercise guidance). Roop ran it past another AI app and
-- sent back "Care Chart — Postpartum Finding Rhythm — Final Move and Reset
-- Edition." Parsed programmatically from the pandoc-converted docx (not
-- hand-transcribed) using the same parser built for Early healing —
-- Finding rhythm's doc structure (individual WEEK headers, "Choose your
-- recovery route" then Move then Nourish/Hydration/Feeding/Rest then Reset
-- then the closing cards, optional "If this applies to you") is identical
-- to Early healing's, so the parser needed zero changes. Round-trip
-- validated the same way as every prior migration — zero errors across all
-- 15 move/reset/condition_notes jsonb blocks.
--
-- The reviewed doc made one genuine, clinically meaningful correction to
-- Claude's own draft: Week 9's diastasis-recti self-check. Claude's draft
-- prescribed a specific finger-width self-test with a numeric threshold
-- ("wider than roughly 2-3 finger-widths... worth a physiotherapy
-- referral"). The reviewed edition explicitly moves away from finger-width
-- as the diagnostic criterion ("Finger width alone does not diagnose a
-- problem or determine which exercise is safe" / editorial note: "Treat the
-- Week 9 core check as neutral function awareness — not diagnosis or a
-- finger-width pass/fail test"), favouring tension, doming, breath
-- coordination and daily function instead. Independently verified this is
-- the more current pelvic-health physiotherapy consensus: research shows
-- the finger-width method has only moderate inter-rater reliability
-- (weighted Kappa 0.53 between different examiners), and gap width alone
-- correlates poorly with functional impairment — tissue tension is now
-- considered at least as diagnostic as width, with narrower gaps sometimes
-- showing worse function than wider ones with good tension. Claude's own
-- draft's numeric threshold was the less accurate version; the reviewed
-- content is what was locked.
--
-- The other new claim needing verification — Week 10's lactational
-- amenorrhoea method (LAM) framing ("a specific temporary contraceptive
-- method with strict criteria") — was confirmed accurate: LAM requires ALL
-- three criteria (amenorrhoea, fully/nearly-fully breastfeeding, under six
-- months postpartum) to reach its >98% effectiveness, exactly matching the
-- doc's "confirm that you meet every criterion" framing without the app
-- needing to spell out the three criteria itself (correctly deferred to
-- her care team).
--
-- Condition notes: Week 7 reinforces the GDM postpartum glucose-screening
-- reminder (4-12 week window, already established in Early healing week 5)
-- diabetes_gd. Week 10 adds PCOS/irregular-cycles and high-BP/clot-risk
-- contraception-counselling notes (pcos, high_bp) — general, safe steers to
-- ask a clinician, no new numeric claims. Week 12 adds GDM (diabetes_gd),
-- a general thyroid reminder (thyroid — "continue prescribed treatment...
-- confirm when testing is due... new symptoms deserve assessment rather
-- than automatic attribution to postpartum life"), and a PCOS cycle-return
-- note (pcos). The thyroid note here does NOT make the postpartum-
-- thyroiditis onset-timing claim (4-8 months) that this project has
-- deliberately deferred to the Rebuilding batch — it's the same general,
-- timing-free safety reminder pattern already used in Early healing, just
-- appearing one batch earlier than planned. Not a conflict with the
-- standing decision to hold the detailed postpartum-thyroiditis explainer
-- for Rebuilding.
--
-- Everything else (Persistent foundations, Urgent warning signs, the four
-- recovery routes, named exercises like sit-to-stands/heel raises/wall
-- push-ups/heel slides/shoulder-blade squeezes/supported step taps) follows
-- the same low-risk, already-established bodyweight-exercise pattern used
-- throughout this project's postpartum content — not individually cited,
-- consistent with how Early healing and every prior depth pass treated
-- named PT-style exercises.

insert into care_chart_week_content (
  week_number, trimester, theme_title, mantra, priority, journey,
  what_you_may_notice, move, nourish, hydration_goal, feeding_comfort,
  rest_support, reset, care_for_yourself, your_corner, support_moment,
  celebrate_this_week, for_your_care_team, condition_notes
) values
(
  47,
  'postpartum',
  'Two months in, building tolerance',
  'You do not have to feel "back" to be making real progress.',
  'Expand daily movement gradually and notice how your body responds — not only how much you completed.',
  'Some days may feel steadier now, which can make it tempting to progress quickly. Your symptoms later that day and the following morning are useful feedback too. Recovery remains shaped by birth route, sleep, feeding demands, medical conditions and support.',
  ARRAY['More stamina on some days and real fatigue on others','Pelvic heaviness, leaking or discomfort that appears with added activity','Scar or perineal sensitivity that is easing but not gone','A stronger pull toward ordinary life','A feeding routine becoming clearer — or still changing']::text[],
  '{"focus": "Build repeatable walking tolerance and reintroduce gentle standing strength.", "recovery_route": {"vaginal": "Add walking time or an easy pace only while bleeding, pain, leaking and pelvic pressure remain settled.", "assisted_tear": "Prioritise pain-free pelvic-floor relaxation and coordination. Ask for pelvic-health assessment if bowel, bladder, sexual or pressure symptoms continue.", "caesarean": "Build walking tolerance and comfortable everyday movement; follow your surgical guidance for lifting and abdominal loading.", "complications": "Let your individual plan lead after haemorrhage, hypertension, infection, clotting concerns, anaemia or another complication."}, "tiers": {"heavy": "Walk or march gently for 2 minutes while holding stable support. Add 8 heel raises, 6 shoulder rolls each way and three relaxed breaths.", "steady": "Walk for 8--10 minutes at conversational effort. Complete one easy round of 8 sit-to-stands and 10 heel raises.", "feeling_good": "Walk for 15--20 minutes. Rest, then complete two easy rounds of 8 sit-to-stands, 10 heel raises and 8 supported marches per side."}, "mood_adjustment": "Heavy: breathing and circulation only. Low: one easy walk. Okay: use 15 minutes. Good: try the 30-minute plan. Really good: keep the effort easy and assess symptoms again tomorrow.", "safety": "Stop and seek advice for increased bleeding, new or worsening pain, pelvic heaviness or bulging, leaking that worsens, wound pulling, dizziness, faintness, chest pain, unusual breathlessness, calf pain or swelling, or feeling suddenly unwell."}'::jsonb,
  'Keep meals regular and include protein, fibre and iron-rich foods as appropriate. Increased capacity does not mean recovery nutrition is finished.',
  'Keep a drink in your main resting and feeding spaces. Adjust for climate and activity while following personalised fluid advice.',
  'Persistent pain, supply worry, pumping difficulty or a plan that is harming sleep and wellbeing still deserves skilled support — whatever the feeding method.',
  'Protect one real handover or rest period each day. Feeling more capable is not the same as no longer needing recovery.',
  '{"heavy_day": "If a hard day feels shocking this far in, tell someone it is heavy and let them help without asking you to build a case.", "a_little_low": "A day that resembles Week 1 is not proof that you have gone backwards. Recovery can fluctuate while the overall direction still improves.", "okay": "Name one thing that is easier than a month ago and one thing that still needs support. Let both facts stay true.", "good": "Enjoy the steadier day without automatically filling it with postponed work. Leave room for recovery on purpose.", "really_good": "Let feeling more like yourself be satisfying by itself. You do not need to repay the difficult weeks with productivity."}'::jsonb,
  'If a clinician has recommended scar desensitisation or massage and confirmed the wound is fully closed, follow that individual plan. Do not begin over redness, opening, drainage or increasing pain.',
  'Save one ordinary detail about your baby or your day that you might otherwise forget.',
  'Hand over one task you are still quietly managing alone — including the planning and follow-through.',
  'Two months of learning a new body and a new person is enormous work.',
  'Ask for assessment of pelvic heaviness, bulging, leaking, bowel symptoms, persistent pain, wound concerns or mood symptoms; time alone is not treatment.',
  '[{"flag": "diabetes_gd", "note": "Gestational diabetes: if postpartum glucose testing has not been arranged, ask now; the usual testing window is 4--12 weeks after birth."}]'::jsonb
),
(
  48,
  'postpartum',
  'Trusting your body again',
  'Strength returns in layers, not all at once.',
  'Add light functional strength while keeping movement symptom-led.',
  'A reassuring postpartum examination can be encouraging, but it does not answer every activity question. Daily strength returns through breathing, coordination, walking and light loading before impact or heavy effort. The right starting point is what your body can do comfortably now.',
  ARRAY['More confidence lifting and carrying the baby','Back, wrist, neck or shoulder fatigue from repeated care','Pelvic heaviness or abdominal pulling with longer days','Questions about gym classes, running or old routines','A wish for activity that feels like your own']::text[],
  '{"focus": "Layer gentle pushing and sit-to-stand strength into your walking routine.", "recovery_route": {"vaginal": "Add gentle body-weight strength only while walking and everyday activity remain symptom-settled.", "assisted_tear": "Keep pelvic-floor relaxation, pain and bowel or bladder function central; loaded exercise should not worsen pressure or pain.", "caesarean": "Add movements that do not pull at the scar or create pain, doming or breath-holding; ask about abdominal loading if uncertain.", "complications": "Strength progression should follow your condition-specific plan and current function, not a generic week number."}, "tiers": {"heavy": "Take three relaxed breaths, complete 6 wall push-ups and 6 slow sit-to-stands from a supportive chair.", "steady": "Walk for 7 minutes, then complete one round of 8 wall push-ups, 8 sit-to-stands and 10 heel raises.", "feeling_good": "Walk for 12--15 minutes. Complete two easy rounds of 8 wall push-ups, 8 sit-to-stands and 10 heel raises, resting between rounds."}, "mood_adjustment": "Heavy: breathing and one movement only. Low: walking without a circuit. Okay: use 15 minutes. Good: use 30 minutes. Really good: improve control, not speed or load.", "safety": "Stop and seek advice for increased bleeding, new or worsening pain, pelvic heaviness or bulging, leaking that worsens, wound pulling, dizziness, faintness, chest pain, unusual breathlessness, calf pain or swelling, or feeling suddenly unwell."}'::jsonb,
  'Match food to healing, movement and any milk-production demands. Restriction is not a prerequisite for rebuilding strength.',
  'Drink regularly and around activity. A bottle placed where you exercise removes one more decision.',
  'Feeding positions can strain wrists, neck and back. Adjust pillows, chair support and baby height rather than tolerating repeated pain.',
  'Pair a stronger day with deliberate recovery. Added movement without added rest can turn confidence into a flare.',
  '{"heavy_day": "If trusting your body feels impossible today, make the task smaller: choose one comfortable position and one person who can help you feel safe.", "a_little_low": "Comparison with your pre-pregnancy strength can distort real progress. Compare with your own Week 2 instead.", "okay": "Choose one activity you avoid because you are uncertain. Write the exact question a clinician or physiotherapist could answer.", "good": "Notice one everyday movement your body completed with more ease today. Let function count as progress.", "really_good": "Feel proud without immediately raising the target. Confidence grows when your body learns that movement can remain safe."}'::jsonb,
  'Check the repeated mechanics of feeding, carrying, getting off the floor and using your phone. One supportive pillow or changed hand position may prevent hours of strain.',
  'Photograph one ordinary part of today — not a milestone, just your life now.',
  'Tell your support person one specific way your body feels different this week, whether easier or harder.',
  'You are rebuilding strength in an order your body can use.',
  'Ask what any exercise "clearance" means for your birth, symptoms, goals and preferred activities. General reassurance is not an individual progression plan.',
  null
),
(
  49,
  'postpartum',
  'Checking in with your core',
  'This check is information — not a verdict.',
  'Notice abdominal-wall function and practise pressure-aware core coordination.',
  'Abdominal separation after pregnancy is common and can change over time. Finger width alone does not diagnose a problem or determine which exercise is safe. Comfort, tension, breathing, doming and daily function give a more useful picture — and a pelvic-health professional can assess concerns properly.',
  ARRAY['A soft midline or doming during effort','Difficulty coordinating an exhale with lifting or standing','Back fatigue during feeding or carrying','Improving strength without a "flat" abdomen','Curiosity or anxiety about abdominal recovery']::text[],
  '{"focus": "Practise breath-led abdominal coordination, then apply it to everyday strength.", "recovery_route": {"vaginal": "Use a comfortable exhale during effort and observe function rather than chasing a particular gap width.", "assisted_tear": "Coordinate pelvic-floor relaxation and exhalation; avoid bearing down during strength work.", "caesarean": "Work in pain-free ranges and avoid direct pressure or pulling across a tender scar.", "complications": "If you have an abdominal, pelvic or surgical restriction, skip self-assessment and follow the rehabilitation plan provided."}, "tiers": {"heavy": "Lie supported or sit tall. Take five relaxed breaths, gently exhaling through 6 heel slides or seated leg extensions — one side at a time and only without pain or doming.", "steady": "Practise 5 minutes of breath-led heel slides or seated leg extensions, then walk easily for 10 minutes.", "feeling_good": "Walk for 12--15 minutes. Complete two gentle rounds of 6 heel slides or seated leg extensions per side, 8 sit-to-stands and 8 wall push-ups."}, "mood_adjustment": "Heavy: breathing only. Low: choose a short walk. Okay: use the 15-minute plan. Good: add the circuit. Really good: improve slow control rather than adding an abdominal challenge.", "safety": "Stop and seek advice for increased bleeding, new or worsening pain, pelvic heaviness or bulging, leaking that worsens, wound pulling, dizziness, faintness, chest pain, unusual breathlessness, calf pain or swelling, or feeling suddenly unwell."}'::jsonb,
  'Abdominal tissue recovery needs adequate overall energy and protein. Body-shape anxiety is not a reason to under-fuel.',
  'Continue regular fluids; no special drinking target is required for an abdominal check.',
  'Revisit feeding and holding posture if the abdomen, back or shoulders fatigue. Support the baby''s weight with your setup rather than your spine alone.',
  'Strength adaptation happens with recovery. Keep at least one part of the day physically low-load.',
  '{"heavy_day": "If looking at or touching your abdomen feels upsetting, stop. You can choose professional assessment without examining yourself today.", "a_little_low": "Grief about change and pride in what your body did can coexist. Neither feeling requires you to judge the body in front of you.", "okay": "Describe what you notice in neutral terms: comfortable, tiring, doming, pulling or steady. Facts are more useful than labels.", "good": "Notice one function that has improved since early healing — rolling, standing, carrying or walking.", "really_good": "Use confidence to seek skilled guidance if you want it, not to prove you can manage every question alone."}'::jsonb,
  'Avoid aggressive "gap-closing" promises. Gentle core work can be useful, but the right programme depends on symptoms, function and technique.',
  'Record one way your relationship with your body has changed — without forcing the change to be positive or negative.',
  'Ask someone to film one everyday movement, such as standing from a chair, if a physiotherapist has requested it; otherwise keep health information private if you prefer.',
  'You replaced judgment with useful information.',
  'Seek pelvic-health or rehabilitation assessment for pain, persistent doming, pelvic heaviness or bulging, leaking, bowel symptoms, or difficulty returning to desired activity.',
  null
),
(
  50,
  'postpartum',
  'Fertility can return quietly',
  'Your first period is not your first fertility signal.',
  'Make a contraception plan based on your goals, health and feeding situation.',
  'Ovulation can occur before the first postpartum period. Feeding can delay fertility, but timing varies. Lactational amenorrhoea is a specific temporary contraceptive method with strict criteria — not a general assumption that breastfeeding prevents pregnancy.',
  ARRAY['A first period, spotting or no bleeding at all','Questions about sex, contraception and pregnancy spacing','Vaginal dryness or discomfort, especially while lactating','Mixed emotions about fertility returning','Continued gains in stamina with occasional tired days']::text[],
  '{"focus": "Continue walking and strength while adding supported balance.", "recovery_route": {"vaginal": "Cycle return does not change the movement plan; symptoms and recovery still guide progression.", "assisted_tear": "If penetrative sex is relevant, tissue healing, lubrication, desire and comfort matter more than a calendar date.", "caesarean": "Contraception and sexual comfort still deserve discussion; abdominal healing and comfortable positions may affect timing.", "complications": "Blood pressure, clot risk, migraine, diabetes, liver disease, medicines and other conditions can affect contraceptive choices — use individual medical advice."}, "tiers": {"heavy": "Take three relaxed breaths, complete 8 supported weight shifts per side and 8 heel raises.", "steady": "Walk for 8 minutes, then complete 8 sit-to-stands, 8 heel raises and 6 supported step taps per side.", "feeling_good": "Walk for 15 minutes. Complete two rounds of 8 sit-to-stands, 10 heel raises, 8 wall push-ups and 6 supported step taps per side."}, "mood_adjustment": "Heavy: breathing and weight shifts only. Low: an easy walk. Okay: use 15 minutes. Good: use 30 minutes. Really good: keep balance work supported and unhurried.", "safety": "Stop and seek advice for increased bleeding, new or worsening pain, pelvic heaviness or bulging, leaking that worsens, wound pulling, dizziness, faintness, chest pain, unusual breathlessness, calf pain or swelling, or feeling suddenly unwell."}'::jsonb,
  'Keep meals regular. A returning period can add another demand when iron stores are already low; discuss fatigue or heavy bleeding rather than self-prescribing supplements.',
  'Continue your regular routine and add fluids around movement or hot weather.',
  'A cycle-related change in milk supply is not universal. If intake or supply worries arise, assess the whole feeding picture with qualified support.',
  'Hormonal changes, caregiving and fragmented sleep can overlap. A lower-energy day deserves adjustment, not a forced workout.',
  '{"heavy_day": "If fertility or intimacy brings grief, fear or pressure, stop the conversation and return when you feel safer. Consent and timing remain yours.", "a_little_low": "Your body resuming one function does not mean every part of you feels recovered. Both realities can exist together.", "okay": "Clarify one decision: whether you want to avoid pregnancy now, and who can explain suitable options.", "good": "Use the steadier mood for an unhurried conversation about contraception, comfort and pregnancy spacing.", "really_good": "Let informed choice feel empowering. You can make a plan without deciding the shape of your entire future today."}'::jsonb,
  'Track bleeding only if it helps. Seek advice for very heavy bleeding, severe pain, faintness or bleeding that concerns you. Dryness and painful sex are treatable.',
  'Write one thing you want for your body or future family — without committing to a timeline.',
  'If contraception affects a partner, share the practical responsibility while keeping the final choice about your body yours.',
  'You turned a quiet biological change into an informed choice.',
  'Ask which methods fit your health, feeding preferences and plans. If relying on lactational amenorrhoea, confirm that you meet every criterion and know when it stops applying.',
  '[{"flag": "pcos", "note": "PCOS or irregular cycles: cycle timing is not a reliable contraceptive signal. Ask about a method that fits your goals rather than waiting for a predictable period."}, {"flag": "high_bp", "note": "High blood pressure or clot risk: some contraceptive methods may not suit you; request condition-specific counselling."}]'::jsonb
),
(
  51,
  'postpartum',
  'Widening the circle',
  'Wanting more than caregiving does not diminish your bond.',
  'Reintroduce one part of life outside full-time baby care.',
  'The newborn world can feel precious and very small at the same time. Work, study, friendships, movement, creativity or time alone may begin calling for attention. There is no single correct pace — and no requirement that widening your life means separating from your baby before you are ready.',
  ARRAY['Restlessness or a wish for more time outside the home','Return-to-work, study or childcare questions','Guilt about wanting space or another identity','A more interactive baby and changing daily rhythm','Physical steadiness with occasional fatigue flares']::text[],
  '{"focus": "Build consistency and strengthen the upper back for daily carrying and feeding.", "recovery_route": {"vaginal": "Continue progressing low-impact walking and strength while monitoring pelvic symptoms.", "assisted_tear": "Keep pelvic-floor treatment central even as the rest of life expands; persistent symptoms should not become your new normal.", "caesarean": "Progress core-adjacent strength only within comfortable limits and any surgical guidance still in place.", "complications": "Changes in work, travel or childcare should accommodate ongoing monitoring, medicine and recovery needs."}, "tiers": {"heavy": "Complete 8 shoulder-blade squeezes, 8 wall push-ups and 6 slow sit-to-stands.", "steady": "Walk for 7 minutes, then complete one round of 10 shoulder-blade squeezes, 8 wall push-ups, 8 sit-to-stands and 10 heel raises.", "feeling_good": "Walk for 12--15 minutes. Complete two rounds of the strength set, resting and breathing between rounds."}, "mood_adjustment": "Heavy: shoulder mobility and breathing. Low: a brief outdoor walk if safe. Okay: use 15 minutes. Good: use 30 minutes. Really good: keep repetitions controlled rather than adding load.", "safety": "Stop and seek advice for increased bleeding, new or worsening pain, pelvic heaviness or bulging, leaking that worsens, wound pulling, dizziness, faintness, chest pain, unusual breathlessness, calf pain or swelling, or feeling suddenly unwell."}'::jsonb,
  'Prepare one or two portable meals or snacks for changing days. Food planning should reduce work, not become another performance standard.',
  'Place water in the bag, workspace or room your new routine will use. Let the environment carry the reminder.',
  'If work or time apart is approaching, make a gradual, feeding-method-specific plan for pumping, milk storage, formula preparation or mixed feeding with qualified guidance.',
  'A wider life still needs recovery. Put protected rest into the plan before the calendar fills.',
  '{"heavy_day": "If work, childcare or separation decisions overwhelm you, pause the planning. One decision made with support is enough for today.", "a_little_low": "Wanting space from caregiving does not mean you love your baby less. Needing identity and rest is human.", "okay": "Name one thing outside caregiving you miss and one realistic way to meet it this week.", "good": "Enjoy a moment of identity outside motherhood without attaching guilt or a productivity target.", "really_good": "Use the energy for one concrete step — message a friend, review childcare, or schedule time that belongs to you."}'::jsonb,
  'Simplify one repeated routine for busier days: clothes, medication, meals, skincare, packing or transport.',
  'Save one thing you are looking forward to that has nothing to do with the baby.',
  'Discuss the full practical load as life widens: childcare, household work, transport, feeding logistics and your recovery time.',
  'A fuller life can hold caregiving, identity and ambition together.',
  'Ask for work-specific advice if your role involves heavy lifting, prolonged standing, driving, exposure risks or limited feeding and rest breaks.',
  null
),
(
  52,
  'postpartum',
  'Three months — a real threshold',
  'This milestone opens a conversation, not a finish line.',
  'Close early-postpartum care gaps and plan the next stage of rehabilitation.',
  'At twelve weeks, many people have gained meaningful stamina and confidence, but readiness for impact or heavy loading cannot be decided by the calendar alone. Sleep, symptoms, baseline fitness, birth route and complications still matter. This is also the end of the usual postpartum glucose-testing window after gestational diabetes.',
  ARRAY['Cumulative gains in walking and everyday strength','A body that feels more familiar but not identical','Open referrals, screenings or unanswered questions','Anticipation or anxiety about work, exercise or the next phase','Emotional steadiness with occasional difficult days']::text[],
  '{"focus": "Consolidate low-impact strength and complete a readiness check for the next phase.", "recovery_route": {"vaginal": "If low-impact movement remains symptom-free, ask about a graded pathway toward your specific goals rather than starting impact automatically.", "assisted_tear": "Persistent pain, leaking, heaviness, bowel symptoms or sexual discomfort needs assessment before impact.", "caesarean": "Internal recovery continues beyond skin healing; progress loading according to function and surgical or rehabilitation advice.", "complications": "Confirm long-term follow-up for hypertension, diabetes, anaemia, mental health or other complications before the early-postpartum pathway ends."}, "tiers": {"heavy": "Take five minutes for relaxed breathing, 8 sit-to-stands and 8 heel raises, reducing repetitions as needed.", "steady": "Walk for 7 minutes, then complete one round of 10 sit-to-stands, 10 wall push-ups and 10 heel raises.", "feeling_good": "Walk for 12--15 minutes. Complete two controlled rounds of 10 sit-to-stands, 10 wall push-ups, 10 heel raises and 8 supported step taps per side."}, "mood_adjustment": "Heavy: keep movement restorative. Low: repeat a familiar walk. Okay: use 15 minutes. Good: use 30 minutes. Really good: record how you feel during, later today and tomorrow before progressing.", "safety": "Stop and seek advice for increased bleeding, new or worsening pain, pelvic heaviness or bulging, leaking that worsens, wound pulling, dizziness, faintness, chest pain, unusual breathlessness, calf pain or swelling, or feeling suddenly unwell."}'::jsonb,
  'No milestone-driven diet change is needed. Continue enough food for recovery, activity and feeding, and seek support if appetite or body-image concerns are driving restriction.',
  'Continue regular fluids and drink around activity, feeding needs and climate.',
  'If feeding is changing because of work, weaning or preference, adjust gradually when possible and seek help for discomfort, inflammation or infant-intake concerns.',
  'Three months can still include fragmented sleep. The next movement plan should account for your actual recovery capacity.',
  '{"heavy_day": "If three months arrives and you still feel far from okay, that deserves real support. This milestone does not invalidate your experience.", "a_little_low": "Milestones can manufacture expectations. You are allowed to feel proud, disappointed, neutral or several things at once.", "okay": "Review the first twelve weeks: one hard thing, one support that worked and one need that remains open.", "good": "Let steadiness be enough today. You do not have to rush into the next identity, routine or fitness goal.", "really_good": "Mark three months in a way that feels true — a meal, a photograph, a walk or quiet recognition of how far you have come."}'::jsonb,
  'Complete a practical care audit: contraception, sexual comfort, pelvic health, mental health, medicines, vaccinations, tests, dental care and primary-care handoff.',
  'Record a short message to your Week 1 self: what you wish she knew.',
  'Thank someone for one specific act of support, then name one form of support you still need.',
  'Twelve weeks of recovery, learning and showing up is sustained work.',
  'Confirm outstanding referrals and tests, and ask for an activity-specific progression plan. "Cleared" should translate into concrete next steps.',
  '[{"flag": "diabetes_gd", "note": "Gestational diabetes: complete postpartum glucose testing now if it is still outstanding, and confirm who will review the result and arrange ongoing screening."}, {"flag": "thyroid", "note": "Known thyroid disease or autoimmune risk: continue prescribed treatment and confirm when thyroid testing is due. New palpitations, tremor, heat intolerance, marked anxiety or unexplained exhaustion deserve assessment rather than automatic attribution to postpartum life."}, {"flag": "pcos", "note": "PCOS: irregular or absent periods do not reliably indicate infertility; use contraception according to your goals and seek individual metabolic and reproductive follow-up."}]'::jsonb
);
