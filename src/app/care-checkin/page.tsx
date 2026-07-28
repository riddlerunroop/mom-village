"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/client";

const TIME_OPTIONS = [
  { value: "5", label: "5 min" },
  { value: "15", label: "15 min" },
  { value: "30", label: "30 min" },
];

// Rebuilt 2026-07-28 per Roop's review: 5 labeled choices, not a bare 1-10
// scale — matches how she answers a real question, not a slider she has to
// interpret. Values map to the new 1-5 range on user_daily_checkin (see
// migration_25).
const ENERGY_OPTIONS = [
  { value: 1, label: "Running on empty" },
  { value: 2, label: "Low, but here" },
  { value: 3, label: "Steady" },
  { value: 4, label: "Good energy" },
  { value: 5, label: "Feeling strong" },
];

const MOOD_OPTIONS = [
  { value: 1, label: "Heavy day" },
  { value: 2, label: "A little low" },
  { value: 3, label: "Okay" },
  { value: 4, label: "Good" },
  { value: 5, label: "Really good" },
];

function CareCheckinForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
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

    router.push(searchParams.get("next") || "/dashboard/care/chart");
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

          <label className="block text-xs font-semibold uppercase tracking-wide text-gold-deep mb-3">
            How&apos;s your energy today?
          </label>
          <div className="flex flex-col gap-2 mb-7">
            {ENERGY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setEnergy(opt.value)}
                className={`text-left py-2.5 px-4 rounded-xl text-sm font-semibold border-[1.5px] transition-colors ${
                  energy === opt.value
                    ? "bg-gold-deep text-ivory border-gold-deep"
                    : "text-ink/75 border-line hover:border-gold-deep/50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <label className="block text-xs font-semibold uppercase tracking-wide text-terracotta mb-3">
            How are you feeling today?
          </label>
          <div className="flex flex-col gap-2 mb-7">
            {MOOD_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setMood(opt.value)}
                className={`text-left py-2.5 px-4 rounded-xl text-sm font-semibold border-[1.5px] transition-colors ${
                  mood === opt.value
                    ? "bg-terracotta text-ivory border-terracotta"
                    : "text-ink/75 border-line hover:border-terracotta/50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {error && <p className="text-terracotta text-sm mb-4">{error}</p>}

          <button
            type="submit"
            disabled={loading || !canSubmit}
            className="w-full py-3 rounded-full bg-gold-deep text-ivory font-semibold text-sm disabled:opacity-40 transition-opacity"
          >
            {loading ? "Just a moment…" : "Show me today's care chart"}
          </button>

          <p className="text-[11px] text-ink/50 mt-4 text-center italic">
            However you answer today is exactly right — as long as you&apos;re
            okay, that&apos;s what matters.
          </p>
        </form>
      </div>
    </div>
  );
}

export default function CareCheckinPage() {
  return (
    <Suspense fallback={null}>
      <CareCheckinForm />
    </Suspense>
  );
}
