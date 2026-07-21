import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { hasActiveSubscription } from "@/lib/subscription";
import { calculateCareWeek, carePhaseLabel, carePhaseKey, careWeekLabel } from "@/lib/weekCalculator";
import LockedPreview from "@/components/LockedPreview";

const SECTIONS = [
  { key: "body", label: "Body", accent: "gold" as const },
  { key: "food", label: "Food", accent: "sage" as const },
  { key: "mind", label: "Mind", accent: "terracotta" as const },
  { key: "skin", label: "Skin", accent: "indigo" as const },
];

export default async function CarePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isSubscribed = await hasActiveSubscription(supabase, user!.id);

  const { data: profile } = await supabase
    .from("profiles")
    .select("baby_dob, due_date, delivery_type")
    .eq("id", user!.id)
    .maybeSingle();

  const week = calculateCareWeek(profile?.baby_dob ?? null, profile?.due_date ?? null);
  const phaseLabel = week !== null ? carePhaseLabel(week) : null;
  const weekLabel = week !== null ? careWeekLabel(week) : null;
  const phaseKey = week !== null ? carePhaseKey(week) : null;
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
      <p className="text-sm text-ink/65 mb-10 max-w-[540px]">
        Body, mind, skin, and more — built around exactly where you are,
        pregnancy through postpartum.
      </p>

      {!isSubscribed ? (
        <LockedPreview
          title="Your care chart is ready to be personalized"
          teaser="Join to get a weekly plan built around your own stage, feeding, and how much time you actually have today."
        />
      ) : !todayCheckin ? (
        <div className="bg-ivory-2 rounded-2xl border border-line p-8 text-center">
          <p className="font-display italic text-lg text-sage-deep mb-4">
            One quick check-in and today's chart is ready for you.
          </p>
          <Link
            href="/care-checkin"
            className="inline-block text-sm font-semibold px-6 py-2.5 rounded-full bg-gold-deep text-ivory"
          >
            Check in for today
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
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
                  Nothing tagged for today's mix yet — check back soon.
                </p>
              ) : (
                <ul className="space-y-3">
                  {section.items.map((item) => (
                    <li key={item.id}>
                      <p className="text-sm font-semibold text-ink">{item.title}</p>
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
        update today's check-in →
      </Link>
    </main>
  );
}
