import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { hasActiveSubscription } from "@/lib/subscription";
import LockedPreview from "@/components/LockedPreview";
import ShowcaseManager from "./ShowcaseManager";

// Rediscover — Showcase: "I have a product, talent, skill, or business."
// Managing her own listings — a small shop, not one giant listing, per
// Mother -> Rediscover Profile -> multiple Listings.

export default async function ShowcasePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isSubscribed = await hasActiveSubscription(supabase, user!.id);

  if (!isSubscribed) {
    return (
      <main className="max-w-[900px] mx-auto px-6 py-10">
        <Link href="/dashboard/rediscover" className="text-xs text-ink/50 hover:text-indigo mb-4 inline-block">
          ← Rediscover
        </Link>
        <LockedPreview
          title="Showcase what you make or offer"
          teaser="Join to list your products, skills, or business for other mothers to find."
        />
      </main>
    );
  }

  const { data: listings } = await supabase
    .from("rediscover_listings")
    .select("id, category_family, category, title, description, is_active")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <main className="max-w-[900px] mx-auto px-6 py-10">
      <Link href="/dashboard/rediscover" className="text-xs text-ink/50 hover:text-indigo mb-4 inline-block">
        ← Rediscover
      </Link>
      <div className="mb-2 text-xs uppercase tracking-[0.12em] text-gold-deep font-semibold">
        ✨ showcase
      </div>
      <h1 className="font-display text-[28px] text-indigo mb-2">
        What you make or offer
      </h1>
      <p className="text-sm text-ink/65 mb-8 max-w-[560px]">
        Add one listing per product, skill, or service — you can have as
        many as you like. Hide or delete any of them any time.
      </p>

      <ShowcaseManager initialListings={listings ?? []} />
    </main>
  );
}
