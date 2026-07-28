"use client";

// Interactive maternity cash-flow planner — replaces the static
// print-it-yourself Worksheet table on the Savings page, per Roop's
// 2026-07-28 review. Same 12 real line items from the original locked
// worksheet, now editable, auto-saving (debounced, same pattern as
// BookReader's reading-progress save), and calculating her actual funding
// gap live instead of leaving the arithmetic to her.

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Sign = 1 | -1;

const ITEMS: { key: string; label: string; sign: Sign }[] = [
  { key: "antenatal", label: "Antenatal appointments and tests", sign: 1 },
  { key: "delivery", label: "Delivery and hospital costs", sign: 1 },
  { key: "insurance_contribution", label: "Expected insurance or government contribution", sign: -1 },
  { key: "postnatal_care", label: "Medicines and postnatal care", sign: 1 },
  { key: "travel_support", label: "Travel and support costs", sign: 1 },
  { key: "baby_purchases", label: "Essential one-time baby purchases", sign: 1 },
  { key: "household_essentials", label: "Monthly household essentials during leave", sign: 1 },
  { key: "loan_insurance_payments", label: "Loan and insurance payments during leave", sign: 1 },
  { key: "paid_leave_income", label: "Income expected during paid leave", sign: -1 },
  { key: "unpaid_leave_income_lost", label: "Income lost during unpaid or reduced-pay leave", sign: 1 },
  { key: "childcare", label: "Childcare after you return to work", sign: 1 },
  { key: "cash_benefits", label: "Government or employer cash benefits", sign: -1 },
];

function formatINR(n: number) {
  return `₹${Math.round(Math.abs(n)).toLocaleString("en-IN")}`;
}

export default function MaternityPlanner() {
  const supabase = createClient();
  const [values, setValues] = useState<Record<string, number>>({});
  const [loaded, setLoaded] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoaded(true);
        return;
      }
      const { data } = await supabase
        .from("user_maternity_plan")
        .select("values")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data?.values) setValues(data.values as Record<string, number>);
      setLoaded(true);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateValue(key: string, raw: string) {
    const n = raw === "" ? 0 : Math.max(0, Number(raw));
    const next = { ...values, [key]: n };
    setValues(next);
    setSaveState("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      await supabase
        .from("user_maternity_plan")
        .upsert(
          { user_id: user.id, values: next, updated_at: new Date().toISOString() },
          { onConflict: "user_id" }
        );
      setSaveState("saved");
    }, 700);
  }

  const gap = ITEMS.reduce((sum, item) => sum + (values[item.key] || 0) * item.sign, 0);

  if (!loaded) {
    return (
      <div className="bg-ivory-2 rounded-2xl border border-line p-5 text-sm text-ink/45">
        Loading your plan…
      </div>
    );
  }

  return (
    <div className="bg-ivory-2 rounded-2xl border border-line p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs uppercase tracking-wide font-semibold text-ink/50">
          Fill in what you know — leave the rest for later
        </p>
        <p className="text-[11px] text-sage-deep font-semibold">
          {saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved" : ""}
        </p>
      </div>
      <div className="space-y-2">
        {ITEMS.map((item) => (
          <div key={item.key} className="flex items-center justify-between gap-3">
            <label htmlFor={item.key} className="text-sm text-ink/80 flex-1">
              {item.label}
              <span className={`ml-1.5 text-[10px] font-semibold ${item.sign === 1 ? "text-terracotta" : "text-sage-deep"}`}>
                {item.sign === 1 ? "(add)" : "(subtract)"}
              </span>
            </label>
            <div className="flex items-center shrink-0">
              <span className="text-sm text-ink/40 mr-1">₹</span>
              <input
                id={item.key}
                type="number"
                min={0}
                inputMode="numeric"
                value={values[item.key] || ""}
                onChange={(e) => updateValue(item.key, e.target.value)}
                placeholder="0"
                className="w-28 rounded-lg border border-line bg-ivory px-2.5 py-1.5 text-sm text-right focus:outline-none focus:border-gold-deep"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-line flex items-center justify-between">
        <p className="text-sm font-semibold text-ink">Your estimated funding gap</p>
        <p className={`font-display text-xl ${gap > 0 ? "text-terracotta" : "text-sage-deep"}`}>
          {gap > 0 ? formatINR(gap) : gap < 0 ? `Covered by ${formatINR(gap)}` : "₹0"}
        </p>
      </div>
      <p className="text-xs text-ink/50 mt-3">
        Try not to treat every baby-related purchase as essential — a
        shorter necessities list protects your cash for healthcare, food,
        housing, and any income gap. Come back and update this once you get
        a hospital quote, insurance confirmation, or updated leave
        information — and don&apos;t count an insurance claim or benefit as
        money in hand until you understand what it takes to actually
        receive it. This stays private to you and saves automatically.
      </p>
    </div>
  );
}
