import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { hasActiveSubscription } from "@/lib/subscription";
import LockedPreview from "@/components/LockedPreview";
import {
  expandScheduleOccurrences,
  getOccurrenceStatus,
  ageInDays,
  doseLabel,
  DoseStatus,
} from "@/lib/vaccinationSchedule";

const STATUS_STYLES: Record<DoseStatus, { label: string; className: string }> = {
  overdue: { label: "Overdue", className: "bg-terracotta/15 text-terracotta" },
  due_soon: { label: "Due soon", className: "bg-gold/20 text-gold-deep" },
  upcoming: { label: "Upcoming", className: "text-ink/40" },
  given: { label: "Given", className: "bg-sage-deep/15 text-sage-deep" },
};

export default async function VaccinationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isSubscribed = await hasActiveSubscription(supabase, user!.id);

  const { data: profile } = await supabase
    .from("profiles")
    .select("baby_dob, baby_name")
    .eq("id", user!.id)
    .maybeSingle();

  let rows: {
    occurrenceKey: string;
    label: string;
    status: DoseStatus;
    regional?: boolean;
    note?: string;
  }[] = [];
  let overdueCount = 0;
  let dueSoonCount = 0;

  if (isSubscribed && profile?.baby_dob) {
    const { data: records } = await supabase
      .from("user_vaccination_records")
      .select("occurrence_key, date_given")
      .eq("user_id", user!.id);

    const givenByKey = Object.fromEntries(
      (records || []).map((r) => [r.occurrence_key, r.date_given])
    );

    const babyAgeDays = ageInDays(profile.baby_dob);
    const occurrences = expandScheduleOccurrences().sort(
      (a, b) => a.dueFromDays - b.dueFromDays
    );

    rows = occurrences.map((o) => {
      const status = getOccurrenceStatus(o, babyAgeDays, givenByKey[o.occurrenceKey] || null);
      if (status === "overdue") overdueCount += 1;
      if (status === "due_soon") dueSoonCount += 1;
      return {
        occurrenceKey: o.occurrenceKey,
        label: doseLabel(o.spec),
        status,
        regional: o.spec.regional,
        note: o.spec.note,
      };
    });
  }

  const babyName = profile?.baby_name || "your little one";

  return (
    <main className="max-w-[760px] mx-auto px-6 py-10">
      <Link href="/dashboard" className="text-xs font-semibold text-sage-deep mb-6 inline-block">
        ← back to Monthly Chart
      </Link>

      <div className="mb-2 text-xs uppercase tracking-[0.12em] text-sage-deep font-semibold">
        {babyName}'s vaccination card
      </div>
      <h1 className="font-display text-[30px] text-indigo mb-2">Vaccinations</h1>
      <p className="text-sm text-ink/65 mb-8 max-w-[560px]">
        Track doses against the government schedule, and log a new one by
        photographing the card — this is a reference, not medical advice;
        always follow your pediatrician's guidance.
      </p>

      {!isSubscribed ? (
        <LockedPreview
          title="Never lose track of a dose"
          teaser="Join to track your child's vaccination schedule and get reminders here in the app."
        />
      ) : !profile?.baby_dob ? (
        <div className="bg-ivory-2 rounded-2xl border border-line p-8 text-center">
          <p className="font-display italic text-lg text-sage-deep">
            Once your baby's born, their vaccination schedule will show up
            here.
          </p>
        </div>
      ) : (
        <>
          {(overdueCount > 0 || dueSoonCount > 0) && (
            <div
              className={`rounded-2xl p-6 mb-6 ${
                overdueCount > 0 ? "bg-terracotta/10" : "bg-gold/10"
              }`}
            >
              <p className="font-display italic text-lg text-indigo">
                {overdueCount > 0
                  ? `${overdueCount} ${overdueCount === 1 ? "dose is" : "doses are"} overdue`
                  : `${dueSoonCount} ${dueSoonCount === 1 ? "dose is" : "doses are"} coming up soon`}
              </p>
            </div>
          )}

          <Link
            href="/dashboard/vaccinations/log"
            className="inline-block rounded-full bg-gold-deep text-ivory font-semibold text-sm px-6 py-3 mb-8 hover:opacity-90 transition-opacity"
          >
            Log a dose
          </Link>

          <div className="space-y-2.5">
            {rows.map((row) => {
              const style = STATUS_STYLES[row.status];
              return (
                <div
                  key={row.occurrenceKey}
                  className="flex items-start justify-between gap-4 bg-ivory-2 rounded-xl border border-line px-5 py-4"
                >
                  <div>
                    <p className="text-sm font-semibold text-ink">{row.label}</p>
                    {(row.regional || row.note) && (
                      <p className="text-xs text-ink/50 mt-1">
                        {row.regional && "Phased/regional rollout — ask your doctor. "}
                        {row.note}
                      </p>
                    )}
                  </div>
                  <span
                    className={`shrink-0 text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap ${style.className}`}
                  >
                    {style.label}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </main>
  );
}
