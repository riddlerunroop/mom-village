// Ported verbatim from the web app's src/lib/weekCalculator.ts — pure date
// logic. Keep in sync with the web copy if this logic ever changes.

export function calculateCareWeek(
  babyDob: string | null,
  dueDate: string | null
): number | null {
  const now = new Date();

  if (babyDob) {
    const dob = new Date(babyDob);
    const diffDays = Math.floor((now.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return null;
    return Math.floor(diffDays / 7);
  }

  if (dueDate) {
    const due = new Date(dueDate);
    const diffDays = Math.floor((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 0;
    return -Math.ceil(diffDays / 7);
  }

  return null;
}

export function carePhaseLabel(week: number): string {
  if (week <= -27) return "First trimester";
  if (week <= -14) return "Second trimester";
  if (week < 0) return "Third trimester — getting close";

  if (week <= 6) return "Early healing (0–6 weeks)";
  if (week <= 12) return "Finding rhythm (6–12 weeks)";
  if (week <= 26) return "Rebuilding (3–6 months)";
  if (week <= 52) return "Settling into strength (6–12 months)";
  if (week <= 104) return "Sustainable rhythms (1–2 years)";
  return "Your rhythm, year three (2–3 years)";
}

export function careWeekLabel(week: number): string {
  if (week < 0) return `${Math.abs(week)} weeks to go`;
  if (week === 0) return "Week 0 — newborn";
  return `Week ${week} postpartum`;
}

export function journeyWeekNumber(careWeek: number): number {
  const week = 40 + careWeek;
  if (week < 1) return 1;
  return week;
}
