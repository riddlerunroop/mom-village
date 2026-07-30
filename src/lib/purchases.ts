import { SupabaseClient } from "@supabase/supabase-js";

// One-time-purchase access checks — mirrors the shape of
// hasActiveSubscription() in src/lib/subscription.ts. Each of these covers
// a mother who bought a specific thing individually without a full
// membership (book, book bundle, or the ₹49 budget map). A page should
// grant access if EITHER the relevant purchase check OR
// hasActiveSubscription() is true — membership always includes everything.

export async function hasPurchasedBook(
  supabase: SupabaseClient,
  userId: string,
  slug: string
): Promise<boolean> {
  // Two separate .eq() queries (rather than building a raw .or() filter
  // string with the slug interpolated into it) — keeps this safe from any
  // filter-syntax injection regardless of what slug is passed in.
  const [bundleResult, bookResult] = await Promise.all([
    supabase
      .from("user_book_purchases")
      .select("id")
      .eq("user_id", userId)
      .eq("status", "paid")
      .eq("is_bundle", true)
      .limit(1)
      .maybeSingle(),
    supabase
      .from("user_book_purchases")
      .select("id")
      .eq("user_id", userId)
      .eq("status", "paid")
      .eq("book_slug", slug)
      .limit(1)
      .maybeSingle(),
  ]);
  return Boolean(bundleResult.data) || Boolean(bookResult.data);
}

export async function hasPurchasedBundle(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  const { data } = await supabase
    .from("user_book_purchases")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "paid")
    .eq("is_bundle", true)
    .limit(1)
    .maybeSingle();
  return Boolean(data);
}

export async function hasPurchasedBudgetMap(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  const { data } = await supabase
    .from("user_budget_map_purchases")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "paid")
    .limit(1)
    .maybeSingle();
  return Boolean(data);
}
