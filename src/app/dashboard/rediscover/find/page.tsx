import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { hasActiveSubscription } from "@/lib/subscription";
import LockedPreview from "@/components/LockedPreview";
import { CATEGORY_FAMILIES, familyLabel } from "@/lib/rediscoverCategories";

// Rediscover — Find: "I need a product, service, or skill." Browsing works
// like Spotify's genre pages, not a search-only directory — a mother
// filters by family/category rather than guessing search terms. No
// matching algorithm in V1; category tags do the work.

export default async function FindPage({
  searchParams,
}: {
  searchParams: Promise<{ family?: string; category?: string }>;
}) {
  const { family, category } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isSubscribed = await hasActiveSubscription(supabase, user!.id);

  let listings: {
    id: string;
    category_family: string;
    category: string;
    title: string;
    description: string | null;
    user_id: string;
  }[] = [];
  let authorNames: Record<string, string> = {};

  if (isSubscribed) {
    const { data: blockedRows } = await supabase
      .from("user_blocks")
      .select("blocked_id")
      .eq("blocker_id", user!.id);
    const blockedIds = (blockedRows || []).map((b) => b.blocked_id);

    let query = supabase
      .from("rediscover_listings")
      .select("id, category_family, category, title, description, user_id")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(60);

    if (family) query = query.eq("category_family", family);
    if (category) query = query.eq("category", category);
    if (blockedIds.length > 0) query = query.not("user_id", "in", `(${blockedIds.join(",")})`);

    const { data } = await query;
    listings = data ?? [];

    if (listings.length > 0) {
      const { data: names } = await supabase
        .from("community_author_names")
        .select("id, mom_name")
        .in(
          "id",
          [...new Set(listings.map((l) => l.user_id))]
        );
      authorNames = Object.fromEntries((names ?? []).map((n) => [n.id, n.mom_name || "A mother in the Village"]));
    }
  }

  return (
    <main className="max-w-[900px] mx-auto px-6 py-10">
      <Link href="/dashboard/rediscover" className="text-xs text-ink/50 hover:text-indigo mb-4 inline-block">
        ← Rediscover
      </Link>
      <div className="mb-2 text-xs uppercase tracking-[0.12em] text-gold-deep font-semibold">
        🔎 find
      </div>
      <h1 className="font-display text-[28px] text-indigo mb-6">
        {category ? category : family ? familyLabel(family) : "Browse what other mothers offer"}
      </h1>

      {!isSubscribed ? (
        <LockedPreview
          title="Find what other mothers offer"
          teaser="Join to browse products, skills, and businesses from mothers across the Village."
        />
      ) : (
        <>
          <div className="flex flex-wrap gap-2 mb-8">
            <Link
              href="/dashboard/rediscover/find"
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${
                !family ? "bg-indigo text-ivory border-indigo" : "border-line text-ink/60"
              }`}
            >
              All
            </Link>
            {CATEGORY_FAMILIES.map((f) => (
              <Link
                key={f.key}
                href={`/dashboard/rediscover/find?family=${f.key}`}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${
                  family === f.key ? "bg-indigo text-ivory border-indigo" : "border-line text-ink/60"
                }`}
              >
                {f.label}
              </Link>
            ))}
          </div>

          {listings.length === 0 ? (
            <p className="text-sm text-ink/55">
              Nothing here yet — be the first to{" "}
              <Link href="/dashboard/rediscover/showcase" className="text-gold-deep underline">
                add a listing
              </Link>{" "}
              in this category.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {listings.map((listing) => (
                <Link
                  key={listing.id}
                  href={`/dashboard/rediscover/listing/${listing.id}`}
                  className="block bg-ivory-2 rounded-2xl border border-line p-5 hover:border-gold-deep/40 transition-colors"
                >
                  <div className="text-[11px] uppercase tracking-wide font-bold text-sage-deep mb-1">
                    {familyLabel(listing.category_family)} · {listing.category}
                  </div>
                  <h3 className="font-display text-lg text-indigo mb-1">{listing.title}</h3>
                  {listing.description && (
                    <p className="text-sm text-ink/65 line-clamp-2">{listing.description}</p>
                  )}
                  <p className="text-xs text-ink/45 mt-2">{authorNames[listing.user_id]}</p>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}
