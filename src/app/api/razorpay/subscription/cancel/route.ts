import { NextRequest, NextResponse } from "next/server";
import { getAuthedSupabase } from "@/lib/supabase/apiAuth";
import { createServiceClient } from "@/lib/supabase/service";
import { getRazorpayClient } from "@/lib/razorpay";

// Real self-serve cancellation. Always cancels at the end of the current
// billing cycle, never immediately — matches Roop's own standing rule for
// manual cancellations in the Razorpay dashboard, and the account page's
// promised copy ("keeping your access active until the end of your
// current paid period. You won't be charged again.").
//
// Uses getAuthedSupabase so this same route works from both the website
// (cookie session) and the native app (Bearer token via authedFetch),
// same pattern as the vaccination/memories routes.
//
// Calls Razorpay directly (the source of truth) and also updates our own
// row synchronously so the UI reflects it immediately, rather than waiting
// on the webhook — the webhook will also update the same row when it
// arrives (idempotent, harmless either order).
export async function POST(req: NextRequest) {
  const { user } = await getAuthedSupabase(req);

  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const service = createServiceClient();

  const { data: subscription } = await service
    .from("subscriptions")
    .select("id, status, razorpay_subscription_id, cancel_at_period_end, current_period_end")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (!subscription || !subscription.razorpay_subscription_id) {
    return NextResponse.json(
      { error: "No active membership found to cancel." },
      { status: 404 }
    );
  }

  if (subscription.cancel_at_period_end) {
    // Already scheduled — nothing more to do, not an error.
    return NextResponse.json({
      status: "already scheduled",
      currentPeriodEnd: subscription.current_period_end,
    });
  }

  let razorpay;
  try {
    razorpay = getRazorpayClient();
  } catch {
    return NextResponse.json(
      { error: "Payments aren't set up on this app yet." },
      { status: 500 }
    );
  }

  try {
    await razorpay.subscriptions.cancel(subscription.razorpay_subscription_id, {
      cancel_at_cycle_end: true,
    });
  } catch (err) {
    console.error("Failed to cancel Razorpay subscription:", err);
    return NextResponse.json(
      { error: "Couldn't reach Razorpay to cancel. Try again in a moment." },
      { status: 502 }
    );
  }

  // Keep status='active' — access stays live until current_period_end
  // passes (hasActiveSubscription() already checks that date). The webhook
  // will also set this same flag when Razorpay's own event arrives.
  await service
    .from("subscriptions")
    .update({ cancel_at_period_end: true })
    .eq("id", subscription.id);

  return NextResponse.json({
    status: "cancelled",
    currentPeriodEnd: subscription.current_period_end,
  });
}
