// Metadata for every book in the Library. Content (paginated JSON) only
// exists for books that have been wired up so far — see `hasReader` below.
// This is intentionally static, not a DB table: the books themselves are
// fixed editorial content, not user data.

export type LibrarySeries = "wealth" | "parenting";

export interface LibraryBookMeta {
  slug: string;
  title: string;
  tagline: string;
  series: LibrarySeries;
  seriesLabel: string;
  cover: string; // path under /public
  hasReader: boolean; // true once its paginated content JSON exists
}

export const LIBRARY_BOOKS: LibraryBookMeta[] = [
  {
    slug: "money-understood",
    title: "Money, Understood",
    tagline: "Because confidence begins with permission to not know yet.",
    series: "wealth",
    seriesLabel: "Wealth & Financial Confidence Series",
    cover: "/library-covers/money-understood.png",
    hasReader: true,
  },
  {
    slug: "creating-your-own-opportunities",
    title: "Creating Your Own Opportunities",
    tagline: "Practical ways to learn, work, and earn around motherhood—without pressure.",
    series: "wealth",
    seriesLabel: "Wealth & Financial Confidence Series",
    cover: "/library-covers/creating-your-own-opportunities.png",
    hasReader: true,
  },
  {
    slug: "building-your-financial-security",
    title: "Building Your Financial Security",
    tagline: "Practical ways to protect your independence, grow lasting wealth, and prepare for life's changes.",
    series: "wealth",
    seriesLabel: "Wealth & Financial Confidence Series",
    cover: "/library-covers/building-your-financial-security.png",
    hasReader: true,
  },
  {
    slug: "understanding-your-little-one",
    title: "Understanding Your Little One",
    tagline: "A practical companion from preparing for your baby's arrival through the first two years.",
    series: "parenting",
    seriesLabel: "Parenting Series",
    cover: "/library-covers/understanding-your-little-one.png",
    hasReader: true,
  },
  {
    slug: "guiding-your-growing-child",
    title: "Guiding Your Growing Child",
    tagline: "A practical companion for connection, boundaries and the early childhood years.",
    series: "parenting",
    seriesLabel: "Parenting Series",
    cover: "/library-covers/guiding-your-growing-child.png",
    hasReader: true,
  },
  {
    slug: "supporting-your-childs-growing-independence",
    title: "Supporting Your Child's Growing Independence",
    tagline: "A practical companion for the school years, adolescence and the journey towards adulthood.",
    series: "parenting",
    seriesLabel: "Parenting Series",
    cover: "/library-covers/supporting-your-childs-growing-independence.png",
    hasReader: true,
  },
];

export function getBookMeta(slug: string): LibraryBookMeta | undefined {
  return LIBRARY_BOOKS.find((b) => b.slug === slug);
}
