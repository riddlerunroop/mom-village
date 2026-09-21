import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { hasActiveSubscription } from "@/lib/subscription";
import { calculateCareWeek, carePhaseLabel, carePhaseKey, careWeekLabel, journeyWeekNumber, type CarePhaseKey } from "@/lib/weekCalculator";
import { calculateNourishLookup, nourishGapWeek, type NourishLookup, type NourishStage } from "@/lib/nourishCalculator";
import type { NourishWeekRow } from "@/types/nourishContent";
import { pickDailyResetIndex } from "@/lib/resetCalculator";
import { careCategoryForDate, pickCareNoteId } from "@/lib/careForYourselfCalculator";
import LockedPreview from "@/components/LockedPreview";
import CareStepItem from "@/components/CareStepItem";
import CareWeekContent, { type CareWeekRow } from "@/components/CareWeekContent";
import type { ResetActivityRow } from "@/components/ResetOfTheDay";
import type { CareForYourselfNoteRow } from "@/components/CareForYourself";

// Renamed 2026-07-28 per Roop's review — user-facing section names now read
// Move / Nourish / Reset / Care for yourself / Rediscover. The underlying
// DB section keys (body/food/mind/skin/rediscover) are unchanged, so no
// migration was needed for this — just a display-label change.
const SECTIONS = [
  { key: "body", label: "Move", accent: "gold" as const },
  { key: "food", label: "Nourish", accent: "sage" as const },
  { key: "mind", label: "Reset", accent: "terracotta" as const },
  { key: "skin", label: "Care for yourself", accent: "indigo" as const },
  { key: "rediscover", label: "Rediscover", accent: "gold-deep" as const },
];

// Full phase list — kept only for Roop's own manual ?phase= review link
// (typed directly into the URL). Deliberately not surfaced anywhere in the
// member-facing UI anymore, per her 2026-07-28 review: "remove the preview
// switcher, it was only ever meant for my own review."
const PHASES: { key: CarePhaseKey; label: string }[] = [
  { key: "first_trimester", label: "First trimester" },
  { key: "second_trimester", label: "Second trimester" },
  { key: "third_trimester", label: "Third trimester" },
  { key: "early_healing", label: "Early healing (0–6wk)" },
  { key: "finding_rhythm", label: "Finding rhythm (6–12wk)" },
  { key: "rebuilding", label: "Rebuilding (3–6mo)" },
  { key: "settling_into_strength", label: "Settling into strength (6–12mo)" },
  { key: "sustainable_rhythms", label: "Sustainable rhythms (1–2yr)" },
  { key: "rhythm_year_three", label: "Your rhythm, year three (2–3yr)" },
];

// Reviewer-only Nourish toggle, added 2026-09-15 per Roop's explicit ask:
// as a real subscriber she only ever sees her own current day out of 190
// possible weeks, and after the postpartum-content mixup (see CLAUDE.md's
// 2026-09-15 entry) she wanted a "foolproof" way to check any week/day
// herself rather than trusting a spot-check. Same spirit as the existing
// ?phase= preview switcher above — a manual URL override never surfaced in
// the normal member UI, just three extra params: ?nourishStage=pregnancy|
// postpartum&nourishWeek=N&nourishDay=D. When present and valid, this
// replaces the real calculateNourishLookup() date-based result below, but
// leaves everything else on the page (her real check-in, her real
// care_chart_week_content week) untouched — she's browsing the Nourish
// meal plan specifically, not faking her whole profile.
function parseNourishOverride(
  stageParam: string | undefined,
  weekParam: string | undefined,
  dayParam: string | undefined
): NourishLookup | null {
  const stage: NourishStage | null =
    stageParam === "pregnancy" || stageParam === "postpartum" ? stageParam : null;
  if (!stage) return null;

  const maxWeek = stage === "pregnancy" ? 40 : 157;
  const weekNumRaw = Number(weekParam);
  const dayNumRaw = Number(dayParam);
  if (!Number.isFinite(weekNumRaw) || !Number.isFinite(dayNumRaw)) return null;

  const weekNumber = Math.min(maxWeek, Math.max(1, Math.round(weekNumRaw)));
  const dayNumber = Math.min(7, Math.max(1, Math.round(dayNumRaw)));
  return { stage, weekNumber, dayNumber };
}

