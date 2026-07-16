import Link from "next/link";

const navLinks = [
  { label: "Monthly chart", href: "#chart" },
  { label: "Fitness", href: "#fitness" },
  { label: "Library", href: "#books" },
  { label: "Community", href: "#community" },
  { label: "Pricing", href: "#pricing" },
];

const pillars = [
  {
    num: "1",
    title: "Monthly chart",
    body: "Money, growth, fitness, and what's changing — unlocked on the first of every month, from her stage, not a stranger's average.",
  },
  {
    num: "2",
    title: "The library",
    body: "Five books on money and parenting, written for the Indian home. Free with membership, or buy individually.",
  },
  {
    num: "3",
    title: "The circle",
    body: "Small group spaces to vent, ask, and be understood. No profiles, no performing — just moms who are where you are.",
  },
];

const fitCards = [
  { label: "Body", title: "Recovery, at her pace", body: "C-section and normal delivery timelines, 5-minute resets, and diabetes-safe movement — never crunches, never rushed." },
  { label: "Food", title: "Nourishment, not restriction", body: "Feeding-friendly meals and diabetes-friendly plates — support for her supply and her health, without overcounting calories." },
  { label: "Mind", title: "Support for the hard days", body: "Postpartum depression support, quieting negative thoughts, and keeping toxic energy at a distance." },
  { label: "Life", title: "Days that feel manageable", body: "Simple time and health routines with baby, so nothing feels endless — and room to just be happy." },
];

const trackCards = [
  { tag: "Body", title: "Diastasis recti recovery", body: "A safe, progressive closure track — no crunches, no full planks, ever." },
  { tag: "Body", title: "C-section timeline", body: "Week 1 to month 3 — what's safe to try, and when, physically and mentally." },
  { tag: "Mind", title: "What's normal, what's not", body: "Understanding postpartum lows — and knowing exactly when and how to get real support." },
  { tag: "Life", title: "A 2-minute happiness ritual", body: "Small, doable practices for the days that feel like too much." },
  { tag: "Body", title: "Ready for more", body: "30-45 minute progressive plans for when she has real energy and time back — no rush to get there." },
  { tag: "Food", title: "Problem-specific plates", body: "PCOS, thyroid, anemia — eating built around her actual health picture, not a generic diet." },
];

const books = [
  { cat: "Money", title: "The first 1000 days: a money map", accent: "gold" },
  { cat: "Money", title: "Small sums, big security", accent: "gold" },
  { cat: "Parenting", title: "What's normal, month by month", accent: "terracotta" },
  { cat: "Parenting", title: "The tired mother's guide to everything", accent: "terracotta" },
  { cat: "Parenting", title: "Raising her, not losing yourself", accent: "terracotta" },
];

const quotes = [
  { q: "Posted at 2am about the crying. Three moms replied before I even put my phone down.", who: "Mom of a 4-month-old" },
  { q: "I sold the walker I never needed and bought exactly what month 10 needed instead.", who: "Mom of a 10-month-old" },
  { q: "First time in this whole journey someone told me what's actually normal, not what's scary.", who: "Mom of a 2-year-old" },
];

function Jaali({ light = false }: { light?: boolean }) {
  return (
    <div
      className={`h-7 ${light ? "opacity-[0.14]" : "opacity-[0.55]"}`}
      style={{
        backgroundImage:
          "radial-gradient(circle at 12px 14px, transparent 8px, var(--color-ink) 8.5px, var(--color-ink) 9px, transparent 9.5px)",
        backgroundSize: "24px 28px",
        backgroundRepeat: "repeat-x",
      }}
    />
  );
}

