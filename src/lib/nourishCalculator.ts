// Powers the Nourish weekly meal-plan lookup (nourish_week_content,
// migration_54) — connects the standalone Nourish docx-per-week nutrition
// series into the Care Chart for the first time. This is a completely
// separate numbering system from weekCalculator.ts's journeyWeekNumber:
// the Nourish series is authored and reviewed using ordinary gestational
// weeks (1-40, "I'm 18 weeks pregnant") and ordinary weeks-since-birth
// (1-157, "my baby is 6 weeks old"), not the app's internal forward-count
// convention. See CLAUDE.md's 2026-09-14 entry for the full history of why
// these are two different systems.

export type NourishStage = "pregnancy" | "postpartum";

export type NourishLookup = {
  stage: NourishStage;
  weekNumber: number; // 1-40 for pregnancy, 1-157 for postpartum
  dayNumber: number; // 1-7, anchored to due_date (pregnancy) or baby_dob (postpartum)
};

const PREGNANCY_MAX_WEEK = 40;
const POSTPARTUM_MAX_WEEK = 157;

function mod7(n: number): number {
  return ((n % 7) + 7) % 7;
}

// babyDob/dueDate are the same profile fields calculateCareWeek already
// reads. Returns null only when neither date is set at all (brand new
// profile, same as calculateCareWeek's own null case).
export function calculateNourishLookup(
  babyDob: string | null,
  dueDate: string | null,
  now: Date = new Date()
): NourishLookup | null {
  if (babyDob) {
    const dob = new Date(babyDob);
    const diffDays = Math.floor((now.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return null; // baby_dob set in the future — shouldn't happen, guard anyway
    const weekNumber = Math.min(POSTPARTUM_MAX_WEEK, Math.floor(diffDays / 7) + 1);
    const dayNumber = mod7(diffDays) + 1;
    return { stage: "postpartum", weekNumber, dayNumber };
  }

  if (dueDate) {
    const due = new Date(dueDate);
    const diffDaysToDue = Math.floor((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    // 280 days = the standard 40-week due-date convention already used by
    // weekCalculator.ts. If she's overdue and hasn't logged the birth yet,
    // diffDaysToDue goes negative and elapsedDays exceeds 280 — clamped to
    // week 40 (the last pregnancy week) rather than returning null, same
    // spirit as calculateCareWeek treating an overdue, unlogged birth as
    // "week 0" rather than nothing.
    const elapsedDays = 280 - diffDaysToDue;
    const weekNumber = Math.min(PREGNANCY_MAX_WEEK, Math.max(1, Math.floor(elapsedDays / 7) + 1));
    const dayNumber = mod7(elapsedDays) + 1;
    return { stage: "pregnancy", weekNumber, dayNumber };
  }

  return null;
}

// Pregnancy weeks 2-8 have no locked Nourish content (a genuine gap in the
// source docx series, flagged to Roop 2026-09-14 and deliberately left
// rather than fabricated) — callers should fall back to the Care Chart's
// own thinner `nourish` field for these weeks.
export function nourishGapWeek(lookup: NourishLookup): boolean {
  return lookup.stage === "pregnancy" && lookup.weekNumber >= 2 && lookup.weekNumber <= 8;
}
