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

// Front door rebuilt 2026-09-21 — Phase 2 (PPD + PPA, see CLAUDE.md).
// Roop's own reasoning: clinical-sounding choices make a mother ask "what
// condition do I have?", first-person choices only require "what am I
// experiencing?" — and a mother who'd never think "I have postpartum
// anxiety" may well think "I can't stop imagining something happening to
// my baby." These six doors replace the old 4 clinical-sounding cards but
// route into the exact same pages underneath — About/Pattern/Prepare/
// Support/Safety are all unchanged, only the entry language changed.
const DOORS = [
  {
    href: "/dashboard/care/mental-health/support",
    label: "I feel overwhelmed",
    line: "Everything feels like too much.",
    accent: "indigo",
  },
  {
    href: "/dashboard/care/mental-health/about",
    label: "I feel anxious or constantly on edge",
    line: "I can't seem to switch my mind off.",
    accent: "gold-deep",
  },
  {
    href: "/dashboard/care/mental-health/about",
    label: "I feel low, numb or unlike myself",
    line: "Something hasn't felt right lately.",
    accent: "sage",
  },
  {
    href: "/dashboard/care/mental-health/prepare",
    label: "I'm having thoughts or feelings that scare me",
    line: "I want help with what I'm experiencing.",
    accent: "terracotta",
  },
  {
    href: "/dashboard/care/mental-health/about",
    label: "Someone close to me is worried about me",
    line: "They've noticed a change.",
    accent: "gold-deep",
  },
  {
    href: "/safety",
    label: "I need help right now",
    line: "Take me straight to immediate support.",
    accent: "terracotta",
  },
] as const;

// Mental-health-history flags — read here since 2026-07-29, following up
// on the "Open strategic question" flagged when Phase 1 was built. Stored
// on user_care_profile.health_flags (same array as thyroid/pcos/etc., see
// migration_48) at the care-quiz. Deliberately shown once, softly, on the
// hub itself rather than repeated on every week's Reset card or turned
// into any kind of heightened monitoring — she already told us this once;
// the only thing that changes is that this specific page acknowledges it.
const MH_HISTORY_KEYS = ["mh_history_pregnancy", "mh_history_postpartum", "mh_history_other"];

export default async function MentalHealthHubPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isSubscribed = await hasActiveSubscription(supabase, user!.id);

  const { data: careProfile } = isSubscribed
    ? await supabase
        .from("user_care_profile")
        .select("health_flags")
        .eq("user_id", user!.id)
        .maybeSingle()
    : { data: null };
  const hasMhHistory = (careProfile?.health_flags || []).some((f: string) =>
    MH_HISTORY_KEYS.includes(f)
  );

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
      <p className="text-sm text-ink/65 mb-4 max-w-[540px]">
        Pregnancy and the years after birth ask a lot of your mind, not just
        your body. There&apos;s no wrong way to feel, and nothing here is a
        test or a diagnosis — just some ways to understand what you&apos;re
        feeling and get support if you want it.
      </p>

      <div className="bg-ivory-2 border border-line rounded-2xl p-5 mb-6">
        <p className="text-sm text-ink/70">
          <span className="font-semibold text-indigo">
            Mom&apos;s Village doesn&apos;t diagnose or decide what&apos;s
            wrong.
          </span>{" "}
          We help you notice when something feels different, put it into
          words, and reach the right person or support.
        </p>
      </div>

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

      {isSubscribed && hasMhHistory && (
        <div className="bg-sage-deep/10 border border-sage-deep/25 rounded-2xl p-5 mb-8">
          <p className="text-sm text-ink/75">
            You let us know you&apos;ve experienced depression or anxiety
            around pregnancy or birth before. Perinatal depression and
            anxiety can happen again, even if things were different this
            time — that&apos;s not a failure, it&apos;s just something worth
            knowing. Everything on this page is here for exactly this.
          </p>
        </div>
      )}

      {!isSubscribed ? (
        <LockedPreview
          title="Support built around how you're actually feeling"
          teaser="Join to check in on your own patterns, prepare for a conversation with someone you trust, and find real support for hard days."
        />
      ) : (
        <>
          <div className="grid sm:grid-cols-2 gap-4">
            {DOORS.map((d, i) => (
              <Link
                key={`${d.href}-${i}`}
                href={d.href}
                className="bg-ivory-2 rounded-2xl border border-line p-5 hover:border-ink/20 transition-colors"
                style={{ borderTop: `3px solid var(--color-${d.accent})` }}
              >
                <h3 className="font-display text-base text-indigo mb-1.5">
                  {d.label}
                </h3>
                <p className="text-[13px] text-ink/65 leading-snug">{d.line}</p>
              </Link>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[13px]">
            <Link
              href="/dashboard/care/mental-health/pattern"
              className="font-semibold text-sage-deep underline"
            >
              Check my recent pattern
            </Link>
            <Link
              href="/dashboard/care/mental-health/about"
              className="font-semibold text-terracotta underline"
            >
              Learn about postpartum depression &amp; anxiety
            </Link>
          </div>
        </>
      )}

      <p className="text-xs text-ink/45 mt-8">
        None of this replaces a real conversation with a doctor or mental
        health professional — it&apos;s here to help you take that step, not
        to stand in for it.
      </p>
    </main>
  );
}
