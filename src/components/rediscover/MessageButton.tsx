"use client";

// Real in-app private messaging — Roop's explicit call, 2026-09-19, over
// two lighter alternatives (an "I'm interested" signal, or exposing
// contact info on the profile). One conversation per pair of mothers
// (enforced by a unique index on the sorted pair in
// migration_65_rediscover_schema.sql), optionally tied to whichever
// listing or need started it.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function MessageButton({
  otherUserId,
  relatedListingId,
  relatedNeedId,
  isOwnProfile,
}: {
  otherUserId: string;
  relatedListingId?: string;
  relatedNeedId?: string;
  isOwnProfile: boolean;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (isOwnProfile) return null;

  async function startConversation() {
    setBusy(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setBusy(false);
      setError("Please log in again.");
      return;
    }

    const { data: existing } = await supabase
      .from("rediscover_conversations")
      .select("id")
      .or(
        `and(user_a.eq.${user.id},user_b.eq.${otherUserId}),and(user_a.eq.${otherUserId},user_b.eq.${user.id})`
      )
      .maybeSingle();

    if (existing) {
      router.push(`/dashboard/rediscover/messages/${existing.id}`);
      return;
    }

    const { data: created, error: insertError } = await supabase
      .from("rediscover_conversations")
      .insert({
        user_a: user.id,
        user_b: otherUserId,
        related_listing_id: relatedListingId ?? null,
        related_need_id: relatedNeedId ?? null,
      })
      .select("id")
      .single();

    if (insertError) {
      // Another request may have created it a moment earlier (race on the
      // unique pair index) — re-select rather than surface a hard error.
      const { data: retry } = await supabase
        .from("rediscover_conversations")
        .select("id")
        .or(
          `and(user_a.eq.${user.id},user_b.eq.${otherUserId}),and(user_a.eq.${otherUserId},user_b.eq.${user.id})`
        )
        .maybeSingle();
      setBusy(false);
      if (retry) {
        router.push(`/dashboard/rediscover/messages/${retry.id}`);
      } else {
        setError("Couldn't start the conversation — please try again.");
      }
      return;
    }

    router.push(`/dashboard/rediscover/messages/${created.id}`);
  }

  return (
    <div>
      <button
        type="button"
        onClick={startConversation}
        disabled={busy}
        className="text-sm font-semibold px-4 py-2 rounded-full bg-indigo text-ivory disabled:opacity-60"
      >
        {busy ? "…" : "Message"}
      </button>
      {error && <p className="text-xs text-terracotta mt-1">{error}</p>}
    </div>
  );
}
