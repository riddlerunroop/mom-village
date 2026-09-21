-- Celebrate This Week redesign — postpartum weeks 53-104, batch 3 of 4, 2026-09-21.
--
-- Continues the postpartum voice from migration_70/71 (Early healing
-- through the first birthday), covering Sustainable rhythms Part 1 and
-- Part 2, ending at the second birthday (week_number 144 = postpartum
-- week 104 = 24 months exactly).
--
-- Two corrections carried in from Roop's batch-2 QA, applied throughout:
--   1. No baby-behaviour/development assumptions stated as universal --
--      anything toddler-skill-flavoured (running, climbing, pointing,
--      copying, independence, "no"/"mine") is hedged with
--      possibly/probably/there's a [decent/good] chance, never asserted
--      as something every child has definitely done by that week.
--   2. Calendar/month labels are reserved for the real, deliberately
--      mapped boundaries, not loosely converted from weeks. This app's
--      own postpartum-week-to-month conversion is week/4.345 (see the
--      Week 81 Nourish lesson in CLAUDE.md) -- so "eighteen months" only
--      appears at week_number 118 (postpartum week 78, ~17.95 months) and
--      "two years" only at week_number 144 (postpartum week 104, exactly
--      24 months). No other week in this batch claims a specific month
--      figure; anything else uses a relative, unfalsifiable phrase
--      ("well over a year," "not far off two years") instead.
--
-- Per Roop's explicit direction for this batch: the humour should
-- gradually increase as the child ages into toddlerhood -- this range has
-- far more personality/absurdity material (toddler logic, obsessions,
-- "helping," tantrums over trivia, running everywhere, copying Mum,
-- throwing things for the joy of it) than early infancy did, and the
-- writing should mature with the child rather than staying in the softer
-- newborn "bond/world/learning each other" register for another year.

update care_chart_week_content set celebrate_this_week = '😄 One week into being a family with an actual one-year-old in it. That''s a whole new chapter, and it already looks delightfully chaotic.' where week_number = 93;

update care_chart_week_content set celebrate_this_week = '💛 Somewhere in the last year, you went from complete strangers to two people who read each other without trying.' where week_number = 94;

update care_chart_week_content set celebrate_this_week = '😄 There''s a decent chance a single object — a spoon, a sock, a particular toy — has become weirdly, wonderfully essential to your household right now.' where week_number = 95;

update care_chart_week_content set celebrate_this_week = '🎉 Welcome to toddler territory. Everything is about to get louder, faster, and considerably funnier.' where week_number = 96;

update care_chart_week_content set celebrate_this_week = '😄 If your living room floor has become a permanent obstacle course lately, that''s basically the toddler starter pack. You''re doing it right.' where week_number = 97;

update care_chart_week_content set celebrate_this_week = '💛 A whole year and a bit into knowing this exact, particular, unrepeatable little person.' where week_number = 98;

update care_chart_week_content set celebrate_this_week = '😄 Somewhere lately, "no" may have entered the household vocabulary — theirs, not necessarily yours, though it''s hard to say anymore.' where week_number = 99;

update care_chart_week_content set celebrate_this_week = '🎉 Well over a year in now, and this particular, chaotic, wonderful life has become simply how things are.' where week_number = 100;

update care_chart_week_content set celebrate_this_week = '😄 There may be a favourite object being carried everywhere right now — into rooms, into meals, occasionally into the bath. It has earned tenure.' where week_number = 101;

update care_chart_week_content set celebrate_this_week = '💛 Somewhere in an ordinary afternoon lately, there was probably a moment that made you laugh out loud at something only a toddler could think of.' where week_number = 102;

update care_chart_week_content set celebrate_this_week = '😄 Pointing has apparently become a full communication system now — at dogs, at lights, at nothing in particular, at everything, really.' where week_number = 103;

update care_chart_week_content set celebrate_this_week = '💛 Whatever today looked like, there''s a real chance a random hug happened somewhere in the middle of it, for no reason at all. Take the win.' where week_number = 104;

