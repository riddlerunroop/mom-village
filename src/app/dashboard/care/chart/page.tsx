import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { hasActiveSubscription } from "@/lib/subscription";
import { calculateCareWeek, carePhaseLabel, carePhaseKey, careWeekLabel, pregnancyWeekNumber, type CarePhaseKey } from "@/lib/weekCalculator";
import LockedPreview from "@/components/LockedPreview";
import CareStepItem from "@/components/CareStepItem";
import CareWeekContent, { type CareWeekRow } from "@/components/CareWeekContent";

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

export default async function CareChartPage({
  searchParams,
}: {
  searchParams: Promise<{ phase?: string }>;
}) {
  const { phase: previewParam } = await searchParams;
  const previewPhase = PHASES.find((p) => p.key === previewParam) ?? null;

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
        .select("health_flags")
        .eq("user_id", user!.id)
        .maybeSingle()
    : { data: null };
  const healthFlags: string[] = careProfile?.health_flags || [];

  // New week-by-week content (currently Second trimester, weeks 14-26 only
  // — see migration_33/34) takes priority over the old phase-based system
  // whenever a row exists for her exact pregnancy week. Skipped entirely in
  // Roop's own ?phase= preview mode, since that browses phases, not weeks.
  // Falls through to the old system below for every week not yet converted
  // (First trimester, Third trimester, all of postpartum).
  const pregWeekNum = !previewPhase && week !== null ? pregnancyWeekNumber(week) : null;
  const { data: weekRow } = isSubscribed && pregWeekNum
    ? await supabase
        .from("care_chart_week_content")
        .select(
          "week_number, theme_title, mantra, priority, journey, what_you_may_notice, move, nourish, hydration_goal, reset, care_for_yourself, your_corner, support_moment, celebrate_this_week, for_your_care_team"
        )
        .eq("week_number", pregWeekNum)
        .maybeSingle()
    : { data: null };
  const newWeekContent = weekRow as CareWeekRow | null;

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
        />
      ) : (
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
