"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CATEGORY_FAMILIES, categoriesForFamily, familyLabel, type RediscoverCategoryFamily } from "@/lib/rediscoverCategories";

type Need = {
  id: string;
  category_family: string;
  category: string;
  note: string;
  is_active: boolean;
};

export default function NeedManager({ initialNeeds }: { initialNeeds: Need[] }) {
  const supabase = createClient();
  const [needs, setNeeds] = useState<Need[]>(initialNeeds);
  const [family, setFamily] = useState<RediscoverCategoryFamily>("business_operations");
  const [category, setCategory] = useState(categoriesForFamily("business_operations")[0]);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function post() {
    if (!note.trim()) {
      setError("Say a little about what you're looking for.");
      return;
    }
    setSaving(true);
    setError("");
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      setError("Please log in again.");
      return;
    }

    const { data, error: insertError } = await supabase
      .from("rediscover_needs")
      .insert({ user_id: user.id, category_family: family, category, note: note.trim() })
      .select("id, category_family, category, note, is_active")
      .single();

    setSaving(false);
    if (insertError || !data) {
      setError("Couldn't post — please try again.");
      return;
    }
    setNeeds((prev) => [data as Need, ...prev]);
    setNote("");
  }

  async function toggleActive(need: Need) {
    const { error: updateError } = await supabase
      .from("rediscover_needs")
      .update({ is_active: !need.is_active })
      .eq("id", need.id);
    if (!updateError) {
      setNeeds((prev) => prev.map((n) => (n.id === need.id ? { ...n, is_active: !n.is_active } : n)));
    }
  }

  async function remove(id: string) {
    const { error: deleteError } = await supabase.from("rediscover_needs").delete().eq("id", id);
    if (!deleteError) setNeeds((prev) => prev.filter((n) => n.id !== id));
  }

  return (
    <div className="space-y-6">
      <div className="bg-ivory-2 rounded-2xl border border-line p-6 space-y-4">
        <h2 className="font-display text-lg text-indigo">What are you looking for?</h2>

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="rd-need-family" className="block text-xs font-semibold text-ink/60 mb-1">
              Category
            </label>
            <select
              id="rd-need-family"
              value={family}
              onChange={(e) => {
                const next = e.target.value as RediscoverCategoryFamily;
                setFamily(next);
                setCategory(categoriesForFamily(next)[0]);
              }}
              className="w-full rounded-lg border border-line px-3 py-2 text-sm bg-white"
            >
              {CATEGORY_FAMILIES.map((f) => (
                <option key={f.key} value={f.key}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="rd-need-category" className="block text-xs font-semibold text-ink/60 mb-1">
              Specific tag
            </label>
            <select
              id="rd-need-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-line px-3 py-2 text-sm bg-white"
            >
              {categoriesForFamily(family).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="rd-need-note" className="block text-xs font-semibold text-ink/60 mb-1">
            What are you looking for?
          </label>
          <textarea
            id="rd-need-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            maxLength={300}
            placeholder="e.g. A manufacturer for children's clothing, small batches"
            className="w-full rounded-lg border border-line px-3 py-2 text-sm"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={post}
            disabled={saving}
            className="text-sm font-semibold px-5 py-2 rounded-full bg-indigo text-ivory disabled:opacity-60"
          >
            {saving ? "Posting…" : "Post"}
          </button>
          {error && <span className="text-xs text-terracotta">{error}</span>}
        </div>
      </div>

      {needs.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-display text-lg text-indigo">What you&apos;ve posted</h2>
          {needs.map((need) => (
            <div key={need.id} className="bg-ivory-2 rounded-xl border border-line p-4 flex items-start justify-between gap-3">
              <div>
                <div className="text-[11px] uppercase tracking-wide font-bold text-sage-deep mb-1">
                  {familyLabel(need.category_family)} · {need.category}
                </div>
                <p className="text-sm text-ink/70">{need.note}</p>
                {!need.is_active && <span className="inline-block mt-1 text-[11px] font-semibold text-ink/45">Hidden from other mothers</span>}
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <button type="button" onClick={() => toggleActive(need)} className="text-xs text-ink/55 underline">
                  {need.is_active ? "Hide" : "Show"}
                </button>
                <button type="button" onClick={() => remove(need.id)} className="text-xs text-terracotta underline">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
