"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function Birthday3Client({ babyName }: { babyName: string }) {
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
        .update({ birthday_3_seen: true })
        .eq("id", user.id);
    }

    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-indigo flex items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Three gold-dot threads, echoing the mala journey — one for each year */}
      <div className="absolute top-10 left-0 right-0 flex flex-col gap-2 items-center opacity-40">
        {[0, 1, 2].map((row) => (
          <div key={row} className="flex justify-center gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <span
                key={i}
                className="w-2 h-2 rounded-full bg-gold"
                style={{ opacity: i % 3 === 0 ? 1 : 0.4 }}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="w-full max-w-[480px] text-center relative z-10">
        <div className="text-xs uppercase tracking-[0.14em] text-gold font-semibold mb-4">
          three whole years
        </div>
        <h1 className="font-display text-[38px] text-ivory mb-4 leading-tight">
          Three years. You made it — every single day of it.
        </h1>
        <p className="text-ivory/75 text-[15px] mb-8 leading-relaxed">
          {babyName === "your little one" ? "They're" : `${babyName} is`}{" "}
          three today — from the very first flutter you felt, through
          every month since, to the little person standing in front of you
          now. Neither of you are who you were when this started. That's
          the whole point.
        </p>

        <div className="bg-ivory/10 rounded-2xl p-6 mb-8 text-left">
          <p className="text-ivory text-sm leading-relaxed font-display italic">
            "Before this began, you didn't know this person yet — and now
            you can't imagine your life without them. That's not luck.
            That's what you built, one ordinary day at a time."
          </p>
        </div>

        <p className="text-ivory/75 text-[15px] mb-8 leading-relaxed">
          This is also where our day-by-day chart wraps up — we walked
          with you from that very first month to this birthday, and it's
          been an honour to be part of the village along the way. Whatever
          comes next for your family, you're carrying it forward with a
          bond three years in the making.
        </p>

        <button
          onClick={handleContinue}
          disabled={loading}
          className="px-8 py-3 rounded-full bg-gold-deep text-ivory font-semibold text-sm disabled:opacity-60"
        >
          {loading ? "Just a moment…" : "Continue to your village"}
        </button>
      </div>
    </div>
  );
}
