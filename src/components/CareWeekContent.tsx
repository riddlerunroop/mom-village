"use client";

// Renders the week-by-week Care Chart content (care_chart_week_content) —
// the full pregnancy-through-third-birthday span (weeks 1-196) is loaded,
// see CLAUDE.md.
//
// Move (migration_53, 2026-08-03) is self-contained: each week's own content
// carries whichever format it was actually drafted in (the tiers3 Restore/
// Rebuild/Thrive choice for First trimester weeks 1-9, or the Reset/Move/
// Build/Release "sections" format for every other week) and she picks her
// own tier/door directly within that content rather than the app auto-
// selecting one from her check-in answer. Reset's message is still picked
// by her check-in's mood_score (1-5 -> heavy_day/a_little_low/okay/good/
// really_good), matching every other part of Care.

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { PROTEIN_TIP, type DietPreference } from "@/lib/proteinTips";

// Move content — fully replaced 2026-08-03 with the real "Move" series
// (11 separately drafted, reviewed and locked documents spanning pregnancy
// weeks 1-39 through postpartum weeks 0-156 — see
// move-series-clinical-verification-2026-08-03.md and CLAUDE.md). The old
// tiered focus/mood_adjustment shape is gone; every week now carries its own
// small Move-specific theme/mantra plus a real Reset/Move/Build/Release (or,
// for First trimester weeks 1-9 only, the original Restore/Rebuild/Thrive
// three-tier shape) session, a featured exercise, and a genuine "why" and
// safety note. Nothing else on this row (theme_title, mantra, nourish,
// reset, care_for_yourself, etc.) changed — this migration (migration_53)
// only ever writes to this one column.
export type MoveExercise = { name: string; focus: string; benefit: string; mistake: string; tip: string };
export type MoveDoor = { pattern: string; comfort: string; steady: string; challenge: string };
export type MoveTiers3 = { restore: string[]; rebuild: string[]; thrive: string[] };

export type MoveContent = {
  format: "tiers3" | "sections";
  theme: string;
  mantra: string;
  // tiers3 (First trimester weeks 1-9 only)
  tiers?: MoveTiers3 | null;
  // sections (everything else)
  reset?: string | null;
  today?: string | null;
  build?: string[] | null;
  release?: string | null;
  recoveryRoute?: Record<string, string> | null;
  door?: MoveDoor | null;
  // shared
  exercise: MoveExercise;
  inRealLife?: string | null;
  why: string;
  quote?: string | null;
  note?: string | null;
  // clinicalFlag is an internal editorial flag ("worth having an OB/GYN and
  // a women's health physiotherapist scrutinise before this is locked") —
  // deliberately never rendered to a mother, kept in the data purely so
  // it isn't lost before that real review happens. See Second trimester
  // week 19 (Standing Wood Chop) for the one place this is currently set.
  clinicalFlag?: string | null;
  progressionNote?: string | null;
  safety: string;
  recovery?: string[] | null;
  reflectionPrompt?: string | null;
  closingLabel: string;
  closingText: string;
  lookingAhead?: string | null;
  // phase-closing callbacks — present only on each phase's final week
  milestone?: string | null;
  breathLegacy?: string | null;
  philosophy?: string | null;
  // "What Your Child Learned Watching You" — present only on each
  // postpartum phase's final week (46, 52, 66, 92, 118, 144, 170, 196)
  childLearned?: string[] | null;
  // week 196 only — the true close of the whole three-year journey
  whatYouGaveYourself?: string[] | null;
  finalNote?: string | null;
  signatureLine?: string[] | null;
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
  mental_health_note?: string | null;
  for_your_care_team: string;
  condition_notes?: ConditionNote[] | null;
  closing_note?: string | null;
};

const RESET_KEY_BY_MOOD: Record<number, keyof ResetContent> = {
  1: "heavy_day",
  2: "a_little_low",
  3: "okay",
  4: "good",
  5: "really_good",
};

