import type { Metadata } from "next";
import { Fraunces, Karla } from "next/font/google";
import "./globals.css";
import { SITE_URL } from "@/lib/siteUrl";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const karla = Karla({
  variable: "--font-karla",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

// Open Graph / Twitter Card metadata added 2026-07-30 — audit finding #3
// (Critical). Without this, sharing a mom-village link on WhatsApp/
// Instagram (the realistic discovery channel for this audience) showed no
// preview image, title, or description at all. metadataBase lets every
// page's relative OG image URL resolve correctly; update SITE_URL in
// src/lib/siteUrl.ts once the real domain is live and this follows
// automatically.
const title = "Mom Village — From your first positive test to her third birthday";
const description =
  "One home for money, milestones, and moms who get it — pregnancy through age three.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title,
  description,
  openGraph: {
    title,
    description,
    url: SITE_URL,
    siteName: "Mom Village",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${karla.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
