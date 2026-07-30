import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/siteUrl";

// New 2026-07-30 — audit finding #2 (Critical). Disallows crawling of
// anything behind a login (dashboard, onboarding, care-quiz, budget
// calculator, API routes) — none of it is useful to index and some of it
// is personal. Everything else public is allowed.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/dashboard/*",
        "/onboarding",
        "/care-quiz",
        "/budget-calculator",
        "/welcome-baby",
        "/birthday-1",
        "/birthday-2",
        "/birthday-3",
        "/api/*",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
