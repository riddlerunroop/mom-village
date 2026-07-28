import Link from "next/link";
import LegalPage, { LegalSection } from "@/components/LegalPage";

export const metadata = { title: "Contact & Help — Mom Village" };

// Support email intentionally left as a placeholder — Roop is setting up a
// dedicated address on her own domain (2026-07-28: "i will make a different
// mail with domain name in picture") rather than using her personal Gmail
// long-term. Swap SUPPORT_EMAIL in once that's ready, same "flag, don't
// fabricate" pattern used for the homepage bio placeholder.
const SUPPORT_EMAIL: string | null = null;

export default function ContactPage() {
  return (
    <LegalPage eyebrow="contact & help" title="Get in touch">
      <LegalSection title="Have a question or ran into a problem?">
        {SUPPORT_EMAIL ? (
          <p>
            Write to{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="text-gold-deep underline">
              {SUPPORT_EMAIL}
            </a>{" "}
            — we read every message and try to reply within a couple of days.
          </p>
        ) : (
          <p>
            {/* TODO (Roop): replace this paragraph with your real support
                email once it's set up on your own domain. */}
            A dedicated support email is being set up now — this page will
            have a direct address here shortly. In the meantime, if
            you&apos;re a member, the fastest way to reach us is posting in{" "}
            <Link href="/dashboard/community" className="text-gold-deep underline">
              Community
            </Link>
            .
          </p>
        )}
      </LegalSection>

      <LegalSection title="Billing or membership questions">
        <p>
          See our{" "}
          <Link href="/refund-policy" className="text-gold-deep underline">
            Cancellation &amp; Refund Policy
          </Link>{" "}
          for how membership billing and the ₹49 budget map purchase work.
        </p>
      </LegalSection>

      <LegalSection title="Something in the app feels medically or factually wrong">
        <p>
          Please tell us right away. Every claim in the app is checked
          against sources like WHO, CDC, ACOG, Mayo Clinic, RBI, and SEBI
          before publishing, but if something reads as inaccurate or unclear,
          we want to fix it fast.
        </p>
      </LegalSection>

      <LegalSection title="Reporting a safety concern in Community">
        <p>
          Use the report option next to any post or reply, or see our{" "}
          <Link href="/community-guidelines" className="text-gold-deep underline">
            Community Guidelines
          </Link>
          . For a medical or emotional emergency, see{" "}
          <Link href="/safety" className="text-gold-deep underline">
            Safety &amp; Emergency Support
          </Link>{" "}
          — this app is not equipped to respond to emergencies in real time.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
