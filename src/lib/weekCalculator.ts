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
  // Monthly Chart. Confirmed 2026-07-21.
  if (week <= 6) return "Early healing (0–6 weeks)";
  if (week <= 12) return "Finding rhythm (6–12 weeks)";
  if (week <= 26) return "Rebuilding (3–6 months)";
  if (week <= 52) return "Strong again (6–12 months)";
  if (week <= 104) return "Toddler year two (1–2 years)";
  return "Toddler year three (2–3 years)";
}

export function careWeekLabel(week: number): string {
  if (week < 0) return `${Math.abs(week)} weeks to go`;
  if (week === 0) return "Week 0 — newborn";
  return `Week ${week} postpartum`;
}
