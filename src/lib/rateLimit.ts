import { SupabaseClient } from "@supabase/supabase-js";

// Added 2026-07-30 — audit finding #8 (Important). A simple per-user,
// per-route, per-day cap for the three AI-calling routes (vaccination card
// reading, voice-memory transcription, memory recall), backed by
// user_api_usage (migration_49). Deliberately simple — no external
// rate-limiting service, just a daily counter, matching how the rest of
// this project avoids adding new infrastructure where a plain Supabase
// table does the job.
export async function checkAndIncrementRateLimit(
  supabase: SupabaseClient,
  userId: string,
  routeKey: string,
  dailyLimit: number
): Promise<{ allowed: boolean }> {
  const today = new Date().toISOString().slice(0, 10);

  const { data: existing } = await supabase
    .from("user_api_usage")
    .select("count")
    .eq("user_id", userId)
    .eq("route_key", routeKey)
    .eq("usage_date", today)
    .maybeSingle();

  const currentCount = existing?.count ?? 0;
  if (currentCount >= dailyLimit) {
    return { allowed: false };
  }

  await supabase
    .from("user_api_usage")
    .upsert(
      { user_id: userId, route_key: routeKey, usage_date: today, count: currentCount + 1 },
      { onConflict: "user_id,route_key,usage_date" }
    );

  return { allowed: true };
}
