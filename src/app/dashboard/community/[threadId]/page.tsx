import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasActiveSubscription } from "@/lib/subscription";
import ReplyForm from "./ReplyForm";

function formatWhen(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ threadId: string }>;
}) {
  const { threadId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isSubscribed = await hasActiveSubscription(supabase, user!.id);

  // A specific thread URL is still a Community page — same gate as the list,
  // just redirect back rather than showing a locked-preview card here.
  if (!isSubscribed) {
    redirect("/dashboard/community");
  }

  const { data: thread } = await supabase
    .from("community_threads")
    .select("id, title, body, tags, created_at, user_id")
    .eq("id", threadId)
    .maybeSingle();

  if (!thread) {
    notFound();
  }

  const { data: replies } = await supabase
    .from("community_replies")
    .select("id, body, created_at, user_id")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });

  const allUserIds = Array.from(
    new Set([thread.user_id, ...(replies || []).map((r) => r.user_id)])
  );
  // community_author_names is a narrow view over profiles (id + mom_name
  // only) — profiles itself is locked to read-your-own-row. See
  // migration_11_community.sql.
  const { data: authors } = await supabase
    .from("community_author_names")
    .select("id, mom_name")
    .in("id", allUserIds);
  const namesByUserId: Record<string, string> = Object.fromEntries(
    (authors || []).map((a) => [a.id, a.mom_name || "A mom in the village"])
  );

  return (
    <main className="max-w-[760px] mx-auto px-6 py-10">
      <Link
        href="/dashboard/community"
        className="text-xs font-semibold text-sage-deep mb-6 inline-block"
      >
        ← back to Community
      </Link>

      <div className="bg-ivory-2 rounded-2xl border border-line p-7 mb-6">
        <h1 className="font-display text-2xl text-indigo mb-3">
          {thread.title}
        </h1>
        <p className="text-sm text-ink/80 leading-relaxed whitespace-pre-wrap mb-4">
          {thread.body}
        </p>
        <div className="flex items-center gap-3 text-xs text-ink/50">
          <span className="font-semibold text-sage-deep">
            {namesByUserId[thread.user_id]}
          </span>
          <span>·</span>
          <span>{formatWhen(thread.created_at)}</span>
          {thread.tags && thread.tags.length > 0 && (
            <>
              <span>·</span>
              <span>{thread.tags.join(", ")}</span>
            </>
          )}
        </div>
      </div>

      <h2 className="font-display text-lg text-indigo mb-4">
        {(replies || []).length === 0
          ? "No replies yet"
          : `${replies!.length} ${replies!.length === 1 ? "reply" : "replies"}`}
      </h2>

      <div className="space-y-4 mb-8">
        {(replies || []).map((reply) => (
          <div
            key={reply.id}
            className="bg-ivory rounded-xl border border-line p-5"
          >
            <p className="text-sm text-ink/80 leading-relaxed whitespace-pre-wrap mb-3">
              {reply.body}
            </p>
            <div className="flex items-center gap-3 text-xs text-ink/50">
              <span className="font-semibold text-sage-deep">
                {namesByUserId[reply.user_id]}
              </span>
              <span>·</span>
              <span>{formatWhen(reply.created_at)}</span>
            </div>
          </div>
        ))}
      </div>

      <ReplyForm threadId={thread.id} />
    </main>
  );
}
