// Maps today's date to one of India's three broad seasons, so Monthly
// Chart content can surface what's actually relevant right now —
// e.g. mosquito/rash advice in monsoon, not in December.

export type Season = "summer" | "monsoon" | "winter";

export function getCurrentSeason(date: Date = new Date()): Season {
  const month = date.getMonth() + 1; // JS months are 0-indexed

  if (month >= 3 && month <= 6) return "summer";   // March–June
  if (month >= 7 && month <= 9) return "monsoon";  // July–September
  return "winter";                                  // October–February
}
