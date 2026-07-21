"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function NewThreadClient() {
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = title.trim().length > 0 && body.trim().length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
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

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const { data, error: insertError } = await supabase
      .from("community_threads")
      .insert({
        user_id: user.id,
        title: title.trim(),
        body: body.trim(),
        tags,
      })
      .select("id")
      .single();

    setLoading(false);

    if (insertError || !data) {
      setError(insertError?.message || "Something went wrong — try again.");
      return;
    }

    router.push(`/dashboard/community/${data.id}`);
  }

  return (
    <main className="max-w-[700px] mx-auto px-6 py-10">
      <Link
        href="/dashboard/community"
        className="text-xs font-semibold text-sage-deep mb-6 inline-block"
      >
        ← back to Community
      </Link>

      <div className="mb-2 text-xs uppercase tracking-[0.12em] text-sage-deep font-semibold">
        start a discussion
      </div>
      <h1 className="font-display text-[28px] text-indigo mb-8">
        What&apos;s on your mind?
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-ivory-2 rounded-2xl border border-line p-7"
      >
        <label className="block text-xs font-semibold uppercase tracking-wide text-sage-deep mb-2">
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Anyone else's baby refusing solids at 7 months?"
          className="w-full rounded-xl border border-line bg-ivory px-4 py-3 text-sm text-ink mb-5 focus:outline-none focus:border-gold-deep"
        />

        <label className="block text-xs font-semibold uppercase tracking-wide text-sage-deep mb-2">
          Tell us more
        </label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={6}
          placeholder="Share what's going on — the more context, the easier it is for someone to help."
          className="w-full rounded-xl border border-line bg-ivory px-4 py-3 text-sm text-ink mb-5 focus:outline-none focus:border-gold-deep resize-none"
        />

        <label className="block text-xs font-semibold uppercase tracking-wide text-sage-deep mb-2">
          Tags <span className="normal-case font-normal text-ink/40">(optional, comma-separated)</span>
        </label>
        <input
          type="text"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="e.g. feeding, 7 months, solids"
          className="w-full rounded-xl border border-line bg-ivory px-4 py-3 text-sm text-ink mb-6 focus:outline-none focus:border-gold-deep"
        />

        {error && <p className="text-terracotta text-sm mb-4">{error}</p>}

        <button
          type="submit"
          disabled={loading || !canSubmit}
          className="w-full py-3 rounded-full bg-gold-deep text-ivory font-semibold text-sm disabled:opacity-50"
        >
          {loading ? "Posting…" : "Post to the village"}
        </button>
      </form>
    </main>
  );
}
