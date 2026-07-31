import { NextRequest } from "next/server";
import { createClient as createSupabaseJsClient, SupabaseClient } from "@supabase/supabase-js";
import { createClient as createCookieClient } from "@/lib/supabase/server";

// Shared auth helper for API routes that need to work from BOTH the
// website (cookie-based session, via @supabase/ssr) and the native mobile
// app (no cookies at all — it holds its own Supabase session in
// AsyncStorage and can only authenticate a fetch() call via a Bearer
// token). Added 2026-07-31 for the native app's Phase 6 (Vaccinations +
// Memories) — these are the first native screens that need to call an
// existing Next.js API route (for AI calls needing server-side secrets)
// rather than just querying Supabase tables directly, so this is the
// first genuine web-code change the native build has required.
//
// Backward-compatible by design: if no Authorization header is present
// (every existing web request), this falls through to the exact same
// cookie-based `createClient()` behavior as before — zero change for the
// website. Only requests carrying `Authorization: Bearer <access_token>`
// (the native app) take the new path.
export async function getAuthedSupabase(
  req: NextRequest
): Promise<{ supabase: SupabaseClient; user: { id: string } | null }> {
  const authHeader = req.headers.get("authorization");

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice("Bearer ".length).trim();
    const supabase = createSupabaseJsClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );
    const {
      data: { user },
    } = await supabase.auth.getUser(token);
    if (user) {
      return { supabase, user };
    }
    // Falls through to the cookie path below if the token didn't validate —
    // matches the original routes' behavior of just returning "not signed
    // in" rather than a different error shape.
  }

  const supabase = await createCookieClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}
