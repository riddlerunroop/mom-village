-- Celebrate This Week redesign — pregnancy weeks 1-39, 2026-09-21.
--
-- Full rewrite of the existing celebrate_this_week plain-text column for
-- pregnancy weeks 1-39, per Roop's redefinition of this card's job: it is
-- the one card in the Care Chart that asks nothing of her and gives real,
-- factual information/reassurance/reflection nowhere else to live -- those
-- jobs already belong to Nourish, Move, Mental Health, Care for Yourself
-- and For Your Care Team. Celebrate This Week's only job is to celebrate
-- something WITH her -- inherently, not by tacking a "worth celebrating"
-- label onto an observation or a developmental fact.
--
-- Went through three drafting rounds with Roop before lock:
--   v1 -- read as pregnancy information/reassurance/reflection dressed up
--         with a "Celebrate This Week" heading, not genuine celebration.
--   v2 -- became celebratory, but relied on manufactured justification
--         phrases ("worth celebrating," "worth marking," "worth a cheer")
--         propping up content that wasn't inherently celebratory.
--   v3 (this migration) -- celebration is inherent to the line itself
--         (a milestone marker, an exclamation, a piece of pregnancy humour,
--         a "look how far you've come" beat) with no justification tag
--         needed. Test used throughout: if the "Celebrate This Week"
--         heading disappeared, would the line still read as someone
--         celebrating something with her?
--
-- Four weeks were rewritten again after v3 for making claims that don't
-- hold universally, even though they read celebratory:
--   * Week 5  -- "first real milestone" read as arbitrary.
--   * Week 14 -- "past the trickiest stretch" assumed first trimester was
--                hardest for everyone.
--   * Week 25 -- "pregnancy stops being a secret" doesn't fit a mother who
--                isn't visibly showing yet.
--   * Week 32 -- "closer to your due date than to finding out" depends on
--                exactly when she found out, which varies mother to mother.
--
-- Per Roop's explicit editorial rules for every week in this series:
--   1. One celebration per week, normally 1-2 sentences.
--   2. Ask nothing of her -- no task, no question, no completion state.
--   3. Never make the celebration depend on a specific milestone having
--      happened (babies/mothers vary too much for that to be safe).
--   4. Avoid repetitive "you survived another week" language.
--   5. Vary naturally between celebrating her, the baby, their bond, and
--      the funny/ordinary reality of pregnancy -- no visible category or
--      tone metadata, this is plain microcopy, not a new content system.
--   6. Any factual developmental claim used as a hook is independently
--      verified first (cardiac activity ~6wk, fetal movement/quickening
--      typically 18-21wk for a first pregnancy not the popularly-quoted
--      16wk, fetal hearing/voice-response developing ~23-28wk) -- and
--      several early drafts (movement at 18/25, hearing at 22/27, fetal
--      motor practice at 32) were softened or replaced rather than stated
--      as a universal timeline for every mother.
--
-- No new column, no keepsake mechanism, no completion state -- this is a
-- lightweight copy-only rewrite of the existing celebrate_this_week field,
-- per Roop's explicit instruction not to build this into a Nourish-scale
-- content architecture.
--
-- Postpartum weeks (week_number 40-196) are a separate follow-on batch,
-- reviewed a handful at a time first to establish the postpartum voice
-- before the remaining weeks are drafted -- not included in this file.

update care_chart_week_content set celebrate_this_week = '🎉 Week one, and it begins. However you got here, this is officially your story with this baby now.' where week_number = 1;

update care_chart_week_content set celebrate_this_week = '🎉 Two weeks in. Whatever''s ahead, you''ve officially begun.' where week_number = 2;

update care_chart_week_content set celebrate_this_week = '🎉 Somewhere in there, the very first cells of your baby are already hard at work. Tiny, but that''s a real head start.' where week_number = 3;

update care_chart_week_content set celebrate_this_week = '🎉 However you found out — a test, a hunch, a missed date — this week, you officially know.' where week_number = 4;

update care_chart_week_content set celebrate_this_week = '💛 Five weeks in — still so early, but already five whole weeks into your story together.' where week_number = 5;

update care_chart_week_content set celebrate_this_week = '💛 There''s a tiny heartbeat getting started this week. Yours has been working overtime for it since before you even knew — cheers to you both.' where week_number = 6;

update care_chart_week_content set celebrate_this_week = '🎉 Seven weeks of being someone''s mother, quietly, before almost anyone else knows there''s anyone to be a mother to.' where week_number = 7;

update care_chart_week_content set celebrate_this_week = '🎉 Eight weeks down, however exhausted or queasy you''ve felt getting here. You made it.' where week_number = 8;

update care_chart_week_content set celebrate_this_week = '💛 Two months in, and your body has already rearranged its entire own priorities for this baby — without being asked.' where week_number = 9;

update care_chart_week_content set celebrate_this_week = '🥳 Tiny fingers and toes are taking shape this week, on someone who not long ago was smaller than a grain of rice.' where week_number = 10;

update care_chart_week_content set celebrate_this_week = '🎉 Whether you''re telling everyone or keeping this just yours a little longer, week eleven is yours either way.' where week_number = 11;

