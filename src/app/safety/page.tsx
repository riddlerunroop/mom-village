import Link from "next/link";
import LegalPage, { LegalSection } from "@/components/LegalPage";
import { DisclaimerBox, BulletList } from "@/components/ContentDoc";

export const metadata = { title: "Safety & Emergency Support — Mom Village" };

export default function SafetyPage() {
  return (
    <LegalPage eyebrow="safety & emergency support" title="If you need help right now">
      <DisclaimerBox>
        Mom&apos;s Village is not an emergency service and can&apos;t respond
        to a crisis in real time. If you or your child is in danger or needs
        urgent medical attention, call for help immediately — don&apos;t wait
        for a reply in the app.
      </DisclaimerBox>

      <LegalSection title="India emergency numbers">
        <BulletList
          items={[
            <><a href="tel:112" className="font-semibold text-ink underline">112</a> — India&apos;s national emergency number (police, fire, ambulance).</>,
            <><a href="tel:14416" className="font-semibold text-ink underline">Tele-MANAS: 14416</a> or <a href="tel:18008914416" className="font-semibold text-ink underline">1800-891-4416</a> — free, 24/7 government mental health support and counselling.</>,
            <><a href="tel:18005990019" className="font-semibold text-ink underline">KIRAN: 1800-599-0019</a> — 24/7 mental health rehabilitation helpline.</>,
            <><a href="tel:181" className="font-semibold text-ink underline">Women Helpline: 181</a> — support for domestic violence and women&apos;s safety.</>,
            <><a href="tel:1098" className="font-semibold text-ink underline">Childline: 1098</a> — child protection and safety helpline.</>,
            <><span className="font-semibold text-ink">Cybercrime: cybercrime.gov.in or <a href="tel:1930" className="underline">1930</a></span> — to report online fraud, scams, or exploitation.</>,
          ]}
        />
        <p className="text-xs text-ink/50 mt-2">
          On a phone, tap any number above to call it directly.
        </p>
      </LegalSection>

      <LegalSection title="Warning signs during pregnancy or after birth">
        <p>
          Severe headache that won&apos;t go away, vision changes, chest pain
          or difficulty breathing, heavy vaginal bleeding, a fever, severe
          swelling, or thoughts of harming yourself or your baby are all
          reasons to seek medical care immediately, not to wait and see. The
          Care Chart&apos;s &quot;Urgent care now&quot; section (CDC Hear
          Her–aligned) has the full list of warning signs for your stage —
          worth reading in advance, not just when something feels wrong.
        </p>
      </LegalSection>

      <LegalSection title="If your mind doesn't feel like your own">
        <p className="mb-3">
          Pregnancy and the years after birth can be genuinely hard on your
          mind, not just your body — and asking for help is a sign of care,
          not failure. What you&apos;re feeling may be perinatal depression
          or anxiety (during pregnancy or after birth), and it&apos;s common
          and treatable, not a personal failing. Persistent sadness or
          numbness, constant worry or racing thoughts, feeling disconnected
          from your baby, or being unable to sleep even when you have the
          chance are all reasons to reach out — to your doctor, a trusted
          person, or Tele-MANAS/KIRAN above.
        </p>
        <p className="mb-3 font-semibold text-terracotta">
          Postpartum psychosis is rarer but a genuine medical emergency.
        </p>
        <p className="mb-3">
          It affects roughly 1 to 2 in every 1,000 new mothers, usually
          starting suddenly within the first two weeks after birth — often
          within days. Warning signs include confusion or disorientation,
          hallucinations (seeing or hearing things that aren&apos;t there),
          delusions or paranoia, extreme mood swings, or racing, disorganized
          thinking. If you or someone around you notices these signs, this
          needs medical attention right away — call 112 or go to the nearest
          hospital, don&apos;t wait to see if it passes.
        </p>
        <p>
          If you ever have thoughts of harming yourself or your baby, please
          call Tele-MANAS or KIRAN above, or go to your nearest hospital
          right away. If it feels safer or easier in the moment, ask someone
          you trust — a partner, family member, or friend — to sit with you
          and help you make that call.
        </p>
      </LegalSection>

      <LegalSection title="A concern in Community">
        <p>
          Community is for support and shared experience, not emergencies.
          Use the report option on any post or reply for a conduct concern —
          see{" "}
          <Link href="/community-guidelines" className="text-gold-deep underline">
            Community Guidelines
          </Link>
          . For anything urgent, use the numbers above instead.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
