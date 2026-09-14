// Shared shape for nourish_week_content rows (migration_54) — the Nourish
// weekly meal-plan series, connected into the Care Chart 2026-09-14. See
// src/lib/nourishCalculator.ts for how a mother's actual week/day is
// computed, and CLAUDE.md for why this is a separate system from
// care_chart_week_content's own thinner `nourish` field.

export type NourishDay = {
  day_number: number;
  title: string;
  notes: string | null;
  breakfast_a: string | null;
  breakfast_b: string | null;
  lunch_a: string | null;
  lunch_b: string | null;
  nourishment_break_a: string | null;
  nourishment_break_b: string | null;
  dinner_a: string | null;
  dinner_b: string | null;
  still_hungry: string | null;
};

export type NourishWeekRow = {
  stage: "pregnancy" | "postpartum";
  week_number: number;
  trimester: string | null;
  phase_label: string | null;
  theme_title: string;
  mantra: string | null;
  why_it_matters: string | null;
  condition_notes: string | null;
  meat_fish_eggs_note: string | null;
  using_meals_note: string | null;
  days: NourishDay[];
  reflection: string | null;
  looking_ahead: string | null;
};
