import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { hasActiveSubscription } from "@/lib/subscription";
import LockedPreview from "@/components/LockedPreview";

export default async function WealthPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isSubscribed = await hasActiveSubscription(supabase, user!.id);

  return (
    <main className="max-w-[900px] mx-auto px-6 py-10">
      <div className="mb-2 text-xs uppercase tracking-[0.12em] text-sage-deep font-semibold">
        her own security
      </div>
      <h1 className="font-display text-[30px] text-indigo mb-2">
        Wealth &amp; direction
      </h1>
      <p className="text-sm text-ink/65 mb-10 max-w-[540px]">
        Government schemes, how to save for these first years, and how to
        stay financially independent.
      </p>

      {!isSubscribed ? (
        <LockedPreview
          title="Real direction, not just information"
          teaser="Join to get guidance on schemes, savings, and staying financially independent through these early years."
        />
      ) : (
        <div className="space-y-5">
          <Link
            href="/budget-calculator"
            className="block bg-indigo rounded-2xl p-7 text-ivory hover:opacity-95 transition-opacity"
          >
            <div className="text-xs uppercase tracking-[0.12em] text-gold font-semibold mb-2">
              the real minimum, not the inflated version
            </div>
            <h3 className="font-display text-xl mb-2">Minimum Budget Planner</h3>
            <p className="text-sm text-ivory/75">
              A few honest questions, and a realistic number — pregnancy
              through your child&apos;s third birthday, built around what you
              actually need.
            </p>
          </Link>

          <Link
            href="/dashboard/wealth/schemes"
            className="block bg-ivory-2 rounded-2xl border border-line p-7 hover:border-gold-deep/40 transition-colors"
          >
            <div className="text-xs uppercase tracking-[0.12em] text-sage-deep font-semibold mb-2">
              what you're entitled to
            </div>
            <h3 className="font-display text-xl text-indigo mb-2">
              Government Benefits &amp; Savings Directory
            </h3>
            <p className="text-sm text-ink/65">
              PMSMA, JSSK, PMMVY, Ayushman Bharat, Sukanya Samriddhi, and
              more — what each one gives you, and how to actually access it.
            </p>
          </Link>

          <Link
            href="/dashboard/wealth/savings"
            className="block bg-ivory-2 rounded-2xl border border-line p-7 hover:border-gold-deep/40 transition-colors"
          >
            <div className="text-xs uppercase tracking-[0.12em] text-sage-deep font-semibold mb-2">
              general education, not advice
            </div>
            <h3 className="font-display text-xl text-indigo mb-2">
              Savings &amp; Financial Planning Guidance
            </h3>
            <p className="text-sm text-ink/65">
              Emergency funds, insurance, debt, PPF and Sukanya Samriddhi,
              and a maternity cash-flow worksheet — the order that tends to
              serve you best.
            </p>
          </Link>

          <div className="bg-ivory-2 rounded-2xl border border-line p-8 text-center">
            <p className="font-display italic text-lg text-sage-deep">
              Books are being written — worth the wait.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
