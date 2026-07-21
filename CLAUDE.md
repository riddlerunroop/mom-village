@AGENTS.md

# Mom Village — Project Status

*This section is maintained by Claude at the end of every significant session. Read this first in any new chat — it replaces needing to re-explain context. Update it whenever something material changes (content locked, feature shipped, decision made).*

*Last updated: 2026-07-21*

## What it is

Subscription app for Indian mothers, pregnancy through a child's third birthday (the "1,000-day journey"). Live at mom-village.vercel.app. Non-technical founder (Roop), builds through Claude. Full background: see `mom-village-project-overview.md` if present, but this file is the source of truth going forward.

## Product scope — confirmed 2026-07-21 (read this before proposing any new module)

Roop shared `Master_Product_Brief_v1.0.docx` — a brief she'd had ChatGPT write up from her own verbal planning session. **That document is NOT authoritative as written.** ChatGPT over-extended her actual intent in several places. Roop reviewed it and explicitly corrected the record; the corrected version below is what's real:

- **Age boundary stays fixed at the third birthday.** No ongoing/lifelong child usage, no School module, no Learning module, no removing the age ceiling. The journey ends at month 36, same as always — the birthday-3 send-off screen is correct as built and should NOT be reframed.
- **Single-user only.** The app is for mothers, full stop. No Father/Grandparents/Caregivers/Children account roles — reject that part of the brief entirely.
- **The five pillars stand as originally defined: Monthly Chart, Fitness/Care Chart, Wealth, Library, Community.** Do not fragment them into the brief's alternate structure (no separate "Family" module with calendar/tasks/shopping/travel/emergency, no standalone "Recipes & Nutrition" module).
  - Nutrition explicitly folds into the **Fitness/Care Chart** pillar as originally designed — do not split it out.
  - **Wealth pillar is confirmed IN, not dropped** — Roop wants books + advisory content built around it. (The brief omitted it; that was ChatGPT's error, not a real decision to cut it.)
- **Two genuine additions Roop does want, both scoped narrowly:**
  1. **Vaccination tracking** — a mother can upload/log baby's vaccination card within the app, and the app reminds her when the next dose is due. Bounded to the 0–3 window like everything else; ties naturally into the Monthly Chart's existing immunization content.
  2. **Voice-log memories + conversational recall** — a lightweight "intelligence layer," but scoped only to this, not a general chatbot. A mother can log voice notes in the moment for things she won't remember to write down later (a symptom and what medicine she gave, a milestone like "started walking today," etc.). Later she can ask the app to recall a memory, and it reconstructs it from her voice logs, photos, and vaccination timeline. This is the one place a conversational/chat interface is wanted — narrowly for memory capture and recall, not as the product's primary interface (the brief's broader "AI chatbot as the product" framing was explicitly rejected).
- Everything else new in the brief (Home Dashboard, Family Knowledge Graph, Timeline/Letters/Memory Capsules as a broad Memories module, phased build order Phase 1–4, non-negotiable-rules list) reflects ChatGPT's own elaboration, not confirmed decisions — don't build toward it without checking with Roop first.

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

## App features already built and DEPLOYED (live)

- Birth-transition welcome screen (fires on first birth-date entry)
- Month archive (all past months stay accessible)
- First-birthday celebration screen — `src/app/birthday-1/Birthday1Client.tsx`
- Second-birthday celebration screen — `src/app/birthday-2/Birthday2Client.tsx`
- **Third-birthday celebration screen** — `src/app/birthday-3/Birthday3Client.tsx`. Wishes the baby happy third birthday and sends the mother off warmly, since the Monthly Chart content journey (not the whole app) concludes at month 36. Matches the visual pattern of birthday-1/birthday-2 (three rows of gold dots). Wired into `src/app/dashboard/layout.tsx` (redirect check) and `src/app/birthday-3/page.tsx` (gate). Supabase column `birthday_3_seen` added via `supabase/migration_7_birthday3.sql` — **migration has been run, and the commit ("Add third birthday screen") has been pushed to GitHub via GitHub Desktop and deployed on Vercel. This feature is fully live, not just built.**
- Shared `hasTurnedAge(dob, years)` helper used by all three birthday screens
- Corresponding Supabase migrations: `supabase/migration_5_birthday.sql`, `supabase/migration_6_birthday2.sql`, `supabase/migration_7_birthday3.sql`

Note for future copy: the "first 1,000 days" (UNICEF definition) runs conception to the *second* birthday, not the third — don't use that phrase for third-birthday or month-36 content. Caught and corrected in both Month 36's content and the birthday-3 screen copy.

## Roop's tooling — now sorted

As of 2026-07-20, Roop has **GitHub Desktop installed and working** (signed in as `riddlerunroop`, `mom-village` added as a local repository at `~/Downloads/mom-village`). She successfully committed and pushed a real change (birthday-3) through it end to end. Previously, pushes to this repo had apparently been done via Terminal (in an earlier session), which made her uncomfortable — that's no longer necessary. Going forward, always route her through GitHub Desktop's GUI (commit summary box + "Commit to main" + "Push origin"), never Terminal, unless she explicitly asks otherwise.

## Fitness/Care Chart pillar — content locked, app plumbing NOT built yet

Working module-by-module now (confirmed 2026-07-21). Order chosen: **Fitness/Care Chart first, Razorpay last** (Roop wants a fuller product to show before applying for Razorpay's business verification — deliberate sequencing, don't second-guess it).

**What Care Chart actually is** (corrected from the initial ChatGPT-drafted brief, `care-chart-fitness-module-brief.md`): a weekly-authored content menu (body/food/mind/skin) organized into **9 phases** spanning pregnancy through the third birthday — mirroring the Monthly Chart's full span, not stopping at 12 months. A **daily check-in** (time available 5/15/30 min, energy, mood) picks which menu items to surface that day and doubles as a light emotional touch-base — "no wrong answer, as long as she's happy." This is NOT a rigid weekly quiz as the brief first suggested; the existing database design (daily check-in) was correct, just needed the phase-based content built on top of it.

**Content: DONE.** All 9 phases drafted, sent through the same ChatGPT-review → independent-verify → lock workflow as the Monthly Chart, and locked: `Weekly Care Chart - All 9 Phases (LOCKED).docx`. Covers First/Second/Third trimester, Early healing (0–6wk), Finding rhythm (6–12wk), Rebuilding (3–6mo), Settling into strength (6–12mo), Sustainable rhythms (1–2yr), Your rhythm year three (2–3yr). Each phase has body/food/mind/skin sections with 5/15/30-min options plus safety standing-notes; document also has a global "Always-relevant safety" + "Urgent care now" section up front (CDC Hear Her-aligned warning signs).

**Code already existed before this session** (found, not built from scratch): `src/app/care-quiz/page.tsx` (health-flags quiz — thyroid/diabetes-GD/PCOS/high BP — live), `src/app/dashboard/care/page.tsx` (subscription-gated page, currently just a placeholder — "Check back soon"), `src/lib/weekCalculator.ts` (`calculateCareWeek`, `carePhaseLabel`, `careWeekLabel`), `supabase/migration_2_care_chart.sql` (tables: `user_care_profile`, `user_daily_checkin`, `weekly_care_chart_content`, `user_care_progress`).

**Changes made this session:**
- `supabase/migration_8_care_chart_skin_section.sql` — adds "skin" as a real 4th section (was body/food/mind only). **Not yet run in Supabase — Roop needs to run this.**
- `src/lib/weekCalculator.ts` — `carePhaseLabel` extended to cover months 12–36 (previously capped at "6–12 months+" as one open bucket). **Not yet committed/pushed via GitHub Desktop.**

**Still to build (real work, not yet started):**
1. Insert the locked 9-phase content into `weekly_care_chart_content` (currently zero rows).
2. Build the daily check-in UI (`user_daily_checkin` has a table, no page/component exists at all).
3. Build the content-matching query logic — map her actual week → phase → filter by today's check-in (time/health flags) → replace the `care/page.tsx` placeholder with real rendered content.

Don't assume Care Chart is "done" just because content is locked — the pillar isn't live until all three of the above are built too.

## Other pillars/features still fully unbuilt

Wealth pillar, Library pillar, Community pillar, vaccination tracking + reminders, voice-log memories + recall. Razorpay is intentionally saved for last (see above). Order beyond Care Chart hasn't been decided — ask Roop.

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
