import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

// Logged-out visitors: clicking a pillar tab should lead toward actually
// getting it, not just scroll to a pitch about it — so each one routes
// through login (and onboarding, if she's new) and lands on the real page,
// where she'll see the subscribe prompt if she isn't a member yet.
const navLinks = [
  { label: "Monthly chart", href: "/login?next=/dashboard" },
  { label: "Wealth", href: "/login?next=/dashboard/wealth" },
  { label: "Fitness", href: "/login?next=/dashboard/care" },
  { label: "Library", href: "/login?next=/dashboard/library" },
  { label: "Community", href: "/login?next=/dashboard/community" },
  { label: "Pricing", href: "#pricing" },
];

// Once she's a member, these same tabs take her straight to the real page
// instead of scrolling past marketing copy she's already bought into.
const memberNavLinks = [
  { label: "Monthly chart", href: "/dashboard" },
  { label: "Wealth", href: "/dashboard/wealth" },
  { label: "Fitness", href: "/dashboard/care" },
  { label: "Library", href: "/dashboard/library" },
  { label: "Community", href: "/dashboard/community" },
];

// Four pillars, matching what's actually built — 2026-07-27 pre-Razorpay
// review found Wealth was missing entirely and Community's copy promised
// anonymity the real feature doesn't have (real profile names, one open
// forum, no groups). Both fixed here.
const pillars = [
  {
    num: "1",
    title: "Monthly chart",
    body: "Money, growth, and what's changing — a new chart unlocked on the first of every month, matched to her actual stage.",
    href: "/dashboard",
  },
  {
    num: "2",
    title: "Wealth",
    body: "Government schemes that lower your real costs, a savings plan for these years, and books on money and work — for your own footing, not just hers.",
    href: "/dashboard/wealth",
  },
  {
    num: "3",
    title: "The library",
    body: "Six books on money and parenting, written for the Indian home. Free with membership, or buy individually.",
    href: "/dashboard/library",
  },
  {
    num: "4",
    title: "Community",
    body: "One open forum under your real name — search past discussions, ask anything, and see what other mothers at your stage are actually going through.",
    href: "/dashboard/community",
  },
];

// Shortened deliberately (2026-07-27) — this used to be two long grids (10
// cards, plus two non-functional "Normal delivery / C-section" toggle
// buttons) describing a structure that didn't match what's actually built.
// Now: the five real pillars, one line each, matching Body/Food/Mind/Skin/
// Rediscover across all 9 phases.
const careCards = [
  { label: "Body", body: "Named exercises for pregnancy through year three — never a generic \"go for a walk.\"" },
  { label: "Food", body: "Real guidance for your stage, with PCOS- and gestational-diabetes-specific notes where they apply." },
  { label: "Mind", body: "A weekly mantra and real tools for hard days, not just \"stay positive.\"" },
  { label: "Skin", body: "A real morning-and-night routine for your stage, not just \"keep it simple.\"" },
  { label: "Rediscover", body: "Small things that are just for you — not baby-related, not another chore." },
];

// Illustrative preview of one real month's chart — same six categories and
// visual language as the actual member dashboard (see
// src/components/MonthlyChartGrid.tsx), so a visitor can see roughly what
// unlocks the day she joins before committing. Labelled as an example, not
// live data.
const previewCards = [
  { label: "Baby's Development", accent: "gold", line: "What's changing for her this month, in plain language." },
  { label: "Mum's Wellbeing", accent: "terracotta", line: "What's normal for your body right now, and what's worth a call." },
  { label: "Buy / Arrange Now", accent: "sage", line: "What's actually worth buying this month — nothing you don't need yet." },
  { label: "Hold Off On", accent: "gold", line: "What to skip for now, so you're not buying ahead of her." },
  { label: "Movement & Rest", accent: "sage", line: "What kind of activity and rest actually fits this stage." },
  { label: "Appointments & Safety", accent: "terracotta", line: "Checkups, screenings, and warning signs worth knowing about." },
];

