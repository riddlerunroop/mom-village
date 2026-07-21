// The ₹49 Minimum Budget Planner — the low-friction front-door product,
// also embedded as a tab inside the Wealth pillar.
//
// Philosophy: show her the REAL minimum, not an inflated, marketing-driven
// "must-buy" list. Every figure below is a deliberately conservative,
// budget-conscious estimate for urban India, 2026 — not a guarantee, not
// a premium/aspirational number. Actual costs vary by city, hospital, and
// personal choices; the calculator says so explicitly in its output.
//
// Sources behind these figures (see chat verification pass, 2026-07-21):
// - JSSK: free delivery incl. C-section, drugs, diagnostics, blood, food,
//   transport at public health institutions (NHM).
// - PMSMA: free antenatal checkups on the 9th of every month, 2nd/3rd trimester.
// - PMMVY: ₹5,000 cash benefit for first child (₹6,000 for a second child
//   if a girl), paid directly to the mother.
// - UIP: free routine immunizations at government facilities.
// - Private delivery costs, disposable/cloth diaper costs, and formula
//   costs are typical low-to-mid-range 2026 market figures, not premium.

export type DeliveryFacility = "public" | "private";
export type DeliveryTypeChoice = "normal" | "c_section" | "not_sure";
export type FeedingPlan = "breastfeeding" | "formula" | "undecided";
export type DiaperingPlan = "cloth" | "disposable" | "mixed";

export interface BudgetCalculatorInput {
  currentlyPregnant: boolean;
  babyCount: number;
  deliveryFacility: DeliveryFacility;
  deliveryType: DeliveryTypeChoice;
  feedingPlan: FeedingPlan;
  diaperingPlan: DiaperingPlan;
  hasHandMeDowns: boolean;
}

export interface CostRange {
  low: number;
  high: number;
}

export interface BudgetLine {
  label: string;
  note: string;
  range: CostRange;
}

export interface BudgetStage {
  key: string;
  label: string;
  lines: BudgetLine[];
  subtotal: CostRange;
}

export interface BudgetResult {
  stages: BudgetStage[];
  total: CostRange;
  schemeCallouts: string[];
}

function sumRanges(ranges: CostRange[]): CostRange {
  return ranges.reduce(
    (acc, r) => ({ low: acc.low + r.low, high: acc.high + r.high }),
    { low: 0, high: 0 }
  );
}

