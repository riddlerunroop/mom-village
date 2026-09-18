"use client";

// The rebuilt Reset feature (migration_59/60, 2026-09-16) — replaces the
// old per-week, mood-matched Reset text with a genuinely dynamic "Reset of
// the day" card: one fixed suggestion (no reshuffle, per Roop's explicit
// simplification), "I'm doing this" or a no-guilt "not today" skip (never
// recorded — there's nothing to track about a day she passed), then a
// small badge moment and an optional "Share your Reset with the Village"
// link into the Reset Gallery (see reset-share/new and the Community
// Gallery page). See src/lib/resetCalculator.ts and CLAUDE.md for why this
// is cumulative badges, not a streak.

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { justUnlockedResetBadge, RESET_BADGE_LABELS } from "@/lib/resetCalculator";
import PillarCard from "@/components/PillarCard";

export type ResetActivityRow = {
  id: string;
  card_number: number;
  emoji: string;
  title: string;
  body: string;
};

export default function ResetOfTheDay({
  activity,
  alreadyDoneToday,
  totalCompletions,
}: {
  activity: ResetActivityRow;
  alreadyDoneToday: boolean;
  totalCompletions: number;
}) {
  const supabase = createClient();
  const [phase, setPhase] = useState<"offer" | "skipped" | "done">(
    alreadyDoneToday ? "done" : "offer"
  );
  const [busy, setBusy] = useState(false);
  const [total, setTotal] = useState(totalCompletions);
  const [justUnlocked, setJustUnlocked] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function markDone() {
    setBusy(true);
    setError("");
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setBusy(false);
      return;
    }
    const today = new Date().toISOString().slice(0, 10);
    const { error: insertError } = await supabase.from("user_reset_completions").insert({
      user_id: user.id,
      completed_date: today,
      activity_id: activity.id,
    });

    setBusy(false);
    if (insertError) {
      // 23505 = unique_violation — she already logged today's Reset from
      // another tab/reload. Not a real error, her total just doesn't move.
      if (insertError.code !== "23505") {
        setError("Couldn't save that — try again in a moment.");
        return;
      }
    } else {
      const newTotal = total + 1;
      setTotal(newTotal);
      setJustUnlocked(justUnlockedResetBadge(newTotal));
    }
    setPhase("done");
  }

  return (
    <PillarCard eyebrow="Need a Reset?" icon={activity.emoji} title={activity.title} accent="terracotta">
      {phase === "offer" && (
        <>
          <p className="text-[13.5px] text-ink/75 leading-relaxed mb-4 max-w-prose">
            {activity.body}
          </p>
          <div className="flex flex-wrap gap-3 items-center">
            <button
              type="button"
              onClick={markDone}
              disabled={busy}
              className="px-6 py-2.5 rounded-full bg-terracotta text-ivory font-semibold text-sm disabled:opacity-50"
            >
              {busy ? "…" : "I'm doing this"}
            </button>
            <button
              type="button"
              onClick={() => setPhase("skipped")}
              disabled={busy}
              className="text-sm font-semibold text-ink/45 hover:text-terracotta"
            >
              Not today
            </button>
          </div>
          {error && <p className="text-terracotta text-[12px] mt-2">{error}</p>}
        </>
      )}

      {phase === "skipped" && (
        <p className="text-[13.5px] text-ink/60 italic">
          No worries — there&apos;s always tomorrow&apos;s Reset.
        </p>
      )}

      {phase === "done" && (
        <>
          <p className="text-[12px] font-semibold text-sage-deep mb-3">Reset done ✓</p>

          {justUnlocked && (
            <div className="bg-gold/15 border border-gold/40 rounded-2xl px-4 py-3 mb-3">
              <p className="text-sm font-semibold text-gold-deep">
                🏆 {RESET_BADGE_LABELS[justUnlocked] ?? `${justUnlocked} Resets`}
              </p>
            </div>
          )}

          <p className="text-[12px] text-ink/45 mb-4">
            {total} Reset{total === 1 ? "" : "s"} and counting.
          </p>

          <Link
            href={`/dashboard/community/reset-share/new?activityId=${activity.id}`}
            className="inline-block text-sm font-semibold px-6 py-2.5 rounded-full border-[1.5px] border-terracotta text-terracotta"
          >
            Share your Reset with the Village →
          </Link>
        </>
      )}
    </PillarCard>
  );
}
