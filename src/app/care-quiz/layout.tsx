import type { Metadata } from "next";

// New 2026-07-30 — audit finding #6 (Important). care-quiz/page.tsx is a
// client component, which can't export its own metadata.
export const metadata: Metadata = {
  title: "A few care questions — Mom Village",
  description: "Quick questions about any health conditions, diet preference, and history — so your Care Chart is genuinely matched to you.",
};

export default function CareQuizLayout({ children }: { children: React.ReactNode }) {
  return children;
}
