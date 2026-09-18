"use client";

// Care for Yourself — the seven-day personal-care rhythm, built 2026-09-18
// per Roop's own spec (see CLAUDE.md's "Care for Yourself" entry for the
// full verbatim text). Each day of the week is permanently assigned one
// care category (Sunday=Hair love, Monday=Face time, Tuesday=Hands &
// feet, Wednesday=Body love, Thursday=Groom & glow, Friday=Feel-good
// Friday, Saturday=My care day — Saturday has its own dedicated 30-note
// bank, not a "revisit another category" mechanic). A mother always knows
// what KIND of care a given day brings; she never knows in advance which
// of that category's rotating Care Notes she'll actually see — see
// src/lib/careForYourselfCalculator.ts for the deterministic per-user,
// per-week rotation that makes that true without a questionnaire.
//
// Completion is a single soft, non-punitive action — "♡ Made time for
// me" — with no streaks, no missed-day warnings, no "X/7" counters shown
// as a score. The only feedback offered is a gentle weekly total, phrased
// as an acknowledgment, never a target — and it simply doesn't render at
// all if the count is zero.
//
// This fully replaces the old generic per-week care_for_yourself text
// field everywhere a mother sees her real chart, per Roop's explicit
// "replace it everywhere" decision — same precedent as Reset-of-the-day
// fully replacing the old mood-mapped Reset card.
//
// IMPORTANT: the real 210 Care Notes (30 per category) are Roop's own to
// write. This component only ever renders whatever's actually in
// care_for_yourself_notes — right now that's 7 clearly-flagged
// (safety_flag = 'placeholder') demonstration rows, one per category, so
// the feature is visible and testable before her real content exists.

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import PillarCard from "@/components/PillarCard";
import { CARE_CATEGORY_META, careWeekAcknowledgment, type CareCategory } from "@/lib/careForYourselfCalculator";

export type CareForYourselfNoteRow = {
  id: string;
  category: string;
  content_type: string;
  headline: string;
  care_note: string;
  tiny_action: string | null;
};

export default function CareForYourself({
  category,
  note,
  alreadyDoneToday,
  weekCompletionCount,
}: {
  category: CareCategory;
  note: CareForYourselfNoteRow | null;
  alreadyDoneToday: boolean;
  weekCompletionCount: number;
}) {
  const [done, setDone] = useState(alreadyDoneToday);
  const [busy, setBusy] = useState(false);
  const meta = CARE_CATEGORY_META[category];
  // Optimistic +1 the moment she taps done today, so the count doesn't
  // wait for a page reload to reflect what she just did.
  const displayedCount = weekCompletionCount + (done && !alreadyDoneToday ? 1 : 0);
  const acknowledgment = careWeekAcknowledgment(displayedCount);

  async function markDone() {
    if (busy || done) return;
    setBusy(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const today = new Date().toISOString().slice(0, 10);
      await supabase.from("user_care_completions").upsert(
        { user_id: user.id, completed_date: today, category, note_id: note?.id ?? null },
        { onConflict: "user_id,completed_date,category" }
      );
    }
    setDone(true);
    setBusy(false);
  }

  if (!note) return null;

  return (
    <PillarCard
      eyebrow={`${meta.emoji} ${meta.dayLabel.toUpperCase()} · ${meta.label.toUpperCase()}`}
      title="Care for yourself"
      accent={meta.accent}
      done={done}
      defaultOpen={false}
    >
      <div className="space-y-3">
        {note.headline && <p className="text-[13px] font-semibold text-indigo">{note.headline}</p>}
        <p className="text-sm text-ink/75 leading-relaxed">{note.care_note}</p>

        {note.tiny_action && (
          <p className="text-[13px] text-sage-deep italic">Today: {note.tiny_action}</p>
        )}

        <button
          type="button"
          onClick={markDone}
          disabled={busy}
          className={`text-[13px] font-semibold px-4 py-2 rounded-full border transition-colors ${
            done
              ? "bg-terracotta/10 border-terracotta/30 text-terracotta"
              : "border-indigo/30 text-indigo hover:bg-indigo/5"
          }`}
        >
          {done ? "♥ Made time for me" : "♡ Made time for me"}
        </button>

        {acknowledgment && <p className="text-[12px] text-ink/45">{acknowledgment}</p>}
      </div>
    </PillarCard>
  );
}