export function calculateMinimumBudget(input: BudgetCalculatorInput): BudgetResult {
  const babies = Math.max(1, input.babyCount || 1);
  const schemeCallouts: string[] = [];
  const stages: BudgetStage[] = [];

  // ---- Stage 1: Pregnancy & delivery ----
  if (input.currentlyPregnant) {
    const deliveryLines: BudgetLine[] = [];

    if (input.deliveryFacility === "public") {
      deliveryLines.push({
        label: "Delivery (incl. C-section if needed)",
        note: "Free at public facilities under JSSK, including drugs, diagnostics, and transport.",
        range: { low: 0, high: 3000 },
      });
      schemeCallouts.push(
        "JSSK covers free delivery, C-section, medicines, diagnostics, blood, food, and transport at government facilities."
      );
    } else {
      const isCsection = input.deliveryType === "c_section";
      deliveryLines.push({
        label: isCsection ? "C-section delivery (private)" : "Delivery (private)",
        note: isCsection
          ? "Typical mid-range private hospital, budget end of the range."
          : "Typical mid-range private hospital, budget end of the range.",
        range: isCsection ? { low: 100000, high: 180000 } : { low: 60000, high: 120000 },
      });
    }

    deliveryLines.push({
      label: "Antenatal checkups & basic tests",
      note: "Free under PMSMA (2nd/3rd trimester govt. checkups); minor cost for extra private visits/tests.",
      range: { low: 0, high: 5000 },
    });

    schemeCallouts.push(
      "PMMVY pays ₹5,000 directly to the mother for her first child (₹6,000 for a second child if a girl) — an offset worth claiming regardless of where you deliver."
    );

    stages.push({
      key: "pregnancy",
      label: "Pregnancy & delivery",
      lines: deliveryLines,
      subtotal: sumRanges(deliveryLines.map((l) => l.range)),
    });
  }

  // ---- Stage 2: Newborn essentials (one-time, first ~3 months) ----
  const newbornLines: BudgetLine[] = [];
  const startupMultiplier = input.hasHandMeDowns ? 0.4 : 1;

  newbornLines.push({
    label: "Basic clothing, bedding, mosquito net, bathing",
    note: input.hasHandMeDowns
      ? "Lower end since you already have hand-me-downs — top up only what's missing."
      : "5–7 clothing sets, basic bedding, mosquito net, bathing basics — no premium items needed.",
    range: {
      low: Math.round(5000 * startupMultiplier * babies),
      high: Math.round(8000 * startupMultiplier * babies),
    },
  });

  if (input.diaperingPlan === "cloth") {
    newbornLines.push({
      label: "Cloth diaper starter stash",
      note: "One-time cost — a full stash that lasts infancy through toddlerhood.",
      range: { low: 6000 * babies, high: 12000 * babies },
    });
  }

  stages.push({
    key: "newborn",
    label: "Newborn essentials (one-time)",
    lines: newbornLines,
    subtotal: sumRanges(newbornLines.map((l) => l.range)),
  });

  // ---- Stage 3: First year (recurring monthly, shown as a 12-month total) ----
  const firstYearLines: BudgetLine[] = [];

  if (input.feedingPlan === "formula") {
    firstYearLines.push({
      label: "Formula feeding (12 months)",
      note: "Budget-brand formula, ~₹2,000–3,000/month.",
      range: { low: 2000 * 12 * babies, high: 3000 * 12 * babies },
    });
  } else if (input.feedingPlan === "undecided") {
    firstYearLines.push({
      label: "Feeding (12 months)",
      note: "Breastfeeding costs close to nothing directly; shown here as a placeholder in case formula becomes necessary.",
      range: { low: 0, high: 3000 * 12 * babies },
    });
  } else {
    schemeCallouts.push(
      "Breastfeeding, where possible, is close to free directly and is WHO's recommended approach for the first 6 months."
    );
  }

  if (input.diaperingPlan === "disposable" || input.diaperingPlan === "mixed") {
    const monthlyLow = input.diaperingPlan === "mixed" ? 1200 : 2000;
    const monthlyHigh = input.diaperingPlan === "mixed" ? 2000 : 3000;
    firstYearLines.push({
      label: "Diapering (12 months)",
      note: "Budget-brand disposables, tapering as baby grows; mixed plans cost less than full disposable.",
      range: { low: monthlyLow * 12 * babies, high: monthlyHigh * 12 * babies },
    });
  } else {
    firstYearLines.push({
      label: "Diapering — laundry/upkeep (12 months)",
      note: "Cloth stash already covered above; this is just ongoing washing costs.",
      range: { low: 300 * 12, high: 500 * 12 },
    });
  }

  firstYearLines.push({
    label: "Immunizations",
    note: "Free under the government Universal Immunization Programme at public facilities.",
    range: { low: 0, high: 0 },
  });
  schemeCallouts.push(
    "Routine immunizations are free under the Universal Immunization Programme at government facilities."
  );

  firstYearLines.push({
    label: "Doctor visits, minor medicines, misc.",
    note: "Modest ongoing buffer for the first year.",
    range: { low: 3000 * babies, high: 8000 * babies },
  });

  stages.push({
    key: "first_year",
    label: "First year (ongoing)",
    lines: firstYearLines,
    subtotal: sumRanges(firstYearLines.map((l) => l.range)),
  });

  // ---- Stage 4: Toddler years 1–3 (recurring, shown as a 24-month total for years 2 and 3) ----
  const toddlerLines: BudgetLine[] = [
    {
      label: "Food (family meals, years 2–3)",
      note: "Cooking family food for your toddler, not separate baby-food purchases — 24 months.",
      range: { low: 1500 * 24 * babies, high: 2500 * 24 * babies },
    },
    {
      label: "Clothing as they grow (years 2–3)",
      note: "Periodic replacement as sizes change — 24 months.",
      range: { low: 500 * 24 * babies, high: 1000 * 24 * babies },
    },
    {
      label: "Everyday play & learning materials (years 2–3)",
      note: "Books, crayons, blocks — everyday materials, no special purchases needed — 24 months.",
      range: { low: 300 * 24, high: 500 * 24 },
    },
  ];

  stages.push({
    key: "toddler",
    label: "Toddler years, 1–3",
    lines: toddlerLines,
    subtotal: sumRanges(toddlerLines.map((l) => l.range)),
  });

  const total = sumRanges(stages.map((s) => s.subtotal));

  return { stages, total, schemeCallouts: Array.from(new Set(schemeCallouts)) };
}

export function formatINR(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}
