import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { hasActiveSubscription } from "@/lib/subscription";
import LockedPreview from "@/components/LockedPreview";

// Rediscover — the standalone marketplace module, 2026-09-19. Built to the
// spec worked through with Roop (and cross-checked with another AI
// reviewer): a real, separate module — not a Care Chart pillar, not
// content inside Community — where mothers list what they offer or need,
// showcase products/services, find collaborators, and message each other
// directly. See CLAUDE.md's "Rediscover" entry for the full spec and every
// decision behind it.
//
// Four doors, matching the confirmed home-screen shape:
//   Explore    — for a mother who doesn't know what she wants to do yet.
//   Showcase   — manage her own listings (what she offers).
//   Find       — browse other mothers' listings by category.
//   Collaborate — the Find Collaborators feed (what mothers are looking for).
//
// No fee or commission on anything in V1. No matching algorithm, no
// dedicated project workspaces, no verification/badge system, no
// integrated payments — all deliberately deferred to a later version.

export default async function RediscoverLandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isSubscribed = await hasActiveSubscription(supabase, user!.id);

  const { data: myProfile } = isSubscribed
    ? await supabase
        .from("user_rediscover_profile")
        .select("user_id, headline")
        .eq("user_id", user!.id)
        .maybeSingle()
    : { data: null };

  return (
    <main className="max-w-[900px] mx-auto px-6 py-10">
      <div className="mb-2 text-xs uppercase tracking-[0.12em] text-gold-deep font-semibold">
        something of yours can begin here
      </div>
      <h1 className="font-display text-[30px] text-indigo mb-2">Rediscover</h1>
      <p className="text-sm text-ink/65 mb-10 max-w-[560px]">
        Maybe you already know what you want to do. Maybe you have a skill
        to offer, or something you want to earn from. Or maybe you have no
        idea yet — this is your place to find out, at whatever pace you
        have time for.
      </p>

      {!isSubscribed ? (
        <LockedPreview
          title="Find skills, work, and collaborators in your Village"
          teaser="Join to showcase what you make or offer, find what you need, and connect with other mothers building something of their own."
        />
      ) : (
        <div className="space-y-5">
          <Link
            href="/dashboard/rediscover/profile"
            className="block bg-ivory-2 rounded-2xl border border-line p-5 hover:border-gold-deep/40 transition-colors"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] uppercase tracking-wide font-bold text-sage-deep mb-1">
                  {myProfile ? "Your Rediscover Profile" : "Get started"}
                </div>
                <p className="text-sm text-ink/70">
                  {myProfile
                    ? myProfile.headline || "Manage your profile, listings, and what you're looking for."
                    : "Set up your Rediscover Profile — takes a minute, and you can leave anything blank."}
                </p>
              </div>
              <span className="text-gold-deep text-lg flex-shrink-0">→</span>
            </div>
          </Link>

          <div className="grid sm:grid-cols-2 gap-4">
            <Link
              href="/dashboard/rediscover/explore"
              className="block bg-ivory-2 rounded-2xl border border-line p-6 hover:border-gold-deep/40 transition-colors"
            >
              <div className="text-2xl mb-2">🌱</div>
              <h3 className="font-display text-lg text-indigo mb-1">Explore</h3>
              <p className="text-sm text-ink/65">
                I don&apos;t know my thing yet — show me ideas.
              </p>
            </Link>

            <Link
              href="/dashboard/rediscover/showcase"
              className="block bg-ivory-2 rounded-2xl border border-line p-6 hover:border-gold-deep/40 transition-colors"
            >
              <div className="text-2xl mb-2">✨</div>
              <h3 className="font-display text-lg text-indigo mb-1">Showcase</h3>
              <p className="text-sm text-ink/65">
                I have a product, talent, skill, or business.
              </p>
            </Link>

            <Link
              href="/dashboard/rediscover/find"
              className="block bg-ivory-2 rounded-2xl border border-line p-6 hover:border-gold-deep/40 transition-colors"
            >
              <div className="text-2xl mb-2">🔎</div>
              <h3 className="font-display text-lg text-indigo mb-1">Find</h3>
              <p className="text-sm text-ink/65">
                I need a product, service, or skill.
              </p>
            </Link>

            <Link
              href="/dashboard/rediscover/collaborate"
              className="block bg-ivory-2 rounded-2xl border border-line p-6 hover:border-gold-deep/40 transition-colors"
            >
              <div className="text-2xl mb-2">🤝</div>
              <h3 className="font-display text-lg text-indigo mb-1">Collaborate</h3>
              <p className="text-sm text-ink/65">
                I want to build something with another mother.
              </p>
            </Link>
          </div>

          <Link
            href="/dashboard/rediscover/messages"
            className="block bg-ivory-2 rounded-2xl border border-line p-5 hover:border-gold-deep/40 transition-colors"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] uppercase tracking-wide font-bold text-sage-deep mb-1">
                  messages
                </div>
                <p className="text-sm text-ink/70">
                  Conversations you&apos;ve started with other mothers.
                </p>
              </div>
              <span className="text-gold-deep text-lg flex-shrink-0">→</span>
            </div>
          </Link>

          <p className="text-xs text-ink/45 pt-2">
            Mom&apos;s Village doesn&apos;t verify anyone&apos;s qualifications, products, or business standing, and takes no fee on anything you arrange with another mother.{" "}
            <Link href="/rediscover-disclaimer" className="text-gold-deep underline">
              Read the full disclaimer
            </Link>
            .
          </p>
        </div>
      )}
    </main>
  );
}
