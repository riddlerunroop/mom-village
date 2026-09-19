// The short, point-of-contact tier of the two-tier disclaimer — shown
// right before a mother can message someone or see their details, not just
// buried in Terms. See src/app/rediscover-disclaimer/page.tsx for the full
// standing page, and CLAUDE.md's "Rediscover" entry for why it's built
// this way.
export default function ContactDisclaimer() {
  return (
    <div className="bg-ivory-2 rounded-xl border border-line px-4 py-3 text-xs text-ink/60 leading-relaxed">
      Mom&apos;s Village doesn&apos;t verify anyone&apos;s qualifications,
      products, or business standing, and takes no side if something goes
      wrong between you. Before you agree to anything: settle what&apos;s
      being delivered and by when, keep your own record of the
      conversation, and keep a screenshot of any payment made or received.{" "}
      <a href="/rediscover-disclaimer" className="underline text-gold-deep">
        Read the full disclaimer
      </a>
      .
    </div>
  );
}
