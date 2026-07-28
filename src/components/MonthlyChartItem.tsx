"use client";

// One Monthly Chart item — rebuilt 2026-07-28 for dashboard scannability
// per Roop's review: a short bold takeaway instead of one dense paragraph,
// with the rest expandable, plus a real checkbox that actually saves
// (previously a permanently-disabled decoration). The takeaway/detail split
// is UI-only: it reads the already-locked, already-verified content
// (1,031 rows across 42 months) and splits at the first sentence boundary,
// rather than requiring a full rewrite of already-published content.

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Finds the first sentence-ending punctuation followed by a space (or the
// end of the string) and splits there. Falls back to showing the whole
// thing as the takeaway with no expandable remainder if there's only one
// sentence, or if the first "sentence" would be unreasonably short (e.g. an
// abbreviation like "Dr." tripping the split).
function splitTakeaway(body: string): { takeaway: string; rest: string } {
  const match = body.match(/^.{20,}?[.!?](?=\s|$)/);
  if (!match) return { takeaway: body, rest: "" };
  const takeaway = match[0];
  const rest = body.slice(takeaway.length).trim();
  return { takeaway, rest };
}

export default function MonthlyChartItem({
  id,
  body,
  initiallyDone,
}: {
  id: string;
  body: string;
  initiallyDone: boolean;
}) {
  const supabase = createClient();
  const [done, setDone] = useState(initiallyDone);
  const [busy, setBusy] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const { takeaway, rest } = splitTakeaway(body);

  async function toggleDone() {
    setBusy(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setBusy(false);
      return;
    }

    if (done) {
      await supabase
        .from("user_monthly_chart_progress")
        .delete()
        .eq("user_id", user.id)
        .eq("content_id", id);
      setDone(false);
    } else {
      await supabase.from("user_monthly_chart_progress").upsert(
        { user_id: user.id, content_id: id, completed_at: new Date().toISOString() },
        { onConflict: "user_id,content_id" }
      );
      setDone(true);
    }
    setBusy(false);
  }

  return (
    <li className="flex items-start gap-2.5">
      <button
        type="button"
        onClick={toggleDone}
        disabled={busy}
        aria-label={done ? "Mark not done" : "Mark done"}
        className={`mt-0.5 shrink-0 w-[18px] h-[18px] rounded-md border-2 flex items-center justify-center text-[10px] font-bold transition-colors ${
          done
            ? "bg-gold-deep border-gold-deep text-ivory"
            : "border-ink/30 text-transparent hover:border-gold-deep/60"
        }`}
      >
        ✓
      </button>
      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-snug font-semibold ${done ? "text-ink/40 line-through decoration-1" : "text-ink/90"}`}>
          {takeaway}
        </p>
        {rest && (
          <>
            {expanded && (
              <p className={`text-[13px] leading-snug mt-1 ${done ? "text-ink/35" : "text-ink/65"}`}>
                {rest}
              </p>
            )}
            <button
              type="button"
              onClick={() => setExpanded((e) => !e)}
              className="text-[11px] font-semibold text-sage-deep mt-1"
            >
              {expanded ? "Show less" : "Read more"}
            </button>
          </>
        )}
      </div>
    </li>
  );
}
