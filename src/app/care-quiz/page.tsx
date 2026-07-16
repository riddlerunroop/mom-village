"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const HEALTH_FLAGS = [
  { key: "thyroid", label: "Thyroid" },
  { key: "diabetes_gd", label: "Diabetes or GD" },
  { key: "pcos", label: "PCOS" },
  { key: "high_bp", label: "High BP" },
];

export default function CareQuizPage() {
  const router = useRouter();
  const supabase = createClient();

  const [selectedFlags, setSelectedFlags] = useState<string[]>([]);
  const [noneSelected, setNoneSelected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function toggleFlag(key: string) {
    setNoneSelected(false);
    setSelectedFlags((prev) =>
      prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key]
    );
  }

  function selectNone() {
    setNoneSelected(true);
    setSelectedFlags([]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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

    const { error: upsertError } = await supabase.from("user_care_profile").upsert({
      user_id: user.id,
      health_flags: selectedFlags,
      updated_at: new Date().toISOString(),
    });

    setLoading(false);

    if (upsertError) {
      setError(upsertError.message);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-[460px]">
        <div className="text-center mb-8">
          <div className="text-xs tracking-[0.12em] uppercase text-sage-deep font-semibold mb-2">
            one quick thing
          </div>
          <h1 className="font-display text-[26px] text-indigo">
            Anything we should know?
          </h1>
          <p className="text-sm text-ink/65 mt-2">
            This shapes your weekly care chart — food, movement, and rest
            built around your actual health, not a generic plan.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-ivory-2 rounded-2xl border border-line p-7"
        >
          <label className="block text-xs font-semibold uppercase tracking-wide text-sage-deep mb-3">
            Select all that apply
          </label>

          <div className="grid grid-cols-2 gap-3 mb-3">
            {HEALTH_FLAGS.map((flag) => (
              <button
                key={flag.key}
                type="button"
                onClick={() => toggleFlag(flag.key)}
                className={`py-3 rounded-xl text-sm font-semibold border-[1.5px] transition-colors ${
                  selectedFlags.includes(flag.key)
                    ? "bg-sage-deep text-ivory border-sage-deep"
                    : "text-sage-deep border-sage-deep/40"
                }`}
              >
                {flag.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={selectNone}
            className={`w-full py-3 rounded-xl text-sm font-semibold border-[1.5px] mb-6 transition-colors ${
              noneSelected
                ? "bg-indigo text-ivory border-indigo"
                : "text-indigo border-indigo/40"
            }`}
          >
            None of these
          </button>

          {error && <p className="text-terracotta text-sm mb-4">{error}</p>}

          <button
            type="submit"
            disabled={loading || (!noneSelected && selectedFlags.length === 0)}
            className="w-full py-3 rounded-full bg-gold-deep text-ivory font-semibold text-sm disabled:opacity-50"
          >
            {loading ? "Saving…" : "Build my care chart"}
          </button>

          <p className="text-[11px] text-ink/50 mt-4 text-center italic">
            You can update this anytime — nothing here is permanent.
          </p>
        </form>
      </div>
    </div>
  );
}
