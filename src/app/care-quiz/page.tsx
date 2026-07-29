"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const HEALTH_FLAGS = [
  { key: "thyroid", label: "Thyroid" },
  { key: "diabetes_gd", label: "Diabetes or GD" },
  { key: "pcos", label: "PCOS" },
  { key: "high_bp", label: "High BP" },
];

// Mental-health-history flags — added 2026-07-29, alongside the diet
// preference question below, following up on the "Open strategic
// question" flagged when PPD/Mental Health Phase 1 was built. Stored in
// the same health_flags array as the physical-condition flags above (same
// storage shape, app-enforced values, no schema change needed) but read
// differently — CareWeekContent.tsx's condition_notes filtering only ever
// checks for 'thyroid'/'diabetes_gd'/'pcos'/'high_bp'/'none', so these new
// values simply pass through unused there and are read instead by the
// Mental Health hub to decide whether to show a proactive, non-alarming
// note. "Declined" is mutually exclusive with the other three (selecting
// it clears them, and selecting any of them clears it).
const MH_HISTORY_FLAGS = [
  { key: "mh_history_pregnancy", label: "During a previous pregnancy" },
  { key: "mh_history_postpartum", label: "After a previous birth" },
  { key: "mh_history_other", label: "At another time in my life" },
];
const MH_DECLINED = "mh_history_declined";
const ALL_MH_KEYS = new Set([...MH_HISTORY_FLAGS.map((f) => f.key), MH_DECLINED]);

const DIET_OPTIONS = [
  { key: "vegetarian", label: "Vegetarian" },
  { key: "non_vegetarian", label: "Non-vegetarian" },
];

export default function CareQuizPage() {
  const router = useRouter();
  const supabase = createClient();

  const [selectedFlags, setSelectedFlags] = useState<string[]>([]);
  const [noneSelected, setNoneSelected] = useState(false);
  const [dietPreference, setDietPreference] = useState<string | null>(null);
  const [mhFlags, setMhFlags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(true);
  const [error, setError] = useState("");

  // Pre-fill from any existing answers, so revisiting this page (e.g. to
  // update the two new questions below) doesn't ask her to re-answer the
  // health flags blank every time. The page previously always started
  // empty — reasonable when it only asked physical-condition flags, less
  // reasonable now that it also asks something as personal as
  // mental-health history.
  useEffect(() => {
    let cancelled = false;
    async function loadExisting() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoadingExisting(false);
        return;
      }
      const { data } = await supabase
        .from("user_care_profile")
        .select("health_flags, diet_preference")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!cancelled) {
        if (data) {
          const flags: string[] = data.health_flags || [];
          const physicalFlags = flags.filter((f) => HEALTH_FLAGS.some((h) => h.key === f));
          const mentalFlags = flags.filter((f) => ALL_MH_KEYS.has(f));
          setSelectedFlags(physicalFlags);
          setNoneSelected(physicalFlags.length === 0);
          setMhFlags(mentalFlags);
          setDietPreference(data.diet_preference ?? null);
        }
        setLoadingExisting(false);
      }
    }
    loadExisting();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  function toggleMhFlag(key: string) {
    setMhFlags((prev) =>
      prev.includes(key)
        ? prev.filter((f) => f !== key)
        : [...prev.filter((f) => f !== MH_DECLINED), key]
    );
  }

  function toggleDeclined() {
    setMhFlags((prev) => (prev.includes(MH_DECLINED) ? [] : [MH_DECLINED]));
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
      health_flags: [...selectedFlags, ...mhFlags],
      diet_preference: dietPreference,
      updated_at: new Date().toISOString(),
    });

    setLoading(false);

    if (upsertError) {
      setError(upsertError.message);
      return;
    }

    router.push("/dashboard");
  }

  if (loadingExisting) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center px-6 py-12">
        <p className="text-sm text-ink/50">Loading…</p>
      </div>
    );
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
            className={`w-full py-3 rounded-xl text-sm font-semibold border-[1.5px] mb-8 transition-colors ${
              noneSelected
                ? "bg-indigo text-ivory border-indigo"
                : "text-indigo border-indigo/40"
            }`}
          >
            None of these
          </button>

          <label className="block text-xs font-semibold uppercase tracking-wide text-sage-deep mb-3">
            Vegetarian or non-vegetarian?
          </label>
          <p className="text-[12px] text-ink/55 mb-3">
            Helps us give you real, useful protein tips instead of generic
            advice. Totally optional.
          </p>
          <div className="grid grid-cols-2 gap-3 mb-8">
            {DIET_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() =>
                  setDietPreference((prev) => (prev === opt.key ? null : opt.key))
                }
                className={`py-3 rounded-xl text-sm font-semibold border-[1.5px] transition-colors ${
                  dietPreference === opt.key
                    ? "bg-gold-deep text-ivory border-gold-deep"
                    : "text-gold-deep border-gold-deep/40"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <label className="block text-xs font-semibold uppercase tracking-wide text-sage-deep mb-2">
            Have you experienced depression or anxiety around pregnancy or
            birth before?
          </label>
          <p className="text-[12px] text-ink/55 mb-3">
            Entirely optional, and only used to gently tailor the support we
            surface for you — never shared, never treated as a diagnosis.
          </p>
          <div className="flex flex-col gap-2 mb-3">
            {MH_HISTORY_FLAGS.map((flag) => (
              <button
                key={flag.key}
                type="button"
                onClick={() => toggleMhFlag(flag.key)}
                className={`py-2.5 px-4 rounded-xl text-sm font-semibold border-[1.5px] text-left transition-colors ${
                  mhFlags.includes(flag.key)
                    ? "bg-terracotta text-ivory border-terracotta"
                    : "text-terracotta border-terracotta/40"
                }`}
              >
                {flag.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={toggleDeclined}
            className={`w-full py-2.5 rounded-xl text-sm font-semibold border-[1.5px] mb-8 transition-colors ${
              mhFlags.includes(MH_DECLINED)
                ? "bg-indigo text-ivory border-indigo"
                : "text-indigo border-indigo/40"
            }`}
          >
            No, or I&apos;d rather not say
          </button>

          {error && <p className="text-terracotta text-sm mb-4">{error}</p>}

          <button
            type="submit"
            disabled={
              loading ||
              (!noneSelected &&
                selectedFlags.length === 0 &&
                mhFlags.length === 0 &&
                !dietPreference)
            }
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
