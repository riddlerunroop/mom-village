import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasActiveSubscription } from "@/lib/subscription";
import LockedPreview from "@/components/LockedPreview";
import ResetShareForm from "./ResetShareForm";

// "Share your Reset with the Village" — the optional step after completing
// a Reset (see ResetOfTheDay.tsx). Posts into reset_shares (migration_59),
// which the Reset Gallery inside Community reads from. Reachable with an
// optional ?activityId= so the form can remind her what she just did, but
// works fine without one too (nothing stops her from sharing from a blank
// state, though nothing currently links here without the param).
export default async function NewResetSharePage({
  searchParams,
}: {
  searchParams: Promise<{ activityId?: string }>;
}) {
  const { activityId } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const isSubscribed = await hasActiveSubscription(supabase, user.id);

  let activity: { id: string; emoji: string; title: string } | null = null;
  if (activityId) {
    const { data } = await supabase
      .from("reset_activities")
      .select("id, emoji, title")
      .eq("id", activityId)
      .maybeSingle();
    activity = data ?? null;
  }

  return (
    <main className="max-w-[640px] mx-auto px-6 py-10">
      <p className="text-xs uppercase tracking-[0.12em] text-terracotta font-semibold mb-2">
        share your reset
      </p>
      <h1 className="font-display text-[28px] text-indigo mb-2">Tell the village</h1>
      <p className="text-sm text-ink/65 mb-6 max-w-[480px]">
        Text, a photo, a short video, or a voice note — whatever feels
        right. Totally optional, and completely up to you.
      </p>

      {!isSubscribed ? (
        <LockedPreview
          title="Join to share with the village"
          teaser="Membership unlocks Community, the Reset Gallery, and everything else."
        />
      ) : (
        <ResetShareForm activity={activity} />
      )}
    </main>
  );
}