export default async function CareChartPage({
  searchParams,
}: {
  searchParams: Promise<{
    phase?: string;
    nourishStage?: string;
    nourishWeek?: string;
    nourishDay?: string;
  }>;
}) {
  const {
    phase: previewParam,
    nourishStage: nourishStageParam,
    nourishWeek: nourishWeekParam,
    nourishDay: nourishDayParam,
  } = await searchParams;
  const previewPhase = PHASES.find((p) => p.key === previewParam) ?? null;
  const nourishOverride = parseNourishOverride(nourishStageParam, nourishWeekParam, nourishDayParam);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isSubscribed = await hasActiveSubscription(supabase, user!.id);

  const { data: profile } = await supabase
    .from("profiles")
    .select("baby_dob, due_date, delivery_type")
    .eq("id", user!.id)
    .maybeSingle();

  const week = calculateCareWeek(profile?.baby_dob ?? null, profile?.due_date ?? null);
  const phaseLabel = previewPhase ? previewPhase.label : week !== null ? carePhaseLabel(week) : null;
  const weekLabel = previewPhase ? null : week !== null ? careWeekLabel(week) : null;
  const phaseKey: CarePhaseKey | null = previewPhase ? previewPhase.key : week !== null ? carePhaseKey(week) : null;
  const deliveryType = profile?.delivery_type || "any";

  const today = new Date().toISOString().slice(0, 10);
  const { data: todayCheckin } = isSubscribed
    ? await supabase
        .from("user_daily_checkin")
        .select("time_available, energy_score, mood_score")
        .eq("user_id", user!.id)
        .eq("checkin_date", today)
        .maybeSingle()
    : { data: null };

  const { data: mantraRow } = isSubscribed && phaseKey
    ? await supabase
        .from("weekly_care_chart_content")
        .select("mantra")
        .eq("phase_key", phaseKey)
        .not("mantra", "is", null)
        .limit(1)
        .maybeSingle()
    : { data: null };

  const { data: careProfile } = isSubscribed
    ? await supabase
        .from("user_care_profile")
        .select("health_flags, diet_preference")
        .eq("user_id", user!.id)
        .maybeSingle()
    : { data: null };
  const healthFlags: string[] = careProfile?.health_flags || [];
  const dietPreference = (careProfile?.diet_preference ?? null) as
    | "vegetarian"
    | "non_vegetarian"
    | null;

  // New week-by-week content — currently pregnancy weeks 1-39 (First/Second/
  // Third trimester, migrations 33-36) plus postpartum weeks 0-6 (Early
  // healing, migrations 37-38) — takes priority over the old phase-based
  // system whenever a row exists for her exact journey week. Skipped
  // entirely in Roop's own ?phase= preview mode, since that browses phases,
  // not weeks. Falls through to the old system below for every week not yet
  // converted (postpartum weeks 7+, Finding rhythm onward).
  const journeyWeekNum = !previewPhase && week !== null ? journeyWeekNumber(week) : null;
  const { data: weekRow } = isSubscribed && journeyWeekNum
    ? await supabase
        .from("care_chart_week_content")
        .select(
          "week_number, theme_title, mantra, priority, journey, what_you_may_notice, move, nourish, hydration_goal, feeding_comfort, rest_support, reset, care_for_yourself, your_corner, support_moment, celebrate_this_week, mental_health_note, for_your_care_team, for_your_care_team_who, for_your_care_team_lede, for_your_care_team_detail, condition_notes, closing_note"
        )
        .eq("week_number", journeyWeekNum)
        .maybeSingle()
    : { data: null };
  const newWeekContent = weekRow as CareWeekRow | null;

  // Nourish weekly meal plan (nourish_week_content, migration_54) — a
  // completely separate lookup from journeyWeekNum above, since this
  // series is authored by ordinary gestational week / weeks-since-birth,
  // not the app's internal forward-count convention. See
  // src/lib/nourishCalculator.ts. Skipped in Roop's ?phase= preview mode,
  // same as the week-by-week content above, and for the genuine pregnancy
  // weeks 2-8 gap (no locked content exists for those weeks yet).
  const nourishLookup = nourishOverride
    ? nourishOverride
    : !previewPhase
    ? calculateNourishLookup(profile?.baby_dob ?? null, profile?.due_date ?? null)
    : null;
  const { data: nourishRow } = isSubscribed && nourishLookup && !nourishGapWeek(nourishLookup)
    ? await supabase
        .from("nourish_week_content")
        .select(
          "stage, week_number, trimester, phase_label, theme_title, mantra, why_it_matters, condition_notes, meat_fish_eggs_note, using_meals_note, days, reflection, looking_ahead"
        )
        .eq("stage", nourishLookup.stage)
        .eq("week_number", nourishLookup.weekNumber)
        .maybeSingle()
    : { data: null };
  const nourishWeek = nourishRow as NourishWeekRow | null;
  const nourishToday =
    nourishWeek && nourishLookup
      ? nourishWeek.days.find((d) => d.day_number === nourishLookup.dayNumber) ?? null
      : null;

  // Reset of the day (migration_59/60, 2026-09-16) — a village-wide,
  // date-based rotation through the 30-card bank, completely independent
  // of her pregnancy/postpartum week. See src/lib/resetCalculator.ts and
  // CLAUDE.md for the full design history (cumulative badges, not a
  // streak; one fixed card a day, no reshuffle).
  const { data: resetActivities } = isSubscribed
    ? await supabase
        .from("reset_activities")
        .select("id, card_number, emoji, title, body")
        .eq("is_active", true)
        .order("card_number")
    : { data: null };
  const resetActivityRow: ResetActivityRow | null =
    resetActivities && resetActivities.length > 0
      ? resetActivities[pickDailyResetIndex(resetActivities.length, today)]
      : null;

  let resetDoneToday = false;
  let resetTotalCompletions = 0;
  if (isSubscribed) {
    const { count: totalCount } = await supabase
      .from("user_reset_completions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user!.id);
    resetTotalCompletions = totalCount ?? 0;

    const { data: todayResetRow } = await supabase
      .from("user_reset_completions")
      .select("id")
      .eq("user_id", user!.id)
      .eq("completed_date", today)
      .maybeSingle();
    resetDoneToday = Boolean(todayResetRow);
  }

  // Care for yourself (migration_61/62, 2026-09-18) — the seven-day
  // personal-care rhythm that fully replaces the old generic per-week
  // care_for_yourself text field wherever a mother sees her real chart
  // (Roop's explicit "replace it everywhere" decision). See
  // src/lib/careForYourselfCalculator.ts and CLAUDE.md for the full spec.
  const careCategory = isSubscribed ? careCategoryForDate(today) : null;
  const { data: careNotes } = isSubscribed && careCategory
    ? await supabase
        .from("care_for_yourself_notes")
        .select("id, category, content_type, headline, care_note, tiny_action")
        .eq("category", careCategory)
        .eq("is_active", true)
        .order("note_number")
    : { data: null };

  const pickedCareNoteId =
    isSubscribed && careCategory
      ? pickCareNoteId(
          user!.id,
          careCategory,
          (careNotes || []).map((n) => ({ id: n.id, contentType: n.content_type })),
          today
        )
      : null;
  const careForYourselfNote: CareForYourselfNoteRow | null =
    (careNotes || []).find((n) => n.id === pickedCareNoteId) ?? null;

  let careForYourselfDoneToday = false;
  let careForYourselfWeekCount = 0;
  if (isSubscribed) {
    const sevenDaysAgo = new Date(new Date(`${today}T00:00:00Z`).getTime() - 6 * 86400000)
      .toISOString()
      .slice(0, 10);
    const { data: careCompletionRows } = await supabase
      .from("user_care_completions")
      .select("completed_date")
      .eq("user_id", user!.id)
      .gte("completed_date", sevenDaysAgo);
    careForYourselfWeekCount = careCompletionRows?.length ?? 0;
    careForYourselfDoneToday = (careCompletionRows || []).some((r) => r.completed_date === today);
  }

  let doneCardKeys = new Set<string>();
  if (isSubscribed && newWeekContent && todayCheckin) {
    const { data: doneRows } = await supabase
      .from("user_care_week_progress")
      .select("card_key")
      .eq("user_id", user!.id)
      .eq("week_number", newWeekContent.week_number)
      .eq("completed_date", today);
    doneCardKeys = new Set((doneRows || []).map((r) => r.card_key));
  }

  let chartContent: {
    id: string;
    section: string;
    title: string;
    body: string;
    time_option: string;
    how_long: string | null;
    why_today: string | null;
    what_to_avoid: string | null;
    detail: string | null;
  }[] | null = null;

  if (isSubscribed && phaseKey && todayCheckin && !newWeekContent) {
    let query = supabase
      .from("weekly_care_chart_content")
      .select("id, section, title, body, time_option, how_long, why_today, what_to_avoid, detail")
      .eq("phase_key", phaseKey)
      .or(`delivery_type.eq.${deliveryType},delivery_type.eq.any`)
      .or(`time_option.eq.${todayCheckin.time_available},time_option.eq.any`)
      .order("section")
      .order("sort_order");

    query = healthFlags.length > 0
      ? query.or(`health_flag.eq.none,health_flag.in.(${healthFlags.join(",")})`)
      : query.eq("health_flag", "none");

    const { data } = await query;
    chartContent = data;
  }

  // Today's completions, so each Care Step opens already showing its real
  // done/undone state rather than always starting unchecked.
  let doneIds = new Set<string>();
  if (isSubscribed && chartContent && chartContent.length > 0) {
    const { data: doneRows } = await supabase
      .from("user_care_progress")
      .select("content_id")
      .eq("user_id", user!.id)
      .eq("completed_date", today)
      .in("content_id", chartContent.map((c) => c.id));
    doneIds = new Set((doneRows || []).map((r) => r.content_id));
  }

  const bySection = SECTIONS.map((section) => ({
    ...section,
    items: (chartContent || []).filter((c) => c.section === section.key),
  }));

  return (
    <main className="max-w-[900px] mx-auto px-6 py-10">
      <Link href="/dashboard/care" className="text-xs font-semibold text-ink/45 hover:text-indigo mb-3 inline-block">
        ← Care
      </Link>
      <div className="mb-2 text-xs uppercase tracking-[0.12em] text-sage-deep font-semibold">
        today, for you
      </div>
      <h1 className="font-display text-[30px] text-indigo mb-1">
        Your care chart
      </h1>
      {weekLabel && (
        <p className="text-sm font-semibold text-gold-deep mb-1">
          {weekLabel} — {phaseLabel}
        </p>
      )}
      {previewPhase && (
        <p className="text-sm font-semibold text-terracotta mb-1">
          Previewing: {previewPhase.label}
        </p>
      )}
      <p className="text-sm text-ink/65 mb-2 max-w-[540px]">
        Move, nourish, reset, care for yourself, and rediscover — built
        around exactly where you are, pregnancy through postpartum.
      </p>
      <p className="text-xs text-ink/45 mb-6">
        Feeling something that worries you right now?{" "}
        <Link href="/safety" className="text-terracotta underline">
          See warning signs and emergency numbers
        </Link>
        .
      </p>

      {previewPhase && (
        <div className="flex flex-wrap gap-1.5 mb-8">
          {PHASES.map((p) => (
            <Link
              key={p.key}
              href={`/dashboard/care/chart?phase=${p.key}`}
              className={`text-[11px] font-semibold px-3 py-1.5 rounded-full border ${
                p.key === previewPhase.key
                  ? "bg-indigo text-ivory border-indigo"
                  : "text-indigo border-indigo/30"
              }`}
            >
              {p.label}
            </Link>
          ))}
          <Link
            href="/dashboard/care/chart"
            className="text-[11px] font-semibold px-3 py-1.5 rounded-full border border-terracotta text-terracotta"
          >
            ← back to my real chart
          </Link>
        </div>
      )}

      {nourishOverride && (() => {
        const maxWeek = nourishOverride.stage === "pregnancy" ? 40 : 157;
        const otherStage: NourishStage =
          nourishOverride.stage === "pregnancy" ? "postpartum" : "pregnancy";
        const link = (stage: NourishStage, wk: number, day: number) =>
          `/dashboard/care/chart?nourishStage=${stage}&nourishWeek=${wk}&nourishDay=${day}`;
        const { stage, weekNumber, dayNumber } = nourishOverride;
        return (
          <div className="mb-8 bg-terracotta/10 rounded-2xl border border-terracotta/30 p-4">
            <p className="text-[13px] font-semibold text-terracotta mb-2.5">
              Nourish reviewer mode — browsing {stage} week {weekNumber}, day{" "}
              {dayNumber}. Not what a real member sees; this only appears
              because of the nourish* link params.
            </p>
            <div className="flex flex-wrap gap-1.5">
              <Link
                href={link(stage, Math.max(1, weekNumber - 1), dayNumber)}
                className="text-[11px] font-semibold px-3 py-1.5 rounded-full border border-terracotta text-terracotta"
              >
                ← week {Math.max(1, weekNumber - 1)}
              </Link>
              <Link
                href={link(stage, weekNumber, dayNumber > 1 ? dayNumber - 1 : 7)}
                className="text-[11px] font-semibold px-3 py-1.5 rounded-full border border-terracotta/50 text-terracotta"
              >
                ← day {dayNumber > 1 ? dayNumber - 1 : 7}
              </Link>
              <Link
                href={link(stage, weekNumber, dayNumber < 7 ? dayNumber + 1 : 1)}
                className="text-[11px] font-semibold px-3 py-1.5 rounded-full border border-terracotta/50 text-terracotta"
              >
                day {dayNumber < 7 ? dayNumber + 1 : 1} →
              </Link>
              <Link
                href={link(stage, Math.min(maxWeek, weekNumber + 1), dayNumber)}
                className="text-[11px] font-semibold px-3 py-1.5 rounded-full border border-terracotta text-terracotta"
              >
                week {Math.min(maxWeek, weekNumber + 1)} →
              </Link>
              <Link
                href={link(otherStage, 1, 1)}
                className="text-[11px] font-semibold px-3 py-1.5 rounded-full border border-indigo/30 text-indigo"
              >
                switch to {otherStage}, week 1
              </Link>
              <Link
                href="/dashboard/care/chart"
                className="text-[11px] font-semibold px-3 py-1.5 rounded-full border border-line text-ink/60"
              >
                ← back to my real chart
              </Link>
            </div>
          </div>
        );
      })()}

      {isSubscribed && !newWeekContent && mantraRow?.mantra && (
        <p className="font-display italic text-lg text-sage-deep mb-8 max-w-[540px]">
          &ldquo;{mantraRow.mantra}&rdquo;
        </p>
      )}

      {!isSubscribed ? (
        <LockedPreview
          title="Your care chart is ready to be personalized"
          teaser="Join to get a weekly plan built around your own stage, feeding, and how much time you actually have today."
        />
      ) : !todayCheckin ? (
        <div className="bg-ivory-2 rounded-2xl border border-line p-8 text-center">
          <p className="font-display italic text-lg text-sage-deep mb-4">
            One quick check-in and today&apos;s chart is ready for you.
          </p>
          <Link
            href="/care-checkin?next=/dashboard/care/chart"
            className="inline-block text-sm font-semibold px-6 py-2.5 rounded-full bg-gold-deep text-ivory"
          >
            Check in for today
          </Link>
        </div>
      ) : newWeekContent ? (
        <CareWeekContent
          week={newWeekContent}
          timeAvailable={todayCheckin.time_available}
          moodScore={todayCheckin.mood_score}
          doneCardKeys={doneCardKeys}
          deliveryType={deliveryType}
          healthFlags={healthFlags}
          dietPreference={dietPreference}
          nourishWeek={nourishWeek}
          nourishToday={nourishToday}
          resetActivity={resetActivityRow}
          resetDoneToday={resetDoneToday}
          resetTotalCompletions={resetTotalCompletions}
          careForYourselfCategory={careCategory}
          careForYourselfNote={careForYourselfNote}
          careForYourselfDoneToday={careForYourselfDoneToday}
          careForYourselfWeekCount={careForYourselfWeekCount}
        />
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {bySection.map((section) => (
              <div
                key={section.key}
                className="bg-ivory-2 rounded-2xl border border-line p-6"
                style={{
                  borderTop: `3px solid var(--color-${section.accent})`,
                }}
              >
                <h3 className="font-display text-lg text-indigo mb-3">
                  {section.label}
                </h3>

                {section.items.length === 0 ? (
                  <p className="text-sm text-ink/55 italic">
                    Nothing tagged for today&apos;s mix yet — check back soon.
                  </p>
                ) : (
                  <ul className="space-y-2.5">
                    {section.items.map((item) => (
                      <CareStepItem
                        key={item.id}
                        item={item}
                        initiallyDone={doneIds.has(item.id)}
                      />
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          {todayCheckin.mood_score <= 1 && (
            <div className="mt-5 bg-terracotta/10 rounded-2xl border border-terracotta/30 p-5">
              <p className="text-sm text-ink/80 mb-2">
                Sounds like today is a heavy one. If anything about how
                you&apos;re feeling is worrying you, real support is close
                by.
              </p>
              <Link
                href="/dashboard/care/mental-health"
                className="inline-block text-sm font-semibold px-6 py-2.5 rounded-full bg-terracotta text-ivory"
              >
                Mental health &amp; support →
              </Link>
            </div>
          )}

          <div className="mt-5 flex items-center justify-between gap-3 bg-ivory-2 rounded-2xl border border-line px-5 py-4">
            <p className="text-[13px] text-ink/65">
              However today feels, support isn&apos;t limited to a single
              card.
            </p>
            <Link
              href="/dashboard/care/mental-health"
              className="shrink-0 text-[13px] font-semibold text-terracotta underline"
            >
              Mental health &amp; support →
            </Link>
          </div>
        </>
      )}

      {isSubscribed && todayCheckin && (
        <Link
          href="/care-checkin?next=/dashboard/care/chart"
          className="text-xs font-semibold text-sage-deep mt-8 inline-block"
        >
          update today&apos;s check-in →
        </Link>
      )}
    </main>
  );
}
