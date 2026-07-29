-- Care Chart week-by-week rebuild — Your Rhythm, Year Three Part 2 content, 2026-07-29.
--
-- Ninth and final batch of the postpartum week-by-week build. Covers
-- postpartum weeks 131-156 (roughly 2 years 6 months through the third
-- birthday). No schema changes needed — reuses every column/shape
-- introduced since Early healing, including mental_health_note
-- (migration_43). Week-number convention unchanged: postpartum week 131 =
-- week_number 171, week 156 = week_number 196 (the third birthday).
--
-- This closes the entire postpartum week-by-week rebuild, and with it the
-- entire pregnancy-through-third-birthday Care Chart rebuild that began
-- with First trimester weeks 1-13 (migration_35). 197 real, individually
-- authored weeks in total (pregnancy weeks 1-39 plus postpartum weeks
-- 0-156) now exist across the full journey this app was built to walk
-- alongside.
--
-- **Roop's explicit creative brief for this batch, distinct from every
-- prior batch's instruction:** rather than a purely content-standard ask,
-- Roop asked for the final 26 weeks to "feel like a gradual farewell — not
-- sentimental every week, but increasingly reflective," such that by Week
-- 156 the mother should genuinely feel she has "completed something
-- meaningful" and is "not the same woman who started at Week 1." Claude's
-- draft was structured explicitly around that brief: Weeks 131-137 stay
-- ordinary/practical (continuing themes — language, patience, self-care,
-- boundaries, money, body) with minimal reflection, deliberately avoiding
-- front-loading the farewell; Weeks 138-143 introduce real reflection
-- (grief for the baby she was, pride in who she's become, the final
-- dedicated "How are you, really" wellbeing check-in at 140) interspersed
-- with grounded practical weeks (illness season, screens) so it doesn't
-- tip into constant sentimentality; Weeks 144-150 deepen steadily,
-- including a genuine full-circle moment at Week 144 naming every phase of
-- this entire postpartum journey by name (Early healing, Finding rhythm,
-- Rebuilding, Settling into strength, Sustainable rhythms, this); Weeks
-- 151-156 build to the close — everything she got right, everything she
-- learned the hard way, the community she's built, a letter to her future
-- self, what hasn't changed, the last full week, and finally Week 156
-- itself, the third birthday and the true close of this entire content
-- series.
--
-- One deliberate correction carried over and applied to Week 156
-- specifically: this project's standing decision (documented since Month
-- 36 of the Monthly Chart and the birthday-3 screen) that the phrase
-- "first 1,000 days" is the UNICEF definition running conception to the
-- *second* birthday, not the third, and must not be used for third-
-- birthday content. Week 156's closing content was checked and does not
-- use this phrase.
--
-- Continuing every decision established since Sustainable Rhythms Part 2:
-- no "Choose your recovery route" block; real, named coping techniques
-- woven into every week's Reset per Roop's standing instruction (a couple
-- of new techniques introduced this batch for variety — loving-kindness
-- style phrasing, a "container" technique for parking a worry); a
-- mental_health_note on every week, not just check-in weeks; one dedicated
-- general-wellbeing check-in week (140, the final one in the whole
-- series). Week 156, as the true final closing week of the entire
-- postpartum rebuild, carries condition_notes on all four flags
-- (diabetes_gd, high_bp, thyroid, pcos) — framed slightly more fully than
-- prior closing weeks (which closed only a batch) since this is the last
-- week the structured weekly series will ever address these conditions,
-- each note explicitly naming that this weekly series is ending while the
-- underlying health vigilance (GDM 1-3-year lifelong rescreening, BP as a
-- permanent cardiovascular risk marker, ongoing thyroid monitoring, PCOS
-- metabolic/cycle care) should not.
--
-- **Process note, same transparency standard as every batch in this
-- series.** This batch was drafted directly against Roop's explicit
-- creative brief (delivered in chat, not via an uploaded docx) rather than
-- against a base draft later reviewed by a second AI app. Content
-- (established coping techniques, GDM/high-BP/thyroid/PCOS long-term
-- follow-up reminders) matches claims already independently verified
-- earlier in this project — no new numeric/clinical claims introduced this
-- batch requiring fresh verification. Flagged here in case Roop wants a
-- second-app pass on this specific batch later, consistent with how
-- migration_45 (Year Three Part 1) was flagged when its review pass didn't
-- happen either.
--
-- Content parsed programmatically from Claude's own markdown draft (see
-- "Care Chart — Your Rhythm Year Three Part 2 — Base Draft (Weeks
-- 131-156).md") using the same parser adapted for Year Three Part 1
-- (parse_yr3p2.py, adapted from parse_yr3p1.py — zero further changes
-- needed, draft structure identical) and round-trip validated via the same
-- state-machine SQL-literal parser used for every prior migration: 53
-- jsonb blocks, zero errors. All 26 week_numbers (171-196) present, no
-- gaps or duplicates. Zero stray backslashes. Parens and quotes balanced.
--
-- This closes "Your rhythm, year three" in full and completes the entire
-- postpartum Care Chart week-by-week rebuild.