const books = [
  { cat: "Money", title: "Money, Understood", accent: "gold", slug: "money-understood" },
  { cat: "Money", title: "Creating Your Own Opportunities", accent: "gold", slug: "creating-your-own-opportunities" },
  { cat: "Money", title: "Building Your Financial Security", accent: "gold", slug: "building-your-financial-security" },
  { cat: "Parenting", title: "Understanding Your Little One", accent: "terracotta", slug: "understanding-your-little-one" },
  { cat: "Parenting", title: "Guiding Your Growing Child", accent: "terracotta", slug: "guiding-your-growing-child" },
  { cat: "Parenting", title: "Supporting Your Child's Growing Independence", accent: "terracotta", slug: "supporting-your-childs-growing-independence" },
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

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Every clickable card on this page should lead toward actually getting
  // the thing, not just describe it. Logged in -> straight to the real
  // page. Logged out -> through login (and onboarding, if new), landing on
  // that same real page, where the subscribe prompt is already built in.
  const dest = (path: string) =>
    user ? path : `/login?next=${encodeURIComponent(path)}`;

  return (
    <>
      <nav className="flex items-center justify-between max-w-[1080px] mx-auto px-8 py-6 gap-4">
        <div className="font-display text-[22px] font-semibold text-indigo shrink-0">
          mom<span className="text-gold-deep">village</span>
        </div>
        <ul className="hidden lg:flex gap-6 text-sm text-ink shrink-0">
          {(user ? memberNavLinks : navLinks).map((l) => (
            <li key={l.href} className="whitespace-nowrap">
              <Link href={l.href} className="hover:text-gold-deep transition-colors">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-4 shrink-0">
          {user ? (
            <>
              <Link
                href="/dashboard/account"
                className="text-sm font-semibold text-indigo whitespace-nowrap hover:text-gold-deep transition-colors"
              >
                Your account
              </Link>
              <Link
                href="/dashboard"
                className="text-sm font-semibold px-[22px] py-[11px] rounded-full bg-gold-deep text-ivory whitespace-nowrap"
              >
                Go to dashboard
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-semibold text-indigo whitespace-nowrap hover:text-gold-deep transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/login"
                className="text-sm font-semibold px-[22px] py-[11px] rounded-full bg-gold-deep text-ivory whitespace-nowrap"
              >
                Join the village
              </Link>
            </>
          )}
        </div>
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
            {user ? (
              <Link
                href="/dashboard"
                className="text-sm font-semibold px-[22px] py-[11px] rounded-full bg-gold-deep text-ivory"
              >
                Go to your dashboard
              </Link>
            ) : (
              <>
                <Link
                  href={dest("/budget-calculator")}
                  className="text-sm font-semibold px-[22px] py-[11px] rounded-full border-[1.5px] border-indigo text-indigo hover:bg-indigo/5 transition-colors"
                >
                  Get the ₹49 budget map
                </Link>
                <Link
                  href={dest("/dashboard")}
                  className="text-sm font-semibold px-[22px] py-[11px] rounded-full bg-gold-deep text-ivory hover:opacity-90 transition-opacity"
                >
                  Join for ₹299/month
                </Link>
              </>
            )}
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
              Four things, always with you
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((p) => (
              <Link
                key={p.num}
                href={dest(p.href)}
                className="block bg-ivory-2 rounded-t-[100px] rounded-b-2xl px-6 pt-10 pb-7 text-center border border-line hover:border-gold-deep/40 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-gold text-ink flex items-center justify-center font-display font-semibold text-lg mx-auto mb-4">
                  {p.num}
                </div>
                <h3 className="text-[18px] text-indigo mb-2.5">{p.title}</h3>
                <p className="text-sm text-ink/70">{p.body}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CARE — shortened 2026-07-27; used to be two long grids describing a
          structure that no longer matched what's built, plus two
          non-functional "Normal delivery / C-section" toggle buttons. */}
      <section id="fitness" className="py-20 px-8 bg-ivory-2">
        <div className="max-w-[1080px] mx-auto">
          <div className="text-center max-w-[560px] mx-auto mb-10">
            <div className="text-xs tracking-[0.12em] uppercase text-terracotta font-semibold">
              more than a workout
            </div>
            <h2 className="text-[32px] text-indigo mt-2">
              Her body, mind, and days — cared for too
            </h2>
            <p className="text-ink/68 text-[15px] mt-3">
              Matched to her pregnancy or postpartum stage — not a generic
              &quot;bounce back&quot; plan, and never crunches or guilt.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4.5 mb-8">
            {careCards.map((c) => (
              <Link
                key={c.label}
                href={dest("/dashboard/care")}
                className="block bg-ivory rounded-2xl p-5.5 border border-line border-t-[3px] border-t-sage hover:border-sage-deep/50 transition-colors"
              >
                <div className="text-[11px] uppercase tracking-wide font-bold text-sage-deep mb-2.5">
                  {c.label}
                </div>
                <p className="text-[13px] text-ink/72 leading-snug">{c.body}</p>
              </Link>
            ))}
          </div>
          <p className="text-center text-[13px] text-sage-deep italic font-display">
            Every medical claim here is independently checked against sources
            like ACOG, WHO, and Mayo Clinic before it&apos;s published — see the
            note near pricing below.
          </p>
        </div>
      </section>

      {/* PREVIEW — new 2026-07-27, answers "what happens after I join?" with
          an illustrative example of one real month's chart, same six
          categories and layout as the actual member dashboard. */}
      <section className="py-20 px-8">
        <div className="max-w-[1080px] mx-auto">
          <div className="text-center max-w-[560px] mx-auto mb-4">
            <div className="text-xs tracking-[0.12em] uppercase text-gold-deep font-semibold">
              what you&apos;ll actually see
            </div>
            <h2 className="text-[32px] text-indigo mt-2">
              A peek at one month&apos;s chart
            </h2>
            <p className="text-ink/68 text-[15px] mt-3">
              This is an example, not your real data — the day you join,
              you&apos;ll see this same layout filled in for your own stage.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
            {previewCards.map((c) => (
              <div
                key={c.label}
                className="bg-ivory-2 rounded-2xl border border-line p-6"
                style={{ borderTop: `3px solid var(--color-${c.accent})` }}
              >
                <h3 className="font-display text-lg text-indigo mb-2">{c.label}</h3>
                <p className="text-sm text-ink/70 leading-snug">{c.line}</p>
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
              Six books, written for this exact journey
            </h2>
            <p className="text-ivory/70 text-[15px] mt-3">
              Three on money, three on parenting — free the moment you join,
              or buy on their own.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4.5 mb-5">
            {books.map((b) => (
              <Link
                key={b.title}
                href={dest(`/dashboard/library/${b.slug}`)}
                className="bg-ivory rounded-l overflow-hidden flex flex-col shadow-[-6px_0_0_rgba(0,0,0,0.15)] hover:opacity-95 transition-opacity"
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
              </Link>
            ))}
          </div>
          <div className="flex items-center justify-center gap-4">
            <p className="text-ivory/75 text-sm">Or get all six as a bundle for ₹849</p>
            <Link
              href={dest("/dashboard/library")}
              className="text-sm font-semibold px-[22px] py-[11px] rounded-full border-[1.5px] border-gold text-gold"
            >
              Buy the bundle
            </Link>
          </div>
        </div>
      </section>

      {/* COMMUNITY */}
      <section id="community" className="bg-ivory-2 py-20 px-8">
        <div className="max-w-[1080px] mx-auto">
          <div className="text-center max-w-[560px] mx-auto mb-12">
            <div className="text-xs tracking-[0.12em] uppercase text-sage-deep font-semibold">
              from the community
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
          <div className="grid md:grid-cols-2 gap-6 max-w-[720px] mx-auto mb-10">
            <div className="rounded-[20px] p-8.5 border border-line bg-ivory-2">
              <div className="text-[13px] uppercase tracking-wide font-semibold opacity-70">
                Budget map
              </div>
              <div className="font-display text-[34px] my-2">₹49</div>
              <ul className="text-sm space-y-0 mb-4">
                <li className="py-1.5 border-t border-black/[0.08]">A stage-by-stage cost breakdown — pregnancy &amp; delivery, newborn essentials, first year, toddler years</li>
                <li className="py-1.5 border-t border-black/[0.08]">Exactly which government schemes lower your real cost (JSSK, PMSMA, PMMVY, free immunizations)</li>
                <li className="py-1.5 border-t border-black/[0.08]">A realistic, judgment-free number — not an inflated shopping list</li>
              </ul>
              <Link
                href={dest("/budget-calculator")}
                className="block text-center text-sm font-semibold px-6 py-2.5 rounded-full border-[1.5px] border-indigo text-indigo hover:bg-indigo/5 transition-colors"
              >
                Get the budget map
              </Link>
            </div>
            <div className="rounded-[20px] p-8.5 bg-indigo text-ivory">
              <div className="text-[13px] uppercase tracking-wide font-semibold opacity-70">
                Village membership
              </div>
              <div className="font-display text-[34px] my-2">₹299/mo</div>
              <ul className="text-sm space-y-0 mb-4">
                <li className="py-1.5 border-t border-ivory/15">Monthly chart, every month</li>
                <li className="py-1.5 border-t border-ivory/15">All 6 books, included</li>
                <li className="py-1.5 border-t border-ivory/15">Full access to Wealth, Care Chart, and Community</li>
              </ul>
              <Link
                href={dest("/dashboard")}
                className="block text-center text-sm font-semibold px-6 py-2.5 rounded-full bg-gold-deep text-ivory hover:opacity-90 transition-opacity"
              >
                Join the village
              </Link>
            </div>
          </div>
          <p className="text-center font-display italic text-[15px] text-sage-deep mb-10">
            Most months, what you save covers what you spend.
          </p>

          {/* CREDIBILITY + SAFETY — added 2026-07-27 per Roop's review.
              Personal-bio line intentionally left as a placeholder — needs
              her own words, not invented credentials. */}
          <div className="max-w-[640px] mx-auto bg-ivory-2 rounded-2xl border border-line p-7 text-center">
            <p className="text-sm text-ink/80 leading-relaxed mb-3">
              {/* TODO (Roop): replace with your own 1-2 line story/background */}
              Mom&apos;s Village is built by Roop, an Indian mother who built
              the resource she couldn&apos;t find herself.
            </p>
            <p className="text-sm text-ink/80 leading-relaxed">
              Every medical, financial, and government-scheme claim in the app
              is independently checked against primary sources — WHO, CDC,
              ACOG, Mayo Clinic, RBI, SEBI, and official Indian government
              portals — before it&apos;s published, not just written from
              memory.
            </p>
            <p className="text-xs text-ink/50 mt-4 italic">
              This app offers general guidance, not medical or financial
              advice. Always check with your own doctor before starting or
              changing any exercise, feeding, or recovery routine.
            </p>
          </div>
        </div>
      </section>

      <Jaali />
      <footer className="bg-ink text-ivory py-12 px-8">
        <div className="max-w-[1080px] mx-auto">
          <div className="flex justify-between items-center flex-wrap gap-4 mb-8">
            <div className="font-display text-[22px] font-semibold text-ivory">
              mom<span className="text-gold">village</span>
            </div>
            <div className="font-display italic text-sm opacity-70">
              From your first positive test to her third birthday — we&apos;re
              your village.
            </div>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs opacity-60 border-t border-ivory/10 pt-6">
            <Link href="/about" className="hover:opacity-100 transition-opacity">About</Link>
            <Link href="/contact" className="hover:opacity-100 transition-opacity">Contact &amp; Help</Link>
            <Link href="/privacy" className="hover:opacity-100 transition-opacity">Privacy Policy</Link>
            <Link href="/terms" className="hover:opacity-100 transition-opacity">Terms of Use</Link>
            <Link href="/community-guidelines" className="hover:opacity-100 transition-opacity">Community Guidelines</Link>
            <Link href="/refund-policy" className="hover:opacity-100 transition-opacity">Cancellation &amp; Refund Policy</Link>
            <Link href="/safety" className="hover:opacity-100 transition-opacity">Safety &amp; Emergency Support</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
