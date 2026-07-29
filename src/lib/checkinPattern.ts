// Shared check-in pattern tiering — extracted 2026-07-29 from
// pattern/page.tsx so the same logic can also power the new gentle
// pattern-escalation banner on the Care landing page (confirmed scope via
// AskUserQuestion: a non-blocking banner, recomputed live on each visit,
// never scored or stored beyond the check-ins that already exist). Single
// source of truth — the banner and the full Pattern page must never
// silently disagree about what counts as "several heavy days."

export type CheckinRow = { checkin_date: string; mood_score: number };
export type PatternSignal = "not_enough" | "mostly_steady" | "some_heavy" | "several_heavy";

export function computePatternSignal(rows: CheckinRow[]): PatternSignal {
  const last14 = rows.slice(-14);
  const lowMoodDays = last14.filter((r) => r.mood_score <= 2).length;
  const daysCheckedInLast14 = last14.length;

  if (rows.length < 3) return "not_enough";
  if (daysCheckedInLast14 === 0) return "not_enough";
  if (lowMoodDays >= 5) return "several_heavy";
  if (lowMoodDays >= 2) return "some_heavy";
  return "mostly_steady";
}
