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
  if (monthNumber === 0) return "Newborn — Month 0";
  return `Month ${monthNumber}`;
}

// The 1000-day journey runs roughly from pregnancy start (-9) to age 3 (36)
export function journeyProgress(monthNumber: number): number {
  const totalMonths = 45; // -9 to 36
  const monthsElapsed = monthNumber + 9;
  const pct = (monthsElapsed / totalMonths) * 100;
  return Math.min(100, Math.max(0, Math.round(pct)));
}
