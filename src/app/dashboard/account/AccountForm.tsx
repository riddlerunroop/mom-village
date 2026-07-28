"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AccountForm({
  momName,
  babyName,
  city,
  babyDob,
  dueDate,
}: {
  momName: string;
  babyName: string;
  city: string;
  babyDob: string;
  dueDate: string;
}) {
  const router = useRouter();
  const supabase = createClient();

  // Whether she's already given birth is decided by whether baby_dob was
  // ever set — this form only lets her correct dates within that state,
  // not switch from "expecting" to "born" (that transition has its own
  // flow via /onboarding, with the welcome-baby moment tied to it).
  const isBorn = Boolean(babyDob);
  const originalDate = isBorn ? babyDob : dueDate;

  const [name, setName] = useState(momName);
  const [baby, setBaby] = useState(babyName);
  const [cityValue, setCityValue] = useState(city);
  const [date, setDate] = useState(originalDate);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  // Changing this date shifts real, already-live content (Monthly Chart,
  // Care chart, vaccination due dates) — per Roop's 2026-07-28 review, a
  // changed date needs a deliberate second confirm, not a silent save.
  const [confirmingDateChange, setConfirmingDateChange] = useState(false);

  const dateChanged = date !== originalDate;

  async function saveNow() {
    setError("");
    setSaved(false);
    setLoading(true);
    setConfirmingDateChange(false);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      setError("Something went wrong — please log in again.");
      return;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        mom_name: name || null,
        baby_name: baby || null,
        city: cityValue || null,
        ...(isBorn ? { baby_dob: date || null } : { due_date: date || null }),
      })
      .eq("id", user.id);

    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setSaved(true);
    router.refresh();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (dateChanged && !confirmingDateChange) {
      setConfirmingDateChange(true);
      return;
    }
    saveNow();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-ivory-2 rounded-2xl border border-line p-6"
    >
      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-sage-deep mb-2">
            Your name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
            value={baby}
            onChange={(e) => setBaby(e.target.value)}
            placeholder="Optional"
            className="w-full px-3.5 py-2.5 rounded-xl border border-line bg-ivory text-ink text-sm focus:outline-none focus:border-indigo"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-2">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-sage-deep mb-2">
            {isBorn ? "Baby's date of birth" : "Due date"}
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setConfirmingDateChange(false);
            }}
            className="w-full px-3.5 py-2.5 rounded-xl border border-line bg-ivory text-ink text-sm focus:outline-none focus:border-indigo"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-sage-deep mb-2">
            City
          </label>
          <input
            type="text"
            value={cityValue}
            onChange={(e) => setCityValue(e.target.value)}
            placeholder="Optional"
            className="w-full px-3.5 py-2.5 rounded-xl border border-line bg-ivory text-ink text-sm focus:outline-none focus:border-indigo"
          />
        </div>
      </div>

      <p className="text-[11px] text-ink/45 mb-4">
        Changing {isBorn ? "her date of birth" : "your due date"} updates
        which Monthly Chart, Care chart, and vaccination schedule you see —
        it moves you to a different month/stage immediately. Anything
        you&apos;ve already logged (vaccination records, memories, Care
        Chart check-ins) stays exactly as it is.
      </p>

      {!isBorn && (
        <p className="text-[11px] text-ink/50 mb-4 italic">
          Already had your baby? Head to onboarding to record her birth —
          that also unlocks the welcome moment and birthday celebrations.
        </p>
      )}

      {error && <p className="text-terracotta text-sm mb-4">{error}</p>}
      {saved && !error && (
        <p className="text-sage-deep text-sm mb-4 font-semibold">Saved.</p>
      )}

      {confirmingDateChange && (
        <div className="rounded-xl border-2 border-terracotta bg-terracotta/10 px-4 py-3 mb-4">
          <p className="text-sm text-ink/80 mb-2">
            You&apos;re changing {isBorn ? "her date of birth" : "your due date"}{" "}
            from {originalDate || "—"} to {date}. This will change what you
            see across the app right away. Continue?
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={saveNow}
              className="text-xs font-semibold text-terracotta"
            >
              Yes, update it
            </button>
            <button
              type="button"
              onClick={() => {
                setDate(originalDate);
                setConfirmingDateChange(false);
              }}
              className="text-xs font-semibold text-ink/50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="px-6 py-2.5 rounded-full bg-gold-deep text-ivory font-semibold text-sm disabled:opacity-60"
      >
        {loading ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
