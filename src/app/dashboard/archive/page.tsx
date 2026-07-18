import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { calculateMonthNumber, monthLabel } from "@/lib/monthCalculator";
import { hasActiveSubscription } from "@/lib/subscription";
import LockedPreview from "@/components/LockedPreview";

export default async function ArchivePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isSubscribed = await hasActiveSubscription(supabase, user!.id);

  const { data: profile } = await supabase
    .from("profiles")
    .select("baby_dob, due_date")
    .eq("id", user!.id)
    .maybeSingle();

  const referenceDate = profile?.baby_dob || profile?.due_date;
  const currentMonth = referenceDate ? calculateMonthNumber(referenceDate) : 0;

  // Every month from the start of the journey up to (but not including) her
  // current month — nothing here is ever locked by time, only by subscription.
  const pastMonths = [];
  for (let m = -9; m < currentMonth; m++) {
    pastMonths.push(m);
  }

  return (
    <main className="max-w-[900px] mx-auto px-6 py-10">
      <div className="mb-2 text-xs uppercase tracking-[0.12em] text-sage-deep font-semibold">
        nothing is ever lost
      </div>
      <h1 className="font-display text-[30px] text-indigo mb-2">Your archive</h1>
      <p className="text-sm text-ink/65 mb-10 max-w-[540px]">
        Every month you've already passed, always here to revisit — whether
        you missed it the first time or just want to look back.
      </p>

      {!isSubscribed ? (
        <LockedPreview
          title="Your full archive is waiting"
          teaser="Join to unlock every month, past and present, whenever you want to look back."
        />
      ) : pastMonths.length === 0 ? (
        <div className="bg-ivory-2 rounded-2xl border border-line p-8 text-center">
          <p className="font-display italic text-lg text-sage-deep">
            Nothing to look back on yet — your journey is just getting started.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {pastMonths.map((m) => (
            <Link
              key={m}
              href={`/dashboard/chart/${m}`}
              className="bg-ivory-2 rounded-xl border border-line p-5 hover:border-gold-deep transition-colors"
            >
              <p className="font-display text-base text-indigo">{monthLabel(m)}</p>
              <p className="text-xs text-sage-deep font-semibold mt-1">view →</p>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
