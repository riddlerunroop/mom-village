"use client";

// Renders the new week-by-week Care Chart content (care_chart_week_content)
// once a week has been converted into this fuller format — currently Second
// trimester (weeks 14-26) only, see migration_33/34 and CLAUDE.md. Falls
// back to the older phase-based rendering in chart/page.tsx for any week
// that isn't in this table yet (First trimester, Third trimester, all of
// postpartum).
//
// Picks Move's tier by her check-in's time_available (5/15/30 -> heavy/
// steady/feeling_good) and Reset's message by her check-in's mood_score
// (1-5 -> heavy_day/a_little_low/okay/good/really_good), matching the same
// two check-in answers every other part of Care already uses.

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type MoveContent = {
  focus: string;
  tiers: { heavy: string; steady: string; feeling_good: string };
  mood_adjustment: string;
  safety: string;
};

export type ResetContent = {
  heavy_day: string;
  a_little_low: string;
  okay: string;
  good: string;
  really_good: string;
};

export type CareWeekRow = {
  week_number: number;
  theme_title: string;
  mantra: string;
  priority: string;
  journey: string;
  what_you_may_notice: string[];
  move: MoveContent;
  nourish: string;
  hydration_goal: string;
  reset: ResetContent;
  care_for_yourself: string;
  your_corner: string;
  support_moment: string;
  celebrate_this_week: string;
  for_your_care_team: string;
};

const MOVE_TIER_BY_TIME: Record<string, keyof MoveContent["tiers"]> = {
  "5": "heavy",
  "15": "steady",
  "30": "feeling_good",
};

const MOVE_TIER_LABEL: Record<keyof MoveContent["tiers"], string> = {
  heavy: "Heavy day · 5 min",
  steady: "Steady day · 15 min",
  feeling_good: "Feeling good · 30 min",
};

const RESET_KEY_BY_MOOD: Record<number, keyof ResetContent> = {
  1: "heavy_day",
  2: "a_little_low",
  3: "okay",
  4: "good",
  5: "really_good",
};

