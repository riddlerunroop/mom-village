import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getRazorpayClient, PRICES } from "@/lib/razorpay";
import { LIBRARY_BOOKS } from "@/lib/library";

type OrderType = "book" | "bundle" | "budget_map";

// One-time payments (book, bundle, or the ₹49 budget map) all go through
// Razorpay's Orders API rather than Subscriptions. The amount is always
// computed server-side from PRICES/LIBRARY_BOOKS — never trust a price the
// client sends, or anyone could open devtools and buy a ₹249 book for ₹1.
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const type = body?.type as OrderType | undefined;
  const slug = body?.slug as string | undefined;

  if (!type || !["book", "bundle", "budget_map"].includes(type)) {
    return NextResponse.json({ error: "Invalid purchase type" }, { status: 400 });
  }

  let amount: number;
  if (type === "book") {
    const book = LIBRARY_BOOKS.find((b) => b.slug === slug);
    if (!book) {
      return NextResponse.json({ error: "Unknown book" }, { status: 400 });
    }
    amount = PRICES.bookIndividual;
  } else if (type === "bundle") {
    amount = PRICES.bookBundle;
  } else {
    amount = PRICES.budgetMap;
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

  try {
    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      // Receipt must be <= 40 chars for Razorpay's Orders API.
      receipt: `${type}_${Date.now()}`.slice(0, 40),
      notes: {
        user_id: user.id,
        type,
        slug: type === "book" ? slug! : "",
      },
    });

    // Record the attempt up front (status 'created') so there's a real
    // trail even if she abandons checkout or the webhook is ever delayed —
    // the webhook flips this same row to 'paid' by matching razorpay_order_id,
    // it never needs to insert a fresh row itself.
    if (type === "budget_map") {
      await supabase.from("user_budget_map_purchases").insert({
        user_id: user.id,
        razorpay_order_id: order.id,
        amount_paid: amount / 100,
        status: "created",
      });
    } else {
      await supabase.from("user_book_purchases").insert({
        user_id: user.id,
        book_slug: type === "book" ? slug : null,
        is_bundle: type === "bundle",
        razorpay_order_id: order.id,
        amount_paid: amount / 100,
        status: "created",
      });
    }

    return NextResponse.json({ orderId: order.id, amount });
  } catch (err) {
    console.error("Failed to create Razorpay order:", err);
    return NextResponse.json(
      { error: "Couldn't start checkout. Try again in a moment." },
      { status: 502 }
    );
  }
}
