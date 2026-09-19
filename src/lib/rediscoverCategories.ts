// Rediscover — shared category taxonomy, 2026-09-19.
//
// Five broad browsing "families" (DB-checked on rediscover_listings and
// rediscover_needs) each holding a handful of specific tags (app-enforced
// text, not DB-checked — same convention as user_care_profile.health_flags
// elsewhere in this project, so the tag list can grow without a migration).
//
// DELIBERATELY EXCLUDED, Roop's explicit decision: Legal services,
// financial/investment advisory, and medical/health-advice categories are
// not listed anywhere below. Fashion, photography, tutoring, baking,
// design, and manufacturing already give real density for V1 — adding any
// of the excluded categories back needs her own legal review first, not
// just a code change. Do not add a "Legal", "Financial Advisory",
// "Investment", or "Medical/Health Advice" tag without that review.
//
// Copy-paste-safe, pure logic — mirrored verbatim in
// mobile/lib/rediscoverCategories.ts, same pattern as every other shared
// calculator/constant in this project.

export type RediscoverCategoryFamily =
  | "products"
  | "creative_services"
  | "professional_services"
  | "business_operations"
  | "promotion_creators";

export const CATEGORY_FAMILIES: {
  key: RediscoverCategoryFamily;
  label: string;
  blurb: string;
  categories: string[];
}[] = [
  {
    key: "products",
    label: "Products",
    blurb: "Things a mother makes and sells — one piece at a time or a small shop's worth.",
    categories: [
      "Fashion",
      "Food & Baking",
      "Jewellery",
      "Art",
      "Crafts & Handmade",
      "Beauty Products",
      "Home & Décor",
      "Kids",
      "Digital Products",
      "Other",
    ],
  },
  {
    key: "creative_services",
    label: "Creative Services",
    blurb: "Design, words, images, and content — made for someone else's brand or idea.",
    categories: [
      "Graphic Design",
      "Photography",
      "Writing",
      "Content Creation",
      "Social Media",
      "Fashion Design",
      "Interior Design",
      "Other",
    ],
  },
  {
    key: "professional_services",
    label: "Professional Services",
    blurb: "Skills a business or another mother might need help with.",
    categories: [
      "Admin Support",
      "Marketing",
      "Technology",
      "Consulting",
      "Translation",
      "Teaching & Tutoring",
      "Bookkeeping",
      "Other",
    ],
  },
  {
    key: "business_operations",
    label: "Business & Operations",
    blurb: "The behind-the-scenes work that gets a product made, packed, and delivered.",
    categories: [
      "Manufacturing",
      "Sourcing",
      "Packaging",
      "Logistics",
      "Sales & Distribution",
      "E-commerce Setup",
      "Other",
    ],
  },
  {
    key: "promotion_creators",
    label: "Promotion & Creators",
    blurb: "Mothers with an audience or reach, open to promoting other mothers' work.",
    categories: [
      "Influencer / Content Creator",
      "Affiliate / Commission Promotion",
      "User-Generated Content",
      "Social Promotion",
      "Other",
    ],
  },
];

export function familyLabel(key: string): string {
  return CATEGORY_FAMILIES.find((f) => f.key === key)?.label ?? key;
}

export function categoriesForFamily(key: string): string[] {
  return CATEGORY_FAMILIES.find((f) => f.key === key)?.categories ?? [];
}

// The Explore doorway's curated front door — a plain, static list of
// "could this be your thing?" ideas for a mother who doesn't know what she
// wants to do yet. Deliberately no tracking, no scoring, no algorithm —
// each just links into browsing that category. The full passion-discovery
// experiment/pattern-detection engine from the original brainstorm stays
// deferred to a later version.
export const EXPLORE_PROMPTS: { category: string; family: RediscoverCategoryFamily }[] = [
  { category: "Graphic Design", family: "creative_services" },
  { category: "Photography", family: "creative_services" },
  { category: "Food & Baking", family: "products" },
  { category: "Teaching & Tutoring", family: "professional_services" },
  { category: "Content Creation", family: "creative_services" },
  { category: "Fashion", family: "products" },
  { category: "Writing", family: "creative_services" },
  { category: "Marketing", family: "professional_services" },
  { category: "Crafts & Handmade", family: "products" },
  { category: "Interior Design", family: "creative_services" },
  { category: "Translation", family: "professional_services" },
  { category: "Technology", family: "professional_services" },
];
