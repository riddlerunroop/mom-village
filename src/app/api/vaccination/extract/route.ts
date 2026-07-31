import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getAuthedSupabase } from "@/lib/supabase/apiAuth";
import { checkAndIncrementRateLimit } from "@/lib/rateLimit";

// Reads a photographed vaccination card and suggests which vaccine/dose and
// date it shows — a suggestion only. The mother always sees and can edit
// this before anything is saved (see LogDoseClient.tsx, and the native
// app's log-dose screen); we never write a record straight from this
// response. Handwritten cards are genuinely failure-prone to read, so the
// model is explicitly told to say so rather than guess confidently.
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
  const { allowed } = await checkAndIncrementRateLimit(supabase, user.id, "vaccination_extract", 20);
  if (!allowed) {
    return NextResponse.json(
      { error: "You've reached today's limit for card reading — try again tomorrow, or enter the details manually." },
      { status: 429 }
    );
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "Card reading isn't set up yet — ANTHROPIC_API_KEY is missing." },
      { status: 500 }
    );
  }

  const body = await req.json();
  const { imageBase64, mediaType } = body as {
    imageBase64?: string;
    mediaType?: string;
  };

  if (!imageBase64 || !mediaType) {
    return NextResponse.json({ error: "No image provided" }, { status: 400 });
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const message = await anthropic.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 500,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType as
                | "image/jpeg"
                | "image/png"
                | "image/webp"
                | "image/gif",
              data: imageBase64,
            },
          },
          {
            type: "text",
            text: `This is a photo of a child's vaccination card, likely handwritten and possibly in Hindi or English. Find the single most recent entry (the latest date written on the card) and identify:
1. The vaccine name as written (e.g. "BCG", "OPV 1", "Penta 2", "MR")
2. The date it was given

Handwritten cards are often hard to read — if you're not confident, say so rather than guessing.

Respond with ONLY a JSON object, no other text, in this exact shape:
{"vaccineGuess": string or null, "dateGuess": "YYYY-MM-DD" or null, "rawText": string describing what you actually see, "confident": boolean}`,
          },
        ],
      },
    ],
  });

  const textBlock = message.content.find((b) => b.type === "text");
  const raw = textBlock && "text" in textBlock ? textBlock.text : "";

  try {
    // Strip any accidental markdown code fences before parsing.
    const cleaned = raw.replace(/^```json\s*|\s*```$/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({
      vaccineGuess: null,
      dateGuess: null,
      rawText: raw || "Couldn't read the card clearly — enter the details manually.",
      confident: false,
    });
  }
}