update care_chart_week_content set celebrate_this_week = '🎉 Twelve-ish weeks of growing a whole person quietly behind the scenes — whether or not anyone else knows yet.' where week_number = 12;

update care_chart_week_content set celebrate_this_week = '🎉 First trimester: DONE. Twelve-ish weeks of growing a human quietly behind the scenes — officially worth celebrating.' where week_number = 13;

update care_chart_week_content set celebrate_this_week = '🎉 Second trimester, officially! One whole trimester behind you — new season, new chapter.' where week_number = 14;

update care_chart_week_content set celebrate_this_week = '🎉 Fifteen weeks in, and the two of you have already been through more together than most relationships manage in a year.' where week_number = 15;

update care_chart_week_content set celebrate_this_week = '🎉 Somewhere around now, your regular clothes start losing the negotiation. Not a defeat — a visible sign of how far you''ve come.' where week_number = 16;

update care_chart_week_content set celebrate_this_week = '💛 Seventeen weeks in — a connection that''s already there, even before you can feel it.' where week_number = 17;

update care_chart_week_content set celebrate_this_week = '🎉 Eighteen weeks in, closing in on the halfway mark of pregnancy. However this one''s going, you''re doing genuinely well.' where week_number = 18;

update care_chart_week_content set celebrate_this_week = '🥳 Nineteen weeks of carrying someone the rest of the world still can''t quite picture yet. You already can.' where week_number = 19;

update care_chart_week_content set celebrate_this_week = '🥳 Halfway there! Twenty weeks of growing this little person behind you, twenty-ish to go. That''s a proper pregnancy milestone.' where week_number = 20;

update care_chart_week_content set celebrate_this_week = '💛 Twenty-one weeks together already — more than halfway through carrying someone the rest of the world still can''t meet.' where week_number = 21;

update care_chart_week_content set celebrate_this_week = '😄 Twenty-two weeks in. If your patience for nonsense has dropped to zero, that''s not a personality change — that''s just pregnancy giving you excellent instincts.' where week_number = 22;

update care_chart_week_content set celebrate_this_week = '🎉 Twenty-three weeks in, closer to done than not. However this pregnancy is going, you''re doing it.' where week_number = 23;

update care_chart_week_content set celebrate_this_week = '💛 Six months together! Half a year of carrying this little person everywhere you''ve gone. That''s worth celebrating.' where week_number = 24;

update care_chart_week_content set celebrate_this_week = '🎉 Twenty-five weeks together — you''ve officially spent more than half this pregnancy as a pair.' where week_number = 25;

update care_chart_week_content set celebrate_this_week = '💛 Twenty-six weeks down — not far off the finish line of your second trimester now. A lot of quiet, invisible work has gone into getting here.' where week_number = 26;

update care_chart_week_content set celebrate_this_week = '🎉 Twenty-seven weeks — last week of your second trimester! However it went, you''re one trimester away from meeting this baby.' where week_number = 27;

update care_chart_week_content set celebrate_this_week = '🎉 Third trimester, officially! However tired you already are, you''ve reached a real milestone — the home stretch starts now.' where week_number = 28;

update care_chart_week_content set celebrate_this_week = '😄 Twenty-nine weeks in, and your body is currently running on a to-do list longer than most productivity apps can handle. Somehow, it''s managing.' where week_number = 29;

update care_chart_week_content set celebrate_this_week = '🎉 Thirty weeks! You''ve carried this little person through thousands of ordinary moments already.' where week_number = 30;

update care_chart_week_content set celebrate_this_week = '💛 Thirty-one weeks of a private language of kicks, stretches and quiet that only the two of you speak.' where week_number = 31;

update care_chart_week_content set celebrate_this_week = '🥳 Thirty-two weeks! Eight months of carrying your little plus-one everywhere — you''re getting seriously close now.' where week_number = 32;

update care_chart_week_content set celebrate_this_week = '😄 If reaching your own feet has become a genuine achievement, that''s worth celebrating too — pregnancy has its own scoreboard now.' where week_number = 33;

update care_chart_week_content set celebrate_this_week = '🎉 Thirty-four weeks down. You''re now officially closer to meeting them than to not knowing them at all.' where week_number = 34;

update care_chart_week_content set celebrate_this_week = '💛 Thirty-five weeks of growing someone a heartbeat at a time. Ordinary some days, genuinely remarkable every day.' where week_number = 35;

update care_chart_week_content set celebrate_this_week = '🎉 Full term is right around the corner. Whatever''s left of this pregnancy, you''re almost at the good part — meeting them.' where week_number = 36;

update care_chart_week_content set celebrate_this_week = '🥳 37 weeks! Hospital bag ready or not, you''ve reached the final stretch. You and baby have come a very long way together.' where week_number = 37;

update care_chart_week_content set celebrate_this_week = '🎉 Any day now, really. Somewhere in there, your baby''s finishing the very last of the details — and so, almost, are you.' where week_number = 38;

update care_chart_week_content set celebrate_this_week = '💛 However these final days go, you''ve now carried this baby through an entire pregnancy, start to finish. That''s the whole thing.' where week_number = 39;
