import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasActiveSubscription } from "@/lib/subscription";
import LockedPreview from "@/components/LockedPreview";
import { familyLabel } from "@/lib/rediscoverCategories";
import RecommendButton from "@/components/rediscover/RecommendButton";
import SaveButton from "@/components/rediscover/SaveButton";
import ReportButton from "@/components/rediscover/ReportButton";
import MessageButton from "@/components/rediscover/MessageButton";
import ContactDisclaimer from "@/components/rediscover/ContactDisclaimer";
import BlockButton from "@/app/dashboard/community/[threadId]/BlockButton";

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isSubscribed = await hasActiveSubscription(supabase, user!.id);

  if (!isSubscribed) {
    return (
      <main className="max-w-[700px] mx-auto px-6 py-10">
        <Link href="/dashboard/rediscover" className="text-xs text-ink/50 hover:text-indigo mb-4 inline-block">
          ← Rediscover
        </Link>
        <LockedPreview title="See what this mother offers" teaser="Join to see the full listing and get in touch." />
      </main>
    );
  }

  const { data: listing } = await supabase
    .from("rediscover_listings")
    .select("id, category_family, category, title, description, user_id")
    .eq("id", id)
    .maybeSingle();

  if (!listing) notFound();

  const [{ data: profile }, { data: authorRow }, { count: recommendCount }, { data: myRecommend }, { data: mySaved }] =
    await Promise.all([
      supabase
        .from("user_rediscover_profile")
        .select("headline, bio, location, remote_ok, open_to_collaboration, open_to_work, open_to_promotion")
        .eq("user_id", listing.user_id)
        .maybeSingle(),
      supabase.from("community_author_names").select("mom_name").eq("id", listing.user_id).maybeSingle(),
      supabase
        .from("rediscover_recommendations")
        .select("recommender_user_id", { count: "exact", head: true })
        .eq("recommended_user_id", listing.user_id),
      supabase
        .from("rediscover_recommendations")
        .select("recommender_user_id")
        .eq("recommender_user_id", user!.id)
        .eq("recommended_user_id", listing.user_id)
        .maybeSingle(),
      supabase
        .from("user_rediscover_saved_listings")
        .select("listing_id")
        .eq("user_id", user!.id)
        .eq("listing_id", listing.id)
        .maybeSingle(),
    ]);

  const authorName = authorRow?.mom_name || "A mother in the Village";
  const isOwn = listing.user_id === user!.id;

  return (
    <main className="max-w-[700px] mx-auto px-6 py-10">
      <Link href="/dashboard/rediscover/find" className="text-xs text-ink/50 hover:text-indigo mb-4 inline-block">
        ← Find
      </Link>

      <div className="text-[11px] uppercase tracking-wide font-bold text-sage-deep mb-1">
        {familyLabel(listing.category_family)} · {listing.category}
      </div>
      <h1 className="font-display text-[28px] text-indigo mb-2">{listing.title}</h1>
      {listing.description && <p className="text-sm text-ink/70 leading-relaxed mb-6">{listing.description}</p>}

      <div className="bg-ivory-2 rounded-2xl border border-line p-5 mb-4">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div>
            <h2 className="font-semibold text-indigo">{authorName}</h2>
            {profile?.headline && <p className="text-sm text-ink/65">{profile.headline}</p>}
            {profile?.location && <p className="text-xs text-ink/45">{profile.location}{profile.remote_ok ? " · open to remote" : ""}</p>}
          </div>
          <RecommendButton
            recommendedUserId={listing.user_id}
            initialCount={recommendCount ?? 0}
            initialRecommended={Boolean(myRecommend)}
            isOwnProfile={isOwn}
          />
        </div>
        {profile?.bio && <p className="text-sm text-ink/65 mt-2">{profile.bio}</p>}
      </div>

      {!isOwn && (
        <>
          <ContactDisclaimer />
          <div className="flex items-center gap-3 mt-4 mb-2">
            <MessageButton otherUserId={listing.user_id} relatedListingId={listing.id} isOwnProfile={isOwn} />
            <SaveButton listingId={listing.id} initialSaved={Boolean(mySaved)} />
          </div>
          <div className="flex items-center gap-3 mt-1">
            <ReportButton listingId={listing.id} />
            <BlockButton userId={listing.user_id} authorName={authorName} />
          </div>
        </>
      )}

      {isOwn && (
        <p className="text-xs text-ink/45 mt-2">
          This is your own listing.{" "}
          <Link href="/dashboard/rediscover/showcase" className="text-gold-deep underline">
            Manage it here
          </Link>
          .
        </p>
      )}
    </main>
  );
}
