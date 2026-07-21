"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const TIME_OPTIONS = [
  { value: "5", label: "5 min" },
  { value: "15", label: "15 min" },
  { value: "30", label: "30 min" },
];

const SCALE = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function CareCheckinPage() {
  const router = useRouter();
  const supabase = createClient();

  const [timeAvailable, setTimeAvailable] = useState<string | null>(null);
  const [energy, setEnergy] = useState<number | null>(null);
  const [mood, setMood] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = timeAvailable !== null && energy !== null && mood !== null;

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

    const today = new Date().toISOString().slice(0, 10);

    const { error: upsertError } = await supabase.from("user_daily_checkin").upsert(
      {
        user_id: user.id,
        checkin_date: today,
        time_available: timeAvailable,
        energy_score: energy,
        mood_score: mood,
      },
      { onConflict: "user_id,checkin_date" }
    );

    setLoading(false);

    if (upsertError) {
      setError(upsertError.message);
      return;
    }

    router.push("/dashboard/care");
  }

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-[480px]">
        <div className="text-center mb-8">
          <div className="text-xs tracking-[0.12em] uppercase text-sage-deep font-semibold mb-2">
            today, for you
          </div>
          <h1 className="font-display text-[26px] text-indigo">
            How are you today?
          </h1>
          <p className="text-sm text-ink/65 mt-2">
            No wrong answer here — this just shapes what we show you today.
            Rest is a valid choice too.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-ivory-2 rounded-2xl border border-line p-7"
        >
          <label className="block text-xs font-semibold uppercase tracking-wide text-sage-deep mb-3">
            How much time do you have today?
          </label>
          <div className="grid grid-cols-3 gap-3 mb-7">
            {TIME_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTimeAvailable(opt.value)}
                className={`py-3 rounded-xl text-sm font-semibold border-[1.5px] transition-colors ${
                  timeAvailable === opt.value
                    ? "bg-sage-deep text-ivory border-sage-deep"
                    : "text-sage-deep border-sage-deep/40"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <label className="block text-xs font-semibold uppercase tracking-wide text-sage-deep mb-3">
            How's your energy today?
          </label>
          <div className="flex justify-between gap-1.5 mb-2">
            {SCALE.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setEnergy(n)}
                aria-label={`Energy ${n} out of 10`}
                className={`flex-1 aspect-square rounded-full text-xs font-semibold border-[1.5px] transition-colors ${
                  energy === n
                    ? "bg-gold-deep text-ivory border-gold-deep"
                    : "text-gold-deep border-gold-deep/40"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-[11px] text-ink/45 mb-7 px-0.5">
            <span>running on empty</span>
            <span>full of it</span>
          </div>

          <label className="block text-xs font-semibold uppercase tracking-wide text-sage-deep mb-3">
            How are you feeling today?
          </label>
          <div className="flex justify-between gap-1.5 mb-2">
            {SCALE.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setMood(n)}
                aria-label={`Mood ${n} out of 10`}
                className={`flex-1 aspect-square rounded-full text-xs font-semibold border-[1.5px] transition-colors ${
                  mood === n
                    ? "bg-terracotta text-ivory border-terracotta"
                    : "text-terracotta border-terracotta/40"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-[11px] text-ink/45 mb-7 px-0.5">
            <span>heavy day</span>
            <span>feeling good</span>
          </div>

          {error && <p className="text-terracotta text-sm mb-4">{error}</p>}

          <button
            type="submit"
            disabled={loading || !canSubmit}
            className="w-full py-3 rounded-full bg-gold-deep text-ivory font-semibold text-sm disabled:opacity-50"
          >
            {loading ? "Just a moment…" : "Show me today's care chart"}
          </button>

          <p className="text-[11px] text-ink/50 mt-4 text-center italic">
            However you answer today is exactly right — as long as you're
            okay, that's what matters.
          </p>
        </form>
      </div>
    </div>
  );
}
