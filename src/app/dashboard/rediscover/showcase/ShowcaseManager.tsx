"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CATEGORY_FAMILIES, categoriesForFamily, familyLabel, type RediscoverCategoryFamily } from "@/lib/rediscoverCategories";

type Listing = {
  id: string;
  category_family: string;
  category: string;
  title: string;
  description: string | null;
  is_active: boolean;
};

export default function ShowcaseManager({ initialListings }: { initialListings: Listing[] }) {
  const supabase = createClient();
  const [listings, setListings] = useState<Listing[]>(initialListings);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [family, setFamily] = useState<RediscoverCategoryFamily>("products");
  const [category, setCategory] = useState(categoriesForFamily("products")[0]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function startEdit(listing: Listing) {
    setEditingId(listing.id);
    setFamily(listing.category_family as RediscoverCategoryFamily);
    setCategory(listing.category);
    setTitle(listing.title);
    setDescription(listing.description ?? "");
  }

  function resetForm() {
    setEditingId(null);
    setFamily("products");
    setCategory(categoriesForFamily("products")[0]);
    setTitle("");
    setDescription("");
  }

  async function saveListing() {
    if (!title.trim()) {
      setError("Give it a title first.");
      return;
    }
    setSaving(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      setError("Something went wrong — please log in again.");
      return;
    }

    if (editingId) {
      const { error: updateError } = await supabase
        .from("rediscover_listings")
        .update({
          category_family: family,
          category,
          title: title.trim(),
          description: description.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingId);
      setSaving(false);
      if (updateError) {
        setError("Couldn't save — please try again.");
        return;
      }
      setListings((prev) =>
        prev.map((l) =>
          l.id === editingId
            ? { ...l, category_family: family, category, title: title.trim(), description: description.trim() || null }
            : l
        )
      );
      resetForm();
    } else {
      const { data, error: insertError } = await supabase
        .from("rediscover_listings")
        .insert({
          user_id: user.id,
          category_family: family,
          category,
          title: title.trim(),
          description: description.trim() || null,
        })
        .select("id, category_family, category, title, description, is_active")
        .single();
      setSaving(false);
      if (insertError || !data) {
        setError("Couldn't save — please try again.");
        return;
      }
      setListings((prev) => [data as Listing, ...prev]);
      resetForm();
    }
  }

  async function toggleActive(listing: Listing) {
    const { error: updateError } = await supabase
      .from("rediscover_listings")
      .update({ is_active: !listing.is_active })
      .eq("id", listing.id);
    if (!updateError) {
      setListings((prev) => prev.map((l) => (l.id === listing.id ? { ...l, is_active: !l.is_active } : l)));
    }
  }

  async function deleteListing(id: string) {
    const { error: deleteError } = await supabase.from("rediscover_listings").delete().eq("id", id);
    if (!deleteError) {
      setListings((prev) => prev.filter((l) => l.id !== id));
      if (editingId === id) resetForm();
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-ivory-2 rounded-2xl border border-line p-6 space-y-4">
        <h2 className="font-display text-lg text-indigo">
          {editingId ? "Edit listing" : "Add a listing"}
        </h2>

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="rd-family" className="block text-xs font-semibold text-ink/60 mb-1">
              Category
            </label>
            <select
              id="rd-family"
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
            <label htmlFor="rd-category" className="block text-xs font-semibold text-ink/60 mb-1">
              Specific tag
            </label>
            <select
              id="rd-category"
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
          <label htmlFor="rd-title" className="block text-xs font-semibold text-ink/60 mb-1">
            Title
          </label>
          <input
            id="rd-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Phulkari Suits"
            maxLength={80}
            className="w-full rounded-lg border border-line px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label htmlFor="rd-desc" className="block text-xs font-semibold text-ink/60 mb-1">
            Description
          </label>
          <textarea
            id="rd-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            maxLength={600}
            className="w-full rounded-lg border border-line px-3 py-2 text-sm"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={saveListing}
            disabled={saving}
            className="text-sm font-semibold px-5 py-2 rounded-full bg-indigo text-ivory disabled:opacity-60"
          >
            {saving ? "Saving…" : editingId ? "Save changes" : "Add listing"}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="text-sm text-ink/55 underline">
              Cancel
            </button>
          )}
          {error && <span className="text-xs text-terracotta">{error}</span>}
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="font-display text-lg text-indigo">Your listings</h2>
        {listings.length === 0 && (
          <p className="text-sm text-ink/55">Nothing yet — add your first listing above.</p>
        )}
        {listings.map((listing) => (
          <div key={listing.id} className="bg-ivory-2 rounded-xl border border-line p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[11px] uppercase tracking-wide font-bold text-sage-deep mb-1">
                  {familyLabel(listing.category_family)} · {listing.category}
                </div>
                <h3 className="font-semibold text-indigo">{listing.title}</h3>
                {listing.description && <p className="text-sm text-ink/65 mt-1">{listing.description}</p>}
                {!listing.is_active && (
                  <span className="inline-block mt-2 text-[11px] font-semibold text-ink/45">Hidden from other mothers</span>
                )}
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <button type="button" onClick={() => startEdit(listing)} className="text-xs font-semibold text-indigo underline">
                  Edit
                </button>
                <button type="button" onClick={() => toggleActive(listing)} className="text-xs text-ink/55 underline">
                  {listing.is_active ? "Hide" : "Show"}
                </button>
                <button type="button" onClick={() => deleteListing(listing.id)} className="text-xs text-terracotta underline">
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
