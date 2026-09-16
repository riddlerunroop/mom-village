import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { hasActiveSubscription } from "@/lib/subscription";
import LockedPreview from "@/components/LockedPreview";
import HeartButton from "./HeartButton";
import ReportButton from "../[threadId]/ReportButton";

// Reset Gallery — "discovery, not relationship-building" per Roop's own
// framing. Deliberately NOT the same shape as the Community thread list:
// no replies, no threading, just a browsable grid and a heart tap. Default
// sort is chronological (newest first), never algorithmic — she scrolls as
// far as she wants via "Show more," which is a real, unbounded amount of
// content if she chooses it, not an auto-loading feed pushing her to keep
// going. See migration_59_reset_feature_schema.sql and CLAUDE.md's Reset
// rebuild entry for the full design conversation.

const PAGE_SIZE = 30;

type ShareRow = {
  id: string;
  user_id: string;
  activity_id: string | null;
  media_type: "text" | "photo" | "video" | "audio";
  media_path: string | null;
  caption: string | null;
  heart_count: number;
  created_at: string;
};

export default async function ResetGalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ limit?: string }>;
}) {
  const { limit: limitParam } = await searchParams;
  const limit = Math.min(300, Math.max(PAGE_SIZE, Number(limitParam) || PAGE_SIZE));

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isSubscribed = await hasActiveSubscription(supabase, user!.id);

  let shares: ShareRow[] = [];
  let totalCount = 0;
  let namesByUserId: Record<string, string> = {};
  let heartedShareIds = new Set<string>();
  let activityById: Record<string, { emoji: string; title: string }> = {};

  if (isSubscribed) {
    const { data: blockedRows } = await supabase
      .from("user_blocks")
      .select("blocked_id")
      .eq("blocker_id", user!.id);
    const blockedIds = (blockedRows || []).map((b) => b.blocked_id);

    let query = supabase
      .from("reset_shares")
      .select(
        "id, user_id, activity_id, media_type, media_path, caption, heart_count, created_at",
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    if (blockedIds.length > 0) {
      query = query.not("user_id", "in", `(${blockedIds.join(",")})`);
    }

    const { data, count } = await query;
    shares = (data || []) as ShareRow[];
    totalCount = count ?? shares.length;

    if (shares.length > 0) {
      const userIds = Array.from(new Set(shares.map((s) => s.user_id)));
      const { data: authors } = await supabase
        .from("community_author_names")
        .select("id, mom_name")
        .in("id", userIds);
      namesByUserId = Object.fromEntries(
        (authors || []).map((a) => [a.id, a.mom_name || "A mom in the village"])
      );

      const { data: heartRows } = await supabase
        .from("reset_share_hearts")
        .select("share_id")
        .eq("user_id", user!.id)
        .in(
          "share_id",
          shares.map((s) => s.id)
        );
      heartedShareIds = new Set((heartRows || []).map((h) => h.share_id));

      const activityIds = Array.from(
        new Set(shares.map((s) => s.activity_id).filter((id): id is string => Boolean(id)))
      );
      if (activityIds.length > 0) {
        const { data: acts } = await supabase
          .from("reset_activities")
          .select("id, emoji, title")
          .in("id", activityIds);
        activityById = Object.fromEntries(
          (acts || []).map((a) => [a.id, { emoji: a.emoji, title: a.title }])
        );
      }
    }
  }

  return (
    <main className="max-w-[960px] mx-auto px-6 py-10">
      <Link
        href="/dashboard/community"
        className="text-xs font-semibold text-ink/45 hover:text-indigo mb-3 inline-block"
      >
        ← Community
      </Link>
      <div className="mb-2 text-xs uppercase tracking-[0.12em] text-terracotta font-semibold">
        discovery, not a discussion
      </div>
      <h1 className="font-display text-[30px] text-indigo mb-2">Reset Gallery</h1>
      <p className="text-sm text-ink/65 mb-8 max-w-[560px]">
        See how other mothers are resetting today — no comments, no
        following, just a heart if something makes you smile. Want to
        actually talk to someone? That&apos;s what{" "}
        <Link href="/dashboard/community" className="text-terracotta underline">
          Community
        </Link>{" "}
        is for.
      </p>

      {!isSubscribed ? (
        <LockedPreview
          title="Join to see the village's Resets"
          teaser="Membership unlocks Community, Reset, and everything else."
        />
      ) : shares.length === 0 ? (
        <div className="bg-ivory-2 rounded-2xl border border-line p-8 text-center">
          <p className="font-display italic text-lg text-sage-deep">
            Nobody&apos;s shared a Reset yet — be the first.
          </p>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {shares.map((s) => {
              const publicUrl = s.media_path
                ? supabase.storage.from("reset-shares").getPublicUrl(s.media_path).data.publicUrl
                : null;
              const act = s.activity_id ? activityById[s.activity_id] : null;
              return (
                <div key={s.id} className="bg-ivory-2 rounded-2xl border border-line p-4 flex flex-col">
                  {act && (
                    <p className="text-[11px] font-semibold text-terracotta mb-2">
                      {act.emoji} {act.title}
                    </p>
                  )}

                  {s.media_type === "text" && (
                    <p className="text-[13.5px] text-ink/80 italic mb-3">&ldquo;{s.caption}&rdquo;</p>
                  )}

                  {s.media_type === "photo" && publicUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={publicUrl}
                      alt={s.caption || "A mother's Reset"}
                      className="w-full rounded-xl mb-3 max-h-[240px] object-cover"
                    />
                  )}

                  {s.media_type === "video" && publicUrl && (
                    <video src={publicUrl} controls className="w-full rounded-xl mb-3 max-h-[240px]" />
                  )}

                  {s.media_type === "audio" && publicUrl && (
                    <audio src={publicUrl} controls className="w-full mb-3" />
                  )}

                  {s.media_type !== "text" && s.caption && (
                    <p className="text-[12.5px] text-ink/70 mb-3">{s.caption}</p>
                  )}

                  <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                    <div>
                      <p className="text-[12px] font-semibold text-sage-deep">
                        {namesByUserId[s.user_id]}
                      </p>
                      <p className="text-[10.5px] text-ink/40">
                        {new Date(s.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <HeartButton
                        shareId={s.id}
                        initialHearted={heartedShareIds.has(s.id)}
                        initialCount={s.heart_count}
                      />
                      <ReportButton resetShareId={s.id} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {shares.length < totalCount && (
            <div className="text-center mt-8">
              <Link
                href={`/dashboard/community/reset-gallery?limit=${limit + PAGE_SIZE}`}
                className="text-sm font-semibold text-terracotta underline"
              >
                Show more
              </Link>
            </div>
          )}
        </>
      )}
    </main>
  );
}
