// Powers the Reset rebuild (migration_59/60, 2026-09-16) — a village-wide
// "Reset of the day" rotation through the curated reset_activities bank,
// plus cumulative milestone badges. See CLAUDE.md for the full design
// history: this deliberately replaced the old per-week, mood-matched Reset
// card, and deliberately uses never-resetting cumulative badges instead of
// a streak (a broken streak carries a real "I lost it" feeling even with
// no visible penalty — exactly the wrong note for the one feature in Care
// meant to have zero stakes).
//
// Pure logic, no browser/DB dependency either side — copy-paste safe
// between web (src/lib) and native (mobile/lib), same convention as
// monthCalculator.ts/weekCalculator.ts.

// The whole village sees the same card on the same calendar date — a
// deliberate choice (not explicitly specified in the brief, worth
// revisiting if Roop wants per-mother variety instead): it means mothers
// sharing their Reset the same day are naturally doing the *same* prompt in
// their own way, which makes browsing the Gallery more fun (spot the
// different takes on "Main Character for One Song") rather than everyone
// doing something unrelated. The rotation is a plain, deterministic
// days-since-epoch index — no randomness, so "today's card" is identical
// no matter how many times the page reloads or who asks.
function daysSinceEpoch(isoDate: string): number {
  return Math.floor(new Date(`${isoDate}T00:00:00Z`).getTime() / 86400000);
}

// activityCount should be the count of active reset_activities rows
// ordered by card_number — the caller passes that ordered array's length
// and then indexes into it with the result. todayIso is a plain
// YYYY-MM-DD string, matching the "today" convention already used
// throughout this app (e.g. chart/page.tsx's `new Date().toISOString().
// slice(0, 10)`).
export function pickDailyResetIndex(activityCount: number, todayIso: string): number {
  if (activityCount <= 0) return 0;
  const n = daysSinceEpoch(todayIso) % activityCount;
  return ((n % activityCount) + activityCount) % activityCount; // guard against a negative epoch edge case
}

// Cumulative milestone thresholds — never reset, only ever counted up.
// Spacing widens as the count grows (fine detail early on, bigger
// celebrations later) so this stays meaningful across a mother's whole
// three-year span with the app rather than running out of milestones.
export const RESET_BADGE_THRESHOLDS = [1, 5, 10, 25, 50, 100, 150, 200, 300, 400, 500] as const;

export const RESET_BADGE_LABELS: Record<number, string> = {
  1: "Your first Reset",
  5: "5 Resets — you're getting the hang of this",
  10: "10 Resets — double digits",
  25: "25 Resets — a proper habit now",
  50: "50 Resets — halfway to something big",
  100: "100 Resets — a hundred little pauses just for you",
  150: "150 Resets — you never miss a chance to be a little ridiculous",
  200: "200 Resets — village legend status",
  300: "300 Resets",
  400: "400 Resets",
  500: "500 Resets",
};

// The highest badge a mother has actually unlocked, given her all-time
// completion count. null if she hasn't hit the first one yet.
export function unlockedResetBadge(totalCompletions: number): number | null {
  let result: number | null = null;
  for (const t of RESET_BADGE_THRESHOLDS) {
    if (totalCompletions >= t) result = t;
  }
  return result;
}

// The next badge still ahead of her — null once she's past the last
// defined threshold (the count keeps going up regardless, there's just no
// bigger named badge yet).
export function nextResetBadge(totalCompletions: number): number | null {
  for (const t of RESET_BADGE_THRESHOLDS) {
    if (totalCompletions < t) return t;
  }
  return null;
}

// Since a completion only ever increases the count by exactly 1, at most
// one threshold can be crossed by any single "I'm doing this" tap — so the
// caller just checks whether her brand-new total exactly matches a
// threshold, and if so, that's the badge to celebrate right now.
export function justUnlockedResetBadge(newTotalCompletions: number): number | null {
  return (RESET_BADGE_THRESHOLDS as readonly number[]).includes(newTotalCompletions)
    ? newTotalCompletions
    : null;
}
