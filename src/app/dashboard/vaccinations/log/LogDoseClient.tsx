"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { occurrenceOptions } from "@/lib/vaccinationSchedule";

const OPTIONS = occurrenceOptions();

function fileToBase64(file: File): Promise<{ data: string; mediaType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const [prefix, data] = result.split(",");
      const mediaType = prefix.match(/data:(.*);base64/)?.[1] || file.type;
      resolve({ data, mediaType });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function LogDoseClient() {
  const router = useRouter();
  const supabase = createClient();

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [reading, setReading] = useState(false);
  const [readError, setReadError] = useState("");
  const [rawText, setRawText] = useState("");
  const [vaccineGuess, setVaccineGuess] = useState("");
  const [dateGuess, setDateGuess] = useState("");
  const [confident, setConfident] = useState<boolean | null>(null);

  const [occurrenceKey, setOccurrenceKey] = useState("");
  const [dateGiven, setDateGiven] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
    setReadError("");
    setRawText("");
    setVaccineGuess("");
    setDateGuess("");
    setConfident(null);
    setReading(true);

    try {
      const { data, mediaType } = await fileToBase64(selected);
      const res = await fetch("/api/vaccination/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: data, mediaType }),
      });
      const json = await res.json();

      if (json.error) {
        setReadError(json.error);
      } else {
        setRawText(json.rawText || "");
        setConfident(json.confident ?? null);

        if (json.dateGuess) {
          setDateGiven(json.dateGuess);
          setDateGuess(json.dateGuess);
        }

        if (json.vaccineGuess) {
          setVaccineGuess(String(json.vaccineGuess));
          const guess = String(json.vaccineGuess).toLowerCase();
          const match = OPTIONS.find(
            (o) =>
              guess.includes(o.vaccine.toLowerCase().split(" ")[0]) ||
              o.vaccine.toLowerCase().includes(guess)
          );
          if (match) setOccurrenceKey(match.occurrenceKey);
        }
      }
    } catch {
      setReadError("Couldn't read the card automatically — fill in the details below.");
    } finally {
      setReading(false);
    }
  }

  const canSave = file !== null && occurrenceKey !== "" && dateGiven !== "";

  async function handleSave() {
    if (!canSave || !file) return;
    setSaving(true);
    setSaveError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSaving(false);
      router.push("/login");
      return;
    }

    const selectedOption = OPTIONS.find((o) => o.occurrenceKey === occurrenceKey);
    if (!selectedOption) {
      setSaving(false);
      setSaveError("Pick which dose this is.");
      return;
    }

    const path = `${user.id}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("vaccination-cards")
      .upload(path, file);

    if (uploadError) {
      setSaving(false);
      setSaveError(uploadError.message);
      return;
    }

    const { error: insertError } = await supabase
      .from("user_vaccination_records")
      .upsert(
        {
          user_id: user.id,
          occurrence_key: occurrenceKey,
          vaccine: selectedOption.vaccine,
          dose_label: selectedOption.doseLabel,
          date_given: dateGiven,
          card_photo_path: path,
          ai_suggested_vaccine: vaccineGuess || null,
          ai_suggested_date: dateGuess || null,
        },
        { onConflict: "user_id,occurrence_key" }
      );

    setSaving(false);

    if (insertError) {
      setSaveError(insertError.message);
      return;
    }

    router.push("/dashboard/vaccinations");
  }

  return (
    <main className="max-w-[600px] mx-auto px-6 py-10">
      <Link
        href="/dashboard/vaccinations"
        className="text-xs font-semibold text-sage-deep mb-6 inline-block"
      >
        ← back to vaccinations
      </Link>

      <div className="mb-2 text-xs uppercase tracking-[0.12em] text-sage-deep font-semibold">
        log a dose
      </div>
      <h1 className="font-display text-[26px] text-indigo mb-2">
        Photograph the card
      </h1>
      <p className="text-sm text-ink/65 mb-8">
        We'll try to read the vaccine and date for you — always double-check
        before saving, handwriting can be hard to read.
      </p>

      <div className="bg-ivory-2 rounded-2xl border border-line p-7">
        <label className="block text-xs font-semibold uppercase tracking-wide text-sage-deep mb-3">
          Card photo
        </label>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelected}
          className="w-full text-sm text-ink mb-5"
        />

        {previewUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt="Vaccination card preview"
            className="w-full rounded-xl border border-line mb-5 max-h-[280px] object-contain bg-ivory"
          />
        )}

        {reading && (
          <p className="text-sm text-sage-deep mb-5">Reading the card…</p>
        )}

        {readError && (
          <p className="text-terracotta text-sm mb-5">{readError}</p>
        )}

        {rawText && !reading && (
          <div className="bg-ivory rounded-xl border border-line p-4 mb-5">
            <p className="text-xs font-semibold text-sage-deep mb-1">
              {confident === false
                ? "We're not fully confident about this — please check carefully:"
                : "Here's what we could read:"}
            </p>
            <p className="text-sm text-ink/75">{rawText}</p>
          </div>
        )}

        <label className="block text-xs font-semibold uppercase tracking-wide text-sage-deep mb-2">
          Which dose is this?
        </label>
        <select
          value={occurrenceKey}
          onChange={(e) => setOccurrenceKey(e.target.value)}
          className="w-full rounded-xl border border-line bg-ivory px-4 py-3 text-sm text-ink mb-5 focus:outline-none focus:border-gold-deep"
        >
          <option value="">Select…</option>
          {OPTIONS.map((o) => (
            <option key={o.occurrenceKey} value={o.occurrenceKey}>
              {o.label}
            </option>
          ))}
        </select>

        <label className="block text-xs font-semibold uppercase tracking-wide text-sage-deep mb-2">
          Date given
        </label>
        <input
          type="date"
          value={dateGiven}
          onChange={(e) => setDateGiven(e.target.value)}
          className="w-full rounded-xl border border-line bg-ivory px-4 py-3 text-sm text-ink mb-6 focus:outline-none focus:border-gold-deep"
        />

        {saveError && <p className="text-terracotta text-sm mb-4">{saveError}</p>}

        <button
          type="button"
          onClick={handleSave}
          disabled={!canSave || saving}
          className="w-full py-3 rounded-full bg-gold-deep text-ivory font-semibold text-sm disabled:opacity-50"
        >
          {saving ? "Saving…" : "Confirm and save"}
        </button>
      </div>
    </main>
  );
}
