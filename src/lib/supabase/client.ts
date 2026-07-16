import { createBrowserClient } from "@supabase/ssr";

// Used in Client Components ("use client") — e.g. login forms, interactive dashboard widgets
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