update care_chart_week_content set celebrate_this_week = '😄 Somewhere lately, "why" may have started making appearances. Enjoy this stage before it becomes the entire conversation.' where week_number = 105;

update care_chart_week_content set celebrate_this_week = '🎉 The two of you have officially been a team for well over a year now, through every version of chaos that''s come your way.' where week_number = 106;

update care_chart_week_content set celebrate_this_week = '😄 If a drawer, cupboard or bag has recently been fully, thoroughly investigated without your permission, that''s just Tuesday now.' where week_number = 107;

update care_chart_week_content set celebrate_this_week = '💛 There''s something quietly wonderful about watching a person figure out, day by day, exactly who they''re going to be.' where week_number = 108;

update care_chart_week_content set celebrate_this_week = '😄 Running has possibly entered the picture. Not walking-but-faster — actual, committed, delighted running, usually in the opposite direction from where you need to go.' where week_number = 109;

update care_chart_week_content set celebrate_this_week = '💛 Somewhere along the way, this household built its own private language of nicknames, noises and inside jokes that would mean nothing to anyone else.' where week_number = 110;

update care_chart_week_content set celebrate_this_week = '😄 If a particular book, song or show has been requested for the fortieth time this week, that''s not annoying — that''s a toddler discovering the joy of "again."' where week_number = 111;

update care_chart_week_content set celebrate_this_week = '🎉 You''ve now spent well over a year learning a person who didn''t exist in your world before. Look at everything you two have built since.' where week_number = 112;

update care_chart_week_content set celebrate_this_week = '😄 Somewhere lately, getting dressed may have become a genuine negotiation with strong opinions on both sides.' where week_number = 113;

update care_chart_week_content set celebrate_this_week = '💛 There''s a good chance somebody in your house has recently tried to "help" with a household task in a way that took twice as long and was completely worth it anyway.' where week_number = 114;

update care_chart_week_content set celebrate_this_week = '😄 If mealtimes lately have involved food ending up somewhere other than a mouth, congratulations — you''re living the full toddler experience.' where week_number = 115;

update care_chart_week_content set celebrate_this_week = '💛 Somewhere in an ordinary week, this little person probably did something that only makes sense to the two of you. That''s a whole private world you''ve built.' where week_number = 116;

update care_chart_week_content set celebrate_this_week = '😄 A favourite phrase, sound or gesture has quite possibly taken over the household lately, said or done approximately one hundred times a day.' where week_number = 117;

update care_chart_week_content set celebrate_this_week = '🎉 A year and a half! Eighteen months of a person who''s gone from newborn to an actual, opinionated little human with their own plans for the day.' where week_number = 118;

update care_chart_week_content set celebrate_this_week = '😄 If climbing has become a preferred method of reaching absolutely everything lately, that''s not a phase to survive — that''s just the toddler skill tree unlocking.' where week_number = 119;

update care_chart_week_content set celebrate_this_week = '💛 Somewhere in there, this household quietly became fluent in a whole vocabulary of gestures, sounds and half-words that outsiders would need subtitles for.' where week_number = 120;

update care_chart_week_content set celebrate_this_week = '😄 Dancing has possibly entered the repertoire — to music, to the fridge humming, to absolutely nothing at all. All equally valid.' where week_number = 121;

update care_chart_week_content set celebrate_this_week = '🎉 You''ve now spent well over a year and a half building an entire relationship with someone who started out not knowing your name.' where week_number = 122;

update care_chart_week_content set celebrate_this_week = '😄 If a particular animal, vehicle or character has become a genuine household obsession lately, that''s just where you live now. Enjoy the ride.' where week_number = 123;

update care_chart_week_content set celebrate_this_week = '💛 Somewhere lately, there was probably an unprompted kiss, hug or "I love you" moment that landed exactly when you needed it.' where week_number = 124;

