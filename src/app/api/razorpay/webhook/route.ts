import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { verifyWebhookSignature } from "@/lib/razorpay";

// Single webhook endpoint for every Razorpay event this app cares about —
// registered once in the Razorpay Dashboard → Settings → Webhooks, pointed
// at https://<domain>/api/razorpay/webhook. This is the one and only place
// that ever writes 'active'/'paid' state — the create routes only ever
// start checkout, they never grant access themselves. That way a mother
// who closes the checkout tab, loses signal mid-payment, or has her
// browser crash still ends up with correct access once Razorpay's own
// confirmation arrives here, and nothing can be marked paid without
// Razorpay actually having said so.
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature");
  const eventId = req.headers.get("x-razorpay-event-id");

  if (!signature || !verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let evt: RazorpayWebhookPayload;
  try {
    evt = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const service = createServiceClient();

  // Idempotency: atomically "claim" this event id before doing any work.
  // If the insert fails because it's already there (Postgres unique
  // violation, code 23505), this is a Razorpay retry of a delivery we
  // already handled — acknowledge with 200 and stop, don't reprocess.
  if (eventId) {
    const { error: claimError } = await service
      .from("razorpay_webhook_events")
      .insert({ event_id: eventId, event_type: evt.event, payload: evt });
    if (claimError) {
      if (claimError.code === "23505") {
        return NextResponse.json({ status: "already processed" });
      }
      console.error("Failed to record webhook event:", claimError);
      // Fall through and still process — better to risk a rare duplicate
      // than to silently drop a real payment event because logging failed.
    }
  }

  try {
    switch (evt.event) {
      case "subscription.activated":
      case "subscription.charged": {
        const sub = evt.payload?.subscription?.entity;
        if (!sub) break;
        const userId = sub.notes?.user_id;
        if (!userId) {
          console.error(`${evt.event}: subscription ${sub.id} has no user_id in notes`);
          break;
        }
        await service.from("subscriptions").upsert(
          {
            user_id: userId,
            status: "active",
            plan: "monthly",
            razorpay_subscription_id: sub.id,
            razorpay_plan_id: sub.plan_id,
            current_period_end: sub.current_end
              ? new Date(sub.current_end * 1000).toISOString()
              : null,
            // A fresh charge/activation always means no cancellation is
            // pending anymore (covers the normal monthly renewal case, and
            // the rare case of a subscription being un-cancelled/renewed).
            cancel_at_period_end: false,
          },
          { onConflict: "razorpay_subscription_id" }
        );
        break;
      }

      case "subscription.cancelled": {
        const sub = evt.payload?.subscription?.entity;
        if (!sub) break;
        // Razorpay fires this the moment a cancel is requested — including
        // a cancel_at_cycle_end request, well before the paid period is
        // actually over. So this must NOT immediately cut off access: if
        // her current_end is still in the future, keep status 'active' and
        // just flag cancel_at_period_end so the account page can say
        // "cancelling — active until <date>". hasActiveSubscription()
        // already checks current_period_end against "now" for any
        // status='active' row, so access falls away on its own once that
        // date passes — no second webhook event needed for that. Only an
        // immediate/no-notice cancel (current_end already past, or absent)
        // should flip status to 'cancelled' right away.
        const periodEndsAt = sub.current_end ? new Date(sub.current_end * 1000) : null;
        const stillWithinPaidPeriod = !!periodEndsAt && periodEndsAt > new Date();
        await service
          .from("subscriptions")
          .update({
            cancel_at_period_end: true,
            status: stillWithinPaidPeriod ? "active" : "cancelled",
          })
          .eq("razorpay_subscription_id", sub.id);
        break;
      }

      case "subscription.completed": {
        const sub = evt.payload?.subscription?.entity;
        if (!sub) break;
        // Fires once a subscription's billing cycles are genuinely done
        // (including the final cycle of a cancel_at_cycle_end request) —
        // this is the real "access should end now" signal.
        await service
          .from("subscriptions")
          .update({ status: "expired", cancel_at_period_end: false })
          .eq("razorpay_subscription_id", sub.id);
        break;
      }

      case "payment.captured": {
        const payment = evt.payload?.payment?.entity;
        if (!payment?.order_id) break; // no order_id = a subscription charge, already handled above
        await handleOrderPaid(service, payment.order_id, payment.id, payment.notes);
        break;
      }

      case "payment.failed": {
        const payment = evt.payload?.payment?.entity;
        if (!payment?.order_id) break;
        await service
          .from("user_book_purchases")
          .update({ status: "failed" })
          .eq("razorpay_order_id", payment.order_id)
          .eq("status", "created");
        await service
          .from("user_budget_map_purchases")
          .update({ status: "failed" })
          .eq("razorpay_order_id", payment.order_id)
          .eq("status", "created");
        break;
      }

      default:
        // Any event we haven't opted into handling — safe to ignore.
        break;
    }
  } catch (err) {
    console.error(`Error processing Razorpay webhook event ${evt.event}:`, err);
    // Still return 200 — we've already recorded the event id, so returning
    // an error here would just make Razorpay retry a delivery whose
    // idempotency claim we already own, without ever succeeding. A logged
    // error is the right escape hatch for this to get caught and fixed by
    // hand rather than retried forever.
  }

  return NextResponse.json({ status: "ok" });
}

async function handleOrderPaid(
  service: ReturnType<typeof createServiceClient>,
  orderId: string,
  paymentId: string,
  notes: Record<string, string> | undefined
) {
  const { data: bookRow } = await service
    .from("user_book_purchases")
    .select("id")
    .eq("razorpay_order_id", orderId)
    .maybeSingle();
  if (bookRow) {
    await service
      .from("user_book_purchases")
      .update({ status: "paid", razorpay_payment_id: paymentId })
      .eq("id", bookRow.id);
    return;
  }

  const { data: budgetRow } = await service
    .from("user_budget_map_purchases")
    .select("id")
    .eq("razorpay_order_id", orderId)
    .maybeSingle();
  if (budgetRow) {
    await service
      .from("user_budget_map_purchases")
      .update({ status: "paid", razorpay_payment_id: paymentId })
      .eq("id", budgetRow.id);
    return;
  }

  // Fallback — the order/create route's own insert didn't make it in for
  // some reason, but the order notes (set at creation time, in
  // src/app/api/razorpay/order/create/route.ts) still tell us who this was
  // for. Insert the paid row directly rather than losing the purchase.
  const userId = notes?.user_id;
  const type = notes?.type;
  const slug = notes?.slug;
  if (!userId || !type) {
    console.error(`payment.captured for order ${orderId} matched no purchase row and had no usable notes`);
    return;
  }

  if (type === "budget_map") {
    await service.from("user_budget_map_purchases").insert({
      user_id: userId,
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      amount_paid: 0, // amount unknown here; the create-route row is the source of truth and should normally exist
      status: "paid",
    });
  } else if (type === "book" || type === "bundle") {
    await service.from("user_book_purchases").insert({
      user_id: userId,
      book_slug: type === "book" ? slug || null : null,
      is_bundle: type === "bundle",
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      amount_paid: 0,
      status: "paid",
    });
  }
}

// Minimal typing for the parts of Razorpay's webhook payload this route
// actually reads — the full payload has many more fields per event type
// that we don't need.
interface RazorpayWebhookPayload {
  event: string;
  payload?: {
    subscription?: {
      entity?: {
        id: string;
        plan_id: string;
        current_end?: number;
        notes?: Record<string, string>;
      };
    };
    payment?: {
      entity?: {
        id: string;
        order_id?: string;
        notes?: Record<string, string>;
      };
    };
  };
}
