"use client";

import { useState } from "react";
import {
  calculateMinimumBudget,
  formatINR,
  type BudgetCalculatorInput,
  type BudgetResult,
} from "@/lib/budgetCalculator";

type ToggleOption<T extends string> = { value: T; label: string };

function ToggleGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: ToggleOption<T>[];
  value: T | null;
  onChange: (v: T) => void;
}) {
  return (
    <div className="mb-7">
      <label className="block text-xs font-semibold uppercase tracking-wide text-sage-deep mb-3">
        {label}
      </label>
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}>
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

export default function BudgetCalculatorPage() {
  const [currentlyPregnant, setCurrentlyPregnant] = useState<"yes" | "no" | null>(null);
  const [babyCount, setBabyCount] = useState<"1" | "2" | "3" | null>(null);
  const [deliveryFacility, setDeliveryFacility] = useState<"public" | "private" | null>(null);
  const [deliveryType, setDeliveryType] = useState<"normal" | "c_section" | "not_sure" | null>(null);
  const [feedingPlan, setFeedingPlan] = useState<"breastfeeding" | "formula" | "undecided" | null>(null);
  const [diaperingPlan, setDiaperingPlan] = useState<"cloth" | "disposable" | "mixed" | null>(null);
  const [hasHandMeDowns, setHasHandMeDowns] = useState<"yes" | "no" | null>(null);

  const [result, setResult] = useState<BudgetResult | null>(null);

  const canCalculate =
    currentlyPregnant !== null &&
    babyCount !== null &&
    (currentlyPregnant === "no" || deliveryFacility !== null) &&
    feedingPlan !== null &&
    diaperingPlan !== null &&
    hasHandMeDowns !== null;

  function handleCalculate() {
    if (!canCalculate) return;
    const input: BudgetCalculatorInput = {
      currentlyPregnant: currentlyPregnant === "yes",
      babyCount: Number(babyCount),
      deliveryFacility: deliveryFacility || "public",
      deliveryType: deliveryType || "not_sure",
      feedingPlan: feedingPlan!,
      diaperingPlan: diaperingPlan!,
      hasHandMeDowns: hasHandMeDowns === "yes",
    };
    setResult(calculateMinimumBudget(input));
  }

  function handleStartOver() {
    setResult(null);
  }

  return (
    <div className="min-h-screen bg-ivory px-6 py-12">
      <div className="w-full max-w-[600px] mx-auto">
        {!result ? (
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
            </div>

            <div className="bg-ivory-2 rounded-2xl border border-line p-7">
              <ToggleGroup
                label="Are you still pregnant, or has baby arrived?"
                value={currentlyPregnant}
                onChange={setCurrentlyPregnant}
                options={[
                  { value: "yes", label: "Still pregnant" },
                  { value: "no", label: "Baby's here" },
                ]}
              />

              <ToggleGroup
                label="How many babies?"
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
                    value={deliveryFacility}
                    onChange={setDeliveryFacility}
                    options={[
                      { value: "public", label: "Government" },
                      { value: "private", label: "Private" },
                    ]}
                  />

                  {deliveryFacility === "private" && (
                    <ToggleGroup
                      label="Expecting a normal delivery or C-section?"
                      value={deliveryType}
                      onChange={setDeliveryType}
                      options={[
                        { value: "normal", label: "Normal" },
                        { value: "c_section", label: "C-section" },
                        { value: "not_sure", label: "Not sure yet" },
                      ]}
                    />
                  )}
                </>
              )}

              <ToggleGroup
                label="Feeding plan?"
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
                value={hasHandMeDowns}
                onChange={setHasHandMeDowns}
                options={[
                  { value: "no", label: "From scratch" },
                  { value: "yes", label: "Have hand-me-downs" },
                ]}
              />

              <button
                type="button"
                onClick={handleCalculate}
                disabled={!canCalculate}
                className="w-full py-3 rounded-full bg-gold-deep text-ivory font-semibold text-sm disabled:opacity-50 mt-2"
              >
                Show my minimum budget
              </button>
            </div>
          </>
        ) : (
          <div>
            <div className="text-center mb-8 print:mb-6">
              <div className="text-xs tracking-[0.12em] uppercase text-sage-deep font-semibold mb-2 print:hidden">
                your real number
              </div>
              <h1 className="font-display text-[28px] text-indigo">
                Your minimum realistic budget
              </h1>
              <p className="text-sm text-ink/65 mt-2 max-w-[480px] mx-auto">
                Pregnancy through your child&apos;s third birthday. These are
                honest, budget-conscious 2026 estimates for urban India — not
                a guarantee, and not the premium version. Your actual costs
                will vary by city, hospital, and choices, so treat this as a
                floor to plan around, with your own buffer on top.
              </p>
            </div>

            <div className="bg-indigo rounded-2xl p-7 text-center mb-6">
              <div className="text-xs uppercase tracking-[0.12em] text-gold font-semibold mb-2">
                total minimum, pregnancy through age 3
              </div>
              <div className="font-display text-[32px] text-ivory">
                {formatINR(result.total.low)} – {formatINR(result.total.high)}
              </div>
            </div>

            {result.schemeCallouts.length > 0 && (
              <div className="bg-ivory-2 rounded-2xl border border-line p-6 mb-6">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-sage-deep mb-3">
                  Government support worth claiming
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
                  <ul className="space-y-2.5">
                    {stage.lines.map((line, i) => (
                      <li key={i} className="text-sm">
                        <div className="flex items-baseline justify-between gap-3">
                          <span className="font-semibold text-ink">{line.label}</span>
                          <span className="text-ink/65 whitespace-nowrap">
                            {formatINR(line.range.low)} – {formatINR(line.range.high)}
                          </span>
                        </div>
                        <p className="text-[13px] text-ink/55 mt-0.5">{line.note}</p>
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
                onClick={handleStartOver}
                className="flex-1 py-3 rounded-full border-[1.5px] border-sage-deep text-sage-deep font-semibold text-sm"
              >
                Start over
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
