"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Minimum viable moderation, added 2026-07-27: a mother can flag a thread
// or reply with a short reason. There's no in-app admin screen — Roop
// reviews reports directly in Supabase (same workflow as every other piece
// of content in this app) and hides anything that needs it by setting
// is_hidden = true on the thread/reply.
export default function ReportButton({
  threadId,
  replyId,
}: {
  threadId?: string;
  replyId?: string;
}) {
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function submit() {
    if (!reason.trim()) return;
    setSubmitting(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSubmitting(false);
      return;
    }

    await supabase.from("community_reports").insert({
      reporter_id: user.id,
      thread_id: threadId ?? null,
      reply_id: replyId ?? null,
      reason: reason.trim(),
    });

    setSubmitting(false);
    setDone(true);
    setOpen(false);
  }

  if (done) {
    return (
      <span className="text-[11px] text-sage-deep font-semibold">
        Reported — thank you
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
        Report
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="What's wrong with this?"
        className="text-[11px] px-2.5 py-1 rounded-full border border-line bg-ivory focus:outline-none focus:border-terracotta w-[160px]"
      />
      <button
        type="button"
        onClick={submit}
        disabled={submitting || !reason.trim()}
        className="text-[11px] font-semibold text-terracotta disabled:opacity-50"
      >
        {submitting ? "…" : "Send"}
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
