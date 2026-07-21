// Shared presentational building blocks for long-form Wealth reference
// content (Government Benefits & Savings Directory, Savings & Planning
// Guidance). These are static, non-personalized documents — unlike the
// Monthly Chart / Care Chart, there's no per-user matching here, so the
// content is just hardcoded JSX rather than pulled from Supabase.

export function DocHeader({
  eyebrow,
  title,
  intro,
}: {
  eyebrow: string;
  title: string;
  intro: string;
}) {
  return (
    <div className="mb-8">
      <div className="mb-2 text-xs uppercase tracking-[0.12em] text-sage-deep font-semibold">
        {eyebrow}
      </div>
      <h1 className="font-display text-[28px] text-indigo mb-3">{title}</h1>
      <p className="text-sm text-ink/65 max-w-[600px]">{intro}</p>
    </div>
  );
}

export function DisclaimerBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-indigo rounded-2xl p-6 text-ivory/90 text-[13px] leading-relaxed mb-10">
      <div className="text-xs uppercase tracking-[0.12em] text-gold font-semibold mb-2">
        before you read on
      </div>
      {children}
    </div>
  );
}

export function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2 className="font-display text-xl text-indigo mb-4">{title}</h2>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

export function EntryCard({
  title,
  who,
  what,
  how,
  link,
  linkLabel,
}: {
  title: string;
  who: string;
  what: string;
  how: string;
  link?: string;
  linkLabel?: string;
}) {
  return (
    <div className="bg-ivory-2 rounded-2xl border border-line p-6">
      <h3 className="font-display text-lg text-indigo mb-3">{title}</h3>
      <p className="text-sm text-ink/80 mb-2">
        <span className="font-semibold text-ink">Who it&apos;s for: </span>
        {who}
      </p>
      <p className="text-sm text-ink/80 mb-2">
        <span className="font-semibold text-ink">What it gives you: </span>
        {what}
      </p>
      <p className="text-sm text-ink/80">
        <span className="font-semibold text-ink">How to access it: </span>
        {how}
      </p>
      {link && (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-3 text-xs font-semibold text-gold-deep underline"
        >
          {linkLabel || "Official info"}
        </a>
      )}
    </div>
  );
}

export function NoteCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-ivory-2 rounded-2xl border border-line p-6 text-sm text-ink/75 leading-relaxed">
      {children}
    </div>
  );
}

export function BulletList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="space-y-2 pl-1">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5 text-sm text-ink/75">
          <span className="text-gold-deep mt-1">•</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function NumberedList({ items }: { items: React.ReactNode[] }) {
  return (
    <ol className="space-y-2 pl-1">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5 text-sm text-ink/75">
          <span className="text-gold-deep font-semibold">{i + 1}.</span>
          <span>{item}</span>
        </li>
      ))}
    </ol>
  );
}

export function Worksheet({ rows }: { rows: string[] }) {
  return (
    <div className="bg-ivory-2 rounded-2xl border border-line p-5 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line text-left">
            <th className="py-2 pr-3 font-semibold text-ink text-xs uppercase tracking-wide">
              Item
            </th>
            <th className="py-2 px-3 font-semibold text-ink text-xs uppercase tracking-wide text-right">
              Lower
            </th>
            <th className="py-2 pl-3 font-semibold text-ink text-xs uppercase tracking-wide text-right">
              Higher
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((label, i) => (
            <tr
              key={i}
              className={
                i === rows.length - 1
                  ? "font-semibold text-ink"
                  : "border-b border-line/50"
              }
            >
              <td className="py-2.5 pr-3 text-ink/80">{label}</td>
              <td className="py-2.5 px-3 text-right text-ink/40">₹</td>
              <td className="py-2.5 pl-3 text-right text-ink/40">₹</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-ink/50 mt-3">
        Fill this in on paper or in a notes app — use a range wherever
        you&apos;re not sure of the exact number yet.
      </p>
    </div>
  );
}

export function SourceFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-t border-line pt-6 mt-10 text-xs text-ink/50 leading-relaxed">
      {children}
    </div>
  );
}
