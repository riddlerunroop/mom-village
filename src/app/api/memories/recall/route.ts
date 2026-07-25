import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

// Answers a mother's recall question ("what did I give her for the fever
// last week?") using ONLY her own logged voice memories, photo captions,
// and vaccination records — never general knowledge, never anything
// outside her own data. This is the one narrowly-scoped conversational
// surface in the app; it does not answer anything that isn't grounded in
// what she herself has logged.
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "Memory recall isn't set up yet — ANTHROPIC_API_KEY is missing." },
      { status: 500 }
    );
  }

  const { question } = (await req.json()) as { question?: string };
  if (!question || !question.trim()) {
    return NextResponse.json({ error: "Ask a question first" }, { status: 400 });
  }

  const [{ data: voiceLogs }, { data: photoLogs }, { data: vaccinations }] = await Promise.all([
    supabase
      .from("user_voice_logs")
      .select("transcript, logged_at")
      .eq("user_id", user.id)
      .order("logged_at", { ascending: false })
      .limit(300),
    supabase
      .from("user_photo_logs")
      .select("caption, logged_at")
      .eq("user_id", user.id)
      .order("logged_at", { ascending: false })
      .limit(300),
    supabase
      .from("user_vaccination_records")
      .select("vaccine, dose_label, date_given")
      .eq("user_id", user.id)
      .order("date_given", { ascending: false }),
  ]);

  const hasNothing =
    (!voiceLogs || voiceLogs.length === 0) &&
    (!photoLogs || photoLogs.length === 0) &&
    (!vaccinations || vaccinations.length === 0);

  if (hasNothing) {
    return NextResponse.json({
      answer: "There's nothing logged yet to recall from — once you've logged a few voice notes or photos, ask again.",
    });
  }

  const context = [
    voiceLogs && voiceLogs.length > 0
      ? "VOICE MEMORIES (most recent first):\n" +
        voiceLogs
          .map((v) => `- [${new Date(v.logged_at).toISOString().slice(0, 10)}] ${v.transcript}`)
          .join("\n")
      : "",
    photoLogs && photoLogs.length > 0
      ? "PHOTO MEMORIES (most recent first, caption only):\n" +
        photoLogs
          .map((p) => `- [${new Date(p.logged_at).toISOString().slice(0, 10)}] ${p.caption || "(no caption)"}`)
          .join("\n")
      : "",
    vaccinations && vaccinations.length > 0
      ? "VACCINATION TIMELINE:\n" +
        vaccinations
          .map((v) => `- [${v.date_given}] ${v.vaccine} — ${v.dose_label}`)
          .join("\n")
      : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const message = await anthropic.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 400,
    messages: [
      {
        role: "user",
        content: `You are helping a mother recall something she herself logged about her baby, using ONLY the entries below — never add outside knowledge, never guess at anything not present here. If the answer isn't in these entries, say so plainly and suggest she check her own notes further back, rather than inventing an answer.

${context}

Her question: "${question.trim()}"

Answer warmly and briefly, in a couple of sentences, referencing the date(s) it happened when you can.`,
      },
    ],
  });

  const textBlock = message.content.find((b) => b.type === "text");
  const answer = textBlock && "text" in textBlock ? textBlock.text : "";

  return NextResponse.json({ answer: answer || "Couldn't find anything about that in your logged memories." });
}
