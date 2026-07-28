"use client";

// Real block control, added 2026-07-28 alongside Report (migration_22) —
// a mother can stop seeing a specific member's posts and replies. Personal
// and private: not visible to the blocked member, doesn't notify anyone,
// and is fully reversible from the account page's "Blocked members" list.
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function BlockButton({
  userId,
  authorName,
}: {
  userId: string;
  authorName: string;
}) {
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function submit() {
    setSubmitting(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSubmitting(false);
      return;
    }
    await supabase.from("user_blocks").upsert(
      { blocker_id: user.id, blocked_id: userId },
      { onConflict: "blocker_id,blocked_id" }
    );
    setSubmitting(false);
    setDone(true);
    setOpen(false);
  }

  if (done) {
    return (
      <span className="text-[11px] text-sage-deep font-semibold">
        Blocked
      </span>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-[11px] text-ink/35 hover:text-terracotta font-semibold"
      >
        Block
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-ink/60">
        Block {authorName}? You won&apos;t see her posts anymore.
      </span>
      <button
        type="button"
        onClick={submit}
        disabled={submitting}
        className="text-[11px] font-semibold text-terracotta disabled:opacity-50"
      >
        {submitting ? "…" : "Confirm"}
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="text-[11px] text-ink/40"
      >
        Cancel
      </button>
    </div>
  );
}