// Real content gap found 2026-08-03: several later batches (Sustainable
// rhythms Part 2 through Your rhythm year three Part 2 — postpartum weeks
// 79-156, migrations 44-46) were drafted with a literal generic filler
// sentence standing in for real, week-specific content on fields that
// weren't given a distinct answer for that week's theme — confirmed by
// grepping the migrations directly (338 exact occurrences of "No specific
// note this week." / "No specific ask this week." across those three files
// alone). Rather than show that filler to a mother as if it were real
// guidance, treat it as "nothing to show" and hide the card entirely — a
// real content rewrite for the affected weeks is tracked separately (see
// CLAUDE.md), this is the immediate display-side fix. Only an exact match
// (after stripping a stray trailing dash-rule artifact some rows also
// carry, e.g. "...this week. — — — — — --") counts as empty; text that
// happens to start the same way but adds real guidance (e.g. "No specific
// note this week — the Wealth pillar's planner ... covers this in depth")
// is left alone since it does carry real information.
const EMPTY_FIELD_VALUES = new Set([
  "No specific note this week.",
  "No specific ask this week.",
  "No specific caution this week.",
  "No specific movement theme this week.",
  "No specific change this week.",
]);

function hasContent(value?: string | null): value is string {
  if (!value) return false;
  const cleaned = value.replace(/\s*(—\s*)+-*\s*$/, "").trim();
  return cleaned.length > 0 && !EMPTY_FIELD_VALUES.has(cleaned);
}

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

// Which recoveryRoute key matches her profile's delivery_type. Onboarding/
// confirm-birth only capture "normal" or "c_section", and the real Move
// series content (Early Healing, Finding Rhythm) only ever splits into two
// routes — "vaginal or assisted" and "caesarean" — so this is a direct,
// honest match rather than the four-category guess the old schema assumed.
function primaryRouteKeyFor(deliveryType: string | undefined, keys: string[]): string | null {
  if (deliveryType === "c_section") return keys.find((k) => k.toLowerCase().includes("caesarean")) ?? null;
  if (deliveryType === "normal") return keys.find((k) => k.toLowerCase().includes("vaginal")) ?? null;
  return null;
}

function titleCaseRoute(key: string): string {
  return key.charAt(0).toUpperCase() + key.slice(1);
}

// The Move series' own recovery-check items ("just notice, don't diagnose")
// — display-only, not wired to per-item tracking, matching how "Celebrate
// this week" is informational rather than actionable. Styled as plain
// pills rather than a bulleted list, 2026-08-03 redesign: a disc-bullet
// list this close to the app's other real, tappable checkbox-style controls
// read as a broken/fake checkbox to Roop on live review — pills make clear
// at a glance that this is a soft noticing list, nothing to tap.
function MoveRecoveryCheck({ items }: { items: string[] }) {
  return (
    <div>
      <p className="text-[11px] font-medium text-ink/45 mb-2">Just notice, don&apos;t diagnose</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((it, i) => (
          <span
            key={i}
            className="text-[12px] text-ink/70 bg-sage/10 border border-sage-deep/15 rounded-full px-3 py-1"
          >
            {it}
          </span>
        ))}
      </div>
    </div>
  );
}

