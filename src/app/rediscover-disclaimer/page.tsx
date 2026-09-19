import Link from "next/link";
import LegalPage, { LegalSection } from "@/components/LegalPage";
import { BulletList } from "@/components/ContentDoc";

export const metadata = { title: "Rediscover Disclaimer — Mom Village" };

// The standing tier of the two-tier disclaimer for Rediscover, Mom's
// Village's marketplace module — see the short, point-of-contact tier at
// src/components/rediscover/ContactDisclaimer.tsx, shown right before a
// mother can message someone. Both are the same policy, in two lengths.
// See CLAUDE.md's "Rediscover" entry for the full spec.

export default function RediscoverDisclaimerPage() {
  return (
    <LegalPage eyebrow="rediscover" title="Rediscover Disclaimer">
      <LegalSection title="Mom's Village doesn't vet anyone here">
        <p>
          Rediscover is a space for mothers to list what they offer or
          need, showcase products and services, and connect with each
          other — not a service Mom&apos;s Village runs, guarantees, or
          reviews before it goes live. We don&apos;t verify anyone&apos;s
          qualifications, the quality of what they make or sell, or their
          business standing. A profile or listing being on Mom&apos;s
          Village is not an endorsement.
        </p>
      </LegalSection>

      <LegalSection title="We take no side in a dispute">
        <p>
          Anything you arrange with another mother — buying, selling,
          hiring, collaborating, or promoting — is an agreement between the
          two of you. Mom&apos;s Village isn&apos;t a party to it, doesn&apos;t
          mediate disagreements, and isn&apos;t responsible for what happens
          between you.
        </p>
      </LegalSection>

      <LegalSection title="No fee, no payments through us">
        <p>
          Mom&apos;s Village doesn&apos;t take a commission or fee on
          anything arranged through Rediscover, and doesn&apos;t process
          payments. Money and delivery stay entirely between the two
          mothers involved.
        </p>
      </LegalSection>

      <LegalSection title="Before you agree to anything">
        <BulletList
          items={[
            "Use your own judgement — patch-test a product, ask questions, and check anything that matters to you before committing.",
            "Agree on what's being delivered and by when, in writing where you can.",
            "Keep your own record of the conversation.",
            "Keep a screenshot of any payment made or received, on your own device — we don't store this for you.",
          ]}
        />
      </LegalSection>

      <LegalSection title="Recommendations are self-reported">
        <p>
          A mother can recommend another mother&apos;s profile after
          working with her. There&apos;s no way to leave a negative public
          rating — only to recommend, or not. Mom&apos;s Village has no way
          to confirm a recommendation came from a real transaction, so
          treat it as one data point, not a guarantee.
        </p>
      </LegalSection>

      <LegalSection title="Categories we've kept out for now">
        <p>
          Legal services, financial or investment advisory, and
          medical/health-advice categories aren&apos;t available to list on
          Rediscover — a deliberate choice, not an oversight, while we work
          through what those professions can and can&apos;t advertise.
        </p>
      </LegalSection>

      <LegalSection title="Reporting a concern">
        <p>
          Every listing, need, and profile has a report option. Tell us
          what&apos;s wrong and we&apos;ll review it — the same small,
          human process already used for Community. You can also block a
          member so her listings and messages stop showing to you.
        </p>
      </LegalSection>

      <LegalSection title="This isn't medical, financial, or legal advice">
        <p>
          Nothing in Rediscover is professional advice. If something
          concerns you, talk to a qualified professional rather than
          relying on what another member said. See{" "}
          <Link href="/safety" className="text-gold-deep underline">
            Safety &amp; Emergency Support
          </Link>{" "}
          if you need help right now.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
