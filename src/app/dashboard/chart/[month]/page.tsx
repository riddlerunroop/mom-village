import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { calculateMonthNumber, monthLabel } from "@/lib/monthCalculator";
import { hasActiveSubscription } from "@/lib/subscription";
import { getCurrentSeason } from "@/lib/season";
import LockedPreview from "@/components/LockedPreview";
import MonthlyChartGrid from "@/components/MonthlyChartGrid";

// Lets her open any past month's chart from the archive — same card layout
// as "today," just for a month she's already lived through. Nothing here is
// ever time-locked, only subscription-gated, same as the archive listing.
export default async function PastMonthChartPage({
  params,
}: {
  params: Promise<{ month: string }>;
}) {
  const { month } = await params;
  const monthNumber = Number(month);

  if (!Number.isInteger(monthNumber)) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("baby_dob, due_date, baby_name, delivery_type")
    .eq("id", user!.id)
    .maybeSingle();

  const isSubscribed = await hasActiveSubscription(supabase, user!.id);

  const referenceDate = profile?.baby_dob || profile?.due_date;
  const currentMonth = referenceDate ? calculateMonthNumber(referenceDate) : 0;

  // Only months she's actually reached are viewable here — the current
  // month lives on the main dashboard, and anything ahead of "now" hasn't
  // been written for her stage yet.
  if (monthNumber >= currentMonth) {
    notFound();
  }

  const label = monthLabel(monthNumber);
  const deliveryType = profile?.delivery_type || "any";
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

  const babyName = profile?.baby_name || "your little one";

  return (
    <main className="max-w-[900px] mx-auto px-6 py-10">
      <Link
        href="/dashboard/archive"
        className="text-xs font-semibold text-sage-deep mb-4 inline-block"
      >
        ← back to your archive
      </Link>
      <div className="mb-2 text-xs uppercase tracking-[0.12em] text-sage-deep font-semibold">
        looking back
      </div>
      <h1 className="font-display text-[30px] text-indigo mb-1">
        {babyName} — {label}
      </h1>
      <p className="text-sm text-ink/65 mb-10">
        What she needed, what was changing, and what to expect that month.
      </p>

      {!isSubscribed ? (
        <LockedPreview
          title="Your full archive is waiting"
          teaser="Join to unlock every month, past and present, whenever you want to look back."
        />
      ) : (
        <MonthlyChartGrid items={chartContent || []} />
      )}
    </main>
  );
}