// The Move card itself — fully rebuilt 2026-08-03 for the real, locked Move
// series. Deliberately its own full-width section above the smaller pillar
// grid rather than squeezed into a 2-column card, since a real week's worth
// of Reset/Move/Build/Release plus a featured exercise is far more content
// than the other pillar cards carry. Branches on `move.format`: "tiers3" for
// First trimester weeks 1-9 (the original Restore/Rebuild/Thrive shape),
// "sections" for everything else.
function MoveSection({
  week,
  deliveryType,
  doneMove,
  weekNumber,
}: {
  week: MoveContent;
  deliveryType?: string;
  doneMove: boolean;
  weekNumber: number;
}) {
  const supabase = createClient();
  const [done, setDone] = useState(doneMove);
  const [busy, setBusy] = useState(false);

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
        .from("user_care_week_progress")
        .delete()
        .eq("user_id", user.id)
        .eq("week_number", weekNumber)
        .eq("card_key", "move")
        .eq("completed_date", today);
      setDone(false);
    } else {
      await supabase.from("user_care_week_progress").upsert(
        { user_id: user.id, week_number: weekNumber, card_key: "move", completed_date: today },
        { onConflict: "user_id,week_number,card_key,completed_date" }
      );
      setDone(true);
    }
    setBusy(false);
  }

  const routeKeys = week.recoveryRoute ? Object.keys(week.recoveryRoute) : [];
  const primaryRouteKey = week.recoveryRoute ? primaryRouteKeyFor(deliveryType, routeKeys) : null;
  const otherRouteKeys = routeKeys.filter((k) => k !== primaryRouteKey);

  // "Why this helps" — merged 2026-08-03 redesign. inRealLife/why/note/
  // progressionNote used to each get their own bold mini-label ("In real
  // life:", "Why:", "Note:") stacked as separate paragraphs, which read as
  // three-to-four competing headed sections for what's really one train of
  // thought. Combined into one lightweight, unboxed block under a single
  // heading — same exact wording for every field, just without the per-
  // field labels and extra visual weight. Order preserved from the
  // original stacking order.
  const whyBlockParts = [
    hasContent(week.inRealLife) ? week.inRealLife : null,
    week.why,
    hasContent(week.note) ? week.note : null,
    hasContent(week.progressionNote) ? week.progressionNote : null,
  ].filter((p): p is string => Boolean(p));

  return (
    <div
      className={`rounded-3xl p-6 mb-4 transition-colors shadow-sm ${
        done ? "bg-sage/10" : "bg-ivory-2"
      }`}
      style={{ borderTop: "3px solid var(--color-gold)" }}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gold-deep mb-1">Move</p>
          <h3 className={`font-display text-xl ${done ? "text-ink/50 line-through decoration-1" : "text-indigo"}`}>
            {week.theme}
          </h3>
          <p className="font-display italic text-[14px] text-sage-deep mt-0.5">&ldquo;{week.mantra}&rdquo;</p>
        </div>
        <button
          type="button"
          onClick={toggleDone}
          disabled={busy}
          aria-label={done ? "Mark not done" : "Mark done"}
          className={`shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center text-[13px] font-bold transition-colors ${
            done ? "bg-sage-deep border-sage-deep text-ivory" : "border-ink/25 text-transparent hover:border-sage-deep/60"
          }`}
        >
          ✓
        </button>
      </div>

      <div className={`text-[13.5px] leading-relaxed space-y-5 ${done ? "text-ink/40" : "text-ink/75"}`}>
        {/* Level 1 — the movement itself: cream card, real elevation */}
        {week.format === "tiers3" && week.tiers ? (
          <div className="grid sm:grid-cols-3 gap-3">
            {(["restore", "rebuild", "thrive"] as const).map((tier) => (
              <div key={tier} className="bg-white rounded-2xl shadow-sm p-3.5">
                <p className="text-[10.5px] font-semibold uppercase tracking-wide text-gold-deep mb-1.5">
                  {tier === "restore" ? "Restore · 5 min" : tier === "rebuild" ? "Rebuild · 15 min" : "Thrive · 30 min"}
                </p>
                <ul className="text-[12px] space-y-1 list-disc list-inside">
                  {(week.tiers?.[tier] ?? []).map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {hasContent(week.reset) && (
              <p>
                <span className="text-[11px] font-medium text-sage-deep mr-1.5">Reset</span>
                {week.reset}
              </p>
            )}
            {hasContent(week.today) && (
              <p>
                <span className="text-[11px] font-medium text-gold-deep mr-1.5">Move</span>
                {week.today}
              </p>
            )}
            {/* Level 2 — a real choice to make: white card, light border */}
            {week.recoveryRoute && routeKeys.length > 0 && (
              <div className="bg-white rounded-2xl border border-line p-3.5">
                {primaryRouteKey ? (
                  <>
                    <p className="text-[11px] font-semibold text-indigo mb-1">{titleCaseRoute(primaryRouteKey)}</p>
                    <p>{week.recoveryRoute[primaryRouteKey]}</p>
                  </>
                ) : (
                  <p className="text-ink/55 italic">Choose whichever route below is closest to your birth.</p>
                )}
                {otherRouteKeys.length > 0 && (
                  <details className="text-[12px] text-ink/55 mt-1.5">
                    <summary className="cursor-pointer font-semibold text-indigo">
                      A different route instead?
                    </summary>
                    {otherRouteKeys.map((k) => (
                      <p key={k} className="mt-1.5">
                        <span className="font-semibold">{titleCaseRoute(k)}: </span>
                        {week.recoveryRoute?.[k]}
                      </p>
                    ))}
                  </details>
                )}
              </div>
            )}
            {week.build && week.build.length > 0 && (
              <div>
                <p className="text-[11px] font-medium text-gold-deep mb-1">Build</p>
                <ul className="space-y-1 list-disc list-inside">
                  {week.build.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            {week.door && (
              <div className="bg-white rounded-2xl border border-line p-3.5">
                <p className="text-[11px] font-semibold text-indigo mb-1">Choose your door — {week.door.pattern}</p>
                <p className="text-[12px]">
                  <span className="font-semibold">Comfort: </span>
                  {week.door.comfort}
                </p>
                <p className="text-[12px]">
                  <span className="font-semibold">Steady: </span>
                  {week.door.steady}
                </p>
                <p className="text-[12px]">
                  <span className="font-semibold">Challenge: </span>
                  {week.door.challenge}
                </p>
                <p className="text-[11px] italic text-ink/50 mt-1">
                  Same practice, three doors in. No door is the &ldquo;real&rdquo; one.
                </p>
              </div>
            )}
            {hasContent(week.release) && (
              <p>
                <span className="text-[11px] font-medium text-sage-deep mr-1.5">Release</span>
                {week.release}
              </p>
            )}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm p-4">
          <p className="font-semibold text-ink/85">⭐ {week.exercise.name}</p>
          <p className="text-[13px] mt-1">
            {week.exercise.focus}
            {week.exercise.benefit ? ` — ${week.exercise.benefit}` : ""}
          </p>
          <p className="text-[13px] mt-1.5">
            <span className="font-semibold">Common mistake: </span>
            {week.exercise.mistake}
          </p>
          <p className="text-[13px] mt-1">
            <span className="font-semibold">Tiny tip: </span>
            {week.exercise.tip}
          </p>
        </div>

        {hasContent(week.quote) && (
          <p className="bg-gold/10 border border-gold/30 rounded-2xl px-4 py-3 text-center font-display italic text-indigo text-[14px]">
            {week.quote}
          </p>
        )}

        {/* Level 3 — educational prose: no box, just room to breathe */}
        {whyBlockParts.length > 0 && (
          <div className="max-w-prose">
            <p className="text-[12px] font-medium text-sage-deep mb-1.5">💛 Why this helps</p>
            <div className="space-y-2">
              {whyBlockParts.map((part, i) => (
                <p key={i} className="italic">
                  {part}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Safety — collapsed by default, 2026-08-03: a persistent
            terracotta paragraph on every single week reads as a repeated
            warning/error to a mother who's already seen the same guidance
            dozens of times. Same information, now a small closed
            disclosure she can open if she actually wants to re-read it. */}
        <details className="group">
          <summary className="cursor-pointer text-[12px] font-medium text-ink/45 select-none list-none flex items-center gap-1.5">
            <span className="inline-block transition-transform group-open:rotate-90">›</span>
            🩺 Safety reminder
          </summary>
          <p className="text-[12px] text-ink/60 mt-1.5 pl-4">{week.safety}</p>
        </details>

        {week.recovery && week.recovery.length > 0 && <MoveRecoveryCheck items={week.recovery} />}

        {hasContent(week.reflectionPrompt) && (
          <div className="bg-gold/10 rounded-2xl border border-gold/30 p-4 text-center">
            <p className="text-[11px] font-medium text-gold-deep mb-1">Pause for a moment</p>
            <p className="italic">{week.reflectionPrompt}</p>
          </div>
        )}

        <div className="max-w-prose">
          <p className="italic">
            <span className="text-[12px] font-medium text-sage-deep not-italic mr-1">🌿 {week.closingLabel}</span>
            <br />
            {week.closingText}
          </p>
        </div>

        {hasContent(week.lookingAhead) && (
          <p className="text-[12.5px] italic text-gold-deep">
            <span className="font-semibold not-italic text-gold-deep">Looking ahead: </span>
            {week.lookingAhead}
          </p>
        )}

        {hasContent(week.milestone) && (
          <p className="font-display italic text-indigo text-[16px] text-center font-semibold pt-1">
            {week.milestone}
          </p>
        )}
        {hasContent(week.breathLegacy) && (
          <p className="font-display italic text-gold-deep text-[15px] text-center font-semibold">
            {week.breathLegacy}
          </p>
        )}
        {hasContent(week.philosophy) && (
          <p className="font-display italic text-sage-deep text-[14px] text-center">{week.philosophy}</p>
        )}
      </div>

      {week.whatYouGaveYourself && week.whatYouGaveYourself.length > 0 && (
        <div className="mt-6 pt-5 border-t border-gold/30">
          <p className="font-display text-lg text-indigo mb-1">What You Gave Yourself</p>
          <p className="text-[12px] text-ink/55 italic mb-2">
            Not what this built for them. What it gave back to you, whether or not anyone else ever knew.
          </p>
          <ul className="space-y-1.5">
            {week.whatYouGaveYourself.map((item, i) => (
              <li key={i} className="text-[13px] text-ink/75">
                <span className="text-indigo font-bold mr-1.5">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {week.childLearned && week.childLearned.length > 0 && (
        <div className="mt-6 pt-5 border-t border-gold/30">
          <p className="font-display text-lg text-indigo mb-1">What Your Child Learned Watching You</p>
          <p className="text-[12px] text-ink/55 italic mb-2">
            Not what you learned this stretch. What they did, just from watching.
          </p>
          <ul className="space-y-1.5">
            {week.childLearned.map((item, i) => (
              <li key={i} className="text-[13px] text-ink/75">
                <span className="text-gold-deep font-bold mr-1.5">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {hasContent(week.finalNote) && (
        <div className="mt-6 pt-5 border-t border-gold/30">
          <p className="text-[13px] italic text-ink/70">{week.finalNote}</p>
          {week.signatureLine && week.signatureLine.length > 0 && (
            <div className="mt-4 text-center">
              {week.signatureLine.map((line, i) => (
                <p
                  key={i}
                  className={`font-display italic font-bold text-[17px] ${i === 0 ? "text-indigo" : "text-gold-deep"}`}
                >
                  {line}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Heavy-day safety bridge — new 2026-07-29, Phase 1 of the Maternal Mental
// Health / PPD integration (see CLAUDE.md). Shown only when her check-in's
// mood lands on "heavy day" — the one moment the app already knows she's
// having a hard time, so it's the natural place to gently offer more than
// just that day's Reset card. Deliberately not a screening tool: one soft
// question, never scored, and every answer (including "no"/declining) still
// leads to the same real support options, never a dead end.
function HeavyDaySafetyBridge() {
  const [answer, setAnswer] = useState<"" | "yes" | "maybe" | "no">("");

  return (
    <div className="mt-5 bg-terracotta/10 rounded-2xl border border-terracotta/30 p-5">
      <p className="text-sm text-ink/80 mb-3">
        Sounds like today is a heavy one. Is anything about how you&apos;re
        feeling worrying you right now?
      </p>
      {!answer ? (
        <div className="flex flex-wrap gap-2">
          {(["yes", "maybe", "no"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setAnswer(v)}
              className="text-sm font-semibold px-5 py-2 rounded-full border-[1.5px] border-terracotta/50 text-terracotta"
            >
              {v === "yes" ? "Yes" : v === "maybe" ? "Maybe" : "No, I'm okay"}
            </button>
          ))}
        </div>
      ) : answer === "yes" || answer === "maybe" ? (
        <div>
          <p className="text-sm text-ink/75 mb-3">
            Thank you for saying so. Please don&apos;t sit with it alone —
            real support is close by.
          </p>
          <Link
            href="/safety"
            className="inline-block text-sm font-semibold px-6 py-2.5 rounded-full bg-terracotta text-ivory"
          >
            Go to emergency numbers and support →
          </Link>
        </div>
      ) : (
        <p className="text-sm text-ink/70">
          Okay — glad to hear it. If that changes, today or any day,{" "}
          <Link href="/dashboard/care/mental-health" className="font-semibold text-terracotta underline">
            support is always here
          </Link>
          .
        </p>
      )}
    </div>
  );
}

export default function CareWeekContent({
  week,
  moodScore,
  doneCardKeys,
  deliveryType,
  healthFlags,
  dietPreference,
}: {
  week: CareWeekRow;
  // timeAvailable is no longer used here -- the new Move series lets her
  // choose her own tier/door directly rather than the app auto-picking one
  // from her check-in's time answer. Kept optional on the caller's props so
  // chart/page.tsx doesn't need to stop passing it.
  timeAvailable?: string;
  moodScore: number;
  doneCardKeys: Set<string>;
  deliveryType?: string;
  healthFlags?: string[];
  dietPreference?: DietPreference | null;
}) {
  const resetKey = RESET_KEY_BY_MOOD[moodScore] ?? "okay";
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

      <MoveSection
        week={week.move}
        deliveryType={deliveryType}
        doneMove={doneCardKeys.has("move")}
        weekNumber={week.week_number}
      />

      <div className="grid md:grid-cols-2 gap-4">
        {(hasContent(week.nourish) || dietPreference) && (
        <WeekCard
          title="Nourish"
          accent="sage"
          cardKey="nourish"
          weekNumber={week.week_number}
          initiallyDone={doneCardKeys.has("nourish")}
        >
          {hasContent(week.nourish) && <p className="mb-2">{week.nourish}</p>}
          {dietPreference && (
            <div className="mt-3 pt-3 border-t border-sage-deep/15">
              <p className="text-[11px] font-semibold text-sage-deep uppercase tracking-wide mb-1">
                A protein tip for you, {dietPreference === "vegetarian" ? "vegetarian" : "non-vegetarian"}
              </p>
              <p className="text-[12px] text-ink/65 mb-1.5">{PROTEIN_TIP[dietPreference].headline}</p>
              <ul className="text-[12px] text-ink/70 list-disc list-inside space-y-0.5">
                {PROTEIN_TIP[dietPreference].tips.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>
          )}
        </WeekCard>
        )}

        {hasContent(week.hydration_goal) && (
          <WeekCard
            title="Hydration goal"
            accent="indigo"
            cardKey="hydration"
            weekNumber={week.week_number}
            initiallyDone={doneCardKeys.has("hydration")}
          >
            {week.hydration_goal}
          </WeekCard>
        )}

        {hasContent(week.feeding_comfort) && (
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

        {hasContent(week.rest_support) && (
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

        {hasContent(week.care_for_yourself) && (
          <WeekCard
            title="Care for yourself"
            accent="gold-deep"
            cardKey="care_for_yourself"
            weekNumber={week.week_number}
            initiallyDone={doneCardKeys.has("care_for_yourself")}
          >
            {week.care_for_yourself}
          </WeekCard>
        )}

        {hasContent(week.your_corner) && (
          <WeekCard
            title="Your corner"
            accent="gold"
            cardKey="your_corner"
            weekNumber={week.week_number}
            initiallyDone={doneCardKeys.has("your_corner")}
          >
            {week.your_corner}
          </WeekCard>
        )}

        {hasContent(week.support_moment) && (
          <WeekCard
            title="Support moment"
            accent="sage"
            cardKey="support_moment"
            weekNumber={week.week_number}
            initiallyDone={doneCardKeys.has("support_moment")}
          >
            {week.support_moment}
          </WeekCard>
        )}

        {hasContent(week.celebrate_this_week) && (
          <WeekCard title="Celebrate this week" accent="gold-deep">
            {week.celebrate_this_week}
          </WeekCard>
        )}

        {hasContent(week.mental_health_note) && (
          <WeekCard title="Mental health & support" accent="terracotta">
            <p className="mb-2">{week.mental_health_note}</p>
            <Link
              href="/dashboard/care/mental-health"
              className="font-semibold text-terracotta underline text-[13px]"
            >
              Open Mental health & support →
            </Link>
          </WeekCard>
        )}
      </div>

      {resetKey === "heavy_day" && <HeavyDaySafetyBridge />}

      {visibleConditionNotes.filter((n) => hasContent(n.note)).length > 0 && (
        <div className="mt-5 bg-terracotta/5 rounded-2xl border border-terracotta/20 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-terracotta mb-2">
            If this applies to you
          </p>
          <div className="space-y-2">
            {visibleConditionNotes.filter((n) => hasContent(n.note)).map((n, i) => (
              <p key={i} className="text-[13px] text-ink/70">
                {n.note}
              </p>
            ))}
          </div>
        </div>
      )}

      {hasContent(week.for_your_care_team) && (
        <div className="mt-5 bg-indigo/5 rounded-2xl border border-indigo/20 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo mb-1.5">
            For your care team
          </p>
          <p className="text-[13px] text-ink/70">{week.for_your_care_team}</p>
        </div>
      )}

      <div className="mt-5 flex items-center justify-between gap-3 bg-ivory-2 rounded-2xl border border-line px-5 py-4">
        <p className="text-[13px] text-ink/65">
          However Reset landed for you today, support isn&apos;t limited to
          this one card.
        </p>
        <Link
          href="/dashboard/care/mental-health"
          className="shrink-0 text-[13px] font-semibold text-terracotta underline"
        >
          Mental health &amp; support →
        </Link>
      </div>

      {week.closing_note && (
        <div className="mt-8 rounded-2xl border-2 border-gold-deep/40 bg-ivory px-6 py-8 sm:px-10 sm:py-10 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-deep mb-5">
            The final page of this chart
          </p>
          <div className="max-w-md mx-auto space-y-4">
            {week.closing_note.split("\n\n").map((para, i) => (
              <p
                key={i}
                className={
                  para.startsWith("With real warmth")
                    ? "font-display italic text-indigo text-[15px] mt-2 whitespace-pre-line"
                    : para === "A note from Mom's Village"
                    ? "font-display text-xl text-indigo mb-2"
                    : "font-display italic text-ink/75 text-[15px] leading-relaxed"
                }
              >
                {para}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
