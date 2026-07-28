import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { calculateMonthNumber, monthLabel, journeyProgress, shouldPromptBirth } from "@/lib/monthCalculator";
import { hasActiveSubscription } from "@/lib/subscription";
import { getCurrentSeason } from "@/lib/season";
import LockedPreview from "@/components/LockedPreview";
import MonthlyChartGrid from "@/components/MonthlyChartGrid";

const PRIORITY_LABELS: Record<string, string> = {
  appointments_safety: "Safety this month",
  buy_now: "Worth buying",
  baby_development: "What's changing",
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .maybeSingle();

  const isSubscribed = await hasActiveSubscription(supabase, user!.id);

  const referenceDate = profile!.baby_dob || profile!.due_date;
  const monthNumber = calculateMonthNumber(referenceDate);
  const label = monthLabel(monthNumber);
  const progress = journeyProgress(monthNumber);
  const deliveryType = profile!.delivery_type;

  const currentSeason = getCurrentSeason();

  const { data: chartContent } = isSubscribed
    ? await supabase
        .from("monthly_chart_content")
        .select("*")
        .eq("month_number", monthNumber)
        .or(`delivery_type.eq.${deliveryType},delivery_type.eq.any`)
        .or(`season.eq.${currentSeason},season.eq.any`)
        .order("sort_order")
    : { data: null };

  // Which of this month's items she's already checked off — real, saving
  // checkboxes now (2026-07-28), not disabled decoration. See
  // migration_27_monthly_chart_progress.sql.
  let completedIds = new Set<string>();
  if (isSubscribed && chartContent && chartContent.length > 0) {
    const { data: doneRows } = await supabase
      .from("user_monthly_chart_progress")
      .select("content_id")
      .eq("user_id", user!.id)
      .in("content_id", chartContent.map((c) => c.id));
    completedIds = new Set((doneRows || []).map((r) => r.content_id));
  }

  // "This month's three priorities" — a short strip surfacing the single
  // most important item from each of the three highest-stakes sections
  // (safety first, then a real spending/arranging decision, then what's
  // changing for her), rather than making her scan all six cards to find
  // what matters most. Pulled from the same locked content, not new copy.
  const PRIORITY_SECTIONS = ["appointments_safety", "buy_now", "baby_development"];
  const priorities = PRIORITY_SECTIONS.map((sectionKey) => {
    const item = (chartContent || [])
      .filter((c) => c.section === sectionKey)
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))[0];
    return item ? { ...item, sectionKey } : null;
  }).filter((x): x is NonNullable<typeof x> => x !== null);

  const babyName = profile!.baby_name || "your little one";
  const momFirstName = profile!.mom_name ? `, ${profile!.mom_name}` : "";
  const promptBirth = shouldPromptBirth(profile!.due_date, profile!.baby_dob);

  return (
    <main className="max-w-[900px] mx-auto px-6 py-10">
      {promptBirth && (
        <Link
          href="/dashboard/confirm-birth"
          className="block mb-6 rounded-2xl border-2 border-terracotta bg-terracotta/10 px-5 py-4 hover:bg-terracotta/15 transition-colors"
        >
          <p className="font-display text-base text-indigo mb-0.5">
            Has your baby arrived?
          </p>
          <p className="text-sm text-ink/70">
            Tap here to log her birth date — we&apos;ll start counting her very first month from the day she was born.
          </p>
        </Link>
      )}
      <div className="mb-2 text-xs uppercase tracking-[0.12em] text-sage-deep font-semibold">
        welcome back{momFirstName}
      </div>
      <h1 className="font-display text-[30px] text-indigo mb-1">
        {babyName} — {label}
      </h1>
      <p className="text-sm text-ink/65 mb-6">
        What she needs, what&apos;s changing, and what to expect this month.
      </p>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Link href="/dashboard/archive" className="text-xs font-semibold text-sage-deep">
          ← look back at past months
        </Link>
        <Link
          href="/dashboard/vaccinations"
          className="text-xs font-semibold px-4 py-2 rounded-full border-[1.5px] border-sage-deep text-sage-deep hover:bg-sage-deep/5 transition-colors"
        >
          Track vaccinations
        </Link>
        <Link
          href="/dashboard/memories"
          className="text-xs font-semibold px-4 py-2 rounded-full border-[1.5px] border-terracotta text-terracotta hover:bg-terracotta/5 transition-colors"
        >
          Log a memory
        </Link>
      </div>

      <div className="mb-10">
        <div className="h-2 rounded-full bg-ivory-2 overflow-hidden">
          <div
            className="h-full bg-gold-deep rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-[11px] text-sage-deep mt-2 font-semibold uppercase tracking-wide">
          {progress}% through the 1000-day journey
        </p>
      </div>

      {!isSubscribed ? (
        <LockedPreview
          title="Your full Monthly Chart is waiting"
          teaser={`You're at ${label.toLowerCase()} — join to see exactly what to buy, skip, and expect this month, with fresh guidance unlocked every month after.`}
        />
      ) : (
        <>
          {priorities.length > 0 && (
            <div className="mb-8">
              <div className="text-xs uppercase tracking-[0.12em] text-gold-deep font-semibold mb-3">
                this month&apos;s three priorities
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                {priorities.map((item, i) => (
                  <div
                    key={item.id}
                    className="bg-indigo rounded-2xl p-4"
                  >
                    <div className="text-[10px] uppercase tracking-wide font-bold text-gold mb-1.5">
                      {PRIORITY_LABELS[item.sectionKey] || "Worth knowing"}
                    </div>
                    <p className="text-[13px] text-ivory/90 leading-snug">
                      {i + 1}. {item.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          <MonthlyChartGrid items={chartContent || []} completedIds={completedIds} />
        </>
      )}
    </main>
  );
}
