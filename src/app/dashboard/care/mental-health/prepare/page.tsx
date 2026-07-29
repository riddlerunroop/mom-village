import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { hasActiveSubscription } from "@/lib/subscription";
import LockedPreview from "@/components/LockedPreview";
import PrepareClient from "./PrepareClient";

export default async function PreparePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isSubscribed = await hasActiveSubscription(supabase, user!.id);

  return (
    <main className="max-w-[680px] mx-auto px-6 py-10">
      <Link href="/dashboard/care/mental-health" className="text-xs font-semibold text-ink/45 hover:text-indigo mb-3 inline-block">
        ← Mental health &amp; support
      </Link>
      <h1 className="font-display text-[26px] text-indigo mb-2">
        Help me prepare to talk to someone
      </h1>
      <p className="text-sm text-ink/60 mb-6 max-w-[540px]">
        Putting feelings into words ahead of time can make a hard
        conversation easier to start — with your doctor, your partner, a
        family member, or a friend. Answer whatever feels relevant; nothing
        is required.
      </p>

      {!isSubscribed ? (
        <LockedPreview
          title="Prepare for a conversation that matters"
          teaser="Join to build a short, honest script you can share with your doctor or someone you trust."
        />
      ) : (
        <PrepareClient />
      )}
    </main>
  );
}
