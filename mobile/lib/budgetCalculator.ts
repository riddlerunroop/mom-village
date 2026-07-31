// The ₹49 Minimum Budget Planner — the low-friction front-door product,
// also embedded as a tab inside the Wealth pillar.
//
// Philosophy: show her the REAL minimum, not an inflated, marketing-driven
// "must-buy" list. Every figure below is a deliberately conservative,
// budget-conscious estimate for urban India, 2026 — not a guarantee, not
// a premium/aspirational number. Actual costs vary by city, hospital, and
// personal choices; the calculator says so explicitly in its output.
//
// Sources behind the base figures (see chat verification pass, 2026-07-21):
// - JSSK: free delivery incl. C-section, drugs, diagnostics, blood, food,
//   transport at public health institutions (NHM).
// - PMSMA: free antenatal checkups on the 9th of every month, 2nd/3rd trimester.
// - PMMVY: ₹5,000 cash benefit for first child (₹6,000 for a second child
//   if a girl), paid directly to the mother.
// - UIP: free routine immunizations at government facilities.
// - Private delivery costs, disposable/cloth diaper costs, and formula
//   costs are typical low-to-mid-range 2026 market figures, not premium,
//   pegged to a tier-2-city baseline (see cityTier below for adjustment).
//
// 2026-07-28 additions (Roop's site-review backlog, item 9): city/cost-range
// input, insurance/government-coverage input, richer hand-me-down detail,
// and a necessity tag (essential / optional / can skip for now) on every
// line so she can see not just "what it costs" but "what actually has to
// be bought now." City-tier and insurance adjustments are deliberately kept
// directional rather than precisely sourced — real hospital pricing varies
// too much to responsibly claim a verified multiplier, so the copy says so.

export type DeliveryFacility = "public" | "private";
export type DeliveryTypeChoice = "normal" | "c_section" | "not_sure";
export type FeedingPlan = "breastfeeding" | "formula" | "undecided";
export type DiaperingPlan = "cloth" | "disposable" | "mixed";
export type CityTier = "metro" | "tier2" | "tier3_or_rural";
export type InsuranceCoverage =
  | "private_insurance"
  | "government_scheme"
  | "none"
  | "not_sure";
export type HandMeDownCategory =
  | "clothing_bedding"
  | "diapering_supplies"
  | "furniture"
  | "feeding_gear";

export const HAND_ME_DOWN_CATEGORY_LABELS: Record<HandMeDownCategory, string> = {
  clothing_bedding: "Clothing & bedding",
  diapering_supplies: "Diapering supplies",
  furniture: "Furniture (cot, stroller)",
  feeding_gear: "Feeding gear (bottles, pump)",
};

export interface BudgetCalculatorInput {
  currentlyPregnant: boolean;
  babyCount: number;
  deliveryFacility: DeliveryFacility;
  deliveryType: DeliveryTypeChoice;
  cityTier: CityTier;
  insuranceCoverage: InsuranceCoverage;
  feedingPlan: FeedingPlan;
  diaperingPlan: DiaperingPlan;
  hasHandMeDowns: boolean;
  handMeDownCategories: HandMeDownCategory[];
}

export interface CostRange {
  low: number;
  high: number;
}

export type Necessity = "essential" | "optional" | "skip_for_now";

export const NECESSITY_LABELS: Record<Necessity, string> = {
  essential: "Essential",
  optional: "Worth budgeting for",
  skip_for_now: "Can skip for now",
};

export interface BudgetLine {
  label: string;
  note: string;
  range: CostRange;
  necessity: Necessity;
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
  necessityTotals: Record<Necessity, CostRange>;
  schemeCallouts: string[];
}

function sumRanges(ranges: CostRange[]): CostRange {
  return ranges.reduce(
    (acc, r) => ({ low: acc.low + r.low, high: acc.high + r.high }),
    { low: 0, high: 0 }
  );
}

