"use client";

// Real deletion-request flow, per Roop's 2026-07-28 review and the
// Privacy Policy's existing promise (deletion within 30 days of a
// verified request). Same "insert-only, Roop reviews in Supabase"
// pattern as Community's report flow — no in-app admin panel.
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function DeleteAccountRequest({
  alreadyRequested,
}: {
  alreadyRequested: boolean;
}) {
  const supabase = createClient();
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(alreadyRequested);
  const [error, setError] = useState("");

  async function submit() {
    setSubmitting(true);
    setError("");
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSubmitting(false);
      return;
    }
    const { error: insertError } = await supabase
      .from("account_deletion_requests")
      .insert({ user_id: user.id });
    setSubmitting(false);
    if (insertError) {
      setError("Something went wrong — try again, or contact us directly.");
      return;
    }
    setDone(true);
    setConfirming(false);
  }

  if (done) {
    return (
      <p className="text-sm text-sage-deep font-semibold">
        Deletion requested — we&apos;ll action this within 30 days. Contact
        us if you change your mind.
      </p>
    );
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-sm font-semibold text-terracotta"
      >
        Request account deletion
      </button>
    );
  }

  return (
    <div className="rounded-xl border-2 border-terracotta bg-terracotta/10 px-4 py-3">
      <p className="text-sm text-ink/80 mb-3">
        This requests permanent deletion of your account and personal data —
        profile, voice logs, photos, vaccination records, and more — within
        30 days. This can&apos;t be undone once actioned. Are you sure?
      </p>
      {error && <p className="text-terracotta text-xs mb-2">{error}</p>}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={submit}
          disabled={submitting}
          className="text-xs font-semibold text-terracotta"
        >
          {submitting ? "…" : "Yes, request deletion"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="text-xs font-semibold text-ink/50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