function WeekCard({
  title,
  accent,
  children,
  cardKey,
  weekNumber,
  initiallyDone,
}: {
  title: string;
  accent: string;
  children: React.ReactNode;
  cardKey?: string;
  weekNumber?: number;
  initiallyDone?: boolean;
}) {
  const supabase = createClient();
  const [done, setDone] = useState(Boolean(initiallyDone));
  const [busy, setBusy] = useState(false);
  const actionable = cardKey !== undefined && weekNumber !== undefined;

  async function toggleDone() {
    if (!actionable) return;
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
        .from("user_care_week_progress")
        .delete()
        .eq("user_id", user.id)
        .eq("week_number", weekNumber)
        .eq("card_key", cardKey)
        .eq("completed_date", today);
      setDone(false);
    } else {
      await supabase.from("user_care_week_progress").upsert(
        { user_id: user.id, week_number: weekNumber, card_key: cardKey, completed_date: today },
        { onConflict: "user_id,week_number,card_key,completed_date" }
      );
      setDone(true);
    }
    setBusy(false);
  }

  return (
    <div
      className={`rounded-2xl border p-5 transition-colors ${done ? "bg-sage/10 border-sage-deep/30" : "bg-ivory-2 border-line"}`}
      style={{ borderTop: `3px solid var(--color-${accent})` }}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className={`font-display text-base ${done ? "text-ink/50 line-through decoration-1" : "text-indigo"}`}>
          {title}
        </h3>
        {actionable && (
          <button
            type="button"
            onClick={toggleDone}
            disabled={busy}
            aria-label={done ? "Mark not done" : "Mark done"}
            className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-[12px] font-bold transition-colors ${
              done
                ? "bg-sage-deep border-sage-deep text-ivory"
                : "border-ink/25 text-transparent hover:border-sage-deep/60"
            }`}
          >
            ✓
          </button>
        )}
      </div>
      <div className={`text-[13px] leading-relaxed ${done ? "text-ink/40" : "text-ink/75"}`}>{children}</div>
    </div>
  );
}

export default function CareWeekContent({
  week,
  timeAvailable,
  moodScore,
  doneCardKeys,
}: {
  week: CareWeekRow;
  timeAvailable: string;
  moodScore: number;
  doneCardKeys: Set<string>;
}) {
  const tierKey = MOVE_TIER_BY_TIME[timeAvailable] ?? "steady";
  const resetKey = RESET_KEY_BY_MOOD[moodScore] ?? "okay";

  return (
    <div>
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.12em] text-sage-deep font-semibold mb-1">
          Week {week.week_number}
        </p>
        <h2 className="font-display text-2xl text-indigo mb-1">{week.theme_title}</h2>
        <p className="font-display italic text-lg text-sage-deep mb-3">&ldquo;{week.mantra}&rdquo;</p>
        <p className="text-sm font-semibold text-ink/80 mb-3">{week.priority}</p>
        <p className="text-sm text-ink/65 mb-4">{week.journey}</p>

        {week.what_you_may_notice.length > 0 && (
          <div className="bg-ivory-2 rounded-xl border border-line p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-sage-deep mb-2">
              What you may notice
            </p>
            <ul className="text-[13px] text-ink/70 space-y-1 list-disc list-inside">
              {week.what_you_may_notice.map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
            <p className="text-[11px] text-ink/45 italic mt-2">
              You may notice some, all or none of these. Absence of a symptom isn&apos;t, by itself, a sign
              something is wrong.
            </p>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <WeekCard
          title="Move"
          accent="gold"
          cardKey="move"
          weekNumber={week.week_number}
          initiallyDone={doneCardKeys.has("move")}
        >
          <p className="font-semibold text-ink/80 mb-1">{week.move.focus}</p>
          <p className="text-[11px] font-semibold text-sage-deep uppercase tracking-wide mb-1">
            {MOVE_TIER_LABEL[tierKey]}
          </p>
          <p className="mb-2">{week.move.tiers[tierKey]}</p>
          <p className="text-[12px] text-ink/55 mb-1">
            <span className="font-semibold">If today feels different: </span>
            {week.move.mood_adjustment}
          </p>
          <p className="text-[12px] text-terracotta">
            <span className="font-semibold">Stop and check with your clinician for: </span>
            {week.move.safety}
          </p>
        </WeekCard>

        <WeekCard
          title="Nourish"
          accent="sage"
          cardKey="nourish"
          weekNumber={week.week_number}
          initiallyDone={doneCardKeys.has("nourish")}
        >
          {week.nourish}
        </WeekCard>

        <WeekCard
          title="Hydration goal"
          accent="indigo"
          cardKey="hydration"
          weekNumber={week.week_number}
          initiallyDone={doneCardKeys.has("hydration")}
        >
          {week.hydration_goal}
        </WeekCard>

        <WeekCard
          title="Reset"
          accent="terracotta"
          cardKey="reset"
          weekNumber={week.week_number}
          initiallyDone={doneCardKeys.has("reset")}
        >
          {week.reset[resetKey]}
        </WeekCard>

        <WeekCard
          title="Care for yourself"
          accent="gold-deep"
          cardKey="care_for_yourself"
          weekNumber={week.week_number}
          initiallyDone={doneCardKeys.has("care_for_yourself")}
        >
          {week.care_for_yourself}
        </WeekCard>

        <WeekCard
          title="Your corner"
          accent="gold"
          cardKey="your_corner"
          weekNumber={week.week_number}
          initiallyDone={doneCardKeys.has("your_corner")}
        >
          {week.your_corner}
        </WeekCard>

        <WeekCard
          title="Support moment"
          accent="sage"
          cardKey="support_moment"
          weekNumber={week.week_number}
          initiallyDone={doneCardKeys.has("support_moment")}
        >
          {week.support_moment}
        </WeekCard>

        <WeekCard title="Celebrate this week" accent="gold-deep">
          {week.celebrate_this_week}
        </WeekCard>
      </div>

      <div className="mt-5 bg-indigo/5 rounded-2xl border border-indigo/20 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo mb-1.5">
          For your care team
        </p>
        <p className="text-[13px] text-ink/70">{week.for_your_care_team}</p>
      </div>
    </div>
  );
}
