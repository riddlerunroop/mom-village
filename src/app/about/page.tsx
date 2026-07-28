import Link from "next/link";
import LegalPage, { LegalSection } from "@/components/LegalPage";

export const metadata = { title: "About — Mom Village" };

export default function AboutPage() {
  return (
    <LegalPage eyebrow="about mom's village" title="Why this exists">
      <LegalSection title="Built by a mother, not a company">
        <p>
          Mom&apos;s Village is built by Roop, an Indian mother who built the
          resource she couldn&apos;t find herself. It isn&apos;t a hospital
          brand, a baby-products company, or an investor-backed startup
          chasing growth — it&apos;s one place, built slowly and carefully,
          for the questions that come up at 3am when you don&apos;t know who
          else to ask.
        </p>
      </LegalSection>

      <LegalSection title="What it's for">
        <p>
          Mom&apos;s Village follows one journey — from your first positive
          test through your child&apos;s third birthday — and tries to answer
          the questions that actually come up along the way: what&apos;s
          normal for your body and hers, what&apos;s worth spending on and
          what isn&apos;t, which government schemes actually apply to you,
          and where to talk to other mothers going through the same stage at
          the same time.
        </p>
        <p>
          It&apos;s built around four things: a monthly chart matched to your
          exact stage, a Care pillar for your body, food, mind, skin and
          sense of self, a Wealth pillar for your money and independence, and
          a Library of original books on money and parenting. A Community
          space and vaccination/memory tracking round it out.
        </p>
      </LegalSection>

      <LegalSection title="How the content is made">
        <p>
          Every medical, financial, and government-scheme claim in the app is
          independently checked against primary sources — WHO, CDC, ACOG,
          Mayo Clinic, RBI, SEBI, and official Indian government portals —
          before it&apos;s published, not written from memory and not left
          unchecked. Where something is genuinely a personal medical or
          financial decision, the app says so and points you to a
          professional instead of guessing on your behalf.
        </p>
      </LegalSection>

      <LegalSection title="Get in touch">
        <p>
          Questions, feedback, or something that doesn&apos;t feel right?
          See the <Link href="/contact" className="text-gold-deep underline">Contact &amp; Help</Link> page.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
