// Powers the Weekly Care Chart — covers BOTH prenatal and postnatal,
// mirroring the same negative/positive convention as monthCalculator.ts:
// negative = weeks still to go before birth, 0+ = weeks since birth.

export function calculateCareWeek(
  babyDob: string | null,
  dueDate: string | null
): number | null {
  const now = new Date();

  if (babyDob) {
    const dob = new Date(babyDob);
    const diffDays = Math.floor((now.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return null; // shouldn't happen, but guard anyway
    return Math.floor(diffDays / 7); // 0, 1, 2, ... weeks postpartum
  }

  if (dueDate) {
    const due = new Date(dueDate);
    const diffDays = Math.floor((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 0; // due date passed but DOB not entered yet — treat as week 0
    return -Math.ceil(diffDays / 7); // negative = weeks still to go
  }

  return null;
}

export function carePhaseLabel(week: number): string {
  // Prenatal phases (rough 40-week pregnancy convention)
  if (week <= -27) return "First trimester";
  if (week <= -14) return "Second trimester";
  if (week < 0) return "Third trimester — getting close";

  // Postnatal phases — extended through the third birthday (~week 156) to
  // match the Care Chart's full pregnancy-through-age-3 span, same as the
  // Monthly Chart. Names match the locked 9-phase content exactly
  // (Weekly Care Chart - All 9 Phases (LOCKED).docx). Confirmed 2026-07-21.
  if (week <= 6) return "Early healing (0–6 weeks)";
  if (week <= 12) return "Finding rhythm (6–12 weeks)";
  if (week <= 26) return "Rebuilding (3–6 months)";
  if (week <= 52) return "Settling into strength (6–12 months)";
  if (week <= 104) return "Sustainable rhythms (1–2 years)";
  return "Your rhythm, year three (2–3 years)";
}

// Stable slug per phase — this is what content rows in weekly_care_chart_content
// are actually tagged and queried by (phase_key column, migration_9). Boundaries
// must stay in lockstep with carePhaseLabel above.
export type CarePhaseKey =
  | "first_trimester"
  | "second_trimester"
  | "third_trimester"
  | "early_healing"
  | "finding_rhythm"
  | "rebuilding"
  | "settling_into_strength"
  | "sustainable_rhythms"
  | "rhythm_year_three";

export function carePhaseKey(week: number): CarePhaseKey {
  if (week <= -27) return "first_trimester";
  if (week <= -14) return "second_trimester";
  if (week < 0) return "third_trimester";

  if (week <= 6) return "early_healing";
  if (week <= 12) return "finding_rhythm";
  if (week <= 26) return "rebuilding";
  if (week <= 52) return "settling_into_strength";
  if (week <= 104) return "sustainable_rhythms";
  return "rhythm_year_three";
}

export function careWeekLabel(week: number): string {
  if (week < 0) return `${Math.abs(week)} weeks to go`;
  if (week === 0) return "Week 0 — newborn";
  return `Week ${week} postpartum`;
}

// Converts the "weeks to go" convention `calculateCareWeek` already uses
// (negative before birth, 0+ after) into the forward-counting journey week
// number that the week-by-week Care Chart rebuild is authored and looked up
// by — matching how every mother and clinician already talks about
// pregnancy ("I'm 18 weeks"), rather than a countdown. Standard 40-week
// due-date convention: journey_week = 40 + care_week (e.g. 27 weeks to go →
// week 13, the end of first trimester, consistent with carePhaseKey's own
// -27 threshold above; birth itself, care_week 0, → week 40 = full term).
//
// Postpartum weeks continue the SAME forward count rather than restarting —
// week 40 = week 0 postpartum, week 46 = week 6 postpartum, and so on up to
// week 196 = week 156 postpartum (the third birthday) — per Roop's explicit
// 2026-07-29 instruction that mothers get a genuinely unique weekly chart
// entry for her full three-year tenure, not a drop to monthly cadence after
// early postpartum. (Renamed from pregnancyWeekNumber, which this function
// was called before it covered postpartum too — one call site, in
// dashboard/care/chart/page.tsx.)
export function journeyWeekNumber(careWeek: number): number {
  const week = 40 + careWeek;
  if (week < 1) return 1; // clamp very early entries (due date just set) to week 1
  return week;
}
