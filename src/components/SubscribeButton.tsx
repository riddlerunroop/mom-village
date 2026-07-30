"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loadRazorpayScript } from "@/lib/loadRazorpayScript";

type Status = "idle" | "loading" | "processing" | "error";

// Opens Razorpay Checkout for the ₹299/month membership. This button only
// ever starts checkout — it never grants access itself. Real activation
// happens server-side once the webhook (src/app/api/razorpay/webhook)
// hears back from Razorpay that the subscription actually activated, which
// is why "processing" shows a short wait-and-refresh rather than an
// instant unlock.
export default function SubscribeButton({
  className,
  label = "Join for ₹299/month",
}: {
  className?: string;
  label?: string;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const router = useRouter();

  async function subscribe() {
    setStatus("loading");
    setError("");

    const scriptOk = await loadRazorpayScript();
    if (!scriptOk) {
      setError("Couldn't load the payment window. Check your connection and try again.");
      setStatus("error");
      return;
    }

    const res = await fetch("/api/razorpay/subscription/create", { method: "POST" });
    const data = await res.json();

    if (!res.ok || !data.subscriptionId) {
      setError(data.error || "Couldn't start checkout. Try again in a moment.");
      setStatus("error");
      return;
    }

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    if (!keyId) {
      setError("Payments aren't set up on this app yet.");
      setStatus("error");
      return;
    }

    const razorpay = new window.Razorpay!({
      key: keyId,
      subscription_id: data.subscriptionId,
      name: "Mom Village",
      description: "Monthly membership",
      theme: { color: "#A97418" },
      handler: () => {
        setStatus("processing");
        // The webhook usually lands within a second or two of a
        // successful payment; a short delay before refreshing gives it
        // room to update the subscriptions row before this page re-reads
        // it. If it's somehow still not through yet, refreshing again
        // (or just returning later) picks it up — nothing here can grant
        // access on its own.
        setTimeout(() => {
          router.refresh();
          setStatus("idle");
        }, 2500);
      },
      modal: {
        ondismiss: () => setStatus("idle"),
      },
    });

    razorpay.open();
    setStatus("idle");
  }

  if (status === "processing") {
    return (
      <div className={className}>
        <p className="text-sm font-semibold text-sage-deep">
          Payment received — setting up your membership…
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={subscribe}
        disabled={status === "loading"}
        className="inline-block text-sm font-semibold px-6 py-2.5 rounded-full bg-gold-deep text-ivory disabled:opacity-60"
      >
        {status === "loading" ? "Loading…" : label}
      </button>
      {error && <p className="text-terracotta text-xs mt-2">{error}</p>}
    </div>
  );
}
