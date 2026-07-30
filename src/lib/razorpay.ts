import Razorpay from "razorpay";
import crypto from "crypto";

// Server-side Razorpay client. Never import this into anything that runs
// in the browser — RAZORPAY_KEY_SECRET must never be exposed client-side.
export function getRazorpayClient() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) {
    throw new Error(
      "RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are not set — add them to your environment before accepting payments."
    );
  }
  return new Razorpay({ key_id, key_secret });
}

// Constant-time string comparison — avoids leaking timing information about
// how much of the signature matched, same reasoning as any other secret
// comparison (password hashes, API tokens).
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function hmac(secret: string, payload: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

// One-time payment (Orders API) — Checkout.js hands back order_id +
// payment_id + signature after a successful payment. Formula per Razorpay's
// docs: hmac_sha256(order_id + "|" + payment_id, key_secret).
export function verifyOrderPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;
  const expected = hmac(secret, `${orderId}|${paymentId}`);
  return safeEqual(expected, signature);
}

// Subscriptions — Checkout.js hands back payment_id + subscription_id +
// signature. Formula: hmac_sha256(payment_id + "|" + subscription_id,
// key_secret) — note the argument order is reversed vs. orders.
export function verifySubscriptionPaymentSignature(
  paymentId: string,
  subscriptionId: string,
  signature: string
): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;
  const expected = hmac(secret, `${paymentId}|${subscriptionId}`);
  return safeEqual(expected, signature);
}

// Webhook signature — verified against the raw (unparsed) request body
// using a *separate* secret (RAZORPAY_WEBHOOK_SECRET, set when the webhook
// is created in the Razorpay dashboard, not the API key secret). Passing
// the already-JSON-parsed-and-restringified body here is a common cause of
// mismatches — the caller must pass the exact raw text Razorpay sent.
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return false;
  const expected = hmac(secret, rawBody);
  return safeEqual(expected, signature);
}

// Prices in paise (smallest currency unit), matching Razorpay's amount
// convention. Kept here as the one place these figures live for the
// payment layer — the homepage's own copy (src/app/page.tsx) states the
// same rupee figures separately and should be kept in sync by hand if
// these ever change.
export const PRICES = {
  membershipMonthly: 29900, // ₹299/month
  bookIndividual: 24900, // ₹249/book
  bookBundle: 84900, // ₹849 for all six
  budgetMap: 4900, // ₹49 one-time
} as const;
