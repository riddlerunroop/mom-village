import Link from "next/link";
import LegalPage, { LegalSection } from "@/components/LegalPage";

export const metadata = { title: "Cancellation & Refund Policy — Mom Village" };

export default function RefundPolicyPage() {
  return (
    <LegalPage
      eyebrow="cancellation & refund policy"
      title="Cancellation & Refund Policy"
      updated="28 July 2026"
    >
      <LegalSection title="Village membership (₹299/month)">
        <p>
          Membership renews automatically every month. You can cancel anytime
          from your account settings — cancelling stops future billing, and
          you&apos;ll keep access through the end of the period you&apos;ve
          already paid for. We don&apos;t offer refunds for the current or
          past billing periods, including partial months.
        </p>
      </LegalSection>

      <LegalSection title="Budget map (₹49)">
        <p>
          The budget map is a one-time purchase delivered instantly inside
          the app. Because it&apos;s digital and delivered immediately on
          purchase, this purchase is non-refundable. If the tool fails to
          load or doesn&apos;t work for you, contact us and we&apos;ll help
          directly.
        </p>
      </LegalSection>

      <LegalSection title="Library books">
        <p>
          Individual book and bundle purchases follow the same approach as
          the budget map — digital, delivered instantly, non-refundable,
          except where the purchase genuinely fails to deliver.
        </p>
      </LegalSection>

      <LegalSection title="If something goes wrong">
        <p>
          If you were charged in error, charged twice, or a purchase never
          unlocked the content it should have, contact us right away — see{" "}
          <Link href="/contact" className="text-gold-deep underline">
            Contact &amp; Help
          </Link>
          . We&apos;ll look into it and make it right.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
