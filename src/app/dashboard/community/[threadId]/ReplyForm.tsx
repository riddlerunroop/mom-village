"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ReplyForm({ threadId }: { threadId: string }) {
  const router = useRouter();
  const supabase = createClient();

  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (body.trim().length === 0) return;
    setError("");
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      router.push("/login");
      return;
    }

    const { error: insertError } = await supabase.from("community_replies").insert({
      thread_id: threadId,
      user_id: user.id,
      body: body.trim(),
    });

    setLoading(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setBody("");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-ivory-2 rounded-2xl border border-line p-6"
    >
      <label className="block text-xs font-semibold uppercase tracking-wide text-sage-deep mb-3">
        Reply
      </label>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={4}
        placeholder="Share what worked for you, or ask a follow-up…"
        className="w-full rounded-xl border border-line bg-ivory px-4 py-3 text-sm text-ink mb-4 focus:outline-none focus:border-gold-deep resize-none"
      />
      {error && <p className="text-terracotta text-sm mb-3">{error}</p>}
      <button
        type="submit"
        disabled={loading || body.trim().length === 0}
        className="py-2.5 px-6 rounded-full bg-gold-deep text-ivory font-semibold text-sm disabled:opacity-50"
      >
        {loading ? "Posting…" : "Post reply"}
      </button>
    </form>
  );
}
