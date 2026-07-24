"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Stage = "not_born" | "born";

function OnboardingPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";
  const supabase = createClient();

  const [stage, setStage] = useState<Stage>("not_born");
  const [momName, setMomName] = useState("");
  const [babyName, setBabyName] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [babyDob, setBabyDob] = useState("");
  const [deliveryType, setDeliveryType] = useState<"normal" | "c_section" | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (stage === "born" && !deliveryType) {
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

    const { error: upsertError } = await supabase.from("profiles").upsert({
      id: user.id,
      mom_name: momName || null,
      baby_name: babyName || null,
      due_date: stage === "not_born" ? dueDate : null,
      baby_dob: stage === "born" ? babyDob : null,
      delivery_type: stage === "born" ? deliveryType : "not_yet_delivered",
    });

    setLoading(false);

    if (upsertError) {
      setError(upsertError.message);
      return;
    }

    router.push(next);
  }

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-[460px]">
        <div className="text-center mb-8">
          <div className="text-xs tracking-[0.12em] uppercase text-sage-deep font-semibold mb-2">
            just one quick thing
          </div>
          <h1 className="font-display text-[26px] text-indigo">
            Let&apos;s find your month
          </h1>
          <p className="text-sm text-ink/65 mt-2">
            This is what unlocks your monthly chart — money, growth, and
            fitness, mapped to exactly where you are.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-ivory-2 rounded-2xl border border-line p-7"
        >
          <div className="flex gap-3 mb-6">
            <button
              type="button"
              onClick={() => setStage("not_born")}
              className={`flex-1 py-2.5 rounded-full text-sm font-semibold border-[1.5px] ${
                stage === "not_born"
                  ? "bg-indigo text-ivory border-indigo"
                  : "text-indigo border-indigo/40"
              }`}
            >
              Still expecting
            </button>
            <button
              type="button"
              onClick={() => setStage("born")}
              className={`flex-1 py-2.5 rounded-full text-sm font-semibold border-[1.5px] ${
                stage === "born"
                  ? "bg-indigo text-ivory border-indigo"
                  : "text-indigo border-indigo/40"
              }`}
            >
              She&apos;s here
            </button>
          </div>

          {stage === "not_born" ? (
            <div className="mb-5">
              <label className="block text-xs font-semibold uppercase tracking-wide text-sage-deep mb-2">
                Due date
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-line bg-ivory text-ink text-base focus:outline-none focus:border-indigo"
              />
            </div>
          ) : (
            <>
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
              <div className="mb-5">
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
                  This only shapes your recovery and fitness plan — nothing
                  else.
                </p>
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-sage-deep mb-2">
                Your name
              </label>
              <input
                type="text"
                value={momName}
                onChange={(e) => setMomName(e.target.value)}
                placeholder="Optional"
                className="w-full px-3.5 py-2.5 rounded-xl border border-line bg-ivory text-ink text-sm focus:outline-none focus:border-indigo"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-sage-deep mb-2">
                Baby&apos;s name
              </label>
              <input
                type="text"
                value={babyName}
                onChange={(e) => setBabyName(e.target.value)}
                placeholder="Optional"
                className="w-full px-3.5 py-2.5 rounded-xl border border-line bg-ivory text-ink text-sm focus:outline-none focus:border-indigo"
              />
            </div>
          </div>

          {error && <p className="text-terracotta text-sm mb-4">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-gold-deep text-ivory font-semibold text-sm disabled:opacity-60"
          >
            {loading ? "Setting up your village…" : "Take me to my chart"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={null}>
      <OnboardingPageInner />
    </Suspense>
  );
}
