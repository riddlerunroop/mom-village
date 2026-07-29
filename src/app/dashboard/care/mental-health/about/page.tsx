import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { hasActiveSubscription } from "@/lib/subscription";
import LockedPreview from "@/components/LockedPreview";

export default async function AboutPPDPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isSubscribed = await hasActiveSubscription(supabase, user!.id);

  return (
    <main className="max-w-[680px] mx-auto px-6 py-10">
      <Link href="/dashboard/care/mental-health" className="text-xs font-semibold text-ink/45 hover:text-indigo mb-3 inline-block">
        ← Mental health &amp; support
      </Link>
      <h1 className="font-display text-[26px] text-indigo mb-4">
        Could this be postpartum depression or anxiety?
      </h1>

      {!isSubscribed ? (
        <LockedPreview
          title="Understand what you're feeling"
          teaser="Join to read this in full and get real next steps built around your own situation."
        />
      ) : (
        <div className="space-y-6 text-sm text-ink/75 leading-relaxed">
          <p>
            This can happen during pregnancy too, not only after birth — it&apos;s
            often called perinatal (rather than only postpartum) depression or
            anxiety for that reason. It&apos;s common, it&apos;s treatable, and
            it says nothing about how much you love your baby or how capable a
            mother you are.
          </p>

          <div className="bg-ivory-2 rounded-2xl border border-line p-5">
            <h2 className="font-display text-lg text-indigo mb-2">
              The &ldquo;baby blues&rdquo; vs. something that needs more support
            </h2>
            <p className="mb-3">
              Feeling weepy, overwhelmed, or on an emotional rollercoaster in
              the first couple of weeks after birth is extremely common — the
              &ldquo;baby blues&rdquo; — and it usually eases on its own as your
              body adjusts.
            </p>
            <p>
              If low mood, constant worry, or feeling numb or disconnected
              lasts beyond about two weeks, feels more intense than that, or
              starts interfering with sleep, eating, or caring for yourself or
              your baby, it&apos;s worth taking seriously and talking to
              someone — whether that&apos;s during pregnancy or well after
              birth.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg text-indigo mb-2">
              What it can look like
            </h2>
            <p className="mb-2">
              Everyone experiences this differently, and you don&apos;t need
              every item on a list for it to be real. Some common signs:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Persistent sadness, hopelessness, or crying that doesn&apos;t feel tied to anything in particular</li>
              <li>Constant worry, racing thoughts, or a sense of dread that&apos;s hard to switch off</li>
              <li>Feeling numb, flat, or disconnected from your baby, or guilty about not &ldquo;feeling the way you should&rdquo;</li>
              <li>Trouble sleeping even when your baby is asleep, or sleeping far more than usual</li>
              <li>Loss of interest in things you&apos;d normally enjoy</li>
              <li>Difficulty concentrating or making even small decisions</li>
              <li>Intrusive, unwanted thoughts that scare you</li>
              <li>Thoughts of harming yourself or your baby</li>
            </ul>
          </div>

          <div className="bg-terracotta/10 border border-terracotta/30 rounded-2xl p-5">
            <h2 className="font-display text-lg text-terracotta mb-2">
              Postpartum psychosis is rarer, and a genuine emergency
            </h2>
            <p className="mb-2">
              It affects roughly 1 to 2 in every 1,000 new mothers, usually
              starting suddenly within the first two weeks after birth. Signs
              include confusion, hallucinations, delusions or paranoia,
              extreme mood swings, or racing, disorganized thinking. This
              needs medical attention immediately — it isn&apos;t something to
              wait out.
            </p>
            <Link href="/safety" className="font-semibold text-terracotta underline text-sm">
              Go to emergency numbers and support →
            </Link>
          </div>

          <p>
            If any of this sounds like you, you don&apos;t have to figure out
            what it is on your own before reaching out. A doctor, gynaecologist,
            or mental health professional can help either way.
          </p>

          <div className="grid sm:grid-cols-3 gap-3 pt-2">
            <Link
              href="/dashboard/care/mental-health/pattern"
              className="bg-ivory-2 rounded-xl border border-line p-4 text-center hover:border-ink/20"
            >
              <span className="text-[13px] font-semibold text-sage-deep">Check my recent pattern</span>
            </Link>
            <Link
              href="/dashboard/care/mental-health/prepare"
              className="bg-ivory-2 rounded-xl border border-line p-4 text-center hover:border-ink/20"
            >
              <span className="text-[13px] font-semibold text-gold-deep">Prepare to talk to someone</span>
            </Link>
            <Link
              href="/dashboard/care/mental-health/support"
              className="bg-ivory-2 rounded-xl border border-line p-4 text-center hover:border-ink/20"
            >
              <span className="text-[13px] font-semibold text-indigo">Support for today</span>
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
