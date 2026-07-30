import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { sendPushToUser } from "@/lib/push";
import { expandScheduleOccurrences, ageInDays, doseLabel } from "@/lib/vaccinationSchedule";

// Runs daily via Vercel Cron (see vercel.json). This is the first of the
// three push use cases scoped when notifications were first discussed
// (vaccination reminders, weekly Care Chart nudges, monthly chart delivery
// messages) — the other two can be built the same way later, as their own
// cron routes calling the same sendPushToUser() from src/lib/push.ts.
//
// Trigger, kept deliberately simple for this first pass: notify a mother
// the day a dose's due window opens (babyAgeDays === dueFromDays), once per
// day per mother, batched into a single notification if more than one dose
// opens on the same day (several UIP doses share the 6/10/14-week points).
// This does not yet re-notify for doses that go on to become overdue
// without being logged — a reasonable next refinement, not built here.
export async function GET(req: NextRequest) {
  // Fail closed, not open — fixed 2026-07-30 (audit finding #7, Important).
  // The previous check only rejected requests if CRON_SECRET was *set and
  // didn't match*; if the env var were ever missing (e.g. accidentally
  // removed from Vercel), the route accepted requests from anyone instead
  // of rejecting them. Now a missing secret is treated as misconfiguration,
  // not an open door.
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const today = new Date().toISOString().slice(0, 10);

  // Only mothers who (a) have a subscribed device and (b) have a baby
  // already born (pregnancy has no vaccination schedule yet) are candidates.
  const { data: subs } = await supabase
    .from("user_push_subscriptions")
    .select("user_id");
  const subscribedUserIds = Array.from(new Set((subs || []).map((s) => s.user_id)));
  if (subscribedUserIds.length === 0) {
    return NextResponse.json({ checked: 0, notified: 0 });
  }

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, baby_dob, baby_name")
    .in("id", subscribedUserIds)
    .not("baby_dob", "is", null);

  // Mirrors src/lib/subscription.ts's hasActiveSubscription() logic (status
  // = active AND, if an expiry is set, it hasn't passed yet) — duplicated
  // rather than imported since that helper takes a per-request Supabase
  // client tied to a logged-in user, not the service-role client this cron
  // route needs to check every mother at once.
  const { data: activeSubs } = await supabase
    .from("subscriptions")
    .select("user_id, current_period_end")
    .eq("status", "active")
    .in("user_id", subscribedUserIds);
  const now = new Date();
  const activeUserIds = new Set(
    (activeSubs || [])
      .filter((s) => !s.current_period_end || new Date(s.current_period_end) > now)
      .map((s) => s.user_id)
  );

  const { data: reminderLog } = await supabase
    .from("user_vaccination_reminder_log")
    .select("user_id, last_sent_date")
    .in("user_id", subscribedUserIds);
  const lastSentByUser = Object.fromEntries(
    (reminderLog || []).map((r) => [r.user_id, r.last_sent_date])
  );

  const occurrences = expandScheduleOccurrences();
  let notified = 0;

  for (const profile of profiles || []) {
    if (!activeUserIds.has(profile.id)) continue;
    if (lastSentByUser[profile.id] === today) continue;
    if (!profile.baby_dob) continue;

    const babyAgeDays = ageInDays(profile.baby_dob);

    const { data: records } = await supabase
      .from("user_vaccination_records")
      .select("occurrence_key")
      .eq("user_id", profile.id);
    const givenKeys = new Set((records || []).map((r) => r.occurrence_key));

    const dueToday = occurrences.filter(
      (o) => o.dueFromDays === babyAgeDays && !givenKeys.has(o.occurrenceKey)
    );

    if (dueToday.length === 0) continue;

    const babyName = profile.baby_name || "your little one";
    const body =
      dueToday.length === 1
        ? `${doseLabel(dueToday[0].spec)} is due today for ${babyName}.`
        : `${dueToday.length} vaccinations are due today for ${babyName} — open the app to see which.`;

    await sendPushToUser(profile.id, {
      title: "A vaccination is due today",
      body,
      url: "/dashboard/vaccinations",
    });

    await supabase
      .from("user_vaccination_reminder_log")
      .upsert({ user_id: profile.id, last_sent_date: today }, { onConflict: "user_id" });

    notified += 1;
  }

  return NextResponse.json({ checked: (profiles || []).length, notified });
}
