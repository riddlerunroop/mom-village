// Care for Yourself — pure calculation logic, no Supabase/browser
// dependency. Ported verbatim to mobile/lib/careForYourselfCalculator.ts,
// same "calculator" pattern as resetCalculator.ts/weekCalculator.ts —
// keep both copies in sync if this logic ever changes.
//
// Two responsibilities:
//   1. Which of the 7 fixed categories does a given calendar date fall on
//      (Sunday=Hair love ... Saturday=My care day — see CLAUDE.md for the
//      full spec, verbatim from Roop).
//   2. Which specific Care Note (out of however many are active in that
//      category) does a given mother see today — deterministic and
//      stable across reloads on the same day, different per mother
//      (seeded by her own user id), and guaranteed not to repeat until
//      the whole bank has cycled once. See migration_61's header comment
//      for why no separate "seen" table is needed to guarantee this.

export type CareCategory =
  | "hair"
  | "face"
  | "handsfeet"
  | "body"
  | "groom"
  | "feelgood"
  | "mycare";

export const CARE_CATEGORY_BY_DAY: Record<number, CareCategory> = {
  0: "hair", // Sunday — Hair love
  1: "face", // Monday — Face time
  2: "handsfeet", // Tuesday — Hands & feet
  3: "body", // Wednesday — Body love
  4: "groom", // Thursday — Groom & glow
  5: "feelgood", // Friday — Feel-good Friday
  6: "mycare", // Saturday — My care day
};

export const CARE_CATEGORY_META: Record<
  CareCategory,
  { label: string; dayLabel: string; emoji: string; accent: string }
> = {
  hair: { label: "Hair love", dayLabel: "Sunday", emoji: "💆‍♀️", accent: "sage-deep" },
  face: { label: "Face time", dayLabel: "Monday", emoji: "✨", accent: "indigo" },
  handsfeet: { label: "Hands & feet", dayLabel: "Tuesday", emoji: "💅", accent: "terracotta" },
  body: { label: "Body love", dayLabel: "Wednesday", emoji: "🧴", accent: "gold-deep" },
  groom: { label: "Groom & glow", dayLabel: "Thursday", emoji: "🌸", accent: "sage" },
  feelgood: { label: "Feel-good Friday", dayLabel: "Friday", emoji: "💄", accent: "gold" },
  mycare: { label: "My care day", dayLabel: "Saturday", emoji: "🌷", accent: "indigo" },
};

// Parses a plain "YYYY-MM-DD" date deliberately via Date.UTC rather than
// `new Date(dateIso)` — avoids any local-timezone shift landing on the
// wrong day of week right around midnight.
export function careCategoryForDate(dateIso: string): CareCategory {
  const [y, m, d] = dateIso.split("-").map(Number);
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return CARE_CATEGORY_BY_DAY[dow];
}

function daysSinceEpoch(dateIso: string): number {
  const [y, m, d] = dateIso.split("-").map(Number);
  const ms = Date.UTC(y, m - 1, d) - Date.UTC(2020, 0, 1);
  return Math.floor(ms / 86400000);
}

// Simple deterministic string hash (FNV-1a) — only needs to be stable and
// reasonably well-distributed, not cryptographically strong; it's just
// the seed for the shuffle below.
function hashSeed(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// mulberry32 — a tiny seeded PRNG, deterministic for a given seed.
function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const result = [...arr];
  const rand = mulberry32(seed);
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// A note id plus its content type (KNOW/CARE/RITUAL/FEEL) — the minimum
// pickCareNoteId needs to keep consecutive picks from landing on the same
// tone. See Roop's own 2026-09-18 note delivering all 210 real Care Notes:
// "don't randomly shuffle all 30 cards blindly... have the rotation avoid
// serving very similar messages consecutively" — this is that fix.
export type CareNoteRef = { id: string; contentType: string };

// Runs the seeded shuffle, then repairs any position where two adjacent
// notes (including the wraparound from last back to first, since the
// order is a repeating cycle) share the same content_type — swaps the
// later one for the nearest later note whose type differs from both of
// its new neighbours. A few passes because one fix can occasionally
// create a new collision elsewhere; deterministic for a given seed, same
// as the plain shuffle it wraps.
function typeAwareShuffle(notes: CareNoteRef[], seed: number): CareNoteRef[] {
  const order = seededShuffle(notes, seed);
  const n = order.length;
  if (n < 3) return order;
  for (let pass = 0; pass < 3; pass++) {
    let changed = false;
    for (let i = 0; i < n; i++) {
      const next = (i + 1) % n;
      if (order[i].contentType !== order[next].contentType) continue;
      const after = (next + 1) % n;
      for (let step = 1; step < n; step++) {
        const j = (next + step) % n;
        if (j === i || j === next) continue;
        const candidateType = order[j].contentType;
        if (candidateType !== order[i].contentType && candidateType !== order[after].contentType) {
          [order[next], order[j]] = [order[j], order[next]];
          changed = true;
          break;
        }
      }
    }
    if (!changed) break;
  }
  return order;
}

// Picks today's Care Note id for this mother + category, out of whichever
// active notes currently exist for that category.
//
// How it stays stable across reloads on the same day, different per
// mother, and non-repeating until the bank cycles: each mother gets her
// own fixed pseudo-random ordering of that category's notes (seeded by
// her user id + the category, so two mothers see different sequences of
// the same content), then type-repaired so two adjacent positions in
// that fixed order never share a content_type (see typeAwareShuffle
// above). Which position in that fixed ordering shows "today" is simply
// the number of whole weeks since a fixed epoch — since every category
// maps to exactly one weekday, that number increments by exactly 1 every
// time that weekday comes around, so consecutive occurrences always land
// on adjacent, distinct (and now distinct-toned) positions, and the whole
// bank must complete one full lap through the order before any note can
// repeat. This also means the feature naturally supports the content
// bank growing later (per the spec's own "allows the content library to
// grow later without changing the feature architecture") — adding more
// notes to a category just makes the lap longer, no schema or logic
// change needed.
export function pickCareNoteId(
  userId: string,
  category: CareCategory,
  activeNotes: CareNoteRef[],
  dateIso: string
): string | null {
  if (activeNotes.length === 0) return null;
  const seed = hashSeed(`${userId}:${category}`);
  const order = typeAwareShuffle(activeNotes, seed);
  const weekIndex = Math.floor(daysSinceEpoch(dateIso) / 7);
  const idx = ((weekIndex % order.length) + order.length) % order.length;
  return order[idx].id;
}

// A gentle, non-punitive weekly acknowledgment — never a target, never
// phrased as a score out of 7 ("2/7 completed" is explicitly the kind of
// language the spec asks to avoid). Returns null when count is 0, since
// the spec is explicit that a mother who made time for herself zero times
// this week should see nothing here at all, not a zero or a nudge.
export function careWeekAcknowledgment(count: number): string | null {
  if (count <= 0) return null;
  return `You've made some space for yourself ${count} ${count === 1 ? "day" : "days"} this week. ♡`;
}
