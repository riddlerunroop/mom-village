import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { hasActiveSubscription } from "@/lib/subscription";
import LockedPreview from "@/components/LockedPreview";

const ACTIONS = [
  {
    title: "Get through the next 10 minutes",
    line: "Put your baby somewhere safe (crib, cot, or with someone else) and step into another room for a few minutes if you need to. It's okay to put your baby down and walk away to breathe.",
  },
  {
    title: "Reach one person",
    line: "You don't have to explain everything. A single message — \"having a hard time, can you call me\" — is enough to start.",
  },
  {
    title: "Lower the bar for today",
    line: "Feeding, safety, and rest are what matter today. Everything else can wait, including the things you think you 'should' be doing.",
  },
  {
    title: "Name it out loud, even just to yourself",
    line: "\"This is hard right now\" is a complete sentence. You don't need to justify it or compare it to anyone else's experience.",
  },
  {
    title: "Water, food, a few breaths",
    line: "It sounds small, but low blood sugar and dehydration make everything feel worse. A glass of water and a few slow breaths can genuinely help, even briefly.",
  },
];

export default async function SupportForTodayPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isSubscribed = await hasActiveSubscription(supabase, user!.id);

  return (
    <main className="max-w-[680px] mx-auto px-6 py-10">
      <Link href="/dashboard/care/mental-health" className="text-xs font-semibold text-ink/45 hover:text-indigo mb-3 inline-block">
        ← Mental health &amp; support
      </Link>
      <h1 className="font-display text-[26px] text-indigo mb-2">
        Support for today
      </h1>
      <p className="text-sm text-ink/60 mb-6 max-w-[540px]">
        A few small, real things that can help right now — not a fix, just
        something to hold onto for the next little while.
      </p>

      {!isSubscribed ? (
        <LockedPreview
          title="Support for hard days"
          teaser="Join for real, practical support for the moments that are genuinely hard."
        />
      ) : (
        <div className="space-y-4">
          {ACTIONS.map((a) => (
            <div key={a.title} className="bg-ivory-2 rounded-2xl border border-line p-5">
              <h2 className="font-display text-base text-indigo mb-1.5">{a.title}</h2>
              <p className="text-[13px] text-ink/70 leading-relaxed">{a.line}</p>
            </div>
          ))}

          <div className="bg-terracotta/10 border border-terracotta/30 rounded-2xl p-5">
            <p className="text-sm text-ink/80">
              If today feels like more than a hard day — if you&apos;re
              scared for yourself or your baby — please use real support
              right now.
            </p>
            <Link href="/safety" className="font-semibold text-terracotta underline text-sm">
              Go to emergency numbers and support →
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
