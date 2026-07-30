import { createClient } from "@/lib/supabase/server";
import { hasActiveSubscription } from "@/lib/subscription";
import LockedPreview from "@/components/LockedPreview";
import MemoriesClient from "./MemoriesClient";

// Voice-log memories + recall — narrowly scoped, confirmed 2026-07-21: log
// a short voice note or photo in the moment, ask to recall it later. Not a
// general chatbot; the recall API only ever answers from her own logged
// entries plus her vaccination timeline, never outside knowledge.
export default async function MemoriesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isSubscribed = await hasActiveSubscription(supabase, user!.id);

  const [{ data: voiceLogs }, { data: photoLogs }] = isSubscribed
    ? await Promise.all([
        supabase
          .from("user_voice_logs")
          .select("id, transcript, logged_at")
          .eq("user_id", user!.id)
          .order("logged_at", { ascending: false })
          .limit(50),
        supabase
          .from("user_photo_logs")
          .select("id, photo_path, caption, logged_at")
          .eq("user_id", user!.id)
          .order("logged_at", { ascending: false })
          .limit(50),
      ])
    : [{ data: null }, { data: null }];

  // Photo paths are private storage objects — turn each into a short-lived
  // signed URL so the client can actually render them. Batched into one
  // request via createSignedUrls (2026-07-30, audit finding #18) rather
  // than one createSignedUrl call per photo — same result, fewer round
  // trips as her memory timeline grows.
  type PhotoLogRow = NonNullable<typeof photoLogs>[number];
  let photosWithUrls: (PhotoLogRow & { url: string | null })[] = [];
  if (photoLogs && photoLogs.length > 0) {
    const { data: signedUrls } = await supabase.storage
      .from("memory-photos")
      .createSignedUrls(
        photoLogs.map((p) => p.photo_path),
        3600
      );
    photosWithUrls = photoLogs.map((p, i) => ({
      ...p,
      url: signedUrls?.[i]?.signedUrl || null,
    }));
  }

  return (
    <main className="max-w-[700px] mx-auto px-6 py-10">
      <div className="mb-2 text-xs uppercase tracking-[0.12em] text-sage-deep font-semibold">
        her story, in your words
      </div>
      <h1 className="font-display text-[30px] text-indigo mb-1">
        Memories
      </h1>
      <p className="text-sm text-ink/65 mb-8 max-w-[540px]">
        Log a voice note or a photo in the moment — a symptom and what you
        gave her, a first word, anything you won&apos;t remember to write
        down later. Ask to recall it whenever you need it.
      </p>

      {!isSubscribed ? (
        <LockedPreview
          title="Your memory log is waiting"
          teaser="Join to log voice notes and photos in the moment, and recall them later whenever you need to."
        />
      ) : (
        <MemoriesClient
          initialVoiceLogs={voiceLogs || []}
          initialPhotoLogs={photosWithUrls}
        />
      )}
    </main>
  );
}
