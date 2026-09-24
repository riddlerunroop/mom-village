-- Adds real self-serve cancellation. A mother's subscription row now tracks
-- whether a cancellation is scheduled for the end of her current paid
-- period, separately from `status` — so hasActiveSubscription() keeps
-- working (it only ever checks status='active' + current_period_end) right
-- up until that date actually passes, matching the account page's own
-- promised copy ("keeping your access active until the end of your current
-- paid period").
alter table subscriptions
  add column if not exists cancel_at_period_end boolean not null default false;