update care_chart_week_content set celebrate_this_week = '😄 Throwing things has possibly become a beloved hobby recently — for the sheer, undiluted joy of watching them land. Physics, but make it toddler.' where week_number = 125;

update care_chart_week_content set celebrate_this_week = '💛 There''s a decent chance this little person has started copying something you do without even realising you do it. That''s flattering and slightly alarming in equal measure.' where week_number = 126;

update care_chart_week_content set celebrate_this_week = '😄 If bedtime has recently turned into a multi-round negotiation with a surprisingly skilled opponent, that''s a very normal toddler plot twist.' where week_number = 127;

update care_chart_week_content set celebrate_this_week = '🎉 Well into your second year with this exact, specific, one-of-a-kind little person. Look how far you''ve both come.' where week_number = 128;

update care_chart_week_content set celebrate_this_week = '😄 Somewhere lately, a tantrum over something genuinely small — the wrong cup, the wrong shoe — probably happened. It''s ridiculous. It''s also, weirdly, kind of hilarious in hindsight.' where week_number = 129;

update care_chart_week_content set celebrate_this_week = '💛 There''s a good chance a random object has been proudly handed to you today, expecting nothing in return except your obvious delight.' where week_number = 130;

update care_chart_week_content set celebrate_this_week = '😄 Independence has possibly entered a new phase — insisting on doing something entirely unassisted that would''ve taken you four seconds. Let them. It''s worth it.' where week_number = 131;

update care_chart_week_content set celebrate_this_week = '💛 Somewhere in the last two years, you became somebody''s whole world. That''s not a small thing to have quietly happened.' where week_number = 132;

update care_chart_week_content set celebrate_this_week = '😄 If your toddler has recently developed a very specific, very firm opinion about which cup, spoon or chair is correct, welcome to the world''s smallest, most confident dictator.' where week_number = 133;

update care_chart_week_content set celebrate_this_week = '🎉 Almost two years of a person who started out unable to lift their own head and can now apparently outrun you in flip-flops.' where week_number = 134;

update care_chart_week_content set celebrate_this_week = '😄 Hiding has possibly entered the game rotation, usually somewhere extremely obvious, followed by delighted shrieking the second they''re found.' where week_number = 135;

update care_chart_week_content set celebrate_this_week = '💛 Somewhere lately, this little person probably said or did something that made you think, quietly, "where on earth did that come from." That''s a whole personality showing up.' where week_number = 136;

update care_chart_week_content set celebrate_this_week = '😄 If "mine" has become a frequently used word around your house lately, that''s just toddlerhood''s opening negotiating position.' where week_number = 137;

update care_chart_week_content set celebrate_this_week = '💛 Not far off two years now, with a person who''s already changed more times than you can count.' where week_number = 138;

update care_chart_week_content set celebrate_this_week = '😄 Water, mud, or anything remotely splashable has possibly become an object of intense toddler fascination lately. Towels exist for a reason.' where week_number = 139;

update care_chart_week_content set celebrate_this_week = '🎉 One hundred weeks since birth! However it''s gone, that''s a genuinely enormous stretch of life shared together.' where week_number = 140;

update care_chart_week_content set celebrate_this_week = '😄 If a single word has been repeated approximately nine hundred times today, that''s not a malfunction — that''s a toddler discovering the sheer power of repetition.' where week_number = 141;

update care_chart_week_content set celebrate_this_week = '💛 Somewhere lately, there was probably a moment where this little person needed exactly you, and only you, and nobody else would do. That''s worth noticing.' where week_number = 142;

update care_chart_week_content set celebrate_this_week = '😄 If getting anywhere on time now takes twice as long because someone insists on inspecting every leaf, puddle and interesting rock along the way, that''s just how toddlers travel.' where week_number = 143;

update care_chart_week_content set celebrate_this_week = '🎉 Two whole years! From a newborn who couldn''t hold up their own head to an actual small person with opinions, favourites and a personality all their own — and you built every single day of it together.' where week_number = 144;
