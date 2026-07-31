// Ported verbatim from the web app's src/lib/season.ts.

export type Season = "summer" | "monsoon" | "winter";

export function getCurrentSeason(date: Date = new Date()): Season {
  const month = date.getMonth() + 1;

  if (month >= 3 && month <= 6) return "summer";
  if (month >= 7 && month <= 9) return "monsoon";
  return "winter";
}
