"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

type VoiceLog = { id: string; transcript: string; logged_at: string };
type PhotoLog = { id: string; photo_path: string; caption: string | null; logged_at: string; url: string | null };

type TimelineEntry =
  | { kind: "voice"; id: string; text: string; at: string }
  | { kind: "photo"; id: string; text: string; at: string; url: string | null };

export default function MemoriesClient({
  initialVoiceLogs,
  initialPhotoLogs,
}: {
  initialVoiceLogs: VoiceLog[];
  initialPhotoLogs: PhotoLog[];
}) {
  const router = useRouter();
  const supabase = createClient();

  // ---- Recall ----
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [answer, setAnswer] = useState("");
  const [askError, setAskError] = useState("");

  async function handleAsk(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim()) return;
    setAsking(true);
    setAskError("");
    setAnswer("");

    try {
      const res = await fetch("/api/memories/recall", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const json = await res.json();
      if (json.error) {
        setAskError(json.error);
      } else {
        setAnswer(json.answer);
      }
    } catch {
      setAskError("Couldn't reach memory recall — try again in a moment.");
    } finally {
      setAsking(false);
    }
  }

  // ---- Voice recording ----
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [draftTranscript, setDraftTranscript] = useState("");
  const [voiceError, setVoiceError] = useState("");
  const [savingVoice, setSavingVoice] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  async function startRecording() {
    setVoiceError("");
    setDraftTranscript("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setTranscribing(true);
        try {
          const formData = new FormData();
          formData.append("audio", blob, "memory.webm");
          const res = await fetch("/api/memories/transcribe", { method: "POST", body: formData });
          const json = await res.json();
          if (json.error) {
            setVoiceError(json.error);
          } else {
            setDraftTranscript(json.transcript);
          }
        } catch {
          setVoiceError("Couldn't transcribe that — try again, or type it below instead.");
        } finally {
          setTranscribing(false);
        }
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecording(true);
    } catch {
      setVoiceError("Couldn't access your microphone — check your browser's permission for this site.");
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  }

  async function handleSaveVoice() {
    if (!draftTranscript.trim()) return;
    setSavingVoice(true);
    setVoiceError("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setSavingVoice(false);
      router.push("/login");
      return;
    }

    // Re-record's raw audio was only needed to produce the transcript —
    // we still keep it, in case she ever wants the original clip back.
    const path = `${user.id}/${Date.now()}.webm`;
    const blob = new Blob(chunksRef.current, { type: "audio/webm" });
    const { error: uploadError } = await supabase.storage.from("voice-logs").upload(path, blob);
    if (uploadError) {
      setSavingVoice(false);
      setVoiceError(uploadError.message);
      return;
    }

    const { error: insertError } = await supabase.from("user_voice_logs").insert({
      user_id: user.id,
      audio_path: path,
      transcript: draftTranscript.trim(),
    });

    setSavingVoice(false);
    if (insertError) {
      setVoiceError(insertError.message);
      return;
    }

    setDraftTranscript("");
    router.refresh();
  }

  // ---- Photo logging ----
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [savingPhoto, setSavingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState("");

  function handlePhotoSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function handleSavePhoto() {
    if (!photoFile) return;
    setSavingPhoto(true);
    setPhotoError("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setSavingPhoto(false);
      router.push("/login");
      return;
    }

    const path = `${user.id}/${Date.now()}-${photoFile.name}`;
    const { error: uploadError } = await supabase.storage.from("memory-photos").upload(path, photoFile);
    if (uploadError) {
      setSavingPhoto(false);
      setPhotoError(uploadError.message);
      return;
    }

    const { error: insertError } = await supabase.from("user_photo_logs").insert({
      user_id: user.id,
      photo_path: path,
      caption: caption.trim() || null,
    });

    setSavingPhoto(false);
    if (insertError) {
      setPhotoError(insertError.message);
      return;
    }

    setPhotoFile(null);
    setPhotoPreview(null);
    setCaption("");
    router.refresh();
  }

  // ---- Merged timeline ----
  const timeline: TimelineEntry[] = [
    ...initialVoiceLogs.map((v): TimelineEntry => ({ kind: "voice", id: v.id, text: v.transcript, at: v.logged_at })),
    ...initialPhotoLogs.map((p): TimelineEntry => ({
      kind: "photo",
      id: p.id,
      text: p.caption || "",
      at: p.logged_at,
      url: p.url,
    })),
  ].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

  return (
    <div>
      {/* Recall */}
      <form onSubmit={handleAsk} className="bg-indigo rounded-2xl p-6 mb-10">
        <label htmlFor="memories-recall-question" className="block text-xs font-semibold uppercase tracking-wide text-gold mb-2">
          Ask to recall something
        </label>
        <div className="flex gap-2">
          <input
            id="memories-recall-question"
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="What did I give her for the fever last week?"
            className="flex-1 px-4 py-3 rounded-xl border-0 bg-ivory text-ink text-sm focus:outline-none"
          />
          <button
            type="submit"
            disabled={asking || !question.trim()}
            className="px-5 py-3 rounded-xl bg-gold-deep text-ivory font-semibold text-sm disabled:opacity-50 whitespace-nowrap"
          >
            {asking ? "Thinking…" : "Recall"}
          </button>
        </div>
        {askError && <p className="text-gold text-sm mt-3">{askError}</p>}
        {answer && (
          <p className="text-sm text-ivory/90 mt-4 leading-relaxed">{answer}</p>
        )}
      </form>

      {/* Log a memory */}
      <div className="grid sm:grid-cols-2 gap-5 mb-10">
        <div className="bg-ivory-2 rounded-2xl border border-line p-6">
          <h3 className="font-display text-lg text-indigo mb-3">Voice note</h3>

          {!recording && !transcribing && !draftTranscript && (
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
              ■ Stop recording
            </button>
          )}

          {transcribing && (
            <p className="text-sm text-sage-deep">Listening back…</p>
          )}

          {draftTranscript && !transcribing && (
            <div>
              <p className="text-[11px] text-ink/50 mb-2">
                Here&apos;s what we heard — fix anything before saving:
              </p>
              <textarea
                value={draftTranscript}
                onChange={(e) => setDraftTranscript(e.target.value)}
                rows={4}
                className="w-full px-3 py-2.5 rounded-xl border border-line bg-ivory text-sm text-ink mb-3 focus:outline-none focus:border-indigo"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSaveVoice}
                  disabled={savingVoice}
                  className="flex-1 py-2 rounded-full bg-gold-deep text-ivory font-semibold text-sm disabled:opacity-50"
                >
                  {savingVoice ? "Saving…" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => setDraftTranscript("")}
                  className="px-4 py-2 rounded-full border border-line text-ink/60 text-sm"
                >
                  Discard
                </button>
              </div>
            </div>
          )}

          {voiceError && <p className="text-terracotta text-sm mt-3">{voiceError}</p>}
        </div>

        <div className="bg-ivory-2 rounded-2xl border border-line p-6">
          <h3 className="font-display text-lg text-indigo mb-3">Photo</h3>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoSelected}
            className="w-full text-xs text-ink mb-3"
          />
          {photoPreview && (
            // Plain <img>, intentionally — this is a local blob: URL preview
            // of the file she just picked, before it's uploaded anywhere.
            // next/image's optimizer can't fetch blob: URLs.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoPreview}
              alt="Preview of the photo you're about to save"
              className="w-full rounded-xl border border-line mb-3 max-h-[160px] object-cover"
            />
          )}
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="What's this a photo of? (optional)"
            className="w-full px-3 py-2.5 rounded-xl border border-line bg-ivory text-sm text-ink mb-3 focus:outline-none focus:border-indigo"
          />
          <button
            type="button"
            onClick={handleSavePhoto}
            disabled={!photoFile || savingPhoto}
            className="w-full py-2.5 rounded-full bg-gold-deep text-ivory font-semibold text-sm disabled:opacity-50"
          >
            {savingPhoto ? "Saving…" : "Save photo"}
          </button>
          {photoError && <p className="text-terracotta text-sm mt-3">{photoError}</p>}
        </div>
      </div>

      {/* Timeline */}
      <h2 className="font-display text-lg text-indigo mb-4">Everything you&apos;ve logged</h2>
      {timeline.length === 0 ? (
        <p className="text-sm text-ink/55 italic">Nothing yet — log your first memory above.</p>
      ) : (
        <ul className="space-y-3">
          {timeline.map((entry) => (
            <li key={`${entry.kind}-${entry.id}`} className="bg-ivory-2 rounded-xl border border-line p-4 flex gap-3">
              {entry.kind === "photo" && entry.url && (
                <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
                  <Image
                    src={entry.url}
                    alt={entry.text || "A photo you logged"}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
              )}
              <div>
                <p className="text-[11px] text-sage-deep font-semibold mb-0.5">
                  {new Date(entry.at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
                <p className="text-sm text-ink/80">{entry.text || "(no caption)"}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
