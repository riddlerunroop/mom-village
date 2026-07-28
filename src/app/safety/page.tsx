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
            <><span className="font-semibold text-ink">112</span> — India&apos;s national emergency number (police, fire, ambulance).</>,
            <><span className="font-semibold text-ink">Tele-MANAS: 14416 or 1800-891-4416</span> — free, 24/7 government mental health support and counselling.</>,
            <><span className="font-semibold text-ink">KIRAN: 1800-599-0019</span> — 24/7 mental health rehabilitation helpline.</>,
            <><span className="font-semibold text-ink">Women Helpline: 181</span> — support for domestic violence and women&apos;s safety.</>,
            <><span className="font-semibold text-ink">Childline: 1098</span> — child protection and safety helpline.</>,
            <><span className="font-semibold text-ink">Cybercrime: cybercrime.gov.in or 1930</span> — to report online fraud, scams, or exploitation.</>,
          ]}
        />
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

      <LegalSection title="If you're struggling emotionally">
        <p>
          Pregnancy and the years after birth can be genuinely hard on your
          mind, not just your body — and asking for help is a sign of care,
          not failure. Tele-MANAS and KIRAN above are free and confidential.
          If you ever have thoughts of harming yourself or your baby, please
          call one of these numbers or go to your nearest hospital right
          away.
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
