import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { hasActiveSubscription } from "@/lib/subscription";
import LockedPreview from "@/components/LockedPreview";

// New 2026-07-29 — Phase 1 of the Maternal Mental Health / PPD integration
// (see CLAUDE.md "PPD/Mental Health — Phase 1" section for the full
// rationale). This is the persistent, week-independent "if you're
// struggling, start here" surface the project was missing — reachable from
// the Care landing page and from every week's Reset card, not just on
// whichever week happens to carry a check-in card. Deliberately not a
// diagnostic tool: it never scores or labels her, only offers real next
// steps and always keeps a fast path to /safety for anything urgent.

const CHOICES = [
  {
    href: "/dashboard/care/mental-health/about",
    label: "Could this be postpartum depression or anxiety?",
    line: "What it can look like, and how it's different from normal exhaustion.",
    accent: "terracotta",
  },
  {
    href: "/dashboard/care/mental-health/pattern",
    label: "Check my recent pattern",
    line: "A gentle look at how your daily check-ins have trended lately.",
    accent: "sage",
  },
  {
    href: "/dashboard/care/mental-health/prepare",
    label: "Help me prepare to talk to someone",
    line: "Put what you're feeling into words, ready to share with your doctor or someone you trust.",
    accent: "gold-deep",
  },
  {
    href: "/dashboard/care/mental-health/support",
    label: "Support for today",
    line: "A few small things that can genuinely help right now.",
    accent: "indigo",
  },
] as const;

export default async function MentalHealthHubPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isSubscribed = await hasActiveSubscription(supabase, user!.id);

  return (
    <main className="max-w-[720px] mx-auto px-6 py-10">
      <Link href="/dashboard/care" className="text-xs font-semibold text-ink/45 hover:text-indigo mb-3 inline-block">
        ← Care
      </Link>
      <div className="mb-2 text-xs uppercase tracking-[0.12em] text-terracotta font-semibold">
        mental health &amp; support
      </div>
      <h1 className="font-display text-[28px] text-indigo mb-3">
        How are you, really?
      </h1>
      <p className="text-sm text-ink/65 mb-6 max-w-[540px]">
        Pregnancy and the years after birth ask a lot of your mind, not just
        your body. There&apos;s no wrong way to feel, and nothing here is a
        test or a diagnosis — just some ways to understand what you&apos;re
        feeling and get support if you want it.
      </p>

      <div className="bg-terracotta/10 border border-terracotta/30 rounded-2xl p-5 mb-8">
        <p className="text-sm text-ink/80">
          If you&apos;re in crisis right now, or having thoughts of harming
          yourself or your baby, please don&apos;t wait —{" "}
          <Link href="/safety" className="font-semibold text-terracotta underline">
            go to emergency numbers and support
          </Link>
          .
        </p>
      </div>

      {!isSubscribed ? (
        <LockedPreview
          title="Support built around how you're actually feeling"
          teaser="Join to check in on your own patterns, prepare for a conversation with someone you trust, and find real support for hard days."
        />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {CHOICES.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="bg-ivory-2 rounded-2xl border border-line p-5 hover:border-ink/20 transition-colors"
              style={{ borderTop: `3px solid var(--color-${c.accent})` }}
            >
              <h3 className="font-display text-base text-indigo mb-2">
                {c.label}
              </h3>
              <p className="text-[13px] text-ink/65 leading-snug">{c.line}</p>
            </Link>
          ))}
        </div>
      )}

      <p className="text-xs text-ink/45 mt-8">
        None of this replaces a real conversation with a doctor or mental
        health professional — it&apos;s here to help you take that step, not
        to stand in for it.
      </p>
    </main>
  );
}
