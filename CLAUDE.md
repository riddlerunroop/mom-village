@AGENTS.md

# Mom Village — Project Status

*This section is maintained by Claude at the end of every significant session. Read this first in any new chat — it replaces needing to re-explain context. Update it whenever something material changes (content locked, feature shipped, decision made).*

*Last updated: 2026-07-20 (evening)*

## What it is

Subscription app for Indian mothers, pregnancy through a child's third birthday (the "1,000-day journey"). Live at mom-village.vercel.app. Non-technical founder (Roop), builds through Claude. Full background: see `mom-village-project-overview.md` if present, but this file is the source of truth going forward.

## Content status: ALL DONE

All 42 months (7 batches) of the Monthly Chart are drafted, reviewed, independently fact-checked, and locked:

| Batch | Months | File |
|---|---|---|
| 1 | -6 to -1 (pregnancy) | `-6 to -1 months.docx` |
| 2 | 1–6 | `1 to 6 months.docx` |
| 3 | 7–12 | `7 to 12 months.docx` |
| 4 | 13–18 | `13 - 18 months.docx` |
| 5 | 19–24 | `19 to 24 months.docx` |
| 6 | 25–30 | `25 - 30 months.docx` |
| 7 | 31–36 | `Batch 7 - Months 31 to 36 (LOCKED).docx` |

The full 1,000-day content journey is complete. No more Monthly Chart content work is expected unless Roop asks for revisions.

Review workflow used for every month (worth reusing for any future content): Claude drafts → ChatGPT second-pass review → Claude independently web-verifies any new medical/factual claim → lock. Do not skip the independent verification step even if ChatGPT's rationale sounds right.

## App features already built (live, pending Roop's git push for the newest one)

- Birth-transition welcome screen (fires on first birth-date entry)
- Month archive (all past months stay accessible)
- First-birthday celebration screen — `src/app/birthday-1/Birthday1Client.tsx`
- Second-birthday celebration screen — `src/app/birthday-2/Birthday2Client.tsx`
- **Third-birthday celebration screen** — `src/app/birthday-3/Birthday3Client.tsx` (built 2026-07-20, not yet pushed/deployed). Wishes the baby happy third birthday and sends the mother off warmly, since the Monthly Chart content journey (not the whole app) concludes at month 36. Matches the visual pattern of birthday-1/birthday-2 (three rows of gold dots this time). Wired into `src/app/dashboard/layout.tsx` (redirect check) and `src/app/birthday-3/page.tsx` (gate). New Supabase column `birthday_3_seen` via `supabase/migration_7_birthday3.sql` — **Roop needs to run this migration in the Supabase SQL Editor before the screen will work.**
- Shared `hasTurnedAge(dob, years)` helper used by all three birthday screens
- Corresponding Supabase migrations: `supabase/migration_5_birthday.sql`, `supabase/migration_6_birthday2.sql`, `supabase/migration_7_birthday3.sql`

Note for future copy: the "first 1,000 days" (UNICEF definition) runs conception to the *second* birthday, not the third — don't use that phrase for third-birthday or month-36 content. Caught and corrected in both Month 36's content and the birthday-3 screen copy.

## In progress / next up

- **Deploy birthday-3**: files were written directly into this connected folder (already in the right place in the repo). Roop needs to (1) run `migration_7_birthday3.sql` in the Supabase SQL Editor, (2) commit + push via GitHub Desktop so Vercel deploys it.
- Open decision on what's next: Razorpay integration (no payment flow exists yet — blocks revenue) vs. one of the four unbuilt pillars (Wealth, Care Chart, Community, Library).

## Tech stack

- Next.js 16, Tailwind v4, fonts Fraunces (display) + Karla (body)
- Supabase (Postgres + auth), Singapore region
- Razorpay planned, not integrated
- Vercel, auto-deploys from GitHub
- Design tokens: ink `#2B2420`, indigo `#1F2E4D`, gold `#D9A441`, gold-deep `#A97418`, terracotta `#BE6240`, ivory `#FBF4E8`, sage-deep `#5F7052`

## Roop's working style

- Non-technical; works through Claude via Sublime Text + GitHub Desktop, or Cowork with this folder connected.
- Prefers concise, direct answers — minimal explanation, no over-formatting in chat.
- Every material medical/government-scheme claim needs independent verification, not just trust in either AI's training data.
