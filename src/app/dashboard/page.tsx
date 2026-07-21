import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { calculateMonthNumber, monthLabel, journeyProgress } from "@/lib/monthCalculator";
import { hasActiveSubscription } from "@/lib/subscription";
import { getCurrentSeason } from "@/lib/season";
import LockedPreview from "@/components/LockedPreview";

const SECTIONS = [
  { key: "money", label: "Money", accent: "gold" as const },
  { key: "development", label: "Development", accent: "sage" as const },
  { key: "environment", label: "Environment", accent: "terracotta" as const },
];

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

  const bySection = SECTIONS.map((section) => ({
    ...section,
    items: (chartContent || []).filter((c) => c.section === section.key),
  }));

  const babyName = profile!.baby_name || "your little one";
  const momFirstName = profile!.mom_name ? `, ${profile!.mom_name}` : "";

  return (
    <main className="max-w-[900px] mx-auto px-6 py-10">
      <div className="mb-2 text-xs uppercase tracking-[0.12em] text-sage-deep font-semibold">
        welcome back{momFirstName}
      </div>
      <h1 className="font-display text-[30px] text-indigo mb-1">
        {babyName} — {label}
      </h1>
      <p className="text-sm text-ink/65 mb-6">
        What she needs, what's changing, and what to expect this month.
      </p>
      <div className="flex flex-wrap gap-x-5 gap-y-2 mb-6">
        <Link href="/dashboard/archive" className="text-xs font-semibold text-sage-deep">
          ← look back at past months
        </Link>
        <Link href="/dashboard/vaccinations" className="text-xs font-semibold text-sage-deep">
          track vaccinations →
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
        <div className="grid md:grid-cols-3 gap-5">
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
                  Your {label.toLowerCase()} {section.label.toLowerCase()} plan
                  is being brewed — check back soon.
                </p>
              ) : (
                <ul className="space-y-3">
                  {section.items.map((item) => (
                    <li key={item.id} className="flex items-start gap-2.5">
                      <input type="checkbox" className="mt-1 accent-gold-deep" disabled />
                      <div>
                        <p className="text-sm font-semibold text-ink">{item.title}</p>
                        <p className="text-[13px] text-ink/65 mt-0.5">{item.body}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
