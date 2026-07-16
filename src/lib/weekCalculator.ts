// Powers the Weekly Care Chart. Unlike the Monthly Chart (which starts during
// pregnancy), the Care Chart is about her postpartum recovery — so it only
// starts counting once baby has actually arrived.

export function calculateWeeksPostpartum(babyDob: string | null): number | null {
  if (!babyDob) return null;

  const dob = new Date(babyDob);
  const now = new Date();
  const diffMs = now.getTime() - dob.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return null; // baby not born yet

  return Math.floor(diffDays / 7);
}

export function carePhaseLabel(weeksPostpartum: number): string {
  if (weeksPostpartum <= 6) return "Early healing (0–6 weeks)";
  if (weeksPostpartum <= 12) return "Finding rhythm (6–12 weeks)";
  if (weeksPostpartum <= 26) return "Rebuilding (3–6 months)";
  return "Strong again (6–12 months+)";
}
