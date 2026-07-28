import Link from "next/link";
import LegalPage, { LegalSection } from "@/components/LegalPage";
import { BulletList } from "@/components/ContentDoc";

export const metadata = { title: "Privacy Policy — Mom Village" };

export default function PrivacyPage() {
  return (
    <LegalPage eyebrow="privacy policy" title="Your privacy" updated="28 July 2026">
      <LegalSection title="The short version">
        <p>
          We collect only what&apos;s needed to run Mom&apos;s Village for
          you personally — your phone number, the profile details you enter,
          and anything you choose to log (voice notes, photos, vaccination
          records, community posts). We don&apos;t sell your data, and we
          don&apos;t share it with advertisers. Anything you mark private
          (voice logs, photos, vaccination cards, your profile) stays visible
          only to you.
        </p>
      </LegalSection>

      <LegalSection title="What we collect">
        <BulletList
          items={[
            <>
              <span className="font-semibold text-ink">Your phone number</span> —
              used to sign you in via OTP. Mom&apos;s Village doesn&apos;t use
              email/password accounts, so your phone number is your only
              login identifier.
            </>,
            <>
              <span className="font-semibold text-ink">Profile details</span> —
              your name, city, baby&apos;s name, due date or date of birth,
              delivery type, and any health flags you choose to share
              (thyroid, PCOS, gestational diabetes, high blood pressure) so
              content can be matched to your real stage and situation.
            </>,
            <>
              <span className="font-semibold text-ink">Voice logs and photo logs</span> —
              anything you choose to record or upload in Memories, stored
              privately and used only to answer your own recall questions.
            </>,
            <>
              <span className="font-semibold text-ink">Vaccination card photos</span> —
              uploaded so our system can suggest a vaccine and date for you to
              confirm or correct; nothing is saved to your record without
              your review.
            </>,
            <>
              <span className="font-semibold text-ink">Community posts and replies</span> —
              posted under your real profile name, visible to other members
              of the village.
            </>,
            <>
              <span className="font-semibold text-ink">Reading progress and check-ins</span> —
              which page of a book you&apos;re on, and your daily Care
              check-ins (time, energy, mood), used only to personalize what
              you see.
            </>,
            <>
              <span className="font-semibold text-ink">Push notification subscription</span> —
              if you turn on reminders, your browser&apos;s push address is
              stored so we can send you vaccination-due reminders. You can
              turn this off anytime from your account page.
            </>,
            <>
              <span className="font-semibold text-ink">Membership/billing status</span> —
              whether your membership is active, so the app knows what to
              show you. Payment itself is handled by our payment processor
              once online payments go live — we don&apos;t store your card or
              UPI details ourselves.
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection title="Who else sees your data">
        <p>
          Mom&apos;s Village is hosted on Supabase (database and file
          storage) and Vercel (the app itself). Two AI services are used to
          power specific features, and only receive the minimum needed for
          that feature: OpenAI (to transcribe voice logs you record) and
          Anthropic&apos;s Claude (to read vaccination card photos and to
          answer your own recall questions using only your own logged data).
          None of these providers are permitted to use your data to train
          their own models on our behalf, and none of them see your data
          unless you actively use the feature that requires it.
        </p>
      </LegalSection>

      <LegalSection title="Community posts are not private">
        <p>
          Anything you post in Community is visible to other members under
          your real profile name — that&apos;s by design, so the space feels
          like a real village rather than an anonymous forum. Don&apos;t
          share anything there you wouldn&apos;t want other members to see.
        </p>
      </LegalSection>

      <LegalSection title="Deleting your account">
        <p>
          You can request account deletion by contacting us (see{" "}
          <Link href="/contact" className="text-gold-deep underline">
            Contact &amp; Help
          </Link>
          ). Once a deletion request is verified, your profile, voice logs,
          photos, vaccination records, and other personal data are deleted
          within 30 days. Community posts you&apos;ve made may remain visible
          with your name removed, since other members&apos; replies are part
          of the same thread — tell us if you&apos;d like those handled
          differently.
        </p>
      </LegalSection>

      <LegalSection title="Questions">
        <p>
          See{" "}
          <Link href="/contact" className="text-gold-deep underline">
            Contact &amp; Help
          </Link>{" "}
          to reach us about anything on this page.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
