// Ported verbatim from the web app's src/lib/nourishCalculator.ts — pure
// date logic, no browser dependency either side. Keep in sync with the web
// copy if this logic ever changes. Powers the Nourish weekly meal-plan
// lookup (nourish_week_content, migration_54) — a completely separate
// numbering system from weekCalculator.ts's journeyWeekNumber. See the web
// file's own comment and CLAUDE.md for the full history.

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

export function calculateNourishLookup(
  babyDob: string | null,
  dueDate: string | null,
  now: Date = new Date()
): NourishLookup | null {
  if (babyDob) {
    const dob = new Date(babyDob);
    const diffDays = Math.floor((now.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return null;
    const weekNumber = Math.min(POSTPARTUM_MAX_WEEK, Math.floor(diffDays / 7) + 1);
    const dayNumber = mod7(diffDays) + 1;
    return { stage: "postpartum", weekNumber, dayNumber };
  }

  if (dueDate) {
    const due = new Date(dueDate);
    const diffDaysToDue = Math.floor((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const elapsedDays = 280 - diffDaysToDue;
    const weekNumber = Math.min(PREGNANCY_MAX_WEEK, Math.max(1, Math.floor(elapsedDays / 7) + 1));
    const dayNumber = mod7(elapsedDays) + 1;
    return { stage: "pregnancy", weekNumber, dayNumber };
  }

  return null;
}

export function nourishGapWeek(lookup: NourishLookup): boolean {
  return lookup.stage === "pregnancy" && lookup.weekNumber >= 2 && lookup.weekNumber <= 8;
}
