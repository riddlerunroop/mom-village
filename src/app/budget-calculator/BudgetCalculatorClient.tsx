"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  calculateMinimumBudget,
  formatINR,
  HAND_ME_DOWN_CATEGORY_LABELS,
  NECESSITY_LABELS,
  type BudgetCalculatorInput,
  type BudgetResult,
  type CityTier,
  type DeliveryFacility,
  type DeliveryTypeChoice,
  type DiaperingPlan,
  type FeedingPlan,
  type HandMeDownCategory,
  type InsuranceCoverage,
  type Necessity,
} from "@/lib/budgetCalculator";

type ToggleOption<T extends string> = { value: T; label: string };

function ToggleGroup<T extends string>({
  label,
  helpText,
  options,
  value,
  onChange,
}: {
  label: string;
  helpText?: string;
  options: ToggleOption<T>[];
  value: T | null;
  onChange: (v: T) => void;
}) {
  const labelId = `toggle-group-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  return (
    <div className="mb-7">
      <div id={labelId} className="block text-xs font-semibold uppercase tracking-wide text-sage-deep mb-1">
        {label}
      </div>
      {helpText && <p className="text-[12px] text-ink/50 mb-3">{helpText}</p>}
      <div
        role="group"
        aria-labelledby={labelId}
        className={`grid gap-3 ${!helpText ? "mt-3" : ""}`}
        style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}
      >
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`py-3 px-2 rounded-xl text-sm font-semibold border-[1.5px] transition-colors ${
              value === opt.value
                ? "bg-sage-deep text-ivory border-sage-deep"
                : "text-sage-deep border-sage-deep/40"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

const NECESSITY_STYLE: Record<Necessity, string> = {
  essential: "bg-terracotta/15 text-terracotta border-terracotta/30",
  optional: "bg-gold/20 text-gold-deep border-gold-deep/30",
  skip_for_now: "bg-ink/5 text-ink/45 border-ink/15",
};

const HAND_ME_DOWN_KEYS = Object.keys(HAND_ME_DOWN_CATEGORY_LABELS) as HandMeDownCategory[];

function formatSavedDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function BudgetCalculatorPage() {
  const supabase = createClient();

  const [currentlyPregnant, setCurrentlyPregnant] = useState<"yes" | "no" | null>(null);
  const [babyCount, setBabyCount] = useState<"1" | "2" | "3" | null>(null);
  const [deliveryFacility, setDeliveryFacility] = useState<DeliveryFacility | null>(null);
  const [deliveryType, setDeliveryType] = useState<DeliveryTypeChoice | null>(null);
  const [cityTier, setCityTier] = useState<CityTier | null>(null);
  const [insuranceCoverage, setInsuranceCoverage] = useState<InsuranceCoverage | null>(null);
  const [feedingPlan, setFeedingPlan] = useState<FeedingPlan | null>(null);
  const [diaperingPlan, setDiaperingPlan] = useState<DiaperingPlan | null>(null);
  const [hasHandMeDowns, setHasHandMeDowns] = useState<"yes" | "no" | null>(null);
  const [handMeDownCategories, setHandMeDownCategories] = useState<HandMeDownCategory[]>([]);

  const [result, setResult] = useState<BudgetResult | null>(null);
  const [loadingSaved, setLoadingSaved] = useState(true);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [editing, setEditing] = useState(true);

  // Load any previously saved plan and, if found, show her results
  // immediately (recomputed fresh from the saved answers, never a stale
  // stored total) with a "last saved" banner instead of starting blank.
  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoadingSaved(false);
        return;
      }
      const { data } = await supabase
        .from("user_budget_plan")
        .select("inputs, updated_at")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data?.inputs) {
        const saved = data.inputs as BudgetCalculatorInput;
        setCurrentlyPregnant(saved.currentlyPregnant ? "yes" : "no");
        setBabyCount(String(Math.min(3, saved.babyCount || 1)) as "1" | "2" | "3");
        setDeliveryFacility(saved.deliveryFacility ?? null);
        setDeliveryType(saved.deliveryType ?? null);
        setCityTier(saved.cityTier ?? "tier2");
        setInsuranceCoverage(saved.insuranceCoverage ?? null);
        setFeedingPlan(saved.feedingPlan ?? null);
        setDiaperingPlan(saved.diaperingPlan ?? null);
        setHasHandMeDowns(saved.hasHandMeDowns ? "yes" : "no");
        setHandMeDownCategories(saved.handMeDownCategories ?? []);
        setResult(calculateMinimumBudget(saved));
        setLastSavedAt(data.updated_at as string);
        setEditing(false);
      }
      setLoadingSaved(false);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canCalculate =
    currentlyPregnant !== null &&
    babyCount !== null &&
    (currentlyPregnant === "no" ||
      (deliveryFacility !== null &&
        (deliveryFacility === "public" || (deliveryType !== null && cityTier !== null)))) &&
    feedingPlan !== null &&
    diaperingPlan !== null &&
    hasHandMeDowns !== null;

  async function handleCalculate() {
    if (!canCalculate) return;
    const input: BudgetCalculatorInput = {
      currentlyPregnant: currentlyPregnant === "yes",
      babyCount: Number(babyCount),
      deliveryFacility: deliveryFacility || "public",
      deliveryType: deliveryType || "not_sure",
      cityTier: cityTier || "tier2",
      insuranceCoverage: insuranceCoverage || "not_sure",
      feedingPlan: feedingPlan!,
      diaperingPlan: diaperingPlan!,
      hasHandMeDowns: hasHandMeDowns === "yes",
      handMeDownCategories,
    };
    setResult(calculateMinimumBudget(input));
    setEditing(false);

    setSaveState("saving");
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const nowIso = new Date().toISOString();
      const { error } = await supabase
        .from("user_budget_plan")
        .upsert({ user_id: user.id, inputs: input, updated_at: nowIso }, { onConflict: "user_id" });
      if (!error) {
        setLastSavedAt(nowIso);
        setSaveState("saved");
      } else {
        setSaveState("idle");
      }
    } else {
      setSaveState("idle");
    }
  }

  function handleEditAnswers() {
    setEditing(true);
  }

  function toggleHandMeDownCategory(cat: HandMeDownCategory) {
    setHandMeDownCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  if (loadingSaved) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center px-6 py-12">
        <p className="text-sm text-ink/45">Loading your planner…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory px-6 py-12">
      <div className="w-full max-w-[600px] mx-auto">
        {editing ? (
          <>
            <div className="text-center mb-8 print:hidden">
              <div className="text-xs tracking-[0.12em] uppercase text-sage-deep font-semibold mb-2">
                the real minimum, not the inflated version
              </div>
              <h1 className="font-display text-[28px] text-indigo">
                Minimum Budget Planner
              </h1>
              <p className="text-sm text-ink/65 mt-2">
                A handful of honest questions, and a realistic number — built
                around what you actually need, not what marketing tells you
                to buy.
              </p>
              {lastSavedAt && (
                <p className="text-[12px] text-sage-deep font-semibold mt-3">
                  You have a saved plan from {formatSavedDate(lastSavedAt)} —
                  your answers below are already filled in. Update anything
                  and recalculate to save your changes.
                </p>
              )}
            </div>

            <div className="bg-ivory-2 rounded-2xl border border-line p-7">
              <ToggleGroup
                label="Are you still pregnant, or has baby arrived?"
                helpText="Decides whether pregnancy & delivery costs are included, or we start from newborn essentials."
                value={currentlyPregnant}
                onChange={setCurrentlyPregnant}
                options={[
                  { value: "yes", label: "Still pregnant" },
                  { value: "no", label: "Baby's here" },
                ]}
              />

              <ToggleGroup
                label="How many babies?"
                helpText="Costs below scale per baby — twins/triplets show a higher total, though some one-time items like furniture may not fully double in real life."
                value={babyCount}
                onChange={setBabyCount}
                options={[
                  { value: "1", label: "1" },
                  { value: "2", label: "2" },
                  { value: "3", label: "3+" },
                ]}
              />

              {currentlyPregnant === "yes" && (
                <>
                  <ToggleGroup
                    label="Planning to deliver at a government or private facility?"
                    helpText="Government facilities are free or near-free under JSSK; private hospitals cost more but may offer more choice."
                    value={deliveryFacility}
                    onChange={setDeliveryFacility}
                    options={[
                      { value: "public", label: "Government" },
                      { value: "private", label: "Private" },
                    ]}
                  />

                  {deliveryFacility === "private" && (
                    <>
                      <ToggleGroup
                        label="Expecting a normal delivery or C-section?"
                        helpText="A C-section typically costs more at a private hospital — this only affects the estimate, not what actually happens during delivery."
                        value={deliveryType}
                        onChange={setDeliveryType}
                        options={[
                          { value: "normal", label: "Normal" },
                          { value: "c_section", label: "C-section" },
                          { value: "not_sure", label: "Not sure yet" },
                        ]}
                      />

                      <ToggleGroup
                        label="What kind of city will you deliver in?"
                        helpText="Private hospital costs vary a lot by city — this adjusts the private delivery estimate directionally, not as a precise citywide average."
                        value={cityTier}
                        onChange={setCityTier}
                        options={[
                          { value: "metro", label: "Metro" },
                          { value: "tier2", label: "Tier-2 city" },
                          { value: "tier3_or_rural", label: "Smaller town" },
                        ]}
                      />

                      <ToggleGroup
                        label="Any insurance or government health coverage?"
                        helpText="This doesn't change the number shown — real coverage varies too much by policy to estimate precisely — but we'll add a note in your results."
                        value={insuranceCoverage}
                        onChange={setInsuranceCoverage}
                        options={[
                          { value: "private_insurance", label: "Private insurance" },
                          { value: "government_scheme", label: "Govt. scheme" },
                          { value: "none", label: "None" },
                          { value: "not_sure", label: "Not sure" },
                        ]}
                      />
                    </>
                  )}
                </>
              )}

              <ToggleGroup
                label="Feeding plan?"
                helpText="Breastfeeding costs close to nothing directly; formula adds a real, ongoing monthly cost."
                value={feedingPlan}
                onChange={setFeedingPlan}
                options={[
                  { value: "breastfeeding", label: "Breastfeeding" },
                  { value: "formula", label: "Formula" },
                  { value: "undecided", label: "Not decided" },
                ]}
              />

              <ToggleGroup
                label="Diapering plan?"
                helpText="Cloth costs more upfront but less over time; disposable is the reverse. Mixed lands in between."
                value={diaperingPlan}
                onChange={setDiaperingPlan}
                options={[
                  { value: "cloth", label: "Cloth" },
                  { value: "disposable", label: "Disposable" },
                  { value: "mixed", label: "Mixed" },
                ]}
              />

              <ToggleGroup
                label="Starting from scratch, or have hand-me-downs?"
                helpText="Even a few hand-me-downs meaningfully lower your newborn essentials cost."
                value={hasHandMeDowns}
                onChange={setHasHandMeDowns}
                options={[
                  { value: "no", label: "From scratch" },
                  { value: "yes", label: "Have hand-me-downs" },
                ]}
              />

              {hasHandMeDowns === "yes" && (
                <div className="mb-7">
                  <div id="budget-handmedowns-label" className="block text-xs font-semibold uppercase tracking-wide text-sage-deep mb-1">
                    What do you already have?
                  </div>
                  <p className="text-[12px] text-ink/50 mb-3">
                    Select what you already have — anything left unchecked is
                    assumed you still need to buy.
                  </p>
                  <div className="grid grid-cols-2 gap-2.5" role="group" aria-labelledby="budget-handmedowns-label">
                    {HAND_ME_DOWN_KEYS.map((cat) => {
                      const checked = handMeDownCategories.includes(cat);
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => toggleHandMeDownCategory(cat)}
                          className={`text-left py-2.5 px-3 rounded-xl text-[13px] font-semibold border-[1.5px] transition-colors ${
                            checked
                              ? "bg-sage-deep text-ivory border-sage-deep"
                              : "text-sage-deep border-sage-deep/40"
                          }`}
                        >
                          {checked ? "✓ " : ""}
                          {HAND_ME_DOWN_CATEGORY_LABELS[cat]}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleCalculate}
                disabled={!canCalculate}
                className="w-full py-3 rounded-full bg-gold-deep text-ivory font-semibold text-sm disabled:opacity-50 mt-2"
              >
                {result ? "Recalculate & save" : "Show my minimum budget"}
              </button>
            </div>
          </>
        ) : (
          result && (
            <div>
              <div className="text-center mb-8 print:mb-6">
                <div className="text-xs tracking-[0.12em] uppercase text-sage-deep font-semibold mb-2 print:hidden">
                  your real number
                </div>
                <h1 className="font-display text-[28px] text-indigo">
                  Your minimum realistic budget
                </h1>
                <p className="text-sm text-ink/65 mt-2 max-w-[480px] mx-auto">
                  Pregnancy through your child&apos;s third birthday. These
                  are honest, budget-conscious 2026 estimates for urban
                  India — not a guarantee, and not the premium version. Your
                  actual costs will vary by city, hospital, and choices, so
                  treat this as a floor to plan around, with your own buffer
                  on top.
                </p>
                {lastSavedAt && (
                  <p className="text-[12px] text-sage-deep font-semibold mt-3 print:hidden">
                    {saveState === "saving"
                      ? "Saving…"
                      : `Saved — last updated ${formatSavedDate(lastSavedAt)}`}
                  </p>
                )}
              </div>

              <div className="bg-indigo rounded-2xl p-7 text-center mb-4">
                <div className="text-xs uppercase tracking-[0.12em] text-gold font-semibold mb-2">
                  total minimum, pregnancy through age 3
                </div>
                <div className="font-display text-[32px] text-ivory">
                  {formatINR(result.total.low)} – {formatINR(result.total.high)}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-6">
                {(["essential", "optional", "skip_for_now"] as Necessity[]).map((n) => (
                  <div
                    key={n}
                    className={`rounded-xl border-[1.5px] px-3 py-3 text-center ${NECESSITY_STYLE[n]}`}
                  >
                    <div className="text-[10px] font-semibold uppercase tracking-wide mb-1">
                      {NECESSITY_LABELS[n]}
                    </div>
                    <div className="text-[13px] font-semibold">
                      {formatINR(result.necessityTotals[n].low)} –{" "}
                      {formatINR(result.necessityTotals[n].high)}
                    </div>
                  </div>
                ))}
              </div>

              {result.schemeCallouts.length > 0 && (
                <div className="bg-ivory-2 rounded-2xl border border-line p-6 mb-6">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-sage-deep mb-3">
                    Government support &amp; coverage notes
                  </h3>
                  <ul className="space-y-2">
                    {result.schemeCallouts.map((c, i) => (
                      <li key={i} className="text-sm text-ink/75">
                        • {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="space-y-4 mb-8">
                {result.stages.map((stage) => (
                  <div
                    key={stage.key}
                    className="bg-ivory-2 rounded-2xl border border-line p-6"
                  >
                    <div className="flex items-baseline justify-between mb-3">
                      <h3 className="font-display text-lg text-indigo">
                        {stage.label}
                      </h3>
                      <span className="text-sm font-semibold text-gold-deep">
                        {formatINR(stage.subtotal.low)} – {formatINR(stage.subtotal.high)}
                      </span>
                    </div>
                    <ul className="space-y-3">
                      {stage.lines.map((line, i) => (
                        <li key={i} className="text-sm">
                          <div className="flex items-start justify-between gap-3">
                            <span className="font-semibold text-ink">{line.label}</span>
                            <span className="text-ink/65 whitespace-nowrap">
                              {formatINR(line.range.low)} – {formatINR(line.range.high)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border ${NECESSITY_STYLE[line.necessity]}`}
                            >
                              {NECESSITY_LABELS[line.necessity]}
                            </span>
                          </div>
                          <p className="text-[13px] text-ink/55 mt-1">{line.note}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 print:hidden">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 py-3 rounded-full bg-gold-deep text-ivory font-semibold text-sm"
                >
                  Download / print as PDF
                </button>
                <button
                  type="button"
                  onClick={handleEditAnswers}
                  className="flex-1 py-3 rounded-full border-[1.5px] border-sage-deep text-sage-deep font-semibold text-sm"
                >
                  Edit my answers
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
