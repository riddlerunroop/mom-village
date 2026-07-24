"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ConfirmBirthClient() {
  const router = useRouter();
  const supabase = createClient();

  const [babyDob, setBabyDob] = useState("");
  const [deliveryType, setDeliveryType] = useState<"normal" | "c_section" | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!babyDob) {
      setError("Let us know her birth date so we can find her first month.");
      return;
    }
    if (!deliveryType) {
      setError("Let us know how she delivered, so we can tailor the fitness plan safely.");
      return;
    }

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      setError("Something went wrong — please log in again.");
      router.push("/login");
      return;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        baby_dob: babyDob,
        delivery_type: deliveryType,
      })
      .eq("id", user.id);

    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    // The dashboard layout re-checks baby_dob/birth_welcome_seen on every
    // load, so this alone is enough to send her to the welcome-baby moment.
    router.push("/dashboard");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-ivory-2 rounded-2xl border border-line p-7"
    >
      <div className="mb-5">
        <label className="block text-xs font-semibold uppercase tracking-wide text-sage-deep mb-2">
          Baby&apos;s date of birth
        </label>
        <input
          type="date"
          required
          value={babyDob}
          onChange={(e) => setBabyDob(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-line bg-ivory text-ink text-base focus:outline-none focus:border-indigo"
        />
      </div>

      <div className="mb-6">
        <label className="block text-xs font-semibold uppercase tracking-wide text-sage-deep mb-2">
          How did you deliver?
        </label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setDeliveryType("normal")}
            className={`flex-1 py-2.5 rounded-full text-sm font-semibold border-[1.5px] ${
              deliveryType === "normal"
                ? "bg-sage-deep text-ivory border-sage-deep"
                : "text-sage-deep border-sage-deep"
            }`}
          >
            Normal delivery
          </button>
          <button
            type="button"
            onClick={() => setDeliveryType("c_section")}
            className={`flex-1 py-2.5 rounded-full text-sm font-semibold border-[1.5px] ${
              deliveryType === "c_section"
                ? "bg-sage-deep text-ivory border-sage-deep"
                : "text-sage-deep border-sage-deep"
            }`}
          >
            C-section
          </button>
        </div>
        <p className="text-[11px] text-ink/50 mt-2 italic">
          This only shapes your recovery and fitness plan — nothing else.
        </p>
      </div>

      {error && <p className="text-terracotta text-sm mb-4">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-full bg-gold-deep text-ivory font-semibold text-sm disabled:opacity-60"
      >
        {loading ? "Saving…" : "Confirm and start her journey"}
      </button>

      <Link
        href="/dashboard"
        className="block text-center text-xs font-semibold text-ink/50 mt-4"
      >
        Not yet — take me back
      </Link>
    </form>
  );
}
