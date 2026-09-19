"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SaveButton({
  listingId,
  initialSaved,
}: {
  listingId: string;
  initialSaved: boolean;
}) {
  const supabase = createClient();
  const [saved, setSaved] = useState(initialSaved);
  const [busy, setBusy] = useState(false);

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

    if (saved) {
      await supabase
        .from("user_rediscover_saved_listings")
        .delete()
        .eq("user_id", user.id)
        .eq("listing_id", listingId);
      setSaved(false);
    } else {
      await supabase
        .from("user_rediscover_saved_listings")
        .upsert({ user_id: user.id, listing_id: listingId }, { onConflict: "user_id,listing_id" });
      setSaved(true);
    }
    setBusy(false);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors disabled:opacity-60 ${
        saved ? "bg-gold-deep/10 border-gold-deep/40 text-gold-deep" : "border-line text-ink/60 hover:border-gold-deep/40"
      }`}
    >
      {saved ? "★ Saved" : "☆ Save"}
    </button>
  );
}
