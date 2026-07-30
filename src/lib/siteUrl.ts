// Single source of truth for the site's public base URL — used by
// sitemap.ts, robots.ts, and Open Graph/Twitter metadata (added 2026-07-30
// as part of the pre-Razorpay launch audit fixes). Updated 2026-07-30 to
// the real domain (momvillage.in, connected via Vercel + GoDaddy DNS,
// apex redirects to www) — nothing else needs to change.
export const SITE_URL = "https://www.momvillage.in";
