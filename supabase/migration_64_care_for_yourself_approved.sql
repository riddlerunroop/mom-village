-- Care for Yourself — mark the 210 real Care Notes 'approved', 2026-09-18.
--
-- Follows migration_63 (which loaded the real content with
-- safety_flag = 'draft', pending a clinical/dermatological review Roop had
-- asked for). Roop's own explicit follow-up call, same day, closes that
-- loop the other way — her words: "never wanted it to be reviewed by
-- anyone. Those are the general statements open for them to follow or not
-- follow. We can always have a disclaimer that... before trying anything,
-- they need to go by their [own judgment] because their skin might be
-- allergic to any... any sort of disclaimer that will waive us off. These
-- are more or less general statements which are not affecting too much.
-- So I want to go ahead with this. Don't draft it. Just finalize it.
-- Consider them approved."
--
-- So: no outside review is being sought. The 'draft' flag is replaced with
-- 'approved' (a value the migration_61 CHECK constraint already allows —
-- no schema change needed), and the liability-waiving disclaimer she asked
-- for instead is rendered directly on every Care for Yourself card in the
-- app (src/components/CareForYourself.tsx and
-- mobile/components/CareForYourself.tsx), not implemented as a review
-- gate. last_reviewed_date is set to today to record when this call was
-- made.
--
-- Idempotent — safe to rerun.

update care_for_yourself_notes
set safety_flag = 'approved',
    last_reviewed_date = current_date
where safety_flag = 'draft';
