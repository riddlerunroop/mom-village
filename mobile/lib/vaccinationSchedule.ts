// The Universal Immunization Programme (UIP) schedule, for infants and
// children, bounded to Mom Village's 0–3 year window (the app's fixed age
// ceiling — see CLAUDE.md "Product scope"). Sourced directly from the
// Ministry of Health & Family Welfare's official National Immunization
// Schedule PDF (mohfw.gov.in), fetched and verified 2026-07-21 — not from
// memory. TT/DPT booster-2 (5–6 yrs) and TT (10/16 yrs) are out of scope
// entirely, since they fall after the third birthday.
//
// This is a reference schedule, not medical advice — the in-app copy says
// so, and always defers to her pediatrician for the actual immunization
// decision. A few vaccines (PCV, Rotavirus, IPV, JE) are phased/regional
// per the official schedule ("Phased introduction, presently in select
// states/districts" / "introduced in 230 endemic districts") — flagged as
// "ask your doctor if this applies to you" rather than presented as
// universal.

export type DoseTiming =
  | { type: "single"; dueFromBirthDays: number; catchUpUntilDays?: number }
  | { type: "range"; windowStartDays: number; windowEndDays: number }
  | {
      type: "recurring";
      firstDueDays: number;
      intervalDays: number;
      boundedUntilDays: number; // Mom Village's own 3-year ceiling, not the medical one
    };

export type VaccineDoseSpec = {
  key: string;
  vaccine: string;
  doseLabel: string; // e.g. "Dose 1", "Birth dose", "Booster"
  timing: DoseTiming;
  regional?: boolean; // phased/regional rollout per official schedule — ask her doctor
  note?: string;
};

const DAY = 1;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY; // approximate, consistent with how the rest of the app buckets months

export const VACCINATION_SCHEDULE: VaccineDoseSpec[] = [
  {
    key: "bcg",
    vaccine: "BCG",
    doseLabel: "Single dose",
    timing: { type: "single", dueFromBirthDays: 0, catchUpUntilDays: 365 },
    note: "At birth, or as early as possible — can be given up to age 1.",
  },
  {
    key: "hep_b_birth",
    vaccine: "Hepatitis B",
    doseLabel: "Birth dose",
    timing: { type: "single", dueFromBirthDays: 0, catchUpUntilDays: 1 },
    note: "Within 24 hours of birth.",
  },
  {
    key: "opv_0",
    vaccine: "OPV",
    doseLabel: "Dose 0 (birth dose)",
    timing: { type: "single", dueFromBirthDays: 0, catchUpUntilDays: 15 },
    note: "At birth, or as early as possible within the first 15 days.",
  },
  {
    key: "opv_1",
    vaccine: "OPV",
    doseLabel: "Dose 1",
    timing: { type: "single", dueFromBirthDays: 6 * WEEK },
  },
  {
    key: "opv_2",
    vaccine: "OPV",
    doseLabel: "Dose 2",
    timing: { type: "single", dueFromBirthDays: 10 * WEEK },
  },
  {
    key: "opv_3",
    vaccine: "OPV",
    doseLabel: "Dose 3",
    timing: { type: "single", dueFromBirthDays: 14 * WEEK },
  },
  {
    key: "penta_1",
    vaccine: "Pentavalent",
    doseLabel: "Dose 1",
    timing: { type: "single", dueFromBirthDays: 6 * WEEK },
  },
  {
    key: "penta_2",
    vaccine: "Pentavalent",
    doseLabel: "Dose 2",
    timing: { type: "single", dueFromBirthDays: 10 * WEEK },
  },
  {
    key: "penta_3",
    vaccine: "Pentavalent",
    doseLabel: "Dose 3",
    timing: { type: "single", dueFromBirthDays: 14 * WEEK },
  },
  {
    key: "pcv_1",
    vaccine: "Pneumococcal Conjugate Vaccine (PCV)",
    doseLabel: "Dose 1",
    timing: { type: "single", dueFromBirthDays: 6 * WEEK },
    regional: true,
  },
  {
    key: "pcv_2",
    vaccine: "Pneumococcal Conjugate Vaccine (PCV)",
    doseLabel: "Dose 2",
    timing: { type: "single", dueFromBirthDays: 14 * WEEK },
    regional: true,
  },
  {
    key: "pcv_booster",
    vaccine: "Pneumococcal Conjugate Vaccine (PCV)",
    doseLabel: "Booster",
    timing: { type: "range", windowStartDays: 9 * MONTH, windowEndDays: 12 * MONTH },
    regional: true,
  },
  {
    key: "rotavirus_1",
    vaccine: "Rotavirus",
    doseLabel: "Dose 1",
    timing: { type: "single", dueFromBirthDays: 6 * WEEK },
    regional: true,
  },
  {
    key: "rotavirus_2",
    vaccine: "Rotavirus",
    doseLabel: "Dose 2",
    timing: { type: "single", dueFromBirthDays: 10 * WEEK },
    regional: true,
  },
  {
    key: "rotavirus_3",
    vaccine: "Rotavirus",
    doseLabel: "Dose 3",
    timing: { type: "single", dueFromBirthDays: 14 * WEEK },
    regional: true,
  },
  {
    key: "ipv_1",
    vaccine: "IPV (fractional dose)",
    doseLabel: "Dose 1",
    timing: { type: "single", dueFromBirthDays: 6 * WEEK },
  },
  {
    key: "ipv_2",
    vaccine: "IPV (fractional dose)",
    doseLabel: "Dose 2",
    timing: { type: "single", dueFromBirthDays: 14 * WEEK },
  },
  {
    key: "mr_1",
    vaccine: "Measles-Rubella (MR)",
    doseLabel: "Dose 1",
    timing: { type: "range", windowStartDays: 9 * MONTH, windowEndDays: 12 * MONTH },
    note: "Can be given up to age 5 if missed at this window.",
  },
  {
    key: "je_1",
    vaccine: "Japanese Encephalitis (JE)",
    doseLabel: "Dose 1",
    timing: { type: "range", windowStartDays: 9 * MONTH, windowEndDays: 12 * MONTH },
    regional: true,
    note: "Only in JE-endemic districts — ask your doctor if this applies where you live.",
  },
  {
    key: "vitamin_a_1",
    vaccine: "Vitamin A",
    doseLabel: "Dose 1",
    timing: { type: "range", windowStartDays: 9 * MONTH, windowEndDays: 9 * MONTH + 30 },
    note: "Given together with the Measles-Rubella dose at 9 months.",
  },
  {
    key: "dpt_booster_1",
    vaccine: "DPT",
    doseLabel: "Booster 1",
    timing: { type: "range", windowStartDays: 16 * MONTH, windowEndDays: 24 * MONTH },
  },
  {
    key: "mr_2",
    vaccine: "Measles-Rubella (MR)",
    doseLabel: "Dose 2",
    timing: { type: "range", windowStartDays: 16 * MONTH, windowEndDays: 24 * MONTH },
  },
  {
    key: "opv_booster",
    vaccine: "OPV",
    doseLabel: "Booster",
    timing: { type: "range", windowStartDays: 16 * MONTH, windowEndDays: 24 * MONTH },
  },
  {
    key: "je_2",
    vaccine: "Japanese Encephalitis (JE)",
    doseLabel: "Dose 2",
    timing: { type: "range", windowStartDays: 16 * MONTH, windowEndDays: 24 * MONTH },
    regional: true,
    note: "Only in JE-endemic districts — ask your doctor if this applies where you live.",
  },
  {
    key: "vitamin_a_recurring",
    vaccine: "Vitamin A",
    doseLabel: "Dose 2 onward (every 6 months)",
    timing: {
      type: "recurring",
      firstDueDays: 16 * MONTH,
      intervalDays: 6 * MONTH,
      boundedUntilDays: 36 * MONTH, // official schedule continues to age 5; Mom Village stops tracking at the 3rd birthday, its fixed ceiling
    },
    note: "Official schedule continues every 6 months up to age 5 — Mom Village tracks it through your child's third birthday, our journey's end point.",
  },
];

