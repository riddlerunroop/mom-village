import { createClient } from "@/lib/supabase/server";
import { hasActiveSubscription } from "@/lib/subscription";
import LockedPreview from "@/components/LockedPreview";

export default async function CommunityPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isSubscribed = await hasActiveSubscription(supabase, user!.id);

  return (
    <main className="max-w-[900px] mx-auto px-6 py-10">
      <div className="mb-2 text-xs uppercase tracking-[0.12em] text-sage-deep font-semibold">
        the circle
      </div>
      <h1 className="font-display text-[30px] text-indigo mb-2">
        Your village
      </h1>
      <p className="text-sm text-ink/65 mb-10 max-w-[540px]">
        Small group spaces to share, vent, and ask — no profiles, no
        performing, just moms who get it.
      </p>

      {!isSubscribed ? (
        <LockedPreview
          title="You're not doing this alone"
          teaser="Join to enter group spaces with moms at your exact stage — real talk, real support."
        />
      ) : (
        <div className="bg-ivory-2 rounded-2xl border border-line p-8 text-center">
          <p className="font-display italic text-lg text-sage-deep">
            You're not doing this alone — this room is almost ready.
          </p>
        </div>
      )}
    </main>
  );
}
