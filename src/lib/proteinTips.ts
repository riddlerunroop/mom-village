// Supplementary veg/non-veg protein tips — added 2026-07-29, alongside the
// new diet_preference care-quiz question. Deliberately a light,
// non-branching addition shown next to the Nourish card, not a rewrite of
// all 196 already-locked weeks' Nourish text (confirmed scope with Roop:
// "a supplementary tip layer," not a full per-week recipe retrofit).
//
// The one numeric claim here — protein needs rising to roughly 55-70g/day
// during pregnancy and lactation, depending on stage — is the ICMR-NIN
// 2020 Recommended Dietary Allowance for Indians: baseline 46g/day for
// women, +9.5g in the 2nd trimester (~55.5g), +22g in the 3rd trimester
// (~68g), +17g while breastfeeding for the first 6 months (~63g), +13g for
// months 7-12 (~59g). Independently verified via WebSearch before writing
// this, matching this project's standing verification practice.

export type DietPreference = "vegetarian" | "non_vegetarian";

export const PROTEIN_TIP: Record<DietPreference, { headline: string; tips: string[] }> = {
  vegetarian: {
    headline:
      "Protein needs are higher than usual through pregnancy and while breastfeeding — roughly 55-70g a day, per ICMR-NIN guidelines, depending on your stage.",
    tips: [
      "A bowl of dal, rajma, or chana with every meal",
      "A cube of paneer or tofu, cooked in or eaten as a snack",
      "A glass of milk, or a spoon of peanut butter",
      "A handful of nuts or roasted chana between meals",
    ],
  },
  non_vegetarian: {
    headline:
      "Protein needs are higher than usual through pregnancy and while breastfeeding — roughly 55-70g a day, per ICMR-NIN guidelines, depending on your stage.",
    tips: [
      "An egg or two at breakfast",
      "A portion of chicken, fish, or eggs at one main meal",
      "Dal or a glass of milk alongside, even on non-veg days",
      "A handful of nuts between meals",
    ],
  },
};
