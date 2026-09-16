"use client";

// Media picker + upload for "Share your Reset with the Village." Text,
// photo, video, and audio all post into reset_shares (migration_59) the
// same way; video and audio are both capped at 60 seconds (Roop's explicit
// call) — checked client-side before it's ever uploaded, not re-checked
// server-side in this pass. Audio is recorded in-browser (same
// MediaRecorder pattern as the Memories voice-log feature, minus the
// transcription step — a Reset share doesn't need a transcript, just the
// clip itself) and auto-stops at the cap rather than needing her to watch
// a timer herself.

import { useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type MediaType = "text" | "photo" | "video" | "audio";

const MAX_MEDIA_SECONDS = 60;

export default function ResetShareForm({
  activity,
}: {
  activity: { id: string; emoji: string; title: string } | null;
}) {
  const supabase = createClient();

  const [mediaType, setMediaType] = useState<MediaType>("text");
  const [text, setText] = useState("");
  const [caption, setCaption] = useState("");

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);

  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordStartRef = useRef<number>(0);
  const autoStopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  function switchMediaType(next: MediaType) {
    setMediaType(next);
    setError("");
  }

  function handlePhotoSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  function handleVideoSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setVideoFile(null);
    setVideoPreview(null);
    setVideoDuration(null);

    const url = URL.createObjectURL(file);
    const probe = document.createElement("video");
    probe.preload = "metadata";
    probe.onloadedmetadata = () => {
      if (probe.duration > MAX_MEDIA_SECONDS) {
        setError(
          `That clip is about ${Math.round(probe.duration)}s — keep videos to 60 seconds or under.`
        );
        URL.revokeObjectURL(url);
        return;
      }
      setVideoFile(file);
      setVideoPreview(url);
      setVideoDuration(probe.duration);
    };
    probe.src = url;
  }

  async function startRecording() {
    setError("");
    setAudioBlob(null);
    setAudioPreviewUrl(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const elapsed = (Date.now() - recordStartRef.current) / 1000;
        setAudioBlob(blob);
        setAudioPreviewUrl(URL.createObjectURL(blob));
        setAudioDuration(Math.min(elapsed, MAX_MEDIA_SECONDS));
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      recordStartRef.current = Date.now();
      setRecording(true);
      autoStopTimerRef.current = setTimeout(() => stopRecording(), MAX_MEDIA_SECONDS * 1000);
    } catch {
      setError("Couldn't access your microphone — check your browser's permission for this site.");
    }
  }

  function stopRecording() {
    if (autoStopTimerRef.current) clearTimeout(autoStopTimerRef.current);
    mediaRecorderRef.current?.stop();
    setRecording(false);
  }

  const canSubmit =
    !saving &&
    ((mediaType === "text" && text.trim().length > 0) ||
      (mediaType === "photo" && Boolean(photoFile)) ||
      (mediaType === "video" && Boolean(videoFile)) ||
      (mediaType === "audio" && Boolean(audioBlob)));

  async function handleSubmit() {
    if (!canSubmit) return;
    setSaving(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      return;
    }

    let mediaPath: string | null = null;
    let durationSeconds: number | null = null;

    try {
      if (mediaType === "photo" && photoFile) {
        mediaPath = `${user.id}/${Date.now()}-${photoFile.name}`;
        const { error: upErr } = await supabase.storage.from("reset-shares").upload(mediaPath, photoFile);
        if (upErr) throw upErr;
      } else if (mediaType === "video" && videoFile) {
        mediaPath = `${user.id}/${Date.now()}-${videoFile.name}`;
        const { error: upErr } = await supabase.storage.from("reset-shares").upload(mediaPath, videoFile);
        if (upErr) throw upErr;
        durationSeconds = videoDuration;
      } else if (mediaType === "audio" && audioBlob) {
        mediaPath = `${user.id}/${Date.now()}.webm`;
        const { error: upErr } = await supabase.storage.from("reset-shares").upload(mediaPath, audioBlob);
        if (upErr) throw upErr;
        durationSeconds = audioDuration;
      }

      const { error: insertError } = await supabase.from("reset_shares").insert({
        user_id: user.id,
        activity_id: activity?.id ?? null,
        media_type: mediaType,
        media_path: mediaPath,
        caption: mediaType === "text" ? text.trim() : caption.trim() || null,
        duration_seconds: durationSeconds,
      });
      if (insertError) throw insertError;

      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't share that — try again in a moment.");
    } finally {
      setSaving(false);
    }
  }

  if (done) {
    return (
      <div className="bg-ivory-2 rounded-2xl border border-line p-8 text-center">
        <p className="font-display italic text-lg text-sage-deep mb-4">
          Shared with the village 🎉
        </p>
        <Link
          href="/dashboard/community/reset-gallery"
          className="inline-block text-sm font-semibold px-6 py-2.5 rounded-full bg-terracotta text-ivory"
        >
          See the Reset Gallery →
        </Link>
      </div>
    );
  }

  return (
    <div>
      {activity && (
        <p className="text-[13px] text-ink/60 mb-5">
          Today&apos;s Reset:{" "}
          <span className="font-semibold text-indigo">
            {activity.emoji} {activity.title}
          </span>
        </p>
      )}

      <p className="text-[12.5px] italic text-sage-deep mb-5">
        Feeling artistic? A song overlay, a filter, a cute edit — make it
        yours. No pressure to make it perfect, just to make it feel like
        you.
      </p>

      <div className="flex flex-wrap gap-2 mb-5">
        {(["text", "photo", "video", "audio"] as MediaType[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => switchMediaType(t)}
            className={`text-sm font-semibold px-4 py-2 rounded-full border-[1.5px] ${
              mediaType === t
                ? "bg-terracotta text-ivory border-terracotta"
                : "border-line text-ink/60"
            }`}
          >
            {t === "text" ? "Text" : t === "photo" ? "Photo" : t === "video" ? "Video (≤60s)" : "Audio (≤60s)"}
          </button>
        ))}
      </div>

      {mediaType === "text" && (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          placeholder="How'd your Reset go?"
          className="w-full px-4 py-3 rounded-xl border border-line bg-ivory text-sm text-ink mb-4 focus:outline-none focus:border-terracotta"
        />
      )}

      {mediaType === "photo" && (
        <div className="mb-4">
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoSelected}
            className="w-full text-xs text-ink mb-3"
          />
          {photoPreview && (
            // Local blob: preview of the file she just picked, before
            // upload — next/image's optimizer can't fetch blob: URLs, same
            // documented exception as MemoriesClient.tsx.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoPreview}
              alt="Preview of your photo"
              className="w-full rounded-xl border border-line mb-3 max-h-[280px] object-cover"
            />
          )}
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Add a caption (optional)"
            className="w-full px-3 py-2.5 rounded-xl border border-line bg-ivory text-sm text-ink focus:outline-none focus:border-terracotta"
          />
        </div>
      )}

      {mediaType === "video" && (
        <div className="mb-4">
          <input
            type="file"
            accept="video/*"
            onChange={handleVideoSelected}
            className="w-full text-xs text-ink mb-3"
          />
          {videoPreview && (
            <video
              src={videoPreview}
              controls
              className="w-full rounded-xl border border-line mb-3 max-h-[280px]"
            />
          )}
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Add a caption (optional)"
            className="w-full px-3 py-2.5 rounded-xl border border-line bg-ivory text-sm text-ink focus:outline-none focus:border-terracotta"
          />
        </div>
      )}

      {mediaType === "audio" && (
        <div className="mb-4">
          {!recording && !audioBlob && (
            <button
              type="button"
              onClick={startRecording}
              className="w-full py-2.5 rounded-full bg-terracotta text-ivory font-semibold text-sm"
            >
              ● Start recording
            </button>
          )}
          {recording && (
            <button
              type="button"
              onClick={stopRecording}
              className="w-full py-2.5 rounded-full bg-ink text-ivory font-semibold text-sm animate-pulse"
            >
              ■ Stop recording (auto-stops at 60s)
            </button>
          )}
          {audioBlob && audioPreviewUrl && (
            <div className="mb-3">
              <audio src={audioPreviewUrl} controls className="w-full mb-2" />
              <button
                type="button"
                onClick={() => {
                  setAudioBlob(null);
                  setAudioPreviewUrl(null);
                }}
                className="text-[12px] text-ink/45"
              >
                Record again
              </button>
            </div>
          )}
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Add a caption (optional)"
            className="w-full px-3 py-2.5 rounded-xl border border-line bg-ivory text-sm text-ink focus:outline-none focus:border-terracotta mt-1"
          />
        </div>
      )}

      {error && <p className="text-terracotta text-sm mb-3">{error}</p>}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="w-full py-3 rounded-full bg-terracotta text-ivory font-semibold text-sm disabled:opacity-50"
      >
        {saving ? "Sharing…" : "Share with the village"}
      </button>
    </div>
  );
}
