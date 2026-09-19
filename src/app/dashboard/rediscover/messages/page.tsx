import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { hasActiveSubscription } from "@/lib/subscription";
import LockedPreview from "@/components/LockedPreview";

export default async function MessagesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isSubscribed = await hasActiveSubscription(supabase, user!.id);

  if (!isSubscribed) {
    return (
      <main className="max-w-[700px] mx-auto px-6 py-10">
        <Link href="/dashboard/rediscover" className="text-xs text-ink/50 hover:text-indigo mb-4 inline-block">
          ← Rediscover
        </Link>
        <LockedPreview title="Your conversations" teaser="Join to message other mothers directly." />
      </main>
    );
  }

  const { data: conversations } = await supabase
    .from("rediscover_conversations")
    .select("id, user_a, user_b, last_message_at")
    .or(`user_a.eq.${user!.id},user_b.eq.${user!.id}`)
    .order("last_message_at", { ascending: false });

  const otherIds = (conversations ?? []).map((c) => (c.user_a === user!.id ? c.user_b : c.user_a));
  const { data: names } =
    otherIds.length > 0
      ? await supabase.from("community_author_names").select("id, mom_name").in("id", [...new Set(otherIds)])
      : { data: [] };
  const nameMap = Object.fromEntries((names ?? []).map((n) => [n.id, n.mom_name || "A mother in the Village"]));

  return (
    <main className="max-w-[700px] mx-auto px-6 py-10">
      <Link href="/dashboard/rediscover" className="text-xs text-ink/50 hover:text-indigo mb-4 inline-block">
        ← Rediscover
      </Link>
      <h1 className="font-display text-[28px] text-indigo mb-6">Messages</h1>

      {!conversations || conversations.length === 0 ? (
        <p className="text-sm text-ink/55">
          No conversations yet — start one from a listing or a need you find interesting.
        </p>
      ) : (
        <div className="space-y-2">
          {conversations.map((c) => {
            const otherId = c.user_a === user!.id ? c.user_b : c.user_a;
            return (
              <Link
                key={c.id}
                href={`/dashboard/rediscover/messages/${c.id}`}
                className="block bg-ivory-2 rounded-xl border border-line p-4 hover:border-gold-deep/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-indigo">{nameMap[otherId]}</span>
                  <span className="text-xs text-ink/40">
                    {new Date(c.last_message_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
