import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Added 2026-07-30 — audit finding #9 (Important), needed so
    // next/image can optimize the signed Supabase Storage URLs used for
    // memory photos and vaccination card images (MemoriesClient.tsx). A
    // wildcard on *.supabase.co (rather than one hardcoded project ref)
    // since the real project URL only lives in Vercel's env vars, not in
    // this repo.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/**",
      },
    ],
  },
};

export default nextConfig;
