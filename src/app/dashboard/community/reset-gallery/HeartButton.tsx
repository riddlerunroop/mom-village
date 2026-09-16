"use client";

// The Reset Gallery's one and only interaction, deliberately — a heart tap,
// no comments, no visible "liked by" list. Keeps the Gallery a browse-and-
// appreciate space rather than a second discussion surface (that's what
// Community already is). See migration_59_reset_feature_schema.sql's
// reset_share_hearts table and CLAUDE.md's Reset rebuild entry for why this
// stayed deliberately this small.

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function HeartButton({
  shareId,
  initialHearted,
  initialCount,
}: {
  shareId: string;
  initialHearted: boolean;
  initialCount: number;
}) {
  const supabase = createClient();
  const [hearted, setHearted] = useState(initialHearted);
  const [count, setCount] = useState(initialCount);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setBusy(false);
      return;
    }

    if (hearted) {
      await supabase.from("reset_share_hearts").delete().eq("share_id", shareId).eq("user_id", user.id);
      setHearted(false);
      setCount((c) => Math.max(0, c - 1));
    } else {
      await supabase.from("reset_share_hearts").insert({ share_id: shareId, user_id: user.id });
      setHearted(true);
      setCount((c) => c + 1);
    }
    setBusy(false);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-label={hearted ? "Remove your heart" : "Heart this"}
      className={`text-sm font-semibold flex items-center gap-1 ${hearted ? "text-terracotta" : "text-ink/35 hover:text-terracotta"}`}
    >
      <span>{hearted ? "❤️" : "🤍"}</span>
      {count > 0 && <span>{count}</span>}
    </button>
  );
}
