"use client";

// Renders the new week-by-week Care Chart content (care_chart_week_content)
// once a week has been converted into this fuller format — currently the
// full pregnancy span (weeks 1-39, migrations 33-36) plus postpartum weeks
// 0-6 / Early healing (migrations 37-38), see CLAUDE.md. Falls back to the
// older phase-based rendering in chart/page.tsx for any week that isn't in
// this table yet (postpartum weeks 7+, Finding rhythm onward).
//
// Picks Move's tier by her check-in's time_available (5/15/30 -> heavy/
// steady/feeling_good) and Reset's message by her check-in's mood_score
// (1-5 -> heavy_day/a_little_low/okay/good/really_good), matching the same
// two check-in answers every other part of Care already uses.

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Recovery route — postpartum-only, added with the Early healing batch
// (migration_38). Delivery-type-branched guidance, kept as its own key
// inside `move` rather than a new column, since jsonb doesn't need a
// migration to carry a new key. Optional because pregnancy weeks' `move`
// blobs don't have it.
export type RecoveryRoute = {
  vaginal: string;
  assisted_tear: string;
  caesarean: string;
  complications: string;
};

export type MoveContent = {
  focus: string;
  recovery_route?: RecoveryRoute;
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

// Condition-specific notes — populated for real starting with the Early
// healing batch (the column existed since migration_33 but was reserved/
// unpopulated until now). flag matches the app's real health_flags values
// (thyroid / diabetes_gd / pcos / high_bp) captured at the care-quiz, or
// "none" for a note meant to show to every mother regardless of flags
// (self-selected by reading, same convention as weekly_care_chart_content's
// health_flag = 'none' rows).
export type ConditionNote = { flag: string; note: string };

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
  feeding_comfort?: string | null;
  rest_support?: string | null;
  reset: ResetContent;
  care_for_yourself: string;
  your_corner: string;
  support_moment: string;
  celebrate_this_week: string;
  for_your_care_team: string;
  condition_notes?: ConditionNote[] | null;
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

// Which named recovery route matches her profile's delivery_type. Onboarding/
// confirm-birth only capture "normal" or "c_section" — there's no stored
// value for "assisted birth or significant tear" or "complications", so
// those two are always offered as a secondary self-select rather than
// pretended to be known from her profile (same honesty-over-fake-
// personalization call made for the Wealth schemes filter and the Budget
// Planner's insurance note).
const PRIMARY_ROUTE_BY_DELIVERY_TYPE: Record<string, keyof RecoveryRoute> = {
  normal: "vaginal",
  c_section: "caesarean",
};

const ROUTE_LABEL: Record<keyof RecoveryRoute, string> = {
  vaginal: "Vaginal birth",
  assisted_tear: "Assisted birth / significant tear",
  caesarean: "Caesarean birth",
  complications: "Complications / restrictions",
};

export default function CareWeekContent({
  week,
  timeAvailable,
  moodScore,
  doneCardKeys,
  deliveryType,
  healthFlags,
}: {
  week: CareWeekRow;
  timeAvailable: string;
  moodScore: number;
  doneCardKeys: Set<string>;
  deliveryType?: string;
  healthFlags?: string[];
}) {
  const tierKey = MOVE_TIER_BY_TIME[timeAvailable] ?? "steady";
  const resetKey = RESET_KEY_BY_MOOD[moodScore] ?? "okay";
  const primaryRouteKey = PRIMARY_ROUTE_BY_DELIVERY_TYPE[deliveryType ?? ""] ?? null;
  const flags = healthFlags ?? [];
  const visibleConditionNotes = (week.condition_notes ?? []).filter(
    (n) => n.flag === "none" || flags.includes(n.flag)
  );

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
        {week.move.recovery_route && (
          <WeekCard title="Your recovery route" accent="indigo">
            {primaryRouteKey ? (
              <>
                <p className="text-[11px] font-semibold text-sage-deep uppercase tracking-wide mb-1">
                  {ROUTE_LABEL[primaryRouteKey]}
                </p>
                <p className="mb-2">{week.move.recovery_route[primaryRouteKey]}</p>
              </>
            ) : (
              <p className="mb-2 text-ink/55 italic">
                Choose whichever route below is closest to your birth.
              </p>
            )}
            <details className="text-[12px] text-ink/55">
              <summary className="cursor-pointer font-semibold text-sage-deep">
                Assisted birth, significant tear, or a complication instead?
              </summary>
              <p className="mt-1.5">
                <span className="font-semibold">{ROUTE_LABEL.assisted_tear}: </span>
                {week.move.recovery_route.assisted_tear}
              </p>
              <p className="mt-1.5">
                <span className="font-semibold">{ROUTE_LABEL.complications}: </span>
                {week.move.recovery_route.complications}
              </p>
            </details>
          </WeekCard>
        )}

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

        {week.feeding_comfort && (
          <WeekCard
            title="Feeding comfort"
            accent="sage"
            cardKey="feeding_comfort"
            weekNumber={week.week_number}
            initiallyDone={doneCardKeys.has("feeding_comfort")}
          >
            {week.feeding_comfort}
          </WeekCard>
        )}

        {week.rest_support && (
          <WeekCard
            title="Rest support"
            accent="gold-deep"
            cardKey="rest_support"
            weekNumber={week.week_number}
            initiallyDone={doneCardKeys.has("rest_support")}
          >
            {week.rest_support}
          </WeekCard>
        )}

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

      {visibleConditionNotes.length > 0 && (
        <div className="mt-5 bg-terracotta/5 rounded-2xl border border-terracotta/20 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-terracotta mb-2">
            If this applies to you
          </p>
          <div className="space-y-2">
            {visibleConditionNotes.map((n, i) => (
              <p key={i} className="text-[13px] text-ink/70">
                {n.note}
              </p>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5 bg-indigo/5 rounded-2xl border border-indigo/20 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo mb-1.5">
          For your care team
        </p>
        <p className="text-[13px] text-ink/70">{week.for_your_care_team}</p>
      </div>
    </div>
  );
}
