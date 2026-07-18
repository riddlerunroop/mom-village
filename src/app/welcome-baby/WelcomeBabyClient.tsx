"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function WelcomeBabyClient({
  babyName,
  hasGap,
  currentMonthLabel,
}: {
  babyName: string;
  hasGap: boolean;
  currentMonthLabel: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  async function handleContinue() {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await supabase
        .from("profiles")
        .update({ birth_welcome_seen: true })
        .eq("id", user.id);
    }

    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-indigo flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-[480px] text-center">
        <div className="text-xs uppercase tracking-[0.14em] text-gold font-semibold mb-4">
          she's here
        </div>
        <h1 className="font-display text-[36px] text-ivory mb-4 leading-tight">
          Welcome to the other side.
        </h1>
        <p className="text-ivory/75 text-[15px] mb-8 leading-relaxed">
          {babyName === "your little one"
            ? "She's arrived — and so has a whole new chapter."
            : `${babyName} has arrived — and so has a whole new chapter.`}{" "}
          Everything shifts now: the chart, the care, the village. All of it
          is with you from here.
        </p>

        {hasGap && (
          <div className="bg-ivory/10 rounded-2xl p-6 mb-8 text-left">
            <p className="text-ivory text-sm leading-relaxed">
              You're already at <strong>{currentMonthLabel.toLowerCase()}</strong> —
              no need to rush and catch up. Everything from her very first
              weeks, including the essentials on safe sleep and feeding, is
              saved and waiting for you, whenever you want it. Nothing is
              lost, nothing expires.
            </p>
          </div>
        )}

        <button
          onClick={handleContinue}
          disabled={loading}
          className="px-8 py-3 rounded-full bg-gold-deep text-ivory font-semibold text-sm disabled:opacity-60"
        >
          {loading ? "Just a moment…" : "Take me to her chart"}
        </button>
      </div>
    </div>
  );
}
