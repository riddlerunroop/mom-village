-- Celebrate This Week redesign — postpartum weeks 105-156, batch 4 of 4, 2026-09-21.
--
-- Final batch. Closes the Celebrate This Week rewrite covering the whole
-- pregnancy-through-third-birthday span (migrations 69-73): pregnancy
-- weeks 1-39, postpartum weeks 0-156 (week_number 1-196).
--
-- Continues the discipline from migration_72: every toddler/preschooler
-- behaviour beat is hedged (possibly/probably/there's a [decent/good/
-- real] chance), never stated as a universal milestone every child has
-- definitely reached by that week. Humour and personality material
-- continues increasing as the child ages into the preschool years
-- (imaginative play, negotiating skills, a sense of humour of their own,
-- early empathy, "big kid" phrases borrowed slightly wrong), per Roop's
-- explicit direction that the writing should mature with the child.
--
-- Month/year labels are checked against this app's real postpartum-
-- week-to-month conversion (week/4.345, per the Week 81 Nourish lesson
-- in CLAUDE.md) before being used, not loosely estimated:
--   * week_number 170 (postpartum week 130) = 29.92 months -- close
--     enough to treat as the real "two and a half years" marker.
--   * week_number 196 (postpartum week 156) = 35.9 months -- this
--     project's own established "third birthday" marker (see the Your
--     Rhythm Year Three sections of CLAUDE.md), used here as the closing
--     celebration.
-- Three weeks in an earlier internal draft of this batch (158, 164, 176)
-- claimed "two and a half" or "nearly three years" too early relative to
-- that same conversion and were corrected before this file was written,
-- to keep the discipline Roop flagged on the previous batch (don't
-- loosely convert weeks into months).
--
-- Week 196's celebrate_this_week is deliberately kept in this pillar's
-- own lighter, celebratory register -- the fuller farewell already lives
-- in this same row's closing_note column (migration_47), so this field
-- doesn't duplicate that job.

update care_chart_week_content set celebrate_this_week = '😄 A "why" phase probably in full swing by now. Every answer just seems to unlock three more.' where week_number = 145;

update care_chart_week_content set celebrate_this_week = '💛 Somewhere in an ordinary day lately, this little person probably said something so unexpectedly wise it stopped you in your tracks for a second.' where week_number = 146;

update care_chart_week_content set celebrate_this_week = '😄 If your toddler has started narrating their own actions out loud lately — "I sitting down now" — that''s basically a live commentary you never signed up for and now can''t imagine living without.' where week_number = 147;

update care_chart_week_content set celebrate_this_week = '🎉 Over two years in, and this whole strange, wonderful life has quietly become simply your life.' where week_number = 148;

update care_chart_week_content set celebrate_this_week = '😄 A very specific outfit, texture or colour preference has possibly emerged lately, non-negotiable, argued with the confidence of a tiny lawyer.' where week_number = 149;

update care_chart_week_content set celebrate_this_week = '💛 There''s a decent chance a small, spontaneous act of kindness happened this week — sharing a favourite thing, patting your back when you looked tired. Take that one in.' where week_number = 150;

update care_chart_week_content set celebrate_this_week = '😄 Pretend play has possibly gotten seriously elaborate lately — entire imaginary worlds with their own rules, narrated at full volume.' where week_number = 151;

update care_chart_week_content set celebrate_this_week = '💛 Somewhere along the way, conversations with this little person started actually going somewhere. However short and sideways they still are, that''s a real, two-way thing now.' where week_number = 152;

update care_chart_week_content set celebrate_this_week = '😄 If mealtimes have turned into a genuine negotiation over which foods are, apparently, now touching in an unacceptable way, welcome to toddler cuisine politics.' where week_number = 153;

update care_chart_week_content set celebrate_this_week = '🎉 More than two years into a relationship that started with neither of you having any idea who the other one was.' where week_number = 154;

update care_chart_week_content set celebrate_this_week = '😄 A favourite song has possibly been requested on repeat lately, sung slightly wrong, with total, unshakeable confidence.' where week_number = 155;

