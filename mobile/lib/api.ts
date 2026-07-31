// Small helper for calling the website's Next.js API routes from the
// native app — used only by the two features that genuinely need a
// server-side AI call (vaccination card reading, voice transcription +
// memory recall), since those need server-side secrets (ANTHROPIC_API_KEY/
// OPENAI_API_KEY) the app itself must never hold.
//
// These routes originally only supported cookie-based auth (the website's
// session). As of 2026-07-31, src/lib/supabase/apiAuth.ts on the website
// side also accepts `Authorization: Bearer <access_token>` — this helper
// fetches that token from the current native session and attaches it.

import { supabase } from "./supabase";

export const API_BASE = "https://www.momvillage.in";

export async function authedFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const headers = new Headers(init.headers);
  if (session?.access_token) {
    headers.set("Authorization", `Bearer ${session.access_token}`);
  }
  return fetch(`${API_BASE}${path}`, { ...init, headers });
}