insert into care_chart_week_content (
  week_number, trimester, theme_title, mantra, priority, journey,
  what_you_may_notice, move, nourish, hydration_goal, feeding_comfort,
  rest_support, reset, care_for_yourself, your_corner, support_moment,
  celebrate_this_week, mental_health_note, for_your_care_team, condition_notes
) values
(
  171,
  'postpartum',
  'Continuing the Rhythm',
  'Not every week needs to be a milestone. Most of them are just life.',
  'Let this be an ordinary week, without needing it to mean anything more.',
  'This one is simply about continuing the rhythm you''ve built — ordinary life with a nearly-three-year-old, which is its own kind of accomplishment.',
  ARRAY['A settled, familiar rhythm to most days','The ordinary demands of caring for an increasingly capable child','Small good moments woven through an unremarkable day']::text[],
  '{"focus": "Whatever routine has genuinely stuck for you.", "tiers": {"heavy": "A few stretches, wherever you are.", "steady": "Your go-to walk or short session.", "feeling_good": "Your established routine, at whatever level fits."}, "mood_adjustment": "No specific note this week.", "safety": "No specific caution this week."}'::jsonb,
  'No specific note this week.',
  'No specific note this week.',
  'No specific note this week.',
  'No specific note this week.',
  '{"heavy_day": "Box breathing: in for 4, hold for 4, out for 4, hold for 4 — a reliable reset, still worth returning to.", "a_little_low": "An ordinary low day doesn''t need a reason — sometimes it''s just a day.", "okay": "Notice today as simply okay, part of the ongoing rhythm.", "good": "Let a good, ordinary day be good.", "really_good": "Enjoy it, without needing it to be remarkable."}'::jsonb,
  'Whatever ritual has stuck for you, keep it going.',
  'No specific note this week.',
  'No specific note this week.',
  'An unremarkable week, well lived, is still a week well lived.',
  'However this week felt, Mental health & support is there whenever it''s useful to you.',
  'No specific note this week. — — — — — — — — — — — — — — — — — — — — — — — — --',
  null
),
(
  172,
  'postpartum',
  'The Words She Uses Now',
  'Listen to how she talks. You''ll hear yourself in there, sometimes.',
  'Notice her personality coming through in how she talks and what she says.',
  'By nearly three, her vocabulary and way of expressing herself carries real personality now — jokes, opinions, phrases picked up from you. This week is about noticing who she''s becoming through her own words.',
  ARRAY['Phrases or expressions she''s picked up that are unmistakably yours','Genuine humor and personality coming through in conversation','Occasional startling insight from someone so young','The strange, wonderful experience of being quoted back to yourself']::text[],
  '{"focus": "No specific movement theme this week.", "tiers": {"heavy": "No specific note this week.", "steady": "A walk together, listening to what she notices along the way.", "feeling_good": "Whatever movement you enjoy this week."}, "mood_adjustment": "No specific note this week.", "safety": "No specific caution this week."}'::jsonb,
  'No specific note this week.',
  'No specific note this week.',
  'No specific note this week.',
  'No specific note this week.',
  '{"heavy_day": "If a hard day makes it difficult to enjoy her chatter, that''s understandable — a moment of quiet is allowed too.", "a_little_low": "Notice one thing she said recently that made you smile, even briefly.", "okay": "No specific note this week.", "good": "Enjoy hearing yourself reflected back in her words today.", "really_good": "Let this delight you fully — it won''t sound quite like this forever."}'::jsonb,
  'No specific note this week.',
  'Write down one thing she said this week that you don''t want to forget.',
  'Share something funny she said with someone who''ll appreciate it.',
  'Watching her language become genuinely, unmistakably hers is a real privilege.',
  'No specific note this week beyond the persistent support link below.',
  'No specific note this week. — — — — — — — — — — — — — — — — — — — — — — — — --',
  null
),
(
  173,
  'postpartum',
  'Your Patience, Matured',
  'You''re not more patient by accident. You built it, one hard day at a time.',
  'Notice how much your own patience has genuinely grown over this journey.',
  'Patience isn''t a trait you either have or don''t — it''s built, day by hard day. This week is a practical check-in on your patience now, and a quiet acknowledgment that it''s genuinely different from where it started.',
  ARRAY['Situations that would have undone you a year ago now feel manageable','Continued moments where patience runs out, which is still normal','A wider range of tools than you used to have for hard moments','Occasional surprise at your own steadiness']::text[],
  '{"focus": "No specific movement theme this week.", "tiers": {"heavy": "A few slow breaths before responding to anything frustrating.", "steady": "A walk to release tension before it builds.", "feeling_good": "Whatever movement you enjoy this week."}, "mood_adjustment": "No specific note this week.", "safety": "No specific caution this week."}'::jsonb,
  'No specific note this week.',
  'No specific note this week.',
  'No specific note this week.',
  'No specific note this week.',
  '{"heavy_day": "Box breathing, still reliable: in for 4, hold for 4, out for 4 — even matured patience needs a reset sometimes.", "a_little_low": "A patience lapse doesn''t undo the real growth you''ve built — one hard moment isn''t the whole picture.", "okay": "Notice today''s patience honestly, without needing perfection.", "good": "If patience came easily today, notice it — it''s a skill you''ve built, not luck.", "really_good": "Enjoy noticing how far your own steadiness has come."}'::jsonb,
  'No specific note this week.',
  'Reflect on one moment recently where you handled something with more patience than you would have a year ago.',
  'No specific note this week.',
  'Your patience today is the product of real, hard-won practice — that''s worth recognizing.',
  'No specific note this week beyond the persistent support link below.',
  'No specific note this week. — — — — — — — — — — — — — — — — — — — — — — — — --',
  null
),
(
  174,
  'postpartum',
  'What Self-Care Means Now',
  'It doesn''t have to look like it did before. It just has to actually help.',
  'Notice what self-care genuinely looks like for you now, three years in.',
  'What counted as self-care in the early weeks (mostly sleep, mostly survival) looks different now — more varied, sometimes more accessible, sometimes still hard to prioritize. This week is a fresh, honest look at what actually restores you at this stage.',
  ARRAY['A clearer, more specific sense of what genuinely helps you now','Old self-care ideas that no longer quite fit','More consistent access to small restorative moments than earlier stages allowed','Continued difficulty prioritizing it, which is still common']::text[],
  '{"focus": "Whatever genuinely counts as self-care for you now.", "tiers": {"heavy": "Whatever five minutes genuinely restores you.", "steady": "Your version of restorative time.", "feeling_good": "A fuller version of whatever restores you."}, "mood_adjustment": "No specific note this week.", "safety": "No specific caution this week."}'::jsonb,
  'No specific note this week.',
  'No specific note this week.',
  'No specific note this week.',
  'No specific note this week.',
  '{"heavy_day": "A self-compassion break: hand on heart, \"this is a hard moment, and I''m allowed to take care of myself through it.\"", "a_little_low": "Notice what you actually need right now, rather than what you think you \"should\" do to feel better.", "okay": "No specific note this week.", "good": "If you found real restoration today, notice what it looked like.", "really_good": "Enjoy feeling genuinely cared for by yourself."}'::jsonb,
  'Choose your own current version of self-care this week, even if it looks different from before.',
  'Reflect on what self-care genuinely means to you now.',
  'No specific note this week.',
  'Learning what actually restores you, three years and many stages in, is real self-knowledge.',
  'No specific note this week beyond the persistent support link below.',
  'No specific note this week. — — — — — — — — — — — — — — — — — — — — — — — — --',
  null
),
(
  175,
  'postpartum',
  'The Help You Didn''t Ask For',
  'You can accept help gracefully and still decide what you actually need.',
  'Notice one piece of unsolicited advice or help, and respond how you actually want to.',
  'Unsolicited advice and help don''t stop at year three — they just shift shape. This week is about noticing where boundaries (Weeks 97, 124) are still doing their job, and where they might need a fresh, calm reinforcement.',
  ARRAY['Continued unsolicited advice about parenting choices','Growing ease in deflecting or accepting help on your own terms','Occasional friction when a boundary needs restating','Genuine gratitude for help that''s actually useful']::text[],
  '{"focus": "No specific movement theme this week.", "tiers": {"heavy": "A few calming breaths before a boundary conversation, if needed.", "steady": "A walk to clarify what you actually need to say.", "feeling_good": "Whatever movement you enjoy this week."}, "mood_adjustment": "No specific note this week.", "safety": "No specific caution this week."}'::jsonb,
  'No specific note this week.',
  'No specific note this week.',
  'No specific note this week.',
  'No specific note this week.',
  '{"heavy_day": "A self-compassion break before responding — \"this is hard, and I''m allowed to protect my own choices.\"", "a_little_low": "Notice you''ve handled this kind of thing before, many times, and you''ll handle it again.", "okay": "No specific note this week.", "good": "If a boundary was respected easily today, note that.", "really_good": "Enjoy noticing how much more natural boundary-setting has become."}'::jsonb,
  'No specific note this week.',
  'No specific note this week.',
  'No specific note this week.',
  'Three years of practicing this has made you genuinely better at it — that''s real growth.',
  'No specific note this week beyond the persistent support link below.',
  'No specific note this week. — — — — — — — — — — — — — — — — — — — — — — — — --',
  null
),
(
  176,
  'postpartum',
  'Your Money, Three Years In',
  'A clearer financial picture than you had at the start — however it looks.',
  'A short, honest look at how your finances have actually evolved over three years.',
  'Three years of real financial decisions — some planned, some improvised — have shaped where you stand now. This week is a practical, non-judgmental check-in, building on Weeks 91, 112.',
  ARRAY['A genuinely different financial picture than three years ago, for better or worse','Habits or systems that have served you well','Areas that still feel uncertain or under-planned','Relief, stress, or a mix, depending on where things stand']::text[],
  '{"focus": "No specific movement theme this week.", "tiers": {"heavy": "A few calming breaths before a financial task, if it feels stressful.", "steady": "A short walk before or after a financial task.", "feeling_good": "Whatever movement you enjoy this week."}, "mood_adjustment": "No specific note this week.", "safety": "No specific caution this week."}'::jsonb,
  'No specific note this week.',
  'No specific note this week.',
  'No specific note this week.',
  'No specific note this week.',
  '{"heavy_day": "Name the specific worry rather than letting it stay vague — specificity makes it workable.", "a_little_low": "One small task can turn worry into information.", "okay": "Notice financial stress doesn''t need solving today.", "good": "If you took a concrete step today, note the relief.", "really_good": "Use a good day to tackle something you''ve been avoiding."}'::jsonb,
  'No specific note this week.',
  'No specific note this week.',
  'A shared, honest look at finances with your partner or household, if that fits.',
  'Three years of navigating real financial decisions, imperfectly and honestly, is real stewardship.',
  'No specific note this week beyond the persistent support link below.',
  'No specific note this week — the Wealth pillar''s planner remains available for as long as you want it. — — — — — — — — — — — — — — — — — — — — — — — — --',
  null
),
(
  177,
  'postpartum',
  'Making Peace With Your Body',
  'Not the body you had before. The body that did this. Both are worth honoring.',
  'Notice where you genuinely stand with your body now, three years on.',
  'Three years since pregnancy began, your relationship with your body has likely shifted many times — grief, acceptance, pride, frustration, all at different points. This week is an honest, non-judgmental check-in, not a demand to have arrived anywhere specific.',
  ARRAY['A body that feels genuinely like yours again, or still doesn''t','Moments of real pride in what your body has done','Lingering comparisons to who you were before, which may or may not be useful','No single fixed feeling — this can shift day to day, even now']::text[],
  '{"focus": "Whatever your body genuinely wants this week.", "tiers": {"heavy": "Gentle stretching, noticing how your body actually feels.", "steady": "A walk, staying present in your body rather than just getting through it.", "feeling_good": "A full session of your choice."}, "mood_adjustment": "No specific note this week.", "safety": "Persistent symptoms are still worth raising with your doctor, however far out from pregnancy you are."}'::jsonb,
  'No specific note this week.',
  'No specific note this week.',
  'No specific note this week.',
  'No specific note this week.',
  '{"heavy_day": "A self-compassion break: hand on heart, \"this body carried us both through everything. It''s allowed to still be figuring itself out.\"", "a_little_low": "Notice one thing your body has done for you this week that had nothing to do with appearance.", "okay": "Notice your body neutrally today.", "good": "If you feel genuinely good in your body today, let that be enough.", "really_good": "Enjoy feeling strong or at peace in your body, fully."}'::jsonb,
  'No specific note this week.',
  'No specific note this week.',
  'No specific note this week.',
  'Wherever you stand with your body today, it has carried you through an extraordinary three years.',
  'If body image thoughts are significantly affecting your wellbeing, Mental health & support can help.',
  'No specific note this week. — — — — — — — — — — — — — — — — — — — — — — — — --',
  null
),
(
  178,
  'postpartum',
  'The Baby She Was',
  'You''re allowed to miss her, even while you love who she''s becoming.',
  'Let yourself feel whatever comes up when you think about who she used to be.',
  'This week marks the beginning of a more reflective stretch, as the third birthday approaches. It starts here, gently: the baby she was is genuinely gone, replaced by the person she''s becoming, and it''s completely normal to feel a real, quiet grief about that alongside all the love for who she is now.',
  ARRAY['Sudden, unexpected nostalgia for the baby or toddler she used to be','A photo or memory that catches you off guard','Guilt about missing an earlier stage, as though it means you''re not present now','Genuine love for who she is right now, alongside the grief']::text[],
  '{"focus": "Gentle movement — this week''s theme is emotional, not physical.", "tiers": {"heavy": "Slow breathing, hand on your chest, if nostalgia feels heavy.", "steady": "A walk to process whatever''s coming up.", "feeling_good": "Whatever movement feels good this week."}, "mood_adjustment": "No specific note this week.", "safety": "No specific caution this week."}'::jsonb,
  'No specific note this week.',
  'No specific note this week.',
  'No specific note this week.',
  'No specific note this week.',
  '{"heavy_day": "A self-compassion break: hand on heart, \"missing who she was doesn''t take anything away from who I love now. Both are true.\"", "a_little_low": "Grief for an earlier stage, even a genuinely happy one now, is completely normal — it doesn''t mean anything is wrong.", "okay": "Notice this bittersweet feeling without needing to resolve it.", "good": "If today brought a warm memory rather than a heavy one, let yourself enjoy it.", "really_good": "Look at an old photo or video, on purpose, and let yourself feel whatever comes."}'::jsonb,
  'Give yourself permission to feel this, rather than pushing it away.',
  'Write down one specific memory of her as a baby that you don''t want to lose.',
  'Share a memory of her early days with someone who was there for them.',
  'Loving every version of her, even the ones that are already gone, is part of what makes this love so real.',
  'If grief or nostalgia is sitting heavily this week, Mental health & support is there — this is a genuine, common feeling, not something to carry alone.',
  'No specific note this week. — — — — — — — — — — — — — — — — — — — — — — — — --',
  null
),
(
  179,
  'postpartum',
  'The Mother You''ve Become',
  'Whoever you thought you''d be, this version of you is real, and it''s enough.',
  'Let yourself genuinely take in who you''ve become as a mother.',
  'Following last week''s grief for who she was, this week turns toward pride — in who you''ve become. The mother you are now is likely quite different from who you expected to be at the start, and that''s worth real, unqualified acknowledgment.',
  ARRAY['Genuine surprise at your own capability and resilience','A version of yourself as a mother you couldn''t have predicted at the beginning','Occasional disbelief that you''ve navigated everything these three years held','Pride that feels earned, not performative']::text[],
  '{"focus": "No specific movement theme this week.", "tiers": {"heavy": "No specific note this week.", "steady": "A walk, with space to let this reflection land.", "feeling_good": "Whatever movement you enjoy this week."}, "mood_adjustment": "No specific note this week.", "safety": "No specific caution this week."}'::jsonb,
  'No specific note this week.',
  'No specific note this week.',
  'No specific note this week.',
  'No specific note this week.',
  '{"heavy_day": "Even on a hard day, name one true thing about the mother you''ve become — pride and hardship can coexist.", "a_little_low": "This reflection doesn''t require a perfect record — you don''t have to have done it flawlessly to have done it well.", "okay": "Notice this honestly, without needing a tidy story.", "good": "Let yourself feel genuinely proud today.", "really_good": "Celebrate this fully — you''ve earned it."}'::jsonb,
  'Mark this reflection with something that''s just for you.',
  'Write down, even briefly, one way you''ve genuinely grown as a mother.',
  'Share this reflection with someone who''s watched you become this version of yourself.',
  'The mother you are now, built through everything these three years asked of you, is genuinely worth celebrating.',
  'No specific note this week beyond the persistent support link below.',
  'No specific note this week. — — — — — — — — — — — — — — — — — — — — — — — — --',
  null
),
(
  180,
  'postpartum',
  'How Are You, Really',
  'The last dedicated check-in in this journey — and still just as important as the first.',
  'One final, honest check-in on how you''re actually doing.',
  'This is the last dedicated general-wellbeing check-in in this entire series — following Weeks 88, 100, 120. Same spirit, same honesty. This project still deliberately doesn''t use the term "postpartum depression" this far out, but ongoing low mood, anxiety, or feeling flat still deserves real, serious attention, at any point in motherhood, including right at the very end of this particular journey.',
  ARRAY['Genuine contentment, worth noticing as much as any hard stretch','A low mood or heaviness that''s lasted longer than a bad week','Complicated feelings as this three-year journey nears its close','Uncertainty about whether what you''re feeling is worth mentioning to someone']::text[],
  '{"focus": "Movement this week is optional and secondary to the check-in itself.", "tiers": {"heavy": "A few slow breaths before anything else today.", "steady": "A walk alone, with space to think about how you''re doing.", "feeling_good": "Whatever movement feels good — this week the real work is elsewhere."}, "mood_adjustment": "No specific note this week — see the honest check-in below instead.", "safety": "No specific caution this week."}'::jsonb,
  'No specific note this week.',
  'No specific note this week.',
  'No specific note this week.',
  'If exhaustion has felt constant rather than tied to a hard week, that''s worth mentioning below.',
  '{"heavy_day": "If today is heavy, and this has been a longer pattern, it''s worth reading more about what ongoing low mood or anxiety can look like, and talking to your doctor or someone you trust. This journey''s structured weekly check-ins are ending, but real support for you never does.", "a_little_low": "A little low, if it''s been the pattern more often than not, deserves honest attention.", "okay": "If you''re genuinely okay, trust that.", "good": "If you''re doing well, notice what''s been helping.", "really_good": "A really good stretch, here at the close of this journey, is worth celebrating fully."}'::jsonb,
  'Whatever your honest answer this week, offer yourself the same care you''d offer a close friend.',
  'Take a few real minutes to sit with the question "how am I, really" — one more time.',
  'If this check-in surfaced something heavier than expected, the "Help me prepare to talk to someone" tool in Mental health & support can help you put it into words.',
  'Checking in with yourself honestly, one last time in this series, is a real act of care — and one you can keep doing long after this app''s weekly cards end.',
  'If low mood, anxiety, or persistent exhaustion has been ongoing, please reach out — Mental health & support and the resources on the Safety page remain available to you always, not just during this weekly series.',
  'If low mood, anxiety, or persistent exhaustion has been ongoing, raise it directly at your next appointment — maternal mental health support has no expiry date, and this journey''s structured content ending doesn''t mean your own care should pause. — — — — — — — — — — — — — — — — — — — — — — — — --',
  null
),
(
  181,
  'postpartum',
  'The Village That Held You',
  'No one does this entirely alone. Whoever showed up for you, this week is for them too.',
  'Name, specifically, the people who helped you get here.',
  'Whether it was a partner, a parent, a friend, a stranger who once helped in a hard moment, or a professional who guided you through something difficult — this week is about naming the people who made this journey possible, since so much of it happens quietly, unacknowledged in the moment.',
  ARRAY['A clearer sense than ever of who actually showed up for you','Gratitude for support you may not have fully acknowledged at the time','Grief if some of that support is no longer available to you','A wish to actually tell these people what they meant']::text[],
  '{"focus": "No specific movement theme this week.", "tiers": {"heavy": "No specific note this week.", "steady": "A walk, thinking through who helped you along the way.", "feeling_good": "Whatever movement you enjoy this week."}, "mood_adjustment": "No specific note this week.", "safety": "No specific caution this week."}'::jsonb,
  'No specific note this week.',
  'No specific note this week.',
  'No specific note this week.',
  'No specific note this week.',
  '{"heavy_day": "If this reflection brings up grief for support you''ve lost, that''s valid — loving-kindness for yourself matters here too: \"may I be gentle with myself in this loss.\"", "a_little_low": "Naming who helped you, even privately, can lighten a heavy day.", "okay": "Notice your support system honestly, gratitude and gaps both.", "good": "Let gratitude for real support feel good today, fully.", "really_good": "Tell someone, today, exactly what their support meant to you."}'::jsonb,
  'No specific note this week.',
  'Write down the names of everyone who genuinely helped you through this journey.',
  'Actually reach out and thank one person specifically this week.',
  'You didn''t do this entirely alone — and recognizing that takes nothing away from what you did.',
  'No specific note this week beyond the persistent support link below.',
  'No specific note this week. — — — — — — — — — — — — — — — — — — — — — — — — --',
  null
),
(
  182,
  'postpartum',
  'Illness Season, Once More',
  'Even in the final stretch, ordinary hard days still happen. That''s okay.',
  'Take your own symptoms as seriously as hers, same as always.',
  'A deliberately ordinary, practical week in the middle of this reflective stretch — illness season cycles back around, same as every other time. Not every week of this final chapter needs to be about looking back; some are just about getting through a hard, ordinary stretch.',
  ARRAY['Catching what she brings home, same as always','The familiar challenge of caring for a sick child while unwell yourself','Slower recovery than you''d like','The comfort of knowing, by now, exactly how to get through this']::text[],
  '{"focus": "Rest is the priority if you''re unwell.", "tiers": {"heavy": "If you''re sick, skip movement and prioritize rest.", "steady": "Gentle stretching only if genuinely recovering.", "feeling_good": "Ease back in once you''re actually better."}, "mood_adjustment": "If unwell, \"movement\" means rest this week.", "safety": "Avoid pushing through fever, significant fatigue, or any symptoms your doctor would want to know about."}'::jsonb,
  'Simple, easy-to-digest food if unwell.',
  'Extra fluids if you or your toddler are sick.',
  'No specific note this week.',
  'Ask for backup this week if you''re sick — still not optional, still necessary.',
  '{"heavy_day": "A self-compassion break can help before problem-solving anything, same as it always has.", "a_little_low": "Lower every expectation this week if illness is in the house — survival mode is still appropriate.", "okay": "If recovering, notice that gently.", "good": "A healthy day after an illness stretch is worth genuinely appreciating.", "really_good": "Enjoy the return to normal energy."}'::jsonb,
  'Basic comfort is the priority if unwell.',
  'No specific note this week.',
  'Actually ask for help this week if illness hits your household.',
  'By now, you know exactly how to get through a hard, ordinary stretch — that''s its own kind of expertise.',
  'No specific note this week beyond the persistent support link below.',
  'If you''re still frequently catching what she brings home, mention it at your next check-up. — — — — — — — — — — — — — — — — — — — — — — — — --',
  null
),
(
  183,
  'postpartum',
  'Screens and Boundaries, Settled',
  'Whatever balance you''ve found by now is the right one — because it''s yours.',
  'A final, easy look at wherever your household''s screen and boundary norms have settled.',
  'Same spirit as Weeks 87, 114, but with less urgency this time — by now, your household likely has a genuine, settled rhythm around screens and family boundaries. This week is a light check-in, not a re-litigation.',
  ARRAY['A settled, workable pattern around screens and boundaries','Occasional adjustments as she grows, without major upheaval','Confidence in decisions that once felt uncertain','Genuine ease with choices that used to carry guilt']::text[],
  '{"focus": "No specific movement theme this week.", "tiers": {"heavy": "No specific note this week.", "steady": "A walk, if you want space to think about this loosely.", "feeling_good": "Whatever movement you enjoy this week."}, "mood_adjustment": "No specific note this week.", "safety": "No specific caution this week."}'::jsonb,
  'No specific note this week.',
  'No specific note this week.',
  'No specific note this week.',
  'No specific note this week.',
  '{"heavy_day": "No specific note this week.", "a_little_low": "No specific note this week.", "okay": "Notice your household''s rhythm honestly, without needing to overhaul anything.", "good": "Enjoy the ease of decisions that used to feel harder.", "really_good": "Notice how much more confident you''ve become in these everyday choices."}'::jsonb,
  'No specific note this week.',
  'No specific note this week.',
  'No specific note this week.',
  'The guilt-loaded decisions from earlier in this journey have become genuinely easy — that''s real growth, even if it happened quietly.',
  'No specific note this week beyond the persistent support link below.',
  'No specific note this week. — — — — — — — — — — — — — — — — — — — — — — — — --',
  null
),
(
  184,
  'postpartum',
  'The Phases You''ve Walked Through',
  'Early healing. Finding rhythm. Rebuilding. Settling into strength. Sustainable rhythms. This. You walked through every one.',
  'Actually name, one by one, the stages this journey has carried you through.',
  'This week is a deliberate, full-circle moment: naming the real phases this Care Chart journey has walked you through, one by one — Early healing, in the rawest days after birth. Finding rhythm, as things started to settle. Rebuilding, as your strength genuinely returned. Settling into strength, through the whole first year. Sustainable rhythms, across the second. And now, this — Your rhythm, year three, nearly complete. Each one asked something different of you, and you met every single one.',
  ARRAY['Genuine disbelief at how much ground you''ve covered','Specific memories tied to particular phases, some hard, some tender','Pride in having moved through every stage, even the ones you didn''t feel ready for','A sense of real, earned completion beginning to settle in']::text[],
  '{"focus": "Movement as reflection this week, not a test of anything.", "tiers": {"heavy": "Whatever five minutes helped you most, at any point in this whole journey — repeat it.", "steady": "A walk, one more time, thinking through the whole arc.", "feeling_good": "Whatever movement you''ve come to love most across these three years."}, "mood_adjustment": "No specific note this week.", "safety": "No specific caution this week."}'::jsonb,
  'No specific note this week.',
  'No specific note this week.',
  'No specific note this week.',
  'No specific note this week.',
  '{"heavy_day": "Even on a heavy day this week, name one phase you genuinely got through — that''s real proof you can get through this one too.", "a_little_low": "Some phases were harder than others. It''s allowed to still feel their weight, even now.", "okay": "Notice this reflection honestly, without needing every phase to have been easy.", "good": "Let pride in this whole arc feel good today.", "really_good": "Celebrate the full distance you''ve traveled, fully."}'::jsonb,
  'Mark this reflection with something meaningful, just for you.',
  'Write down one specific memory from each phase you can recall — even a fragment.',
  'Share this reflection with someone who walked alongside you through more than one of these phases.',
  'Early healing. Finding rhythm. Rebuilding. Settling into strength. Sustainable rhythms. This. You walked through every one of them. That is genuinely something.',
  'If this reflection brings up more than you expected, Mental health & support is there — looking back honestly can surface real feelings, and that''s okay.',
  'No specific note this week. — — — — — — — — — — — — — — — — — — — — — — — — --',
  null
),
(
  185,
  'postpartum',
  'What You''d Tell Week-One You',
  'She needed to hear it wouldn''t always feel like this. Tell her now.',
  'Write, even briefly, what you''d tell the version of you at the very beginning.',
  'If you could speak to the mother you were at Week 1 of this whole journey — pregnant, or newly holding a newborn, uncertain about nearly everything — what would you tell her? This week is about actually answering that, honestly.',
  ARRAY['A clear sense of what that earlier version of you needed to hear','Compassion for how uncertain or overwhelmed she was','Surprise at how much you now know that she couldn''t have','Gratitude that she kept going, even without knowing how this would turn out']::text[],
  '{"focus": "No specific movement theme this week.", "tiers": {"heavy": "No specific note this week.", "steady": "A walk, composing your message to her in your head.", "feeling_good": "Whatever movement you enjoy this week."}, "mood_adjustment": "No specific note this week.", "safety": "No specific caution this week."}'::jsonb,
  'No specific note this week.',
  'No specific note this week.',
  'No specific note this week.',
  'No specific note this week.',
  '{"heavy_day": "If this reflection stirs up hard memories of the beginning, that''s valid — speak to her with the same kindness you''d offer a struggling friend.", "a_little_low": "Notice what she needed to hear most, and offer it to yourself now too — you may still need it.", "okay": "Notice this exercise honestly, without needing to have all the right words.", "good": "Let this reflection feel warm today.", "really_good": "Enjoy how far you''ve come from where she started."}'::jsonb,
  'No specific note this week.',
  'Actually write the message — a few sentences to the version of you at the very start.',
  'No specific note this week.',
  'She didn''t know how this would turn out, and she kept going anyway. That took real courage.',
  'No specific note this week beyond the persistent support link below.',
  'No specific note this week. — — — — — — — — — — — — — — — — — — — — — — — — --',
  null
),
(
  186,
  'postpartum',
  'Rituals Worth Keeping',
  'Some things you built are worth carrying forward, on purpose.',
  'Name one ritual or habit from this journey you want to keep.',
  'Across three years, you''ve built real rituals — some big, some small — that have genuinely served you or your family well. This week is about noticing them deliberately, so you carry them forward on purpose rather than by accident.',
  ARRAY['A ritual or habit that''s become genuinely meaningful','Pride in something you built intentionally','A wish to keep certain routines even as this app''s structured content ends','Clarity about what''s actually worth protecting going forward']::text[],
  '{"focus": "No specific movement theme this week.", "tiers": {"heavy": "No specific note this week.", "steady": "A walk, thinking through what''s actually worth keeping.", "feeling_good": "Whatever movement you enjoy this week."}, "mood_adjustment": "No specific note this week.", "safety": "No specific caution this week."}'::jsonb,
  'No specific note this week.',
  'No specific note this week.',
  'No specific note this week.',
  'No specific note this week.',
  '{"heavy_day": "No specific note this week.", "a_little_low": "Notice one small ritual that''s helped you through hard days — it''s still available to you.", "okay": "Notice today''s rituals honestly.", "good": "Enjoy noticing what''s genuinely worked.", "really_good": "Celebrate the rituals you''ve built, fully."}'::jsonb,
  'Protect one ritual this week specifically, on purpose.',
  'Write down the rituals or habits from this journey you want to keep going forward.',
  'Share a ritual that''s meant something to you with someone who''s been part of it.',
  'Building rituals that genuinely serve you, over three real years, is quiet, lasting work.',
  'No specific note this week beyond the persistent support link below.',
  'No specific note this week. — — — — — — — — — — — — — — — — — — — — — — — — --',
  null
),
(
  187,
  'postpartum',
  'Rituals Worth Letting Go',
  'Not everything you built needs to last forever. Some of it did its job and can rest now.',
  'Name one habit or approach from this journey you''re ready to release.',
  'Alongside the rituals worth keeping, some things served a purpose for a specific stage and no longer fit — and letting them go isn''t failure, it''s appropriate evolution. This week is about noticing what''s ready to be set down.',
  ARRAY['A habit or approach that no longer fits who you or she are now','Relief at the idea of letting something go','Guilt about "giving up" on something, even when it''s genuinely time','Confidence that you know your own family well enough to make this call']::text[],
  '{"focus": "No specific movement theme this week.", "tiers": {"heavy": "No specific note this week.", "steady": "A walk, thinking through what''s ready to be released.", "feeling_good": "Whatever movement you enjoy this week."}, "mood_adjustment": "No specific note this week.", "safety": "No specific caution this week."}'::jsonb,
  'No specific note this week.',
  'No specific note this week.',
  'No specific note this week.',
  'No specific note this week.',
  '{"heavy_day": "A container exercise: if letting go of something feels heavy, name it, and mentally \"place it in a container\" to revisit later — you don''t have to resolve it all today.", "a_little_low": "Letting go of something that no longer serves you isn''t giving up — it''s a sign you''re paying attention.", "okay": "Notice this honestly, without needing to decide everything today.", "good": "If releasing something today felt like relief, let that be enough reason.", "really_good": "Enjoy the lightness of letting go of what no longer fits."}'::jsonb,
  'No specific note this week.',
  'Write down one thing you''re ready to let go of, and why.',
  'No specific note this week.',
  'Knowing when to let something go, rather than clinging out of habit, is real wisdom.',
  'No specific note this week beyond the persistent support link below.',
  'No specific note this week. — — — — — — — — — — — — — — — — — — — — — — — — --',
  null
),
(
  188,
  'postpartum',
  'Preparing Her for What''s Next',
  'She''s ready for more of the world. You''ve already given her what she needs to meet it.',
  'Notice one practical way to help her step into whatever comes after this stage.',
  'As the third birthday nears, many children are stepping toward more structured settings — school, bigger social circles, more independence. This week is a practical, forward-looking one: preparing her, in small real ways, for what''s ahead.',
  ARRAY['Excitement and nerves about what''s next for her','Confidence in the foundation you''ve already given her','Practical questions about school, routines, or new settings','Pride in how ready she genuinely seems']::text[],
  '{"focus": "No specific movement theme this week.", "tiers": {"heavy": "No specific note this week.", "steady": "A walk, thinking through practical next steps.", "feeling_good": "Whatever movement you enjoy this week."}, "mood_adjustment": "No specific note this week.", "safety": "No specific caution this week."}'::jsonb,
  'No specific note this week.',
  'No specific note this week.',
  'No specific note this week.',
  'No specific note this week.',
  '{"heavy_day": "If nerves about her next steps feel heavy, remember you''ve navigated real transitions with her before, successfully.", "a_little_low": "No specific note this week.", "okay": "Notice preparation as it stands today, without needing it finished.", "good": "If a piece of preparation came together easily, enjoy that.", "really_good": "Feel genuinely excited for what''s ahead for her."}'::jsonb,
  'No specific note this week.',
  'No specific note this week.',
  'No specific note this week.',
  'You''ve given her a genuine foundation — she''s ready for what''s next because of everything you''ve already done.',
  'No specific note this week beyond the persistent support link below.',
  'No specific note this week — Library book *Guiding Your Growing Child* covers the 2-7 age range in depth if you want to keep going. — — — — — — — — — — — — — — — — — — — — — — — — --',
  null
),
(
  189,
  'postpartum',
  'Preparing Yourself for What''s Next',
  'Whatever comes after this chapter, you''re allowed to look forward to it too.',
  'Notice what you''re looking forward to, for yourself, beyond this stage.',
  'Alongside preparing her, this week turns the same question toward you — what are you looking forward to, personally, as this particular chapter closes? Not instead of loving where you are now, but alongside it.',
  ARRAY['Genuine excitement about your own next chapter, whatever that looks like','Guilt about wanting something beyond motherhood, which isn''t necessary','Uncertainty about what comes next for you specifically','A mix of readiness and reluctance to move into a new stage']::text[],
  '{"focus": "No specific movement theme this week.", "tiers": {"heavy": "No specific note this week.", "steady": "A walk, thinking about what you''re looking forward to.", "feeling_good": "Whatever movement you enjoy this week."}, "mood_adjustment": "No specific note this week.", "safety": "No specific caution this week."}'::jsonb,
  'No specific note this week.',
  'No specific note this week.',
  'No specific note this week.',
  'No specific note this week.',
  '{"heavy_day": "If thinking about what''s next feels overwhelming, that''s okay — you don''t need a plan today, just an honest thought.", "a_little_low": "Wanting something for yourself beyond motherhood doesn''t take anything away from your love for her.", "okay": "Notice this honestly, without needing certainty.", "good": "Let excitement about what''s ahead for you feel good today.", "really_good": "Enjoy genuinely looking forward to something, fully."}'::jsonb,
  'Do one small thing this week that points toward whatever''s next for you.',
  'Write down what you''re genuinely looking forward to, for yourself.',
  'Share what you''re looking forward to with someone who''ll be glad to hear it.',
  'Looking forward to your own next chapter, alongside hers, is a healthy, honest thing to want.',
  'No specific note this week beyond the persistent support link below.',
  'No specific note this week. — — — — — — — — — — — — — — — — — — — — — — — — --',
  null
),
(
  190,
  'postpartum',
  'Everything You Got Right',
  'Even on the days it didn''t feel like it, you were doing it right more often than you knew.',
  'Actually list, without deflecting, what you got right over this journey.',
  'Mothers are often quicker to list what they got wrong than what they got right. This week deliberately reverses that — a real, honest accounting of what you did well, even amid everything that was hard.',
  ARRAY['Discomfort at first with naming your own successes','A longer list than you expected, once you actually try','Specific moments you''re genuinely proud of','A softer view of the moments you once judged yourself harshly for']::text[],
  '{"focus": "No specific movement theme this week.", "tiers": {"heavy": "No specific note this week.", "steady": "A walk, listing what you got right as you go.", "feeling_good": "Whatever movement you enjoy this week."}, "mood_adjustment": "No specific note this week.", "safety": "No specific caution this week."}'::jsonb,
  'No specific note this week.',
  'No specific note this week.',
  'No specific note this week.',
  'No specific note this week.',
  '{"heavy_day": "Even on a hard day, name one thing you got right this week specifically — it counts, regardless of how today feels.", "a_little_low": "This list isn''t about performing confidence — it''s about honestly counting what''s real.", "okay": "Notice this exercise honestly, without minimizing your own answers.", "good": "Let pride in your own list feel good today.", "really_good": "Celebrate everything on this list, fully, without qualifying it."}'::jsonb,
  'Mark this reflection with something that honors it.',
  'Write the actual list — everything you got right, no minimizing.',
  'Read your list to someone who''ll agree with every item on it.',
  'You got so much right, in ways big and small, across this entire journey — this week is for finally saying so.',
  'No specific note this week beyond the persistent support link below.',
  'No specific note this week. — — — — — — — — — — — — — — — — — — — — — — — — --',
  null
),
(
  191,
  'postpartum',
  'Everything You Learned the Hard Way',
  'The hard lessons were still lessons. You don''t have to have wanted them to have grown from them.',
  'Name one thing this journey taught you that you wish hadn''t required a hard lesson.',
  'Alongside everything you got right, this week makes room for what you learned the hard way — the mistakes, the hard nights, the moments you''d do differently. Naming them isn''t self-criticism; it''s honest completion of the record.',
  ARRAY['Specific hard lessons that genuinely shaped who you are now','Lingering regret about certain moments or choices','Compassion for yourself in hindsight, even for the hard parts','Genuine gratitude for what those hard lessons ultimately gave you']::text[],
  '{"focus": "No specific movement theme this week.", "tiers": {"heavy": "No specific note this week.", "steady": "A walk, sitting with whatever this reflection brings up.", "feeling_good": "Whatever movement you enjoy this week."}, "mood_adjustment": "No specific note this week.", "safety": "No specific caution this week."}'::jsonb,
  'No specific note this week.',
  'No specific note this week.',
  'No specific note this week.',
  'No specific note this week.',
  '{"heavy_day": "A self-compassion break: hand on heart, \"I did the best I could with what I knew then. That''s genuinely enough.\"", "a_little_low": "Regret about a hard lesson doesn''t erase everything you got right — both can be true.", "okay": "Notice this reflection honestly, without needing to resolve every regret.", "good": "Let gratitude for what a hard lesson ultimately taught you feel real today.", "really_good": "Notice how far you''ve come from wherever that hard lesson started."}'::jsonb,
  'Offer yourself real forgiveness for whatever this week brings up.',
  'Write down one hard lesson, and what it ultimately gave you.',
  'If this reflection brings up something you''ve never fully said out loud, consider sharing it with someone you trust.',
  'Learning, even the hard way, is still learning — and you kept growing through every one of these lessons.',
  'If old regrets are weighing heavily and not lifting, Mental health & support can help — self-forgiveness is sometimes genuinely hard to do alone.',
  'No specific note this week. — — — — — — — — — — — — — — — — — — — — — — — — --',
  null
),
(
  192,
  'postpartum',
  'The Community You''ve Built',
  'Whoever''s around your table now, you built that, one relationship at a time.',
  'Notice the community — however large or small — that surrounds you now.',
  'Whether it''s a wide circle or a small, tight one, the community around you now — friends, family, other mothers, this app''s Community forum, whoever it is — was built through real effort over these three years. This week is about noticing and appreciating it.',
  ARRAY['A community that looks different than it did three years ago','Relationships built specifically through motherhood that matter deeply now','Gratitude for whoever shows up, regardless of how many people that is','Continued desire for more connection, which is worth naming too']::text[],
  '{"focus": "Movement you could share with your community, if you want to.", "tiers": {"heavy": "No specific note this week.", "steady": "A walk with someone from your community, if that fits.", "feeling_good": "A shared activity, if schedules allow."}, "mood_adjustment": "No specific note this week.", "safety": "No specific caution this week."}'::jsonb,
  'No specific note this week.',
  'No specific note this week.',
  'No specific note this week.',
  'No specific note this week.',
  '{"heavy_day": "If community feels thin right now, that''s honest information, not a failing — reaching out, even in a small way, is still available to you.", "a_little_low": "Notice one person in your community you could lean on this week.", "okay": "Notice your community honestly today.", "good": "Let gratitude for your community feel good today.", "really_good": "Celebrate the people around you, fully."}'::jsonb,
  'No specific note this week.',
  'No specific note this week.',
  'Thank someone in your community, specifically, for being part of this journey.',
  'Whatever your community looks like, you built real, meaningful connection during a genuinely demanding stretch of life.',
  'No specific note this week beyond the persistent support link below.',
  'No specific note this week — the Community forum remains open to you well beyond this weekly series. — — — — — — — — — — — — — — — — — — — — — — — — --',
  null
),
(
  193,
  'postpartum',
  'A Letter to Yourself, Three Years From Today',
  'Whatever you hope for her, hope for yourself too. Write it down.',
  'Write a short letter to yourself, to open three years from now.',
  'As this journey nears its close, this week is about looking forward rather than back — a short letter to yourself, three years from today, capturing whatever you''d want that future version of you to know or remember.',
  ARRAY['Hopes for both her and yourself, mixed together','Curiosity about who you''ll both be in three more years','A wish to remember exactly how this moment feels','Genuine excitement about the unknown ahead']::text[],
  '{"focus": "No specific movement theme this week.", "tiers": {"heavy": "No specific note this week.", "steady": "A walk, drafting the letter in your head.", "feeling_good": "Whatever movement you enjoy this week."}, "mood_adjustment": "No specific note this week.", "safety": "No specific caution this week."}'::jsonb,
  'No specific note this week.',
  'No specific note this week.',
  'No specific note this week.',
  'No specific note this week.',
  '{"heavy_day": "If writing to your future self feels hard today, keep it simple — even one honest sentence is enough.", "a_little_low": "Write yourself something kind to find later, especially if today is hard.", "okay": "Notice this exercise honestly.", "good": "Let hope for the future feel good today.", "really_good": "Enjoy imagining who you and she will be in three more years."}'::jsonb,
  'No specific note this week.',
  'Actually write the letter — save it somewhere you''ll find it later.',
  'No specific note this week.',
  'Looking forward with real hope, after everything this journey has held, is its own kind of accomplishment.',
  'No specific note this week beyond the persistent support link below.',
  'No specific note this week. — — — — — — — — — — — — — — — — — — — — — — — — --',
  null
),
(
  194,
  'postpartum',
  'What Hasn''t Changed',
  'Through every phase, this stayed the same: you showed up. That won''t change either.',
  'Notice what''s stayed constant through everything that''s changed.',
  'So much has changed across these three years — her, you, your family, your days. This week is about noticing what''s actually stayed the same through all of it: probably more than you''d expect.',
  ARRAY['Your love for her, unchanged in its core even as everything around it shifted','A fundamental commitment to showing up, present through every phase','Certain values or instincts that guided you from the very start','Genuine surprise at how much has stayed steady beneath the change']::text[],
  '{"focus": "No specific movement theme this week.", "tiers": {"heavy": "No specific note this week.", "steady": "A walk, thinking about what''s stayed the same.", "feeling_good": "Whatever movement you enjoy this week."}, "mood_adjustment": "No specific note this week.", "safety": "No specific caution this week."}'::jsonb,
  'No specific note this week.',
  'No specific note this week.',
  'No specific note this week.',
  'No specific note this week.',
  '{"heavy_day": "Even on a hard day, one thing hasn''t moved: you showed up. That''s still true today.", "a_little_low": "Notice what''s stayed constant, even when today feels uncertain.", "okay": "Notice this honestly.", "good": "Let the constancy underneath all this change feel good today.", "really_good": "Celebrate what''s endured, fully."}'::jsonb,
  'No specific note this week.',
  'Write down what''s genuinely stayed the same through these three years.',
  'No specific note this week.',
  'Through Early healing, Finding rhythm, Rebuilding, Settling into strength, Sustainable rhythms, and now, this — your love and your showing up never wavered. That''s the real foundation underneath everything else.',
  'No specific note this week beyond the persistent support link below.',
  'No specific note this week. — — — — — — — — — — — — — — — — — — — — — — — — --',
  null
),
(
  195,
  'postpartum',
  'The Last Full Week',
  'One more week before the day itself. Let it be as ordinary or as full as it wants to be.',
  'Let this week be whatever it needs to be — ordinary, reflective, or both.',
  'This is the last full week of this entire journey before the third birthday itself. There''s no single right way to spend it — some mothers will want to mark every day; others will want it to feel completely ordinary, right up until the moment it isn''t. Either is exactly right.',
  ARRAY['Anticipation building as the third birthday approaches','A pull to make this week meaningful, alongside a pull to just let it be normal','Emotional unpredictability — moments of pride, grief, excitement, all close together','A quiet sense that something real is about to close']::text[],
  '{"focus": "Whatever routine has carried you through this whole journey.", "tiers": {"heavy": "A few stretches, wherever you are — the same five minutes that have carried you through hundreds of hard days.", "steady": "Your go-to walk, one more time.", "feeling_good": "Your established routine, at whatever level you''ve built to."}, "mood_adjustment": "Whatever you need this week, trust yourself to know it — you''ve had a lot of practice.", "safety": "No specific caution this week."}'::jsonb,
  'No specific note this week.',
  'No specific note this week.',
  'No specific note this week.',
  'No specific note this week.',
  '{"heavy_day": "Box breathing, one more time: in for 4, hold for 4, out for 4, hold for 4 — the same reliable reset from Week 1 of this stretch, still here for you.", "a_little_low": "Whatever this week stirs up, it''s allowed to be complicated — anticipation and low mood can coexist.", "okay": "Let today simply be today, whatever that means this week.", "good": "Let a good day, this close to the end, be good.", "really_good": "Enjoy this — you''re almost there."}'::jsonb,
  'Whatever ritual has genuinely carried you through this journey, use it one more time this week.',
  'Take a few minutes to simply notice you''re in the final week of this chapter.',
  'Tell someone close that this is the last full week — let them share this moment with you.',
  'One more week, and you''ve very nearly carried this whole three-year journey home.',
  'Whatever this final stretch brings up, Mental health & support remains here — not just for this week, but for as long as you need it, well beyond this app''s structured content.',
  'No specific note this week. — — — — — — — — — — — — — — — — — — — — — — — — --',
  null
),
(
  196,
  'postpartum',
  'Happy Third Birthday',
  'You are not who you were. You are who this journey made you — and that woman is remarkable.',
  'Let yourself fully feel what three years of this has meant — not just for her, for you.',
  'Three years ago, this journey began — pregnant, or newly holding a newborn, with no real idea what any of this would ask of you. You''ve since walked through early healing, found your rhythm, rebuilt your strength, settled into it, sustained it across a second year, and carried it all the way through a third. Today isn''t only her birthday. It''s the close of something you built, week by week, choice by choice, on the hardest days as much as the easiest ones. You are not the woman who started this journey. You are who these three years made you — and that woman is worth celebrating every bit as much as the child you raised.',
  ARRAY['Genuine pride, possibly larger than you expected','A real, quiet grief for the version of you and her that this chapter closes','Uncertainty about what comes after this particular structure ends','Deep, uncomplicated love for who you''ve both become']::text[],
  '{"focus": "Whatever feels like the right way to mark this, physically, for you.", "tiers": {"heavy": "A few minutes of stillness or gentle stretching, wherever the day finds you.", "steady": "A walk, one you might remember later as the one you took on this day.", "feeling_good": "A full session of whatever movement has meant the most to you across this journey."}, "mood_adjustment": "Today can hold whatever it holds — there''s no wrong way to feel on a day like this.", "safety": "No specific caution this week."}'::jsonb,
  'No specific note this week.',
  'No specific note this week.',
  'No specific note this week.',
  'Milestone days are still tiring days — protect real rest around this one, before or after.',
  '{"heavy_day": "If today feels heavier than you expected, that''s real and valid — endings, even happy ones, often carry genuine weight. Box breathing, or simply naming what you''re feeling to someone close, can help you hold it.", "a_little_low": "Mixed feelings today are allowed, fully — joy and loss, pride and uncertainty, can all be true on the same day.", "okay": "Notice today for exactly what it is — a real, hard-won milestone, met however it''s met.", "good": "Let yourself enjoy this fully, without needing to qualify it.", "really_good": "Celebrate — genuinely, without holding back. Three years of real, demanding, meaningful work deserve nothing less."}'::jsonb,
  'Do something today that''s specifically for you — not just for the celebration, and not just for her. You earned this milestone as much as she did.',
  'Take a real, quiet moment today to acknowledge — just to yourself — everything these three years have asked of you, and everything you gave them.',
  'Share this milestone with everyone who walked any part of this journey alongside you — this belongs to your whole village, not just the two of you.',
  'Happy third birthday to her — and to you, for three years of showing up, learning, breaking and rebuilding, and becoming someone genuinely new along the way. You completed something meaningful. You are not the woman who started at Week 1. Carry her forward with you.',
  'This weekly series ends here, but support for you doesn''t — Mental health & support, the Safety page, and your own care team remain exactly as available tomorrow as they were today. Please keep using them, for as long as you need to.',
  'As this structured weekly journey closes, this is a good moment for both her third-birthday well-child check and a check-in on your own ongoing health — the reminders below are worth carrying forward, even without a weekly card to prompt them.',
  '[{"flag": "diabetes_gd", "note": "If your pregnancy involved gestational diabetes, ADA and ACOG guidance recommends ongoing screening for type 2 diabetes every 1 to 3 years, for life. This app''s weekly reminders end today — your own vigilance doesn''t have to. Keep this on your calendar going forward."}, {"flag": "high_bp", "note": "If you had high blood pressure during pregnancy or postpartum, that history is a genuine, lifelong cardiovascular risk marker. Make sure it''s a permanent part of your medical record, checked in on by your regular doctor for years to come, not just during this journey."}, {"flag": "thyroid", "note": "If you have a thyroid condition, continued monitoring stays relevant for the rest of your life, not just the postpartum years — keep up with your prescribed treatment and routine labs long after this app''s weekly content ends."}, {"flag": "pcos", "note": "If you have PCOS, your metabolic and cycle health deserve ongoing attention well beyond motherhood''s early years — this is a good day to make sure that care continues, on your own terms, going forward. — — — — — — — — — — — — — — — — — — — — — — — — --"}]'::jsonb
);
