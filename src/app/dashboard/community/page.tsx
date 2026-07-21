import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { hasActiveSubscription } from "@/lib/subscription";
import LockedPreview from "@/components/LockedPreview";

// Flat, Orkut-style forum — confirmed with Roop 2026-07-21. No groups to
// join: every mother sees every thread, can start one on anything, and can
// search first to see whether a similar discussion has already happened
// before starting a new one. Real profile (mom_name) shown as author, not
// anonymous. See supabase/migration_11_community.sql for the schema this
// reads from, and CLAUDE.md's "Community pillar" section for the full scope
// decision (this replaced an earlier groups-based draft).
export default async function CommunityPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isSubscribed = await hasActiveSubscription(supabase, user!.id);

  let threads: {
    id: string;
    title: string;
    body: string;
    tags: string[];
    reply_count: number;
    last_activity_at: string;
    user_id: string;
  }[] = [];

  if (isSubscribed) {
    let query = supabase
      .from("community_threads")
      .select("id, title, body, tags, reply_count, last_activity_at, user_id")
      .order("last_activity_at", { ascending: false })
      .limit(50);

    if (q && q.trim().length > 0) {
      query = query.textSearch("search_doc", q.trim(), {
        type: "websearch",
        config: "english",
      });
    }

    const { data } = await query;
    threads = data || [];
  }

  // Look up display names via community_author_names, a narrow view over
  // profiles (id + mom_name only) — profiles itself is locked to
  // read-your-own-row, so a direct query here would silently return nothing
  // for anyone but the current user. See migration_11_community.sql.
  let namesByUserId: Record<string, string> = {};
  if (threads.length > 0) {
    const userIds = Array.from(new Set(threads.map((t) => t.user_id)));
    const { data: authors } = await supabase
      .from("community_author_names")
      .select("id, mom_name")
      .in("id", userIds);
    namesByUserId = Object.fromEntries(
      (authors || []).map((a) => [a.id, a.mom_name || "A mom in the village"])
    );
  }

  return (
    <main className="max-w-[900px] mx-auto px-6 py-10">
      <div className="mb-2 text-xs uppercase tracking-[0.12em] text-sage-deep font-semibold">
        the whole village, talking
      </div>
      <h1 className="font-display text-[30px] text-indigo mb-2">Community</h1>
      <p className="text-sm text-ink/65 mb-8 max-w-[540px]">
        Start a discussion, or search to see if someone&apos;s already asked
        the same thing.
      </p>

      {!isSubscribed ? (
        <LockedPreview
          title="You're not doing this alone"
          teaser="Join to read and start discussions with other moms in the village."
        />
      ) : (
        <>
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <form action="/dashboard/community" className="flex-1">
              <input
                type="text"
                name="q"
                defaultValue={q || ""}
                placeholder="Search past discussions…"
                className="w-full rounded-full border border-line bg-ivory-2 px-5 py-3 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:border-gold-deep"
              />
            </form>
            <Link
              href="/dashboard/community/new"
              className="shrink-0 rounded-full bg-gold-deep text-ivory font-semibold text-sm px-6 py-3 text-center hover:opacity-90 transition-opacity"
            >
              Start a discussion
            </Link>
          </div>

          {q && (
            <p className="text-xs text-ink/50 mb-4">
              {threads.length > 0
                ? `Showing results for "${q}"`
                : `No past discussions found for "${q}" — be the first to start one.`}
            </p>
          )}

          {threads.length === 0 && !q ? (
            <div className="bg-ivory-2 rounded-2xl border border-line p-8 text-center">
              <p className="font-display italic text-lg text-sage-deep">
                No discussions yet — start the first one.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {threads.map((thread) => (
                <Link
                  key={thread.id}
                  href={`/dashboard/community/${thread.id}`}
                  className="block bg-ivory-2 rounded-2xl border border-line p-6 hover:border-gold-deep/40 transition-colors"
                >
                  <h3 className="font-display text-lg text-indigo mb-1">
                    {thread.title}
                  </h3>
                  <p className="text-sm text-ink/65 mb-3 line-clamp-2">
                    {thread.body}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-ink/50">
                    <span className="font-semibold text-sage-deep">
                      {namesByUserId[thread.user_id]}
                    </span>
                    <span>·</span>
                    <span>
                      {thread.reply_count}{" "}
                      {thread.reply_count === 1 ? "reply" : "replies"}
                    </span>
                    {thread.tags.length > 0 && (
                      <>
                        <span>·</span>
                        <span>{thread.tags.join(", ")}</span>
                      </>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}
