import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getRazorpayClient, PRICES } from "@/lib/razorpay";

// Starts the ₹299/month membership checkout. Two steps:
// 1. Get-or-create the Razorpay Plan for the membership (cached in the tiny
//    app_config table after the first real call, so this never depends on
//    Roop manually creating a Plan in the Razorpay dashboard first, and
//    works the same whether we're pointed at test or live keys).
// 2. Create a Subscription against that plan for this specific mother
//    (notes: user_id, so the webhook can identify her later without a
//    separate lookup) and hand back its id for Checkout.js to open.
//
// No Supabase write happens here — the `subscriptions` row is only ever
// created/updated by the webhook handler once Razorpay confirms the
// subscription actually activated. That avoids a half-created "pending"
// row if she opens checkout and abandons it.
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  let razorpay;
  try {
    razorpay = getRazorpayClient();
  } catch {
    return NextResponse.json(
      { error: "Payments aren't set up yet — missing Razorpay API keys." },
      { status: 500 }
    );
  }

  const service = createServiceClient();

  // Step 1 — get or create the monthly membership plan id.
  let planId: string | null = null;
  const { data: cached } = await service
    .from("app_config")
    .select("value")
    .eq("key", "razorpay_membership_plan_id")
    .maybeSingle();

  if (cached?.value) {
    planId = cached.value;
  } else {
    try {
      const plan = await razorpay.plans.create({
        period: "monthly",
        interval: 1,
        item: {
          name: "Mom Village Membership",
          amount: PRICES.membershipMonthly,
          currency: "INR",
          description:
            "Monthly chart, Care, Wealth, Community, and all 6 Library books",
        },
      });
      planId = plan.id;
      // Best-effort cache — if this insert races with another first-time
      // caller, both created a valid plan; whichever id lands in
      // app_config first just wins for future calls. Low-stakes, low-odds.
      await service
        .from("app_config")
        .upsert({ key: "razorpay_membership_plan_id", value: planId, updated_at: new Date().toISOString() });
    } catch (err) {
      console.error("Failed to create Razorpay plan:", err);
      return NextResponse.json(
        { error: "Couldn't set up the membership plan with Razorpay. Try again in a moment." },
        { status: 502 }
      );
    }
  }

  // Step 2 — create the subscription for this mother.
  try {
    const subscription = await razorpay.subscriptions.create({
      plan_id: planId!,
      customer_notify: 1,
      // Razorpay requires a total_count for fixed-length billing cycles;
      // 120 months (10 years) comfortably covers the app's full pregnancy
      // -through-third-birthday span with room to spare, and she can cancel
      // anytime well before it would ever matter.
      total_count: 120,
      notes: {
        user_id: user.id,
        phone: user.phone || "",
      },
    });

    return NextResponse.json({ subscriptionId: subscription.id });
  } catch (err) {
    console.error("Failed to create Razorpay subscription:", err);
    return NextResponse.json(
      { error: "Couldn't start checkout. Try again in a moment." },
      { status: 502 }
    );
  }
}
