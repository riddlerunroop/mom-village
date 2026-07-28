import Link from "next/link";
import LegalPage, { LegalSection } from "@/components/LegalPage";
import { DisclaimerBox } from "@/components/ContentDoc";

export const metadata = { title: "Terms of Use — Mom Village" };

export default function TermsPage() {
  return (
    <LegalPage eyebrow="terms of use" title="Terms of Use" updated="28 July 2026">
      <DisclaimerBox>
        Mom&apos;s Village provides general guidance, not medical, financial,
        or legal advice. Always check with your own doctor, financial
        advisor, or a qualified professional before acting on anything you
        read here.
      </DisclaimerBox>

      <LegalSection title="What Mom's Village is">
        <p>
          Mom&apos;s Village is a subscription app for mothers in India,
          covering the journey from pregnancy through a child&apos;s third
          birthday — a monthly chart, a Care pillar (body, food, mind, skin,
          and yourself), a Wealth pillar, a Library of original books, a
          Community discussion space, vaccination tracking, and voice/photo
          memory logging. It is built for a single mother user per account —
          there is no separate father, grandparent, or caregiver role.
        </p>
      </LegalSection>

      <LegalSection title="Not medical, financial, or legal advice">
        <p>
          Everything in Mom&apos;s Village — the monthly chart, Care content,
          Wealth guidance, and Library books — is general education, checked
          against sources like WHO, CDC, ACOG, Mayo Clinic, RBI, and SEBI. It
          is not personalized medical, financial, or legal advice, and using
          the app does not create a doctor-patient, advisor-client, or any
          other professional relationship. Always consult a qualified
          professional for decisions specific to your own situation,
          especially anything involving your or your child&apos;s health, or
          your finances.
        </p>
      </LegalSection>

      <LegalSection title="Community is member-generated, not reviewed">
        <p>
          Posts and replies in Community are written by other members, not by
          Mom&apos;s Village, and are not fact-checked or medically reviewed.
          Treat anything read in Community as one mother&apos;s experience,
          not professional guidance. See our{" "}
          <Link href="/community-guidelines" className="text-gold-deep underline">
            Community Guidelines
          </Link>{" "}
          for expected conduct and how to report a concern.
        </p>
      </LegalSection>

      <LegalSection title="Membership and payment">
        <p>
          Membership is billed on a recurring monthly basis. You can cancel
          anytime from your account settings, which stops future billing —
          see our{" "}
          <Link href="/refund-policy" className="text-gold-deep underline">
            Cancellation &amp; Refund Policy
          </Link>{" "}
          for full details. The ₹49 budget map is a separate one-time
          purchase.
        </p>
      </LegalSection>

      <LegalSection title="Your account">
        <p>
          You&apos;re responsible for keeping your account (phone number and
          OTP access) secure. Content you log — voice notes, photos,
          vaccination records — is yours; we store it to provide the service
          back to you, as described in our{" "}
          <Link href="/privacy" className="text-gold-deep underline">
            Privacy Policy
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="Acceptable use">
        <p>
          Don&apos;t use Mom&apos;s Village to harass or harm other members,
          post content that endangers a child, misrepresent who you are, or
          attempt to access another member&apos;s account or data. We may
          suspend or remove access for accounts that violate this.
        </p>
      </LegalSection>

      <LegalSection title="No liability for outcomes">
        <p>
          While every effort is made to keep information accurate and
          current, Mom&apos;s Village and its content are provided &quot;as
          is,&quot; without guarantee that any specific outcome — medical,
          financial, or otherwise — will result from following it. To the
          fullest extent permitted by law, Mom&apos;s Village is not liable
          for decisions made based on app content; the responsibility for
          medical and financial decisions always rests with you and the
          professionals you consult.
        </p>
      </LegalSection>

      <LegalSection title="Changes to these terms">
        <p>
          We may update these terms as the app grows. Material changes will
          be reflected here with an updated date at the top of this page.
        </p>
      </LegalSection>

      <LegalSection title="Governing law">
        <p>These terms are governed by the laws of India.</p>
      </LegalSection>

      <LegalSection title="Questions">
        <p>
          See{" "}
          <Link href="/contact" className="text-gold-deep underline">
            Contact &amp; Help
          </Link>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
