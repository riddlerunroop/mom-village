"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Real self-serve cancellation. Always calls Razorpay's
// cancel_at_cycle_end — never an immediate cancel — matching Roop's own
// standing rule for manual cancellations and the account page's promised
// copy. Two-step confirm (button reveals a "yes, cancel" step) since this
// is an irreversible-feeling action, even though it's gentle in effect.
export default function CancelButton({
  currentPeriodEndLabel,
}: {
  currentPeriodEndLabel: string | null;
}) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function cancel() {
    setLoading(true);
    setError("");

    const res = await fetch("/api/razorpay/subscription/cancel", { method: "POST" });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Couldn't cancel just now. Try again in a moment.");
      setLoading(false);
      return;
    }

    router.refresh();
  }

  if (confirming) {
    return (
      <div>
        <p className="text-sm text-ink/70 mb-3">
          This stops future renewals — you won&apos;t be charged again, and
          your access stays exactly as it is
          {currentPeriodEndLabel ? ` until ${currentPeriodEndLabel}` : ""}.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={cancel}
            disabled={loading}
            className="text-sm font-semibold px-5 py-2 rounded-full bg-terracotta text-ivory disabled:opacity-60"
          >
            {loading ? "Cancelling…" : "Yes, cancel"}
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="text-sm font-semibold px-5 py-2 rounded-full border border-line text-ink/70"
          >
            Never mind
          </button>
        </div>
        {error && <p className="text-terracotta text-xs mt-2">{error}</p>}
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-sm font-semibold px-5 py-2 rounded-full border border-terracotta text-terracotta"
      >
        Cancel subscription
      </button>
      {error && <p className="text-terracotta text-xs mt-2">{error}</p>}
    </div>
  );
}
