"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loadRazorpayScript } from "@/lib/loadRazorpayScript";

type Status = "idle" | "loading" | "processing" | "error";
type PurchaseType = "book" | "bundle" | "budget_map";

// Opens Razorpay Checkout for a one-time purchase (an individual book, the
// six-book bundle, or the ₹49 budget map). Same access model as
// SubscribeButton — this only starts checkout, the webhook is what
// actually marks the purchase 'paid' and unlocks anything.
export default function BuyButton({
  type,
  slug,
  label,
  className,
}: {
  type: PurchaseType;
  slug?: string;
  label: string;
  className?: string;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const router = useRouter();

  async function buy() {
    setStatus("loading");
    setError("");

    const scriptOk = await loadRazorpayScript();
    if (!scriptOk) {
      setError("Couldn't load the payment window. Check your connection and try again.");
      setStatus("error");
      return;
    }

    const res = await fetch("/api/razorpay/order/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, slug }),
    });
    const data = await res.json();

    if (!res.ok || !data.orderId) {
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
      amount: data.amount,
      currency: "INR",
      order_id: data.orderId,
      name: "Mom Village",
      description:
        type === "bundle" ? "All six books" : type === "budget_map" ? "Minimum Budget Planner" : "One book",
      theme: { color: "#A97418" },
      handler: () => {
        setStatus("processing");
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
      <p className={`text-sm font-semibold text-sage-deep ${className || ""}`}>
        Payment received — unlocking…
      </p>
    );
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={buy}
        disabled={status === "loading"}
        className="inline-block text-sm font-semibold px-5 py-2 rounded-full border-[1.5px] border-gold-deep text-gold-deep disabled:opacity-60"
      >
        {status === "loading" ? "Loading…" : label}
      </button>
      {error && <p className="text-terracotta text-xs mt-2">{error}</p>}
    </div>
  );
}
