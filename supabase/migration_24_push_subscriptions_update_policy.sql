-- MOM VILLAGE — MIGRATION 24
-- migration_23 gave user_push_subscriptions SELECT/INSERT/DELETE policies
-- but not UPDATE. Found during a pre-Razorpay site health check, 2026-07-27:
-- PushSubscribeButton.tsx was hardened to upsert (on the endpoint unique
-- constraint) instead of a plain insert, so re-subscribing on a device that
-- already has a row updates it instead of failing — but an upsert's update
-- path needs its own RLS policy, which was missing. Without this, the
-- upsert's UPDATE branch would be silently denied by RLS on the rare device
-- that hits it.

create policy "A mother can update her own push subscription" on user_push_subscriptions
  for update using (auth.uid() = user_id);
