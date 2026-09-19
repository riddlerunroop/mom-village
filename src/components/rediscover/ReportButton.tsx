"use client";

// Mirrors src/app/dashboard/community/[threadId]/ReportButton.tsx exactly —
// no in-app admin screen, Roop reviews rediscover_reports directly in
// Supabase, same workflow as every other report queue in this app.
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ReportButton({
  listingId,
  needId,
  reportedUserId,
}: {
  listingId?: string;
  needId?: string;
  reportedUserId?: string;
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

    await supabase.from("rediscover_reports").insert({
      reporter_id: user.id,
      listing_id: listingId ?? null,
      need_id: needId ?? null,
      reported_user_id: reportedUserId ?? null,
      reason: reason.trim(),
    });

    setSubmitting(false);
    setDone(true);
    setOpen(false);
  }

  if (done) {
    return <span className="text-[11px] text-sage-deep font-semibold">Reported — thank you</span>;
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
    <div className="flex items-center gap-2 flex-wrap">
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
      <button type="button" onClick={() => setOpen(false)} className="text-[11px] text-ink/40">
        Cancel
      </button>
    </div>
  );
}
