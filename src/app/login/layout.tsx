import type { Metadata } from "next";

// New 2026-07-30 — audit finding #6 (Important). login/page.tsx is a client
// component ("use client"), which can't export its own metadata — this
// server-component layout carries it instead.
export const metadata: Metadata = {
  title: "Log in — Mom Village",
  description: "No passwords, just your phone number.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
