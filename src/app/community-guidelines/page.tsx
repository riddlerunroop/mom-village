import Link from "next/link";
import LegalPage, { LegalSection } from "@/components/LegalPage";
import { BulletList } from "@/components/ContentDoc";

export const metadata = { title: "Community Guidelines — Mom Village" };

export default function CommunityGuidelinesPage() {
  return (
    <LegalPage eyebrow="community guidelines" title="Community Guidelines">
      <LegalSection title="This is a real village, not an anonymous forum">
        <p>
          Community posts appear under your real profile name, the same
          identity as the rest of the app. Speak the way you would to a
          mother you actually know — with honesty, and with the same care
          you&apos;d want back.
        </p>
      </LegalSection>

      <LegalSection title="What's welcome">
        <BulletList
          items={[
            "Real questions, even ones that feel small or silly — someone else is probably wondering the same thing.",
            "Your own experience, clearly framed as your own experience.",
            "Encouragement, honesty, and disagreement expressed respectfully.",
            "Searching before posting, so related discussions stay together.",
          ]}
        />
      </LegalSection>

      <LegalSection title="What's not welcome">
        <BulletList
          items={[
            "Harassment, shaming, or personal attacks on another mother or her choices.",
            "Presenting your own experience as medical, financial, or legal advice she should follow instead of consulting a professional.",
            "Promoting products, services, or other apps/communities.",
            "Sharing another member's personal information without her consent.",
            "Anything that would endanger a child if acted on.",
          ]}
        />
      </LegalSection>

      <LegalSection title="This isn't professional advice">
        <p>
          Every post and reply in Community is written by another member, not
          reviewed by Mom&apos;s Village before it&apos;s posted. It&apos;s
          real experience, not medical, financial, or legal guidance. If
          something you read here concerns you about your or your
          child&apos;s health, talk to your doctor — don&apos;t wait on a
          reply.
        </p>
      </LegalSection>

      <LegalSection title="Reporting a concern">
        <p>
          Every thread and reply has a report option. Tell us what&apos;s
          wrong in a line or two and we&apos;ll review it. Reported content
          isn&apos;t automatically removed — we look at each report and, if
          it&apos;s warranted, hide the post. This is a small, human process
          right now, not an automated system, so please be patient and use
          it for real concerns.
        </p>
      </LegalSection>

      <LegalSection title="If you're in crisis">
        <p>
          Community is not equipped for emergencies. If you or your child
          needs help right now, see{" "}
          <Link href="/safety" className="text-gold-deep underline">
            Safety &amp; Emergency Support
          </Link>{" "}
          for real numbers to call.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
