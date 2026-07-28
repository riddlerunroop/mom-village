import Link from "next/link";

// Shared shell for standalone public pages (About, Contact, Privacy, Terms,
// Community Guidelines, Cancellation & Refund, Safety) — built 2026-07-28 as
// part of the pre-Razorpay "essential pages" pass. These pages live outside
// both the marketing homepage and the subscriber dashboard, so they get
// their own minimal header/footer rather than reusing either.
export default function LegalPage({
  eyebrow,
  title,
  updated,
  children,
}: {
  eyebrow: string;
  title: string;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-ivory">
      <header className="border-b border-line px-6 py-5">
        <div className="max-w-[720px] mx-auto flex items-center justify-between">
          <Link href="/" className="font-display text-xl font-semibold text-indigo">
            mom<span className="text-gold-deep">village</span>
          </Link>
          <Link
            href="/"
            className="text-xs font-semibold text-ink/60 hover:text-indigo transition-colors"
          >
            ← Back to homepage
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-[720px] mx-auto px-6 py-14 w-full">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-[0.12em] text-sage-deep font-semibold mb-2">
            {eyebrow}
          </div>
          <h1 className="font-display text-[30px] text-indigo mb-2">{title}</h1>
          {updated && <p className="text-xs text-ink/45">Last updated {updated}</p>}
        </div>
        <div className="space-y-8 text-sm text-ink/80 leading-relaxed">{children}</div>
      </main>

      <footer className="border-t border-line px-6 py-8">
        <div className="max-w-[720px] mx-auto flex flex-wrap gap-x-5 gap-y-2 text-xs text-ink/50">
          <Link href="/about" className="hover:text-indigo transition-colors">About</Link>
          <Link href="/contact" className="hover:text-indigo transition-colors">Contact &amp; Help</Link>
          <Link href="/privacy" className="hover:text-indigo transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-indigo transition-colors">Terms of Use</Link>
          <Link href="/community-guidelines" className="hover:text-indigo transition-colors">Community Guidelines</Link>
          <Link href="/refund-policy" className="hover:text-indigo transition-colors">Cancellation &amp; Refund Policy</Link>
          <Link href="/safety" className="hover:text-indigo transition-colors">Safety &amp; Emergency Support</Link>
        </div>
      </footer>
    </div>
  );
}

// Small reusable heading for sub-sections within a legal/info page.
export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="font-display text-lg text-indigo mb-2.5">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