export type DoseOccurrence = {
  spec: VaccineDoseSpec;
  occurrenceKey: string; // spec.key, or spec.key + index for recurring doses
  dueFromDays: number; // start of the window this occurrence falls due
  dueUntilDays?: number; // end of window, if bounded
};

// Expands "recurring" specs into individual occurrences within the app's
// 0–3 year window, and passes "single"/"range" specs through as-is.
export function expandScheduleOccurrences(): DoseOccurrence[] {
  const occurrences: DoseOccurrence[] = [];

  for (const spec of VACCINATION_SCHEDULE) {
    if (spec.timing.type === "single") {
      occurrences.push({
        spec,
        occurrenceKey: spec.key,
        dueFromDays: spec.timing.dueFromBirthDays,
        dueUntilDays: spec.timing.catchUpUntilDays,
      });
    } else if (spec.timing.type === "range") {
      occurrences.push({
        spec,
        occurrenceKey: spec.key,
        dueFromDays: spec.timing.windowStartDays,
        dueUntilDays: spec.timing.windowEndDays,
      });
    } else {
      let day = spec.timing.firstDueDays;
      let i = 1;
      while (day <= spec.timing.boundedUntilDays) {
        occurrences.push({
          spec,
          occurrenceKey: `${spec.key}_${i}`,
          dueFromDays: day,
          dueUntilDays: day + 30,
        });
        day += spec.timing.intervalDays;
        i += 1;
      }
    }
  }

  return occurrences;
}

export type DoseStatus = "given" | "overdue" | "due_soon" | "upcoming";

const DUE_SOON_WINDOW_DAYS = 14; // surfaces in the banner this many days before the window opens

export function ageInDays(babyDob: string, asOf: Date = new Date()): number {
  const dob = new Date(babyDob);
  return Math.floor((asOf.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24));
}

export function getOccurrenceStatus(
  occurrence: DoseOccurrence,
  babyAgeDays: number,
  givenDate: string | null
): DoseStatus {
  if (givenDate) return "given";

  const windowEnd = occurrence.dueUntilDays ?? occurrence.dueFromDays + 30;

  if (babyAgeDays > windowEnd) return "overdue";
  if (babyAgeDays >= occurrence.dueFromDays - DUE_SOON_WINDOW_DAYS) return "due_soon";
  return "upcoming";
}

export function doseLabel(spec: VaccineDoseSpec): string {
  return `${spec.vaccine} — ${spec.doseLabel}`;
}

// Flat, chronologically-sorted list for a dropdown — "which dose is this?"
// when she's confirming a logged card.
export function occurrenceOptions(): {
  occurrenceKey: string;
  label: string;
  vaccine: string;
  doseLabel: string;
}[] {
  return expandScheduleOccurrences()
    .sort((a, b) => a.dueFromDays - b.dueFromDays)
    .map((o) => ({
      occurrenceKey: o.occurrenceKey,
      label: doseLabel(o.spec),
      vaccine: o.spec.vaccine,
      doseLabel: o.spec.doseLabel,
    }));
}
