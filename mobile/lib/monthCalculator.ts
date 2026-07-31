// Ported verbatim from the web app's src/lib/monthCalculator.ts — pure date
// logic, no browser dependency, so it works identically here. Keep these
// two files in sync if this logic ever changes on either side.

export function calculateMonthNumber(referenceDate: string): number {
  const ref = new Date(referenceDate);
  const now = new Date();

  let months =
    (now.getFullYear() - ref.getFullYear()) * 12 +
    (now.getMonth() - ref.getMonth());

  if (now.getDate() < ref.getDate()) {
    months -= 1;
  }

  return months;
}

export function monthLabel(monthNumber: number): string {
  if (monthNumber < 0) {
    const monthsToGo = Math.abs(monthNumber);
    return `${monthsToGo} ${monthsToGo === 1 ? "month" : "months"} to go`;
  }
  const displayMonth = monthNumber + 1;
  if (monthNumber === 0) return "Month 1 — Newborn";
  return `Month ${displayMonth}`;
}

export function journeyProgress(monthNumber: number): number {
  const totalMonths = 45; // -9 to 36
  const monthsElapsed = monthNumber + 9;
  const pct = (monthsElapsed / totalMonths) * 100;
  return Math.min(100, Math.max(0, Math.round(pct)));
}

export function hasTurnedAge(babyDob: string, years: number): boolean {
  const dob = new Date(babyDob);
  const mark = new Date(dob);
  mark.setFullYear(mark.getFullYear() + years);
  return new Date() >= mark;
}

export function shouldPromptBirth(
  dueDate: string | null | undefined,
  babyDob: string | null | undefined
): boolean {
  if (babyDob) return false;
  if (!dueDate) return false;
  return calculateMonthNumber(dueDate) >= -1;
}
