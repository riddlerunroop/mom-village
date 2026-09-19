import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { hasActiveSubscription } from "@/lib/subscription";
import LockedPreview from "@/components/LockedPreview";
import { CATEGORY_FAMILIES, familyLabel } from "@/lib/rediscoverCategories";
import MessageButton from "@/components/rediscover/MessageButton";
import ReportButton from "@/components/rediscover/ReportButton";
import NeedManager from "./NeedManager";

// Rediscover — Collaborate: "I want to build something with another
// mother." The Find Collaborators feed, over rediscover_needs — every
// "looking for" post across all categories, filterable the same way Find
// filters listings. Because needs carry the same category tags as
// listings, this works as a filtered feed rather than a matching
// algorithm — no AI matching needed for V1.

export default async function CollaboratePage({
  searchParams,
}: {
  searchParams: Promise<{ family?: string }>;
}) {
  const { family } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isSubscribed = await hasActiveSubscription(supabase, user!.id);

  let needs: {
    id: string;
    category_family: string;
    category: string;
    note: string;
    user_id: string;
  }[] = [];
  let authorNames: Record<string, string> = {};
  let myNeeds: { id: string; category_family: string; category: string; note: string; is_active: boolean }[] = [];

  if (isSubscribed) {
    const { data: blockedRows } = await supabase
      .from("user_blocks")
      .select("blocked_id")
      .eq("blocker_id", user!.id);
    const blockedIds = (blockedRows || []).map((b) => b.blocked_id);

    let query = supabase
      .from("rediscover_needs")
      .select("id, category_family, category, note, user_id")
      .eq("is_active", true)
      .neq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(60);

    if (family) query = query.eq("category_family", family);
    if (blockedIds.length > 0) query = query.not("user_id", "in", `(${blockedIds.join(",")})`);

    const { data } = await query;
    needs = data ?? [];

    if (needs.length > 0) {
      const { data: names } = await supabase
        .from("community_author_names")
        .select("id, mom_name")
        .in("id", [...new Set(needs.map((n) => n.user_id))]);
      authorNames = Object.fromEntries((names ?? []).map((n) => [n.id, n.mom_name || "A mother in the Village"]));
    }

    const { data: mine } = await supabase
      .from("rediscover_needs")
      .select("id, category_family, category, note, is_active")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });
    myNeeds = mine ?? [];
  }

  return (
    <main className="max-w-[900px] mx-auto px-6 py-10">
      <Link href="/dashboard/rediscover" className="text-xs text-ink/50 hover:text-indigo mb-4 inline-block">
        ← Rediscover
      </Link>
      <div className="mb-2 text-xs uppercase tracking-[0.12em] text-gold-deep font-semibold">
        🤝 collaborate · find collaborators
      </div>
      <h1 className="font-display text-[28px] text-indigo mb-2">
        What mothers are looking for
      </h1>
      <p className="text-sm text-ink/65 mb-6 max-w-[560px]">
        A manufacturer, a photographer, a promoter, a collaborator — post
        what you need, or see what other mothers are looking for and reach
        out if you can help.
      </p>

      {!isSubscribed ? (
        <LockedPreview
          title="Find collaborators in your Village"
          teaser="Join to post what you're looking for, and see what other mothers need."
        />
      ) : (
        <>
          <div className="flex flex-wrap gap-2 mb-6">
            <Link
              href="/dashboard/rediscover/collaborate"
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${
                !family ? "bg-indigo text-ivory border-indigo" : "border-line text-ink/60"
              }`}
            >
              All
            </Link>
            {CATEGORY_FAMILIES.map((f) => (
              <Link
                key={f.key}
                href={`/dashboard/rediscover/collaborate?family=${f.key}`}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${
                  family === f.key ? "bg-indigo text-ivory border-indigo" : "border-line text-ink/60"
                }`}
              >
                {f.label}
              </Link>
            ))}
          </div>

          <div className="space-y-3 mb-10">
            {needs.length === 0 && (
              <p className="text-sm text-ink/55">Nothing here yet — check back, or post your own below.</p>
            )}
            {needs.map((need) => (
              <div key={need.id} className="bg-ivory-2 rounded-xl border border-line p-4">
                <div className="text-[11px] uppercase tracking-wide font-bold text-sage-deep mb-1">
                  {familyLabel(need.category_family)} · {need.category}
                </div>
                <p className="text-sm text-ink/75 mb-2">{need.note}</p>
                <p className="text-xs text-ink/45 mb-3">{authorNames[need.user_id]}</p>
                <div className="flex items-center gap-3">
                  <MessageButton otherUserId={need.user_id} relatedNeedId={need.id} isOwnProfile={false} />
                  <ReportButton needId={need.id} />
                </div>
              </div>
            ))}
          </div>

          <NeedManager initialNeeds={myNeeds} />
        </>
      )}
    </main>
  );
}
