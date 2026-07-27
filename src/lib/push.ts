import webpush from "web-push";
import { createServiceClient } from "@/lib/supabase/service";

// Shared send utility — designed once to serve all three use cases scoped
// back when push notifications were first discussed (vaccination due-date
// reminders, weekly Care Chart nudges, monthly chart delivery messages).
// Only the vaccination reminder actually calls this today; the other two
// can reuse it later without any change here.

let configured = false;
function ensureConfigured() {
  if (configured) return;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:rb0403@gmail.com";
  if (!publicKey || !privateKey) {
    throw new Error("Push isn't set up yet — NEXT_PUBLIC_VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY are missing.");
  }
  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
}

// Sends one notification to every device a mother has subscribed on, and
// quietly forgets any subscription the browser reports as gone (410/404 —
// she uninstalled, cleared data, or switched browsers) so the table doesn't
// accumulate dead endpoints forever.
export async function sendPushToUser(
  userId: string,
  payload: { title: string; body: string; url?: string }
) {
  ensureConfigured();
  const supabase = createServiceClient();

  const { data: subscriptions } = await supabase
    .from("user_push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("user_id", userId);

  if (!subscriptions || subscriptions.length === 0) return { sent: 0 };

  let sent = 0;
  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        JSON.stringify(payload)
      );
      sent += 1;
    } catch (err: unknown) {
      const statusCode = (err as { statusCode?: number })?.statusCode;
      if (statusCode === 404 || statusCode === 410) {
        await supabase.from("user_push_subscriptions").delete().eq("id", sub.id);
      }
      // Other errors (network blips, etc.) are left alone — no need to drop
      // a subscription just because one send attempt failed.
    }
  }
  return { sent };
}
