import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { hasActiveSubscription } from "@/lib/subscription";
import LockedPreview from "@/components/LockedPreview";
import { EXPLORE_PROMPTS } from "@/lib/rediscoverCategories";

// Rediscover — Explore, the doorway for a mother who doesn't know her thing
// yet ("I want something for myself, but I genuinely don't know what").
// Deliberately lightweight for V1 — a curated, static "could this be your
// thing?" list linking straight into browsing that category. No
// experiments, no tracking, no pattern detection — that heavier engine
// stays deferred to a later version, per the spec.

export default async function ExplorePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isSubscribed = await hasActiveSubscription(supabase, user!.id);

  return (
    <main className="max-w-[900px] mx-auto px-6 py-10">
      <Link href="/dashboard/rediscover" className="text-xs text-ink/50 hover:text-indigo mb-4 inline-block">
        ← Rediscover
      </Link>
      <div className="mb-2 text-xs uppercase tracking-[0.12em] text-gold-deep font-semibold">
        🌱 explore
      </div>
      <h1 className="font-display text-[28px] text-indigo mb-2">
        Could this be your thing?
      </h1>
      <p className="text-sm text-ink/65 mb-8 max-w-[560px]">
        No pressure to decide anything today. Tap whatever catches your eye
        — it just takes you to what other mothers are already doing with
        it, so you can see what it actually looks like in practice.
      </p>

      {!isSubscribed ? (
        <LockedPreview
          title="Find what might be yours"
          teaser="Join to browse ideas, skills, and businesses other mothers are already exploring."
        />
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          {EXPLORE_PROMPTS.map((prompt) => (
            <Link
              key={prompt.category}
              href={`/dashboard/rediscover/find?family=${prompt.family}&category=${encodeURIComponent(prompt.category)}`}
              className="block bg-ivory-2 rounded-xl border border-line px-4 py-3 text-sm font-semibold text-indigo hover:border-gold-deep/40 transition-colors"
            >
              {prompt.category}
            </Link>
          ))}
        </div>
      )}

      {isSubscribed && (
        <p className="text-xs text-ink/45 mt-8">
          Have something in mind that&apos;s not here?{" "}
          <Link href="/dashboard/rediscover/find" className="text-gold-deep underline">
            Browse every category
          </Link>
          .
        </p>
      )}
    </main>
  );
}
