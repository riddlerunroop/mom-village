import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasActiveSubscription } from "@/lib/subscription";
import NewThreadClient from "./NewThreadClient";

export default async function NewThreadPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isSubscribed = await hasActiveSubscription(supabase, user!.id);

  // Not gating with LockedPreview here on purpose — a non-subscriber
  // shouldn't be able to reach a posting form at all, so bounce her back to
  // the (gated) list page instead.
  if (!isSubscribed) {
    redirect("/dashboard/community");
  }

  return <NewThreadClient />;
}
