import { createClient } from "@/lib/supabase/server";
import { hasActiveSubscription } from "@/lib/subscription";
import LockedPreview from "@/components/LockedPreview";

export default async function WealthPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isSubscribed = await hasActiveSubscription(supabase, user!.id);

  return (
    <main className="max-w-[900px] mx-auto px-6 py-10">
      <div className="mb-2 text-xs uppercase tracking-[0.12em] text-sage-deep font-semibold">
        her own security
      </div>
      <h1 className="font-display text-[30px] text-indigo mb-2">
        Wealth &amp; direction
      </h1>
      <p className="text-sm text-ink/65 mb-10 max-w-[540px]">
        Government schemes, how to save for these first years, and how to
        stay financially independent.
      </p>

      {!isSubscribed ? (
        <LockedPreview
          title="Real direction, not just information"
          teaser="Join to get guidance on schemes, savings, and staying financially independent through these early years."
        />
      ) : (
        <div className="bg-ivory-2 rounded-2xl border border-line p-8 text-center">
          <p className="font-display italic text-lg text-sage-deep">
            This guidance is being written — worth the wait.
          </p>
        </div>
      )}
    </main>
  );
}
