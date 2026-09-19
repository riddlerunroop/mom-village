import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasActiveSubscription } from "@/lib/subscription";
import MessageThread from "./MessageThread";
import ContactDisclaimer from "@/components/rediscover/ContactDisclaimer";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isSubscribed = await hasActiveSubscription(supabase, user!.id);

  if (!isSubscribed) redirect("/dashboard/rediscover");

  const { data: conversation } = await supabase
    .from("rediscover_conversations")
    .select("id, user_a, user_b")
    .eq("id", id)
    .maybeSingle();

  if (!conversation || (conversation.user_a !== user!.id && conversation.user_b !== user!.id)) {
    notFound();
  }

  const otherId = conversation.user_a === user!.id ? conversation.user_b : conversation.user_a;

  const [{ data: otherName }, { data: messages }] = await Promise.all([
    supabase.from("community_author_names").select("mom_name").eq("id", otherId).maybeSingle(),
    supabase
      .from("rediscover_messages")
      .select("id, sender_id, body, created_at")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true }),
  ]);

  return (
    <main className="max-w-[700px] mx-auto px-6 py-10">
      <Link href="/dashboard/rediscover/messages" className="text-xs text-ink/50 hover:text-indigo mb-4 inline-block">
        ← Messages
      </Link>
      <h1 className="font-display text-[24px] text-indigo mb-4">
        {otherName?.mom_name || "A mother in the Village"}
      </h1>
      <ContactDisclaimer />
      <div className="mt-4">
        <MessageThread conversationId={id} selfId={user!.id} initialMessages={messages ?? []} />
      </div>
    </main>
  );
}
