"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ProfileForm({
  headline: initialHeadline,
  bio: initialBio,
  location: initialLocation,
  remoteOk: initialRemoteOk,
  openToCollaboration: initialOpenToCollaboration,
  openToWork: initialOpenToWork,
  openToPromotion: initialOpenToPromotion,
  isActive: initialIsActive,
}: {
  headline: string;
  bio: string;
  location: string;
  remoteOk: boolean;
  openToCollaboration: boolean;
  openToWork: boolean;
  openToPromotion: boolean;
  isActive: boolean;
}) {
  const supabase = createClient();

  const [headline, setHeadline] = useState(initialHeadline);
  const [bio, setBio] = useState(initialBio);
  const [location, setLocation] = useState(initialLocation);
  const [remoteOk, setRemoteOk] = useState(initialRemoteOk);
  const [openToCollaboration, setOpenToCollaboration] = useState(initialOpenToCollaboration);
  const [openToWork, setOpenToWork] = useState(initialOpenToWork);
  const [openToPromotion, setOpenToPromotion] = useState(initialOpenToPromotion);
  const [isActive, setIsActive] = useState(initialIsActive);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    setLoading(true);
    setSaved(false);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      setError("Something went wrong — please log in again.");
      return;
    }

    const { error: upsertError } = await supabase.from("user_rediscover_profile").upsert(
      {
        user_id: user.id,
        headline: headline || null,
        bio: bio || null,
        location: location || null,
        remote_ok: remoteOk,
        open_to_collaboration: openToCollaboration,
        open_to_work: openToWork,
        open_to_promotion: openToPromotion,
        is_active: isActive,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    setLoading(false);
    if (upsertError) {
      setError("Couldn't save — please try again.");
    } else {
      setSaved(true);
    }
  }

  return (
    <div className="bg-ivory-2 rounded-2xl border border-line p-6 space-y-4">
      <div>
        <label htmlFor="rd-headline" className="block text-xs font-semibold text-ink/60 mb-1">
          Headline
        </label>
        <input
          id="rd-headline"
          type="text"
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
          placeholder="e.g. Fashion Designer · Ludhiana"
          maxLength={80}
          className="w-full rounded-lg border border-line px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="rd-bio" className="block text-xs font-semibold text-ink/60 mb-1">
          About my work
        </label>
        <textarea
          id="rd-bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          maxLength={600}
          className="w-full rounded-lg border border-line px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="rd-location" className="block text-xs font-semibold text-ink/60 mb-1">
          Location
        </label>
        <input
          id="rd-location"
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g. Ludhiana"
          maxLength={80}
          className="w-full rounded-lg border border-line px-3 py-2 text-sm"
        />
      </div>

      <div id="rd-flags-label" className="block text-xs font-semibold text-ink/60 mb-1">
        Open to
      </div>
      <div role="group" aria-labelledby="rd-flags-label" className="flex flex-wrap gap-2">
        {[
          { key: "remote", label: "Remote work", value: remoteOk, set: setRemoteOk },
          { key: "collab", label: "Collaboration", value: openToCollaboration, set: setOpenToCollaboration },
          { key: "work", label: "Work / projects", value: openToWork, set: setOpenToWork },
          { key: "promo", label: "Being promoted", value: openToPromotion, set: setOpenToPromotion },
        ].map((flag) => (
          <button
            key={flag.key}
            type="button"
            onClick={() => flag.set(!flag.value)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
              flag.value
                ? "bg-gold-deep/10 border-gold-deep/40 text-gold-deep"
                : "border-line text-ink/55"
            }`}
          >
            {flag.value ? "✓ " : ""}
            {flag.label}
          </button>
        ))}
      </div>

      <label className="flex items-center gap-2 text-sm text-ink/70 pt-2 border-t border-line">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
        />
        My profile and listings are visible to other mothers
      </label>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={save}
          disabled={loading}
          className="text-sm font-semibold px-5 py-2 rounded-full bg-indigo text-ivory disabled:opacity-60"
        >
          {loading ? "Saving…" : "Save profile"}
        </button>
        {saved && <span className="text-xs text-sage-deep">Saved.</span>}
        {error && <span className="text-xs text-terracotta">{error}</span>}
      </div>
    </div>
  );
}
