-- Care Team mental-health-aware additions, 2026-09-21.
--
-- Direct follow-on to migration_67 (the full "For your care team" redesign)
-- and the Maternal Mental Health Phase 2 build (see CLAUDE.md). Per Roop's
-- and Claude's agreed plan: rather than reopen all 196 weeks around mental
-- health, 10 strategic weeks get a mental-health-aware Care Team card,
-- varying the job by stage (before birth: know this can happen / early
-- postpartum: notice her too / later: don't assume she's fine because the
-- newborn period has passed / much later: no expiry date on this).
--
-- Every week below was drafted against that week's real theme_title before
-- being proposed to Roop (see the earlier extraction pass), then reviewed
-- and approved by her directly, with three specific wording edits applied
-- before this migration was written:
--   * Week 36 -- softened so a partner isn't instructed to act "without
--     waiting for her to bring it up" (read as paternalistic); now offers
--     help "if she wants or needs it."
--   * Week 46 -- removed the unverifiable assertion that the six-week
--     check is "often the only appointment about her"; now frames it as
--     "use the check for her mind too."
--   * Week 190 -- replaced vague "if something was ever mentioned..."
--     phrasing (read as if the app kept a mental-health record) with a
--     warmer "keep the door open... support doesn't have an expiry date."
--
-- All 10 use the same for_your_care_team_who/_lede/_detail columns added
-- in migration_67, and keep for_your_care_team itself in sync as the same
-- plain-text fallback, per that migration's established convention.
--
-- Roop's explicit standing note, worth repeating here: the PPD/PPA
-- educational sections (About page) must stay experience-led -- symptom
-- lists are framed as things a mother may notice and want to discuss with
-- a professional, never as diagnostic criteria the app applies to her.
-- Separately, the mental-health safety pathway (trigger wording ->
-- escalation -> emergency resources -> PPD/PPA education -> prepare-for-
-- doctor script) remains explicitly flagged as a pre-public-launch action
-- item needing a real Indian perinatal mental-health professional's
-- review -- not something already completed by this build.

update care_chart_week_content set
  for_your_care_team_who = 'Partner or support person',
  for_your_care_team_lede = 'Know this can happen',
  for_your_care_team_detail = 'Emotional shifts after birth are common and say nothing about how she''ll mother. If she seems persistently low, anxious or unlike herself after birth, check in gently and help her reach support if she wants or needs it.',
  for_your_care_team = 'Partner or support person — Know this can happen: Emotional shifts after birth are common and say nothing about how she''ll mother. If she seems persistently low, anxious or unlike herself after birth, check in gently and help her reach support if she wants or needs it.'
where week_number = 36;

update care_chart_week_content set
  for_your_care_team_who = 'Whoever''s with her most',
  for_your_care_team_lede = 'Notice her, not just the baby',
  for_your_care_team_detail = 'Everyone''s watching the baby right now — ask her "how are you, really?" more than once, genuinely.',
  for_your_care_team = 'Whoever''s with her most — Notice her, not just the baby: Everyone''s watching the baby right now — ask her "how are you, really?" more than once, genuinely.'
where week_number = 40;

update care_chart_week_content set
  for_your_care_team_who = 'Partner or support person',
  for_your_care_team_lede = 'Ask again, differently',
  for_your_care_team_detail = 'If "fine" comes too fast, try "what''s been the hardest hour of your day?" instead.',
  for_your_care_team = 'Partner or support person — Ask again, differently: If "fine" comes too fast, try "what''s been the hardest hour of your day?" instead.'
where week_number = 42;

update care_chart_week_content set
  for_your_care_team_who = 'Her doctor',
  for_your_care_team_lede = 'Ask about her mind, not just her body',
  for_your_care_team_detail = 'Use the check for her mind too: if emotional wellbeing doesn''t come up, she can raise how she''s been feeling — not only how her body is recovering.',
  for_your_care_team = 'Her doctor — Ask about her mind, not just her body: Use the check for her mind too: if emotional wellbeing doesn''t come up, she can raise how she''s been feeling — not only how her body is recovering.'
where week_number = 46;

update care_chart_week_content set
  for_your_care_team_who = 'Family or friend',
  for_your_care_team_lede = 'Don''t assume the fog has lifted',
  for_your_care_team_detail = 'People often stop asking by now, assuming the hardest part''s past — if she still seems flat or anxious, that assumption is worth checking.',
  for_your_care_team = 'Family or friend — Don''t assume the fog has lifted: People often stop asking by now, assuming the hardest part''s past — if she still seems flat or anxious, that assumption is worth checking.'
where week_number = 53;

update care_chart_week_content set
  for_your_care_team_who = 'Partner or support person',
  for_your_care_team_lede = 'Notice if "fine" has become automatic',
  for_your_care_team_detail = 'If a mood or worry has quietly become the new normal, name it out loud together.',
  for_your_care_team = 'Partner or support person — Notice if "fine" has become automatic: If a mood or worry has quietly become the new normal, name it out loud together.'
where week_number = 66;

update care_chart_week_content set
  for_your_care_team_who = 'Whoever''s closest to her',
  for_your_care_team_lede = 'A milestone isn''t proof she''s okay',
  for_your_care_team_detail = 'A happy day can make it harder to say something still feels off — ask her directly, not despite the celebration.',
  for_your_care_team = 'Whoever''s closest to her — A milestone isn''t proof she''s okay: A happy day can make it harder to say something still feels off — ask her directly, not despite the celebration.'
where week_number = 92;

update care_chart_week_content set
  for_your_care_team_who = 'Family or friend',
  for_your_care_team_lede = 'Keep checking, even now',
  for_your_care_team_detail = 'There''s no "by now she should be fine" deadline on this.',
  for_your_care_team = 'Family or friend — Keep checking, even now: There''s no "by now she should be fine" deadline on this.'
where week_number = 118;

update care_chart_week_content set
  for_your_care_team_who = 'Partner or support person',
  for_your_care_team_lede = 'Ask her, not just about her',
  for_your_care_team_detail = 'Somewhere in today, ask how she''s doing — not how the family''s been.',
  for_your_care_team = 'Partner or support person — Ask her, not just about her: Somewhere in today, ask how she''s doing — not how the family''s been.'
where week_number = 144;

update care_chart_week_content set
  for_your_care_team_who = 'Whoever''s in her corner',
  for_your_care_team_lede = 'This kind of support has no expiry date',
  for_your_care_team_detail = 'Keep the door open: if she''s struggled before — or something doesn''t feel like her now — check in again. Support doesn''t have an expiry date.',
  for_your_care_team = 'Whoever''s in her corner — This kind of support has no expiry date: Keep the door open: if she''s struggled before — or something doesn''t feel like her now — check in again. Support doesn''t have an expiry date.'
where week_number = 190;
