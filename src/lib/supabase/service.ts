import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Service-role client — bypasses RLS entirely. Only ever used server-side,
// from scheduled/cron routes that need to look across every mother's data
// at once (e.g. "who has a vaccination dose due today"), never from a
// request made on a specific mother's behalf. Never import this into
// anything a browser can trigger directly.
export function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