// City-tier adjustment applies only to private delivery cost — the one line
// item where real-world city cost gaps are largest. Deliberately a
// directional widen/narrow of the range, not a precisely sourced multiplier
// (flagged as such in the line's own note).
const CITY_DELIVERY_MULTIPLIER: Record<CityTier, { low: number; high: number }> = {
  metro: { low: 1.2, high: 1.4 },
  tier2: { low: 1, high: 1 },
  tier3_or_rural: { low: 0.6, high: 0.8 },
};

const CITY_TIER_LABELS: Record<CityTier, string> = {
  metro: "a metro city",
  tier2: "a tier-2 city",
  tier3_or_rural: "a smaller town or rural area",
};

export function calculateMinimumBudget(input: BudgetCalculatorInput): BudgetResult {
  const babies = Math.max(1, input.babyCount || 1);
  const schemeCallouts: string[] = [];
  const stages: BudgetStage[] = [];

  const catSet = new Set(input.hasHandMeDowns ? input.handMeDownCategories : []);
  const clothingMultiplier = catSet.has("clothing_bedding") ? 0.4 : 1;
  const diaperingMultiplier = catSet.has("diapering_supplies") ? 0.4 : 1;
  const furnitureMultiplier = catSet.has("furniture") ? 0.4 : 1;
  const feedingGearMultiplier = catSet.has("feeding_gear") ? 0.4 : 1;

  // ---- Stage 1: Pregnancy & delivery ----
  if (input.currentlyPregnant) {
    const deliveryLines: BudgetLine[] = [];

    if (input.deliveryFacility === "public") {
      deliveryLines.push({
        label: "Delivery (incl. C-section if needed)",
        note: "Free at public facilities under JSSK, including drugs, diagnostics, and transport.",
        range: { low: 0, high: 3000 },
        necessity: "essential",
      });
      schemeCallouts.push(
        "JSSK covers free delivery, C-section, medicines, diagnostics, blood, food, and transport at government facilities."
      );
    } else {
      const isCsection = input.deliveryType === "c_section";
      const mult = CITY_DELIVERY_MULTIPLIER[input.cityTier];
      const base = isCsection ? { low: 100000, high: 180000 } : { low: 60000, high: 120000 };
      deliveryLines.push({
        label: isCsection ? "C-section delivery (private)" : "Delivery (private)",
        note: `Typical mid-range private hospital cost for ${CITY_TIER_LABELS[input.cityTier]}. This is a directional adjustment, not a precise citywide average — actual hospital pricing varies a lot, so confirm with hospitals near you.`,
        range: {
          low: Math.round(base.low * mult.low),
          high: Math.round(base.high * mult.high),
        },
        necessity: "essential",
      });

      if (input.insuranceCoverage === "private_insurance") {
        schemeCallouts.push(
          "If your health insurance includes maternity cover, your actual out-of-pocket delivery cost could be much lower than shown — check your policy's maternity waiting period and sub-limits before you rely on it."
        );
      } else if (input.insuranceCoverage === "government_scheme") {
        schemeCallouts.push(
          "If you're covered under Ayushman Bharat (PM-JAY), CGHS, ESI, or a similar government health scheme and deliver at an empanelled hospital, your cost could be significantly lower or free — check your scheme's hospital list before you plan around the private estimate shown."
        );
      } else if (input.insuranceCoverage === "not_sure") {
        schemeCallouts.push(
          "Worth checking now, before delivery: whether you have any health insurance or government scheme coverage (through an employer, family policy, or Ayushman Bharat/CGHS/ESI) that could lower this cost."
        );
      }
    }

    deliveryLines.push({
      label: "Antenatal checkups & basic tests",
      note: "Free under PMSMA (2nd/3rd trimester govt. checkups); minor cost for extra private visits/tests.",
      range: { low: 0, high: 5000 },
      necessity: "essential",
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

  newbornLines.push({
    label: "Basic clothing, bedding, mosquito net, bathing",
    note:
      clothingMultiplier < 1
        ? "Lower end since you already have clothing & bedding hand-me-downs — top up only what's missing."
        : "5–7 clothing sets, basic bedding, mosquito net, bathing basics — no premium items needed.",
    range: {
      low: Math.round(5000 * clothingMultiplier * babies),
      high: Math.round(8000 * clothingMultiplier * babies),
    },
    necessity: "essential",
  });

  newbornLines.push({
    label: "Furniture (cot/crib, stroller) & feeding basics",
    note:
      furnitureMultiplier < 1 || feedingGearMultiplier < 1
        ? "Lower end since you already have some of this from hand-me-downs — top up only what's missing."
        : "A safe sleep space, a basic stroller or carrier, bottles/feeding basics — secondhand and budget options work fine here. Many families skip a separate cot or stroller entirely, which is why this is optional, not essential.",
    range: {
      low: Math.round(4000 * ((furnitureMultiplier + feedingGearMultiplier) / 2) * babies),
      high: Math.round(9000 * ((furnitureMultiplier + feedingGearMultiplier) / 2) * babies),
    },
    necessity: "optional",
  });

  if (input.diaperingPlan === "cloth") {
    newbornLines.push({
      label: "Cloth diaper starter stash",
      note:
        diaperingMultiplier < 1
          ? "Lower end since you already have some diapering supplies — top up only what's missing."
          : "One-time cost — a full stash that lasts infancy through toddlerhood.",
      range: {
        low: Math.round(6000 * diaperingMultiplier * babies),
        high: Math.round(12000 * diaperingMultiplier * babies),
      },
      necessity: "essential",
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
      necessity: "essential",
    });
  } else if (input.feedingPlan === "undecided") {
    firstYearLines.push({
      label: "Feeding (12 months)",
      note: "Breastfeeding costs close to nothing directly; shown here as a placeholder in case formula becomes necessary.",
      range: { low: 0, high: 3000 * 12 * babies },
      necessity: "optional",
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
      necessity: "essential",
    });
  } else {
    firstYearLines.push({
      label: "Diapering — laundry/upkeep (12 months)",
      note: "Cloth stash already covered above; this is just ongoing washing costs.",
      range: { low: 300 * 12, high: 500 * 12 },
      necessity: "essential",
    });
  }

  firstYearLines.push({
    label: "Immunizations",
    note: "Free under the government Universal Immunization Programme at public facilities.",
    range: { low: 0, high: 0 },
    necessity: "essential",
  });
  schemeCallouts.push(
    "Routine immunizations are free under the Universal Immunization Programme at government facilities."
  );

  firstYearLines.push({
    label: "Doctor visits, minor medicines, misc.",
    note: "Modest ongoing buffer for the first year — not a fixed cost, but sensible to set aside.",
    range: { low: 3000 * babies, high: 8000 * babies },
    necessity: "optional",
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
      necessity: "essential",
    },
    {
      label: "Clothing as they grow (years 2–3)",
      note: "Periodic replacement as sizes change — 24 months.",
      range: { low: 500 * 24 * babies, high: 1000 * 24 * babies },
      necessity: "essential",
    },
    {
      label: "Everyday play & learning materials (years 2–3)",
      note: "Books, crayons, blocks — everyday materials, no special purchases needed. Easy to defer or improvise with things you already have at home — 24 months.",
      range: { low: 300 * 24, high: 500 * 24 },
      necessity: "skip_for_now",
    },
  ];

  stages.push({
    key: "toddler",
    label: "Toddler years, 1–3",
    lines: toddlerLines,
    subtotal: sumRanges(toddlerLines.map((l) => l.range)),
  });

  const total = sumRanges(stages.map((s) => s.subtotal));

  const allLines = stages.flatMap((s) => s.lines);
  const necessityTotals: Record<Necessity, CostRange> = {
    essential: sumRanges(allLines.filter((l) => l.necessity === "essential").map((l) => l.range)),
    optional: sumRanges(allLines.filter((l) => l.necessity === "optional").map((l) => l.range)),
    skip_for_now: sumRanges(
      allLines.filter((l) => l.necessity === "skip_for_now").map((l) => l.range)
    ),
  };

  return {
    stages,
    total,
    necessityTotals,
    schemeCallouts: Array.from(new Set(schemeCallouts)),
  };
}

export function formatINR(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}