update care_chart_week_content set celebrate_this_week = '💛 Somewhere lately, there was probably a moment this little person tried to comfort someone else — a toy, a sibling, you. That''s a whole heart growing right in front of you.' where week_number = 156;

update care_chart_week_content set celebrate_this_week = '😄 If getting dressed has become a full production involving several rejected outfits and one very specific pair of socks, that''s just how mornings go now.' where week_number = 157;

update care_chart_week_content set celebrate_this_week = '🎉 Well past the two-year mark now. Look at the sheer amount of living the two of you have already packed into this.' where week_number = 158;

update care_chart_week_content set celebrate_this_week = '😄 Counting, singing or reciting something on loop has possibly become the soundtrack of your house lately. Whether or not it''s entirely accurate is beside the point.' where week_number = 159;

update care_chart_week_content set celebrate_this_week = '💛 Somewhere in an ordinary week, this little person probably asked a question so specific and strange that you had absolutely no idea how to answer it.' where week_number = 160;

update care_chart_week_content set celebrate_this_week = '😄 If "I do it myself" has become a household motto lately, brace for things to take four times as long and be, somehow, entirely worth it.' where week_number = 161;

update care_chart_week_content set celebrate_this_week = '💛 There''s a good chance a whole imaginary friend, creature or scenario has taken up permanent residence in your house by now. Welcome them warmly.' where week_number = 162;

update care_chart_week_content set celebrate_this_week = '😄 A specific ritual — a particular cup, a particular order of events — has possibly become sacred lately. Deviate at your own risk.' where week_number = 163;

update care_chart_week_content set celebrate_this_week = '🎉 Well on the way to two and a half years now. Whatever the last while has looked like, that''s a genuinely huge chunk of a life built together.' where week_number = 164;

update care_chart_week_content set celebrate_this_week = '😄 If your toddler has recently developed a sense of humour of their own — repeating a joke that only makes sense to them, laughing at it every single time — that''s comedy in the making.' where week_number = 165;

update care_chart_week_content set celebrate_this_week = '💛 Somewhere lately, this little person probably surprised you by remembering something in far more detail than you expected. That memory is quietly building a whole life story already.' where week_number = 166;

update care_chart_week_content set celebrate_this_week = '😄 If a scribble has recently been confidently identified as a dog, a house, or you, personally, that''s basically their first art exhibition.' where week_number = 167;

update care_chart_week_content set celebrate_this_week = '💛 There''s a real chance a genuine, unprompted "I love you" happened this week, completely out of nowhere, at the most ordinary possible moment.' where week_number = 168;

update care_chart_week_content set celebrate_this_week = '😄 Climbing, jumping and generally treating furniture as a small obstacle course has possibly become standard practice by now. Send help, or just snacks.' where week_number = 169;

update care_chart_week_content set celebrate_this_week = '🎉 Two and a half years! Look at how much this whole story has grown since it began.' where week_number = 170;

update care_chart_week_content set celebrate_this_week = '😄 A "big kid" phrase has possibly been proudly borrowed and used slightly wrong lately, with total conviction. Let them have it.' where week_number = 171;

update care_chart_week_content set celebrate_this_week = '💛 Somewhere lately, there was probably a moment this little person chose you, specifically, over anyone or anything else in the room. Small. Not small at all, really.' where week_number = 172;

update care_chart_week_content set celebrate_this_week = '😄 If a single toy has recently been declared "my best friend," that relationship deserves the same respect as any other in this house.' where week_number = 173;

update care_chart_week_content set celebrate_this_week = '💛 There''s a good chance a whole made-up story got told to you this week, with total sincerity, plot holes and all.' where week_number = 174;

update care_chart_week_content set celebrate_this_week = '😄 Sharing has possibly been attempted lately — sometimes generously, sometimes very reluctantly, occasionally with dramatic negotiation. All of it counts as progress.' where week_number = 175;

