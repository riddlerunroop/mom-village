import { NextRequest, NextResponse } from "next/server";
import { getAuthedSupabase } from "@/lib/supabase/apiAuth";
import { checkAndIncrementRateLimit } from "@/lib/rateLimit";

// Transcribes a recorded voice memory via OpenAI's Whisper API — Claude
// doesn't take raw audio, so this is a separate service, same pattern as
// the ANTHROPIC_API_KEY dependency added for vaccination card reading.
// Returns a transcript only; she always reviews/edits it before anything
// is saved (see MemoriesClient.tsx, and the native app's memories screen)
// — speech-to-text can mishear a medicine name or a date, and this is
// exactly the kind of detail that matters later when she's trying to
// recall it.
//
// 2026-07-31: now also callable from the native mobile app via a Bearer
// token (getAuthedSupabase falls back to the original cookie-based auth
// for every existing web request — see that file's own comment).
export async function POST(req: NextRequest) {
  const { supabase, user } = await getAuthedSupabase(req);

  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  // Added 2026-07-30 — audit finding #8 (Important): cap real-money AI
  // calls per user per day so this can't be hammered.
  const { allowed } = await checkAndIncrementRateLimit(supabase, user.id, "memories_transcribe", 50);
  if (!allowed) {
    return NextResponse.json(
      { error: "You've reached today's limit for voice transcription — try again tomorrow, or type it instead." },
      { status: 429 }
    );
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "Voice transcription isn't set up yet — OPENAI_API_KEY is missing." },
      { status: 500 }
    );
  }

  const formData = await req.formData();
  const audio = formData.get("audio");

  if (!audio || !(audio instanceof Blob)) {
    return NextResponse.json({ error: "No audio provided" }, { status: 400 });
  }

  const whisperForm = new FormData();
  whisperForm.append("file", audio, "memory.webm");
  whisperForm.append("model", "whisper-1");

  const whisperRes = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: whisperForm,
  });

  if (!whisperRes.ok) {
    return NextResponse.json(
      { error: "Couldn't transcribe that — try recording again, or type it instead." },
      { status: 500 }
    );
  }

  const { text } = (await whisperRes.json()) as { text: string };
  return NextResponse.json({ transcript: text?.trim() || "" });
}
