-- Care profile — diet preference + mental-health-history flags, 2026-07-29.
--
-- Builds the two remaining open items flagged when the postpartum
-- week-by-week rebuild finished: the veg/non-veg protein preference
-- (flagged as a missing onboarding question since the very first working
-- spec for the week-by-week rebuild), and the onboarding mental-health-
-- history flag (flagged in the "Open strategic question" section when PPD/
-- Mental Health Phase 1 was built, which Roop asked for time to think
-- over — this build follows up on that with her explicit go-ahead).
--
-- Confirmed scope, via AskUserQuestion:
-- 1. No validated screening instrument (EPDS/PHQ-9) this pass — deferred,
--    same as Phase 1's own decision, pending a separate licensing
--    conversation.
-- 2. Pattern escalation (see CareLandingPage) is a gentle, non-blocking
--    banner only — no push notification.
-- 3. Diet preference gets a supplementary tip layer alongside Nourish, not
--    a full per-week recipe rewrite across all 196 already-locked weeks.
-- 4. The mental-health-history question uses multiple options (during a
--    previous pregnancy / after a previous birth / another time in life /
--    prefer not to say) rather than a bare yes/no.
--
-- One new nullable column: diet_preference ('vegetarian' | 'non_vegetarian'
-- | null). The mental-health-history flags need NO schema change — they're
-- stored as new string values inside the existing health_flags text[]
-- array (already app-enforced, not DB-constrained, per migration_2's own
-- comment), the same storage shape as thyroid/diabetes_gd/pcos/high_bp.
-- CareWeekContent.tsx's condition_notes filtering only ever checks for
-- those four physical flags plus 'none', so the new mh_history_* values
-- simply pass through unused there and are read instead by the Mental
-- Health hub.

alter table user_care_profile add column if not exists diet_preference text
  check (diet_preference in ('vegetarian', 'non_vegetarian'));

-- Valid mental-health-history flag values (enforced in application code,
-- same as the physical health_flags, since arrays don't support a clean
-- check-in-list constraint): 'mh_history_pregnancy', 'mh_history_postpartum',
-- 'mh_history_other', 'mh_history_declined'.
