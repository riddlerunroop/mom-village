import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { hasActiveSubscription } from "@/lib/subscription";
import { calculateCareWeek, carePhaseLabel, carePhaseKey, careWeekLabel, type CarePhaseKey } from "@/lib/weekCalculator";
import LockedPreview from "@/components/LockedPreview";

// Care landing page — rebuilt 2026-07-28 per Roop's review. Previously
// /dashboard/care WAS the daily chart itself; now it's a proper landing
// page (stage display, a stage-specific message, a preview of all 5
// sections, one clear primary action) and the actual matched content lives
// at /dashboard/care/chart. This mirrors how Monthly Chart and other
// pillars greet her before showing the day's specifics.

const SECTION_PREVIEWS = [
  { label: "Move", accent: "gold", line: "Named exercises for exactly where you are — never a generic \"go for a walk.\"" },
  { label: "Nourish", accent: "sage", line: "Real food guidance for your stage, with PCOS- and diabetes-specific notes where they apply." },
  { label: "Reset", accent: "terracotta", line: "A weekly mantra and real tools for hard days, not just \"stay positive.\"" },
  { label: "Care for yourself", accent: "indigo", line: "A real morning-and-night routine, not just \"keep it simple.\"" },
  { label: "Rediscover", accent: "gold-deep", line: "Small things that are just for you — not baby-related, not another chore." },
] as const;

export default async function CareLandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isSubscribed = await hasActiveSubscription(supabase, user!.id);

  const { data: profile } = await supabase
    .from("profiles")
    .select("baby_dob, due_date")
    .eq("id", user!.id)
    .maybeSingle();

  const week = calculateCareWeek(profile?.baby_dob ?? null, profile?.due_date ?? null);
  const phaseLabel = week !== null ? carePhaseLabel(week) : null;
  const weekLabel = week !== null ? careWeekLabel(week) : null;
  const phaseKey: CarePhaseKey | null = week !== null ? carePhaseKey(week) : null;

  // Same single source of truth as the chart page — this phase's mantra,
  // stored once per phase, not a separately-written landing message that
  // could drift out of sync with it.
  const { data: mantraRow } = isSubscribed && phaseKey
    ? await supabase
        .from("weekly_care_chart_content")
        .select("mantra")
        .eq("phase_key", phaseKey)
        .not("mantra", "is", null)
        .limit(1)
        .maybeSingle()
    : { data: null };

  const today = new Date().toISOString().slice(0, 10);
  const { data: todayCheckin } = isSubscribed
    ? await supabase
        .from("user_daily_checkin")
        .select("checkin_date")
        .eq("user_id", user!.id)
        .eq("checkin_date", today)
        .maybeSingle()
    : { data: null };

  // Gentle, private, non-punitive completion note — never a streak or
  // score. Just "you showed up," and silent (not scolding) if she hasn't.
  let recentDaysCount = 0;
  if (isSubscribed) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    const { data: recentRows } = await supabase
      .from("user_care_progress")
      .select("completed_date")
      .eq("user_id", user!.id)
      .gte("completed_date", sevenDaysAgo.toISOString().slice(0, 10));
    recentDaysCount = new Set((recentRows || []).map((r) => r.completed_date)).size;
  }

  return (
    <main className="max-w-[900px] mx-auto px-6 py-10">
      <div className="mb-2 text-xs uppercase tracking-[0.12em] text-sage-deep font-semibold">
        care &amp; wellbeing
      </div>
      <h1 className="font-display text-[30px] text-indigo mb-1">
        {weekLabel && phaseLabel ? phaseLabel : "Your care chart"}
      </h1>
      {weekLabel && (
        <p className="text-sm font-semibold text-gold-deep mb-3">{weekLabel}</p>
      )}
      {isSubscribed && mantraRow?.mantra && (
        <p className="font-display italic text-lg text-sage-deep mb-6 max-w-[540px]">
          &ldquo;{mantraRow.mantra}&rdquo;
        </p>
      )}

      {!isSubscribed ? (
        <LockedPreview
          title="Your care chart is ready to be personalized"
          teaser="Join to get a weekly plan built around your own stage, feeding, and how much time you actually have today."
        />
      ) : (
        <div className="bg-ivory-2 rounded-2xl border border-line p-7 mb-8">
          {todayCheckin ? (
            <>
              <p className="text-sm text-ink/70 mb-4">
                You&apos;ve already checked in today — your chart is ready.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/dashboard/care/chart"
                  className="inline-block text-sm font-semibold px-6 py-2.5 rounded-full bg-gold-deep text-ivory"
                >
                  View today&apos;s care chart
                </Link>
                <Link
                  href="/care-checkin?next=/dashboard/care/chart"
                  className="inline-block text-sm font-semibold px-6 py-2.5 rounded-full border-[1.5px] border-sage-deep text-sage-deep"
                >
                  Update today&apos;s check-in
                </Link>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-ink/70 mb-4">
                One quick check-in — how much time, energy, and how
                you&apos;re feeling — and we&apos;ll build today&apos;s chart
                around it.
              </p>
              <Link
                href="/care-checkin?next=/dashboard/care/chart"
                className="inline-block text-sm font-semibold px-6 py-2.5 rounded-full bg-gold-deep text-ivory"
              >
                Build my care chart
              </Link>
            </>
          )}
          {recentDaysCount > 0 && (
            <p className="text-xs text-ink/45 mt-4">
              You&apos;ve cared for yourself on {recentDaysCount} of the last
              7 days — however many, that counts.
            </p>
          )}
        </div>
      )}

      {isSubscribed && (
        <Link
          href="/dashboard/care/mental-health"
          className="block bg-ivory-2 rounded-2xl border border-terracotta/30 p-5 mb-6 hover:border-terracotta/60 transition-colors"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[11px] uppercase tracking-wide font-bold text-terracotta mb-1">
                Mental health &amp; support
              </div>
              <p className="text-[13px] text-ink/70 leading-snug">
                How you&apos;re feeling matters, any day — not just the ones
                a weekly card happens to land on.
              </p>
            </div>
            <span className="text-terracotta text-lg flex-shrink-0">→</span>
          </div>
        </Link>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SECTION_PREVIEWS.map((s) => (
          <div
            key={s.label}
            className="bg-ivory-2 rounded-2xl border border-line p-5"
            style={{ borderTop: `3px solid var(--color-${s.accent})` }}
          >
            <div className="text-[11px] uppercase tracking-wide font-bold text-ink/60 mb-2">
              {s.label}
            </div>
            <p className="text-[13px] text-ink/70 leading-snug">{s.line}</p>
          </div>
        ))}
      </div>

      <p className="text-xs text-ink/45 mt-8">
        Feeling something that worries you right now?{" "}
        <Link href="/safety" className="text-terracotta underline">
          See warning signs and emergency numbers
        </Link>
        .
      </p>
    </main>
  );
}
