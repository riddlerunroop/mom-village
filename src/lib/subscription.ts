import { SupabaseClient } from "@supabase/supabase-js";

// Checks whether a mom currently has an active subscription.
// This is the single source of truth every pillar page checks before
// deciding whether to show real content or a locked preview.
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

  // If there's an expiry set, make sure it hasn't passed
  if (data.current_period_end) {
    return new Date(data.current_period_end) > new Date();
  }

  return true;
}
