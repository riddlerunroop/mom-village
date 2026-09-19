import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { hasActiveSubscription } from "@/lib/subscription";
import LockedPreview from "@/components/LockedPreview";
import ProfileForm from "./ProfileForm";

// Rediscover Profile — the mother's identity inside Rediscover, extending
// her existing Village profile rather than a separate account. Listings
// (Showcase) and needs (Collaborate) are managed on their own screens, not
// crammed in here — this page is her headline, bio, location, and what
// she's generally open to.

export default async function RediscoverProfilePage() {
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
          title="Set up your Rediscover Profile"
          teaser="Join to build a profile other mothers can find."
        />
      </main>
    );
  }

  const [{ data: profile }, { count: listingCount }, { count: needCount }, { count: recommendCount }] =
    await Promise.all([
      supabase
        .from("user_rediscover_profile")
        .select("headline, bio, location, remote_ok, open_to_collaboration, open_to_work, open_to_promotion, is_active")
        .eq("user_id", user!.id)
        .maybeSingle(),
      supabase
        .from("rediscover_listings")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user!.id)
        .eq("is_active", true),
      supabase
        .from("rediscover_needs")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user!.id)
        .eq("is_active", true),
      supabase
        .from("rediscover_recommendations")
        .select("recommender_user_id", { count: "exact", head: true })
        .eq("recommended_user_id", user!.id),
    ]);

  return (
    <main className="max-w-[900px] mx-auto px-6 py-10">
      <Link href="/dashboard/rediscover" className="text-xs text-ink/50 hover:text-indigo mb-4 inline-block">
        ← Rediscover
      </Link>
      <h1 className="font-display text-[28px] text-indigo mb-2">Your Rediscover Profile</h1>
      <p className="text-sm text-ink/65 mb-6 max-w-[560px]">
        Everything below is yours to edit or leave blank. You control what
        shows — nothing here is shared outside Mom&apos;s Village.
      </p>

      <div className="grid sm:grid-cols-3 gap-3 mb-6">
        <Link
          href="/dashboard/rediscover/showcase"
          className="bg-ivory-2 rounded-xl border border-line p-4 hover:border-gold-deep/40 transition-colors"
        >
          <div className="text-2xl font-display text-indigo">{listingCount ?? 0}</div>
          <div className="text-xs text-ink/60">listing{listingCount === 1 ? "" : "s"} · manage →</div>
        </Link>
        <Link
          href="/dashboard/rediscover/collaborate"
          className="bg-ivory-2 rounded-xl border border-line p-4 hover:border-gold-deep/40 transition-colors"
        >
          <div className="text-2xl font-display text-indigo">{needCount ?? 0}</div>
          <div className="text-xs text-ink/60">thing{needCount === 1 ? "" : "s"} you&apos;re looking for · manage →</div>
        </Link>
        <div className="bg-ivory-2 rounded-xl border border-line p-4">
          <div className="text-2xl font-display text-indigo">{recommendCount ?? 0}</div>
          <div className="text-xs text-ink/60">mother{recommendCount === 1 ? "" : "s"} recommend you</div>
        </div>
      </div>

      <ProfileForm
        headline={profile?.headline ?? ""}
        bio={profile?.bio ?? ""}
        location={profile?.location ?? ""}
        remoteOk={profile?.remote_ok ?? false}
        openToCollaboration={profile?.open_to_collaboration ?? false}
        openToWork={profile?.open_to_work ?? false}
        openToPromotion={profile?.open_to_promotion ?? false}
        isActive={profile?.is_active ?? true}
      />
    </main>
  );
}