export default function Home() {
  return (
    <>
      <nav className="flex items-center justify-between max-w-[1080px] mx-auto px-8 py-6 gap-4">
        <div className="font-display text-[22px] font-semibold text-indigo shrink-0">
          mom<span className="text-gold-deep">village</span>
        </div>
        <ul className="hidden lg:flex gap-7 text-sm text-ink shrink-0">
          {navLinks.map((l) => (
            <li key={l.href} className="whitespace-nowrap">
              <a href={l.href} className="hover:text-gold-deep transition-colors">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <Link
          href="/join"
          className="text-sm font-semibold px-[22px] py-[11px] rounded-full bg-gold-deep text-ivory shrink-0 whitespace-nowrap"
        >
          Join the village
        </Link>
      </nav>

      <Jaali light />

      {/* HERO */}
      <section className="grid md:grid-cols-[1.1fr_0.9fr] gap-14 items-center max-w-[1080px] mx-auto px-8 py-14 md:py-18">
        <div>
          <div className="text-xs tracking-[0.12em] uppercase text-sage-deep font-semibold mb-3">
            for every indian mom, month zero to three
          </div>
          <h1 className="text-[36px] md:text-[46px] text-indigo mb-5">
            Stop googling alone
            <br />
            at 3am.
          </h1>
          <p className="text-[17px] text-ink/80 max-w-[460px] mb-7">
            From your first positive test to her third birthday — one place for
            what to spend, what to skip, how she&apos;s growing, and moms who
            already get it.
          </p>
          <div className="flex gap-3.5 flex-wrap mb-5">
            <button className="text-sm font-semibold px-[22px] py-[11px] rounded-full border-[1.5px] border-indigo text-indigo">
              Get the ₹49 budget map
            </button>
            <button className="text-sm font-semibold px-[22px] py-[11px] rounded-full bg-gold-deep text-ivory">
              Join for ₹299/month
            </button>
          </div>
          <p className="font-display italic text-[13px] text-sage-deep">
            Built by a mom. Not a corporation selling diapers.
          </p>
        </div>
        <div className="relative aspect-[3/4] rounded-t-[200px] rounded-b-2xl overflow-hidden border-[6px] border-ivory-2 flex items-end justify-center bg-gradient-to-b from-indigo to-[#2c4066]">
          <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[60%] h-[60%] rounded-full bg-[radial-gradient(circle,rgba(217,164,65,0.35)_0%,transparent_70%)]" />
          <div className="relative z-10 text-ivory font-display text-sm text-center p-4.5 bg-indigo/55 w-full">
            a home, month by month — from her first flutter to her third
            birthday
          </div>
        </div>
      </section>

      {/* JOURNEY / MALA */}
      <section id="chart" className="bg-indigo py-18 px-8">
        <div className="max-w-[1080px] mx-auto text-center">
          <div className="text-xs tracking-[0.12em] uppercase text-gold font-semibold mb-2">
            her first 1000 days
          </div>
          <h2 className="text-[32px] text-ivory mb-2">
            Every month, mapped for you
          </h2>
          <p className="text-ivory/75 max-w-[480px] mx-auto mb-12 text-[15px]">
            Money, milestones, and how her own body is recovering and getting
            stronger — delivered the first of every month, from pregnancy
            through age three.
          </p>
          <svg viewBox="0 0 900 140" className="w-full h-auto">
            <path
              d="M 20 90 Q 130 20, 240 90 T 460 90 T 680 90 T 900 90"
              fill="none"
              stroke="rgba(251,244,232,0.25)"
              strokeWidth="2"
            />
            {[
              { cx: 20, cy: 90, label: "Due date", now: false, gold: true },
              { cx: 130, cy: 42, label: "Month 1", now: false, gold: true },
              { cx: 240, cy: 90, label: "Month 4", now: false, gold: true },
              { cx: 350, cy: 42, label: "Month 8 · now", now: true, gold: true },
              { cx: 460, cy: 90, label: "Month 12", now: false, gold: false },
              { cx: 570, cy: 42, label: "Month 18", now: false, gold: false },
              { cx: 680, cy: 90, label: "Month 24", now: false, gold: false },
              { cx: 790, cy: 42, label: "Month 30", now: false, gold: false },
              { cx: 900, cy: 90, label: "3rd birthday", now: false, gold: false },
            ].map((p, i) => (
              <g key={i}>
                <circle
                  cx={p.cx}
                  cy={p.cy}
                  r={p.now ? 8 : 7}
                  fill={p.gold ? "#D9A441" : "none"}
                  stroke={p.gold ? (p.now ? "#FBF4E8" : "none") : "rgba(251,244,232,0.4)"}
                  strokeWidth={p.now ? 2 : p.gold ? 0 : 2}
                />
                <text
                  x={p.cx}
                  y={p.cy > 60 ? p.cy + 25 : p.cy - 12}
                  textAnchor="middle"
                  className={`text-[11px] font-sans ${p.now ? "fill-gold font-bold" : "fill-ivory/65"}`}
                >
                  {p.label}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </section>

      {/* PILLARS */}
      <section className="py-20 px-8">
        <div className="max-w-[1080px] mx-auto">
          <div className="text-center max-w-[560px] mx-auto mb-12">
            <div className="text-xs tracking-[0.12em] uppercase text-sage-deep font-semibold">
              what&apos;s inside
            </div>
            <h2 className="text-[32px] text-indigo mt-2">
              Three things, always with you
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-7">
            {pillars.map((p) => (
              <div
                key={p.num}
                className="bg-ivory-2 rounded-t-[120px] rounded-b-2xl px-6.5 pt-11 pb-7.5 text-center border border-line"
              >
                <div className="w-13 h-13 rounded-full bg-gold text-ink flex items-center justify-center font-display font-semibold text-lg mx-auto mb-4.5">
                  {p.num}
                </div>
                <h3 className="text-[19px] text-indigo mb-2.5">{p.title}</h3>
                <p className="text-sm text-ink/70">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FITNESS */}
      <section id="fitness" className="py-20 px-8 bg-ivory-2">
        <div className="max-w-[1080px] mx-auto">
          <div className="text-center max-w-[560px] mx-auto mb-8">
            <div className="text-xs tracking-[0.12em] uppercase text-terracotta font-semibold">
              more than a workout
            </div>
            <h2 className="text-[32px] text-indigo mt-2">
              Her body, mind, and days — cared for too
            </h2>
            <p className="text-ink/68 text-[15px] mt-3">
              Built around how she delivered, how she&apos;s feeding, and how
              she&apos;s really doing — not a generic &quot;bounce back&quot; plan.
            </p>
          </div>
          <div className="flex justify-center gap-3 mb-1">
            <button className="text-sm font-semibold px-5 py-2.25 rounded-full bg-sage-deep text-ivory border-[1.5px] border-sage-deep">
              Normal delivery
            </button>
            <button className="text-sm font-semibold px-5 py-2.25 rounded-full text-sage-deep border-[1.5px] border-sage-deep">
              C-section recovery
            </button>
          </div>
          <p className="text-center text-[13px] text-ink/60 italic mb-8">
            Starts at 5 minutes. Grows with her — 30 to 45 minute sessions
            unlock once she&apos;s ready, usually well into year one.
          </p>
          <div className="grid md:grid-cols-4 gap-5 mb-3">
            {fitCards.map((c) => (
              <div
                key={c.label}
                className="bg-ivory rounded-2xl p-6 border border-line border-t-[3px] border-t-sage"
              >
                <div className="text-[11px] uppercase tracking-wide font-bold text-sage-deep mb-2.5">
                  {c.label}
                </div>
                <h4 className="text-base text-indigo mb-2">{c.title}</h4>
                <p className="text-[13px] text-ink/72">{c.body}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-[13px] text-sage-deep italic font-display mt-8 mb-14">
            Every plan is diastasis-recti safe by default. Mind-care content is
            written with a perinatal mental health professional, with clear
            guidance on when to reach out for real support.
          </p>

          <div className="text-center mb-7">
            <div className="text-xs tracking-[0.12em] uppercase text-terracotta font-semibold">
              if you need more, opt in
            </div>
            <h3 className="text-2xl text-indigo mt-2">A peek inside</h3>
            <p className="text-ink/68 text-sm mt-2.5 max-w-[480px] mx-auto">
              Not everyone needs all of these — but if one applies to you,
              it&apos;s one tap away. No pressure to take on more than
              you&apos;re ready for.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-4.5">
            {trackCards.map((t) => (
              <div key={t.title} className="bg-indigo rounded-2xl p-5.5 text-ivory">
                <span className="inline-block text-[10px] font-bold uppercase tracking-wide text-gold bg-gold/[0.14] px-2.5 py-1 rounded-full mb-3">
                  {t.tag}
                </span>
                <h4 className="text-base mb-2">{t.title}</h4>
                <p className="text-[13px] text-ivory/70">{t.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BOOKS */}
      <section id="books" className="bg-indigo py-20 px-8">
        <div className="max-w-[1080px] mx-auto">
          <div className="text-center max-w-[560px] mx-auto mb-12">
            <div className="text-xs tracking-[0.12em] uppercase text-gold font-semibold">
              the library
            </div>
            <h2 className="text-[32px] text-ivory mt-2">
              Five books, written for this exact journey
            </h2>
            <p className="text-ivory/70 text-[15px] mt-3">
              Two on money, three on parenting — free the moment you join, or
              buy on their own. Titles below are placeholders until topics are
              finalised.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4.5 mb-5">
            {books.map((b) => (
              <div
                key={b.title}
                className="bg-ivory rounded-l overflow-hidden flex flex-col shadow-[-6px_0_0_rgba(0,0,0,0.15)]"
              >
                <div
                  className="h-1.5"
                  style={{
                    background:
                      b.accent === "gold"
                        ? "var(--color-gold)"
                        : "var(--color-terracotta)",
                  }}
                />
                <div className="p-5 flex flex-col flex-1">
                  <div
                    className="text-[10px] uppercase tracking-wide font-bold"
                    style={{
                      color:
                        b.accent === "gold"
                          ? "var(--color-gold-deep)"
                          : "var(--color-terracotta)",
                    }}
                  >
                    {b.cat}
                  </div>
                  <h4 className="font-display text-base text-indigo mt-2.5 mb-auto leading-snug">
                    {b.title}
                  </h4>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-line">
                    <span className="font-display text-[15px] text-ink">₹249</span>
                    <span className="text-[10px] text-sage-deep font-semibold">
                      Free w/ membership
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-4">
            <p className="text-ivory/75 text-sm">Or get all five as a bundle for ₹849</p>
            <button className="text-sm font-semibold px-[22px] py-[11px] rounded-full border-[1.5px] border-gold text-gold">
              Buy the bundle
            </button>
          </div>
        </div>
      </section>

      {/* COMMUNITY */}
      <section id="community" className="bg-ivory-2 py-20 px-8">
        <div className="max-w-[1080px] mx-auto">
          <div className="text-center max-w-[560px] mx-auto mb-12">
            <div className="text-xs tracking-[0.12em] uppercase text-sage-deep font-semibold">
              from the circle
            </div>
            <h2 className="text-[32px] text-indigo mt-2">Real talk, real village</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {quotes.map((q) => (
              <div
                key={q.who}
                className="bg-ivory rounded-t-[90px] rounded-b-xl px-5.5 pt-9.5 pb-6.5 border border-line"
              >
                <p className="font-display italic text-base text-ink mb-3.5">
                  &quot;{q.q}&quot;
                </p>
                <p className="text-xs text-sage-deep font-semibold">— {q.who}</p>
              </div>
            ))}
          </div>
          <p className="text-center mt-12 font-display italic text-xl text-terracotta">
            You&apos;re not doing this alone.
          </p>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-20 px-8">
        <div className="max-w-[1080px] mx-auto">
          <div className="text-center max-w-[560px] mx-auto mb-12">
            <div className="text-xs tracking-[0.12em] uppercase text-sage-deep font-semibold">
              join the village
            </div>
            <h2 className="text-[32px] text-indigo mt-2">Simple, honest pricing</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-[720px] mx-auto">
            <div className="rounded-[20px] p-8.5 border border-line bg-ivory-2">
              <div className="text-[13px] uppercase tracking-wide font-semibold opacity-70">
                Budget map
              </div>
              <div className="font-display text-[34px] my-2">₹49</div>
              <ul className="text-sm space-y-0">
                <li className="py-1.5 border-t border-black/[0.08]">Full 0–3 year cost planner</li>
                <li className="py-1.5 border-t border-black/[0.08]">One-time download</li>
                <li className="py-1.5 border-t border-black/[0.08]">No login needed</li>
              </ul>
            </div>
            <div className="rounded-[20px] p-8.5 bg-indigo text-ivory">
              <div className="text-[13px] uppercase tracking-wide font-semibold opacity-70">
                Village membership
              </div>
              <div className="font-display text-[34px] my-2">₹299/mo</div>
              <ul className="text-sm space-y-0">
                <li className="py-1.5 border-t border-ivory/15">Monthly chart, every month</li>
                <li className="py-1.5 border-t border-ivory/15">All 5 books, included</li>
                <li className="py-1.5 border-t border-ivory/15">Full access to the circle</li>
              </ul>
            </div>
          </div>
          <p className="text-center font-display italic text-[15px] text-sage-deep mt-7">
            Most months, what you save covers what you spend.
          </p>
        </div>
      </section>

      <Jaali />
      <footer className="bg-ink text-ivory py-12 px-8">
        <div className="max-w-[1080px] mx-auto flex justify-between items-center flex-wrap gap-4">
          <div className="font-display text-[22px] font-semibold text-ivory">
            mom<span className="text-gold">village</span>
          </div>
          <div className="font-display italic text-sm opacity-70">
            From your first positive test to her third birthday — we&apos;re
            your village.
          </div>
        </div>
      </footer>
    </>
  );
}
