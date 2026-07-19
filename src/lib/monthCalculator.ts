// The core engine behind the Monthly Chart: turns a due date or DOB into
// "Month -3" (still expecting) or "Month 8" (baby is here), the way the
// whole product is organized.

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
  // Postnatal months are 1-indexed in how she thinks of them: the newborn
  // stretch (baby's age 0–1 month, stored as month_number 0) is "Month 1",
  // not "Month 0" — matches her own "Month +5 = fifth completed month" convention.
  const displayMonth = monthNumber + 1;
  if (monthNumber === 0) return "Month 1 — Newborn";
  return `Month ${displayMonth}`;
}

// The 1000-day journey runs roughly from pregnancy start (-9) to age 3 (36)
export function journeyProgress(monthNumber: number): number {
  const totalMonths = 45; // -9 to 36
  const monthsElapsed = monthNumber + 9;
  const pct = (monthsElapsed / totalMonths) * 100;
  return Math.min(100, Math.max(0, Math.round(pct)));
}

// Precise real-date check for whether baby has reached a given birthday —
// used to trigger the one-time celebration moments, independent of our
// month-number bucketing.
export function hasTurnedAge(babyDob: string, years: number): boolean {
  const dob = new Date(babyDob);
  const mark = new Date(dob);
  mark.setFullYear(mark.getFullYear() + years);
  return new Date() >= mark;
}

// Kept for the existing first-birthday feature.
export function hasTurnedOne(babyDob: string): boolean {
  return hasTurnedAge(babyDob, 1);
}
