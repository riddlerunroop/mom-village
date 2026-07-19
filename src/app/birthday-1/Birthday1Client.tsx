"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function Birthday1Client({ babyName }: { babyName: string }) {
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
        .update({ birthday_1_seen: true })
        .eq("id", user.id);
    }

    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-indigo flex items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Simple decorative mala-style dots, echoing the homepage journey thread */}
      <div className="absolute top-10 left-0 right-0 flex justify-center gap-3 opacity-40">
        {Array.from({ length: 12 }).map((_, i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full bg-gold"
            style={{ opacity: i % 3 === 0 ? 1 : 0.4 }}
          />
        ))}
      </div>

      <div className="w-full max-w-[480px] text-center relative z-10">
        <div className="text-xs uppercase tracking-[0.14em] text-gold font-semibold mb-4">
          one whole year
        </div>
        <h1 className="font-display text-[38px] text-ivory mb-4 leading-tight">
          365 days. You did it — both of you.
        </h1>
        <p className="text-ivory/75 text-[15px] mb-8 leading-relaxed">
          {babyName === "your little one" ? "She's" : `${babyName} is`} one
          today. However this year actually went — the hard nights, the
          small wins, the moments you'll never quite remember and the ones
          you'll never forget — you got here. Both of you.
        </p>

        <div className="bg-ivory/10 rounded-2xl p-6 mb-8 text-left">
          <p className="text-ivory text-sm leading-relaxed font-display italic">
            "The first year isn't really about the baby learning to walk.
            It's about you learning you could carry this — and did."
          </p>
        </div>

        <button
          onClick={handleContinue}
          disabled={loading}
          className="px-8 py-3 rounded-full bg-gold-deep text-ivory font-semibold text-sm disabled:opacity-60"
        >
          {loading ? "Just a moment…" : "Continue to her chart"}
        </button>
      </div>
    </div>
  );
}
