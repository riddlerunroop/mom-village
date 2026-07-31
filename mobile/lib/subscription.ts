// Ported verbatim from the web app's src/lib/subscription.ts. Works
// identically here since it just takes a SupabaseClient and a userId —
// no browser/server dependency either way.

import { SupabaseClient } from "@supabase/supabase-js";

export async function hasActiveSubscription(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  const { data } = await supabase
    .from("subscriptions")
    .select("status, current_period_end")
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();

  if (!data) return false;

  if (data.current_period_end) {
    return new Date(data.current_period_end) > new Date();
  }

  return true;
}
