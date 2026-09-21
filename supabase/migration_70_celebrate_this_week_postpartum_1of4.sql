-- Celebrate This Week redesign — postpartum weeks 0-14, batch 1 of 4, 2026-09-21.
--
-- Establishes the postpartum voice for this series, following the same
-- inherent-celebration standard locked for pregnancy (migration_69), with
-- one further correction Roop caught on this batch specifically: several
-- v1 lines assumed the mother already understood her baby's cries, had
-- settled routines, or was "functioning" by a specific week -- which
-- risks making a struggling new mother feel behind, and drifts toward
-- "look how competent you've become at motherhood" as this pillar's
-- default message. That is explicitly NOT what Celebrate This Week should
-- become across the postpartum stretch. Corrected weeks 42, 43, 45, 46,
-- 48, 49 and 54 to remove that assumption -- celebrating the newborn
-- stage's real, shared absurdity/tenderness instead of implied maternal
-- competence.
--
-- Governing principle for every postpartum week going forward (weeks
-- 15-156, later batches): the emotional note should rotate across --
--   * her growing confidence (sometimes, not as the default)
--   * the funny absurdity of life with a baby/toddler
--   * something lovely about their relationship
--   * the stage they're living through
--   * baby's emerging personality, without assuming a specific milestone
--   * ordinary family moments
--   * real calendar milestones (month/birthday markers)
--   * how different their world has become
--   * an occasional "look at you" moment for Mum
-- -- and should never imply she should already understand her baby's
-- cries, have routines, be "functioning well," feel recovered, or have
-- mastered any particular skill by a given week.

update care_chart_week_content set celebrate_this_week = '🎉 One week of knowing this exact person. You''re both already becoming fluent in each other.' where week_number = 40;

update care_chart_week_content set celebrate_this_week = '😄 A full week in, and you''ve already developed an entire secret language of grunts, sighs and side-eyes with a person who can''t talk yet.' where week_number = 41;

update care_chart_week_content set celebrate_this_week = '💛 Two weeks in, and you''re already noticing tiny things about this baby that you didn''t know on day one. That''s how knowing each other begins.' where week_number = 42;

update care_chart_week_content set celebrate_this_week = '😄 At three weeks, a hot cup of tea consumed while still hot may officially qualify as a luxury experience. Welcome to newborn life.' where week_number = 43;

update care_chart_week_content set celebrate_this_week = '🎉 One month of this little person being in the actual world, not just your imagination. Look how far you''ve both come already.' where week_number = 44;

update care_chart_week_content set celebrate_this_week = '💛 One month ago this face was completely new to you. Now it''s already becoming one of the most familiar faces in your world.' where week_number = 45;

update care_chart_week_content set celebrate_this_week = '🎉 Six weeks! You''ve already lived through more feeds, cuddles, changes and middle-of-the-night moments than you could possibly count.' where week_number = 46;

update care_chart_week_content set celebrate_this_week = '😄 Seven weeks in, and you''ve become someone who can hold a full conversation while silently calculating exactly how long it''s been since the last feed.' where week_number = 47;

update care_chart_week_content set celebrate_this_week = '😄 By eight weeks you''ve probably discovered one universal newborn rule: the minute you think you''ve figured something out, they update the software.' where week_number = 48;

update care_chart_week_content set celebrate_this_week = '😄 Nine weeks in, and uninterrupted time has somehow become a legitimate luxury item. Nobody warned you how valuable ten quiet minutes could become.' where week_number = 49;

update care_chart_week_content set celebrate_this_week = '💛 If that little face has started lighting up for specific people lately, you''re very likely one of the headline acts.' where week_number = 50;

update care_chart_week_content set celebrate_this_week = '🎉 Eleven weeks in, and you''ve built an entire world for someone who, not that long ago, didn''t know the outside one existed yet.' where week_number = 51;

update care_chart_week_content set celebrate_this_week = '🥳 Three months in! A whole season of knowing this person, start to finish.' where week_number = 52;

update care_chart_week_content set celebrate_this_week = '💛 Thirteen weeks of practice, and it shows — you''re simply not the same mother you were on day one.' where week_number = 53;

update care_chart_week_content set celebrate_this_week = '😄 Fourteen weeks in, and baby sounds that once seemed completely mysterious may now have you saying things like, "No, that''s their annoyed noise." Look at you.' where week_number = 54;
