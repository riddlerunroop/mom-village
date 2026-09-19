"use client";

// Positive-only trust signal, per Roop's explicit call over an open 1-5
// rating: a mother can recommend a profile once, and can withdraw her own
// recommendation, but there is no way to leave a negative public mark on
// anyone. See CLAUDE.md's "Rediscover" entry for why.
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function RecommendButton({
  recommendedUserId,
  initialCount,
  initialRecommended,
  isOwnProfile,
}: {
  recommendedUserId: string;
  initialCount: number;
  initialRecommended: boolean;
  isOwnProfile: boolean;
}) {
  const supabase = createClient();
  const [count, setCount] = useState(initialCount);
  const [recommended, setRecommended] = useState(initialRecommended);
  const [busy, setBusy] = useState(false);

  if (isOwnProfile) {
    return (
      <span className="text-xs text-ink/50">
        Recommended by {count} mother{count === 1 ? "" : "s"}
      </span>
    );
  }

  async function toggle() {
    if (busy) return;
    setBusy(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setBusy(false);
      return;
    }

    if (recommended) {
      await supabase
        .from("rediscover_recommendations")
        .delete()
        .eq("recommender_user_id", user.id)
        .eq("recommended_user_id", recommendedUserId);
      setRecommended(false);
      setCount((c) => Math.max(0, c - 1));
    } else {
      await supabase.from("rediscover_recommendations").upsert(
        { recommender_user_id: user.id, recommended_user_id: recommendedUserId },
        { onConflict: "recommender_user_id,recommended_user_id" }
      );
      setRecommended(true);
      setCount((c) => c + 1);
    }
    setBusy(false);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors disabled:opacity-60 ${
        recommended
          ? "bg-sage-deep/10 border-sage-deep/40 text-sage-deep"
          : "border-line text-ink/60 hover:border-sage-deep/40"
      }`}
    >
      {recommended ? "♥ Recommended" : "♡ Recommend"} · {count}
    </button>
  );
}
