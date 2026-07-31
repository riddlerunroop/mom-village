# Mom's Village — mobile app

React Native + Expo (Expo Router), pinned to **Expo SDK 54** deliberately —
see the "Expo Go SDK mismatch" note in the main project's CLAUDE.md for
why (Apple/Google's app stores were lagging behind on approving newer
Expo Go versions as of mid-2026, so SDK 54 is what the real Expo Go app
on the stores actually supports right now).

Same Supabase backend as the website in `../` — one account works on
both, per the 2026-07-30 decision. See the main project's `CLAUDE.md`
(repo root) for full product context; this README only covers running
the mobile app itself.

## First-time setup

1. `npm install`
2. Copy `.env.example` to `.env` and fill in the same
   `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY` values as
   the website's `.env.local` (Supabase → Project Settings → API).
3. `npx expo start` — scan the QR code with the **Expo Go** app (free, on
   the App Store / Play Store) on your own phone to try it live. No Apple
   Developer or Google Play account needed for this step — those are only
   needed later, when it's time to submit to the actual app stores.

## What's built (v1 slice, 2026-07-31)

- Phone/OTP login against the same Supabase project as the website.
- Monthly Chart (real content + saving checkboxes).
- Care Chart (daily check-in + that week's matched content).
- Account (profile summary, membership status, sign out).

No in-app purchases — subscribing/buying happens on the website
(momvillage.in) in the phone's browser; the app just reflects whatever
access that account already has. See CLAUDE.md for the reasoning (Apple/
Google in-app purchase policy).

Not built yet: Wealth, Library, Community (later phases), native
onboarding for a brand-new mobile-only signup (for now, a new account is
told to finish onboarding on the website).
