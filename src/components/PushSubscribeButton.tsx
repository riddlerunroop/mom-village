"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Turns a base64url VAPID public key into the Uint8Array format the Push
// API's applicationServerKey expects.
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

type Status = "idle" | "checking" | "subscribed" | "unsupported" | "denied";

export default function PushSubscribeButton() {
  const supabase = createClient();
  const [status, setStatus] = useState<Status>("checking");
  const [error, setError] = useState("");

  useEffect(() => {
    async function check() {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        setStatus("unsupported");
        return;
      }
      if (Notification.permission === "denied") {
        setStatus("denied");
        return;
      }
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        const existing = reg ? await reg.pushManager.getSubscription() : null;
        setStatus(existing ? "subscribed" : "idle");
      } catch {
        setStatus("idle");
      }
    }
    check();
  }, []);

  async function enable() {
    setError("");
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!publicKey) {
      setError("Reminders aren't set up on this app yet.");
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus(permission === "denied" ? "denied" : "idle");
        return;
      }

      const reg = await navigator.serviceWorker.register("/sw.js");
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const json = subscription.toJSON();
      // Upsert on endpoint, not a plain insert: the endpoint is unique per
      // browser subscription, so if this device already has a row (e.g. it
      // was cleaned up server-side after a delivery failure but the
      // browser-level subscription itself is still live), this updates that
      // row instead of failing against the unique constraint.
      const { error: upsertError } = await supabase
        .from("user_push_subscriptions")
        .upsert(
          {
            user_id: user.id,
            endpoint: json.endpoint!,
            p256dh: json.keys!.p256dh!,
            auth: json.keys!.auth!,
          },
          { onConflict: "endpoint" }
        );

      if (upsertError) {
        setError("Couldn't turn on reminders — try again in a moment.");
        return;
      }

      setStatus("subscribed");
    } catch {
      setError("Couldn't turn on reminders — try again in a moment.");
    }
  }

  if (status === "checking") return null;

  if (status === "unsupported") {
    return (
      <p className="text-xs text-ink/45">
        Reminders aren&apos;t supported in this browser yet.
      </p>
    );
  }

  if (status === "denied") {
    return (
      <p className="text-xs text-ink/45">
        Notifications are blocked for this site in your browser settings —
        enable them there if you&apos;d like reminders.
      </p>
    );
  }

  if (status === "subscribed") {
    return (
      <p className="text-xs text-sage-deep font-semibold">
        Reminders are on for this device
      </p>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={enable}
        className="text-xs font-semibold px-4 py-2 rounded-full bg-gold-deep text-ivory"
      >
        Turn on reminders
      </button>
      {error && <p className="text-terracotta text-xs mt-2">{error}</p>}
    </div>
  );
}
