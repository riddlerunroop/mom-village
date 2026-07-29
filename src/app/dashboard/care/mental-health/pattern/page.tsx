import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { hasActiveSubscription } from "@/lib/subscription";
import LockedPreview from "@/components/LockedPreview";

const MOOD_LABEL: Record<number, string> = {
  1: "Heavy day",
  2: "A little low",
  3: "Okay",
  4: "Good",
  5: "Really good",
};

const MOOD_COLOR: Record<number, string> = {
  1: "#BE6240",
  2: "#D9A441",
  3: "#C9BEA8",
  4: "#5F7052",
  5: "#1F2E4D",
};

export default async function PatternPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isSubscribed = await hasActiveSubscription(supabase, user!.id);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);

  const { data: checkins } = isSubscribed
    ? await supabase
        .from("user_daily_checkin")
        .select("checkin_date, mood_score, energy_score")
        .eq("user_id", user!.id)
        .gte("checkin_date", thirtyDaysAgo.toISOString().slice(0, 10))
        .order("checkin_date", { ascending: true })
    : { data: null };

  const rows = checkins || [];
  const last14 = rows.slice(-14);
  const lowMoodDays = last14.filter((r) => r.mood_score <= 2).length;
  const daysCheckedInLast14 = last14.length;

  let signal: "not_enough" | "mostly_steady" | "some_heavy" | "several_heavy" = "not_enough";
  if (rows.length >= 3) {
    if (daysCheckedInLast14 === 0) signal = "not_enough";
    else if (lowMoodDays >= 5) signal = "several_heavy";
    else if (lowMoodDays >= 2) signal = "some_heavy";
    else signal = "mostly_steady";
  }

  return (
    <main className="max-w-[680px] mx-auto px-6 py-10">
      <Link href="/dashboard/care/mental-health" className="text-xs font-semibold text-ink/45 hover:text-indigo mb-3 inline-block">
        ← Mental health &amp; support
      </Link>
      <h1 className="font-display text-[26px] text-indigo mb-2">
        Check my recent pattern
      </h1>
      <p className="text-sm text-ink/60 mb-6 max-w-[540px]">
        A gentle look at the mood you&apos;ve logged in your daily check-ins —
        not a test, not a score, and not a diagnosis. Just a way to notice a
        pattern you might not see day to day.
      </p>

      {!isSubscribed ? (
        <LockedPreview
          title="See your own patterns"
          teaser="Join to check in daily and see a gentle picture of how you've been doing."
        />
      ) : signal === "not_enough" ? (
        <div className="bg-ivory-2 rounded-2xl border border-line p-6">
          <p className="text-sm text-ink/70 mb-4">
            You don&apos;t have enough recent check-ins yet for a pattern to
            show. The more you check in, the more useful this becomes — but
            there&apos;s no pressure, only whenever it&apos;s useful to you.
          </p>
          <Link
            href="/care-checkin?next=/dashboard/care/mental-health/pattern"
            className="inline-block text-sm font-semibold px-6 py-2.5 rounded-full bg-gold-deep text-ivory"
          >
            Check in for today
          </Link>
        </div>
      ) : (
        <>
          <div className="bg-ivory-2 rounded-2xl border border-line p-6 mb-6">
            <div className="text-xs uppercase tracking-wide font-bold text-ink/50 mb-3">
              last {last14.length} check-ins
            </div>
            <div className="flex gap-1.5 flex-wrap mb-4">
              {last14.map((r, i) => (
                <div
                  key={i}
                  title={`${r.checkin_date}: ${MOOD_LABEL[r.mood_score]}`}
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: MOOD_COLOR[r.mood_score] }}
                />
              ))}
            </div>
            <div className="flex flex-wrap gap-3 text-[11px] text-ink/55">
              {Object.entries(MOOD_LABEL).map(([k, label]) => (
                <span key={k} className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block"
                    style={{ backgroundColor: MOOD_COLOR[Number(k)] }}
                  />
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-ivory-2 rounded-2xl border border-line p-6">
            {signal === "mostly_steady" && (
              <p className="text-sm text-ink/75">
                Your recent check-ins look fairly steady. Everyone has harder
                days mixed in — that&apos;s normal. If that ever changes, this
                page will still be here.
              </p>
            )}
            {signal === "some_heavy" && (
              <p className="text-sm text-ink/75">
                You&apos;ve logged a few heavier days recently. That&apos;s
                worth paying attention to gently, not panicking over —
                everyone has stretches like this. If it keeps happening or
                starts feeling harder to shake, it may help to read a bit more
                about what perinatal depression and anxiety can look like, or
                talk to someone you trust.
              </p>
            )}
            {signal === "several_heavy" && (
              <p className="text-sm text-ink/75 mb-4">
                You&apos;ve logged several heavy days in the last couple of
                weeks. That doesn&apos;t automatically mean anything specific
                — but it&apos;s a real, honest pattern, and it&apos;s worth
                taking seriously enough to talk to someone, whether that&apos;s
                your doctor or a person you trust. You don&apos;t have to
                carry this alone.
              </p>
            )}
            {signal === "several_heavy" && (
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/dashboard/care/mental-health/about"
                  className="inline-block text-sm font-semibold px-5 py-2 rounded-full border-[1.5px] border-terracotta text-terracotta"
                >
                  What this can look like
                </Link>
                <Link
                  href="/dashboard/care/mental-health/prepare"
                  className="inline-block text-sm font-semibold px-5 py-2 rounded-full bg-gold-deep text-ivory"
                >
                  Prepare to talk to someone
                </Link>
              </div>
            )}
          </div>
        </>
      )}

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