update care_chart_week_content set celebrate_this_week = '🎉 However this particular chapter has gone, look at everything the two of you have quietly built lately.' where week_number = 176;

update care_chart_week_content set celebrate_this_week = '😄 If a very specific, very strong opinion about bath time, bedtime or breakfast has emerged lately, that''s just toddler diplomacy in action.' where week_number = 177;

update care_chart_week_content set celebrate_this_week = '💛 Somewhere lately, this little person probably said something in exactly your own words, in exactly your own tone. Slightly startling. Also, honestly, kind of an honour.' where week_number = 178;

update care_chart_week_content set celebrate_this_week = '😄 A favourite game has possibly been demanded on repeat this week, with the same rules, the same jokes, the same delighted reaction every single time.' where week_number = 179;

update care_chart_week_content set celebrate_this_week = '💛 There''s a real chance a small, ordinary moment this week — a shared laugh, a quiet cuddle — will end up being one you remember for a long time.' where week_number = 180;

update care_chart_week_content set celebrate_this_week = '😄 If a very confident, very inaccurate fact has been stated recently with complete certainty, that''s toddler science, and it''s not up for debate.' where week_number = 181;

update care_chart_week_content set celebrate_this_week = '🎉 Well into the final stretch of year three. Whatever the road here has looked like, you''ve both come an enormous distance.' where week_number = 182;

update care_chart_week_content set celebrate_this_week = '😄 Negotiating over one more story, one more song or five more minutes has possibly become a nightly ritual by now — performed with real skill on both sides.' where week_number = 183;

update care_chart_week_content set celebrate_this_week = '💛 Somewhere lately, there was probably a moment this little person noticed you were tired or sad, and tried, in their own small way, to help. That''s real empathy, already growing.' where week_number = 184;

update care_chart_week_content set celebrate_this_week = '😄 If your toddler has recently insisted on doing something "myself, all by myself," while looking directly at you the whole time, that''s the full performance, free of charge.' where week_number = 185;

update care_chart_week_content set celebrate_this_week = '💛 Whatever this particular week brought, it''s one more thread in a genuinely long, rich story.' where week_number = 186;

update care_chart_week_content set celebrate_this_week = '😄 A specific, slightly unhinged obsession — dinosaurs, a particular vehicle, one single colour — has possibly taken over lately. Let it run its course. It''s usually a good one.' where week_number = 187;

update care_chart_week_content set celebrate_this_week = '💛 Somewhere in an ordinary day this week, there was probably a moment of pure, easy joy between the two of you that nobody else even noticed.' where week_number = 188;

update care_chart_week_content set celebrate_this_week = '😄 If a full, dramatic retelling of something very minor has happened recently, complete with sound effects, that''s just how the news gets delivered around here now.' where week_number = 189;

update care_chart_week_content set celebrate_this_week = '🎉 Closing in on three years now. Look at the two people you''ve both become since this whole thing started.' where week_number = 190;

update care_chart_week_content set celebrate_this_week = '😄 A very particular, very firm bedtime routine has possibly locked itself in by now, performed in the exact same order, every single night, no exceptions.' where week_number = 191;

update care_chart_week_content set celebrate_this_week = '💛 Somewhere lately, this little person probably asked to hear a story about themselves as a baby. That''s a whole new kind of curiosity arriving.' where week_number = 192;

update care_chart_week_content set celebrate_this_week = '😄 If an entire, elaborate excuse has recently been offered for something very small, delivered with complete sincerity, that''s next-level toddler negotiation.' where week_number = 193;

update care_chart_week_content set celebrate_this_week = '💛 Three years almost exactly. Whatever the very first weeks of this felt like, look at the two of you now.' where week_number = 194;

update care_chart_week_content set celebrate_this_week = '🎉 One week left until three whole years of this particular, unrepeatable story.' where week_number = 195;

update care_chart_week_content set celebrate_this_week = '🎉 Three whole years! From the very first week you two met to right now — an entire, enormous, ordinary, extraordinary story, built one week at a time.' where week_number = 196;
