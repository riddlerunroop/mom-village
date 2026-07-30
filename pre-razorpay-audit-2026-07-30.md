# Mom's Village — Pre-Razorpay Launch Audit

*Conducted 2026-07-30, per Roop's request for a full commercial-launch review before domain purchase + Razorpay integration. Static code audit (no browser available this session) — routes, links, forms, states, a11y, SEO, security, and performance checked directly against the codebase; UX judgments cross-referenced against Roop's own extensive hands-on reviews already logged in CLAUDE.md.*

Nothing has been fixed yet. This is the findings list only, as requested — fixes start after you've reviewed this.

---

## Critical — must fix before launch

**1. Homepage has no mobile navigation.** The entire top nav (Monthly chart / Explore dropdown / Pricing) is wrapped in `hidden lg:flex` with zero hamburger menu or mobile alternative — below ~1024px width, a visitor has no way to navigate the site at all except the hero buttons. Given most Indian mothers will land on this site from a phone, this is likely costing signups right now, not just a future risk.

**2. No sitemap.xml or robots.txt.** Neither file exists anywhere in the project. Search engines have no explicit crawl guidance and no sitemap to discover your pages efficiently.

**3. No Open Graph / Twitter Card metadata anywhere.** When a mother shares a mom-village link on WhatsApp or Instagram (the realistic discovery channel for this audience), the preview card will show nothing — no image, no title, no description. For a product that depends on word-of-mouth sharing, this materially hurts conversion from shares.

**4. Wealth page shows a false "Books are being written" message.** `src/app/dashboard/wealth/page.tsx` has a static, unconditional line — "Books are being written — worth the wait." — but all three relevant Wealth books have been live in the Library for days. A paying subscriber sees this every time she opens Wealth.

**5. The login page is a dead end — no way back to the homepage.** Flagged by Roop directly, confirmed in code: `src/app/login/page.tsx`'s "momvillage" wordmark (line 127-129) is plain text, not a link, and nothing else on the page points home. Anyone who lands here (from a shared link, a bookmark, or just curiosity) and decides not to enter a phone number is stuck — no back button equivalent, no logo link, nothing. Every other page in the app (dashboard header, all 6 legal pages) links the wordmark back to `/`; this is the one page that doesn't.

---

## Important — should fix before launch if feasible

**6. No per-page SEO metadata on any public page except the 6 legal pages.** The homepage, `/login`, `/budget-calculator`, `/onboarding`, `/care-quiz` — all inherit the same generic root title/description. Search results and browser tabs can't distinguish them.

**7. Cron endpoint fails open if `CRON_SECRET` is unset.** `src/app/api/cron/vaccination-reminders/route.ts` only checks the secret `if (process.env.CRON_SECRET && ...)` — if that env var is ever missing (e.g. accidentally removed from Vercel, or a future deploy environment), the route accepts requests from anyone instead of rejecting them. Should fail closed, not open. (Confirmed the variable is currently set in Vercel per your own setup — this is a code robustness gap, not an active breach.)

**8. No rate limiting on AI-calling routes.** `/api/vaccination/extract`, `/api/memories/transcribe`, `/api/memories/recall` are all auth-gated correctly, but a logged-in user (or a compromised account) could hammer them with no cap, running up your Anthropic/OpenAI bill. Worth a simple per-user per-day cap before this is handling real payment-backed traffic.

**9. Every image in the app is a raw `<img>` tag — `next/image` is used zero times.** Book covers, the homepage hero mockup, memory photos, vaccination card photos — none get automatic lazy-loading, responsive sizing, or modern-format compression. On mobile data (the realistic condition for a lot of your users), this is a real load-time cost, especially on the Library shelf and the memories timeline.

**10. Systemic missing form-label association.** 30 of 31 `<label>` elements across the app (onboarding, care-quiz, account, budget calculator, etc.) sit next to their input with no `htmlFor`/`id` pairing — sighted users never notice, but a screen reader can't associate the label with the field. Mechanical, low-risk fix, but genuinely affects usability for anyone using assistive tech.

**11. Phone number and OTP inputs have no format/length validation before submit.** `src/app/login/page.tsx` — a malformed phone number or a non-6-digit OTP gets submitted as-is and surfaces Supabase's raw API error instead of a friendly message.

**12. Date-of-birth / due-date fields have no min/max bounds.** Onboarding and the account page both accept any date via a bare `<input type="date">` — a fat-fingered year (e.g. 1900, or 2030) would break the month/week calculators that drive nearly every pillar's content matching, with no client-side guard catching it first.

**13. No `loading.tsx` or `error.tsx` anywhere in the app.** Every route relies on the browser's default blank-screen-while-fetching behavior, and any unhandled server error produces Next's generic error screen rather than something on-brand and reassuring.

---

## Nice to have — can wait until after launch

**14. Empty `alt=""` on user-uploaded memory photos.** `MemoriesClient.tsx` — cosmetic photos could reasonably stay decorative, but a mother's own logged photo probably deserves better than a blank alt attribute for screen-reader users.

**15. Widespread low-contrast text**, particularly the homepage's medical/financial disclaimer (`text-ink/50`) and the 9px fine print near the footer. Nothing is illegible, but a legally-relevant disclaimer is worth a slightly darker/larger treatment.

**16. Pattern page's mood dots communicate partly through color** (with a text legend below and a hover tooltip, so not a hard failure) — could add a visible label per dot for a cleaner accessibility story later.

**17. The Explore dropdown on desktop is hover-only** (`group-hover`), which doesn't work well on touch/hybrid devices even once a mobile nav exists for the collapsed case. Worth a tap-friendly version eventually.

**18. Some minor N+1-shaped Supabase calls** (e.g. memory photo signed-URL generation loops with `Promise.all` per photo) — fine at current scale, worth batching if the Memories timeline ever gets large per user.

---

## Not included in this list, on purpose

Per your explicit instructions this session: the homepage bio placeholder, the Contact page's support-email placeholder, EPDS/PHQ-9 screening, and anything native-app-related are all deliberately out of scope and untouched.

The lack of any working payment/subscription-grant flow is not listed as a bug — that's the reason Razorpay is next, not a defect in what's already built.

---

## Suggested next step

Items 1-5 (Critical) are all small, contained fixes — realistically an hour or two of work, not a rebuild. Say the word and I'll start there, then move through Important in whatever order you'd like.
