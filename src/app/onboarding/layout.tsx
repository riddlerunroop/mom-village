import type { Metadata } from "next";

// New 2026-07-30 — audit finding #6 (Important). onboarding/page.tsx is a
// client component, which can't export its own metadata.
export const metadata: Metadata = {
  title: "Tell us about your journey — Mom Village",
  description: "A few quick details so we can match your Monthly Chart, Care Chart, and everything else to your actual stage.",
};

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
