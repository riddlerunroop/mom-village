import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { hasActiveSubscription } from "@/lib/subscription";
import { calculateCareWeek, carePhaseLabel, carePhaseKey, careWeekLabel, type CarePhaseKey } from "@/lib/weekCalculator";
import LockedPreview from "@/components/LockedPreview";

const SECTIONS = [
  { key: "body", label: "Body", accent: "gold" as const },
  { key: "food", label: "Food", accent: "sage" as const },
  { key: "mind", label: "Mind", accent: "terracotta" as const },
  { key: "skin", label: "Skin", accent: "indigo" as const },
  { key: "rediscover", label: "Rediscover", accent: "gold-deep" as const },
];

// All 9 phases, in order — used only by the ?phase= preview switcher below,
// so content can be reviewed phase-by-phase without having to change a real
// profile's dates. Never shown to a mother unless she's already in preview
// mode (i.e. arrived via a ?phase= link), so the normal experience — see
// exactly where you are, nothing else — is untouched.
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

// The 5/15/30 tags map to their own small badge, rather than doubling as
// the item's title — so a mother sees a real name for what she's being
// asked to do, with the duration shown alongside it, not standing in for it.
const TIME_BADGES: Record<string, string> = {
  "5": "5 min",
  "15": "15 min",
  "30": "30 min",
};

export default async function CarePage({
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

  // Has she checked in yet today? The check-in (time/energy/mood) is what
  // picks which items from today's phase menu to actually show her, and
  // doubles as the light daily emotional touch-base.
  const today = new Date().toISOString().slice(0, 10);
  const { data: todayCheckin } = isSubscribed
    ? await supabase
        .from("user_daily_checkin")
        .select("time_available, energy_score, mood_score")
        .eq("user_id", user!.id)
        .eq("checkin_date", today)
        .maybeSingle()
    : { data: null };

  // This phase's mantra — a single short line of warmth, stored once per
  // phase (not per row), looked up separately since it isn't tied to
  // today's specific check-in-matched items.
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

  let chartContent = null;
  if (isSubscribed && phaseKey && todayCheckin) {
    let query = supabase
      .from("weekly_care_chart_content")
      .select("*")
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

  const bySection = SECTIONS.map((section) => ({
    ...section,
    items: (chartContent || []).filter((c) => c.section === section.key),
  }));

  return (
    <main className="max-w-[900px] mx-auto px-6 py-10">
      <div className="mb-2 text-xs uppercase tracking-[0.12em] text-sage-deep font-semibold">
        this week, for you
      </div>
      <h1 className="font-display text-[30px] text-indigo mb-1">
        Your weekly care chart
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
      <p className="text-sm text-ink/65 mb-6 max-w-[540px]">
        Body, mind, skin, and more — built around exactly where you are,
        pregnancy through postpartum.
      </p>

      {previewPhase ? (
        <div className="flex flex-wrap gap-1.5 mb-8">
          {PHASES.map((p) => (
            <Link
              key={p.key}
              href={`/dashboard/care?phase=${p.key}`}
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
            href="/dashboard/care"
            className="text-[11px] font-semibold px-3 py-1.5 rounded-full border border-terracotta text-terracotta"
          >
            ← back to my real chart
          </Link>
        </div>
      ) : (
        <Link
          href={`/dashboard/care?phase=${phaseKey ?? "early_healing"}`}
          className="text-[11px] font-semibold text-ink/40 hover:text-ink/60 mb-6 inline-block"
        >
          preview other phases (for review)
        </Link>
      )}

      {isSubscribed && mantraRow?.mantra && (
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
            href="/care-checkin"
            className="inline-block text-sm font-semibold px-6 py-2.5 rounded-full bg-gold-deep text-ivory"
          >
            Check in for today
          </Link>
        </div>
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
                <ul className="space-y-3">
                  {section.items.map((item) => (
                    <li key={item.id}>
                      <p className="text-sm font-semibold text-ink">
                        {item.title}
                        {TIME_BADGES[item.time_option] && item.title !== TIME_BADGES[item.time_option] && (
                          <span className="ml-2 text-[11px] font-semibold text-sage-deep align-middle">
                            · {TIME_BADGES[item.time_option]}
                          </span>
                        )}
                      </p>
                      <p className="text-[13px] text-ink/65 mt-0.5">{item.body}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      <Link
        href="/care-checkin"
        className="text-xs font-semibold text-sage-deep mt-8 inline-block"
      >
        update today&apos;s check-in →
      </Link>
    </main>
  );
}
