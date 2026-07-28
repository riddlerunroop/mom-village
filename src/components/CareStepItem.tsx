"use client";

// A single Care Step, rendered to the new strict standard when the content
// has it (what to do / how long / why today / what to avoid / optional
// detail) and gracefully falling back to just "what to do" for phases not
// yet restructured — see migration_25/26 and CLAUDE.md's Care module
// rebuild section. Also owns the per-item "done" toggle: a private, daily
// completion mark (never a streak or score), stored in user_care_progress
// keyed by (user, content, today's date).

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type CareStepData = {
  id: string;
  title: string;
  body: string;
  time_option: string;
  how_long: string | null;
  why_today: string | null;
  what_to_avoid: string | null;
  detail: string | null;
};

const TIME_BADGES: Record<string, string> = {
  "5": "5 min",
  "15": "15 min",
  "30": "30 min",
};

export default function CareStepItem({
  item,
  initiallyDone,
}: {
  item: CareStepData;
  initiallyDone: boolean;
}) {
  const supabase = createClient();
  const [done, setDone] = useState(initiallyDone);
  const [busy, setBusy] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  const badge = item.how_long || TIME_BADGES[item.time_option];
  const showBadge = badge && item.title !== TIME_BADGES[item.time_option];

  async function toggleDone() {
    setBusy(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setBusy(false);
      return;
    }
    const today = new Date().toISOString().slice(0, 10);

    if (done) {
      await supabase
        .from("user_care_progress")
        .delete()
        .eq("user_id", user.id)
        .eq("content_id", item.id)
        .eq("completed_date", today);
      setDone(false);
    } else {
      await supabase.from("user_care_progress").upsert(
        {
          user_id: user.id,
          content_id: item.id,
          completed_date: today,
          completed: true,
          completed_at: new Date().toISOString(),
        },
        { onConflict: "user_id,content_id,completed_date" }
      );
      setDone(true);
    }
    setBusy(false);
  }

  return (
    <li className={`rounded-xl border p-3.5 transition-colors ${done ? "bg-sage/10 border-sage-deep/30" : "border-line"}`}>
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={toggleDone}
          disabled={busy}
          aria-label={done ? "Mark not done" : "Mark done"}
          className={`mt-0.5 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center text-[11px] font-bold transition-colors ${
            done
              ? "bg-sage-deep border-sage-deep text-ivory"
              : "border-ink/25 text-transparent hover:border-sage-deep/60"
          }`}
        >
          ✓
        </button>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold ${done ? "text-ink/50 line-through decoration-1" : "text-ink"}`}>
            {item.title}
            {showBadge && (
              <span className="ml-2 text-[11px] font-semibold text-sage-deep align-middle no-underline">
                · {badge}
              </span>
            )}
          </p>
          <p className={`text-[13px] mt-0.5 ${done ? "text-ink/40" : "text-ink/65"}`}>{item.body}</p>

          {item.why_today && !done && (
            <p className="text-[12px] text-sage-deep mt-1.5">
              <span className="font-semibold">Why today: </span>
              {item.why_today}
            </p>
          )}
          {item.what_to_avoid && !done && (
            <p className="text-[12px] text-terracotta mt-1">
              <span className="font-semibold">Avoid: </span>
              {item.what_to_avoid}
            </p>
          )}
          {item.detail && !done && (
            <div className="mt-1.5">
              <button
                type="button"
                onClick={() => setShowDetail((s) => !s)}
                className="text-[11px] font-semibold text-ink/45 underline"
              >
                {showDetail ? "Hide detail" : "Need more detail?"}
              </button>
              {showDetail && (
                <p className="text-[12px] text-ink/60 mt-1">{item.detail}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </li>
  );
}
