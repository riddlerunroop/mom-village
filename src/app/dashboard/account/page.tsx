import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/SignOutButton";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-line last:border-0">
      <span className="text-xs uppercase tracking-[0.08em] text-ink/45 font-semibold">
        {label}
      </span>
      <span className="text-sm text-ink/85 font-medium">{value}</span>
    </div>
  );
}

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("mom_name, baby_name, baby_dob, due_date, city")
    .eq("id", user!.id)
    .maybeSingle();

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("status, plan, current_period_end")
    .eq("user_id", user!.id)
    .eq("status", "active")
    .maybeSingle();

  const subscriptionLabel = subscription
    ? `Active — ${subscription.plan}${
        subscription.current_period_end
          ? ` (renews ${new Date(subscription.current_period_end).toLocaleDateString(
              "en-IN",
              { day: "numeric", month: "short", year: "numeric" }
            )})`
          : ""
      }`
    : "Not subscribed";

  return (
    <main className="max-w-[900px] mx-auto px-6 py-10">
      <div className="mb-2 text-xs uppercase tracking-[0.12em] text-sage-deep font-semibold">
        your account
      </div>
      <h1 className="font-display text-[30px] text-indigo mb-8">
        Account details
      </h1>

      <div className="bg-ivory-2 rounded-2xl border border-line px-6 py-2 mb-8">
        <Row
          label="Phone"
          value={user!.phone ? `+${user!.phone.replace(/^\+/, "")}` : "—"}
        />
        <Row label="Your name" value={profile?.mom_name || "Not set"} />
        {profile?.baby_name && <Row label="Baby's name" value={profile.baby_name} />}
        {profile?.baby_dob && (
          <Row
            label="Baby's DOB"
            value={new Date(profile.baby_dob).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          />
        )}
        {!profile?.baby_dob && profile?.due_date && (
          <Row
            label="Due date"
            value={new Date(profile.due_date).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          />
        )}
        {profile?.city && <Row label="City" value={profile.city} />}
        <Row label="Membership" value={subscriptionLabel} />
      </div>

      <div className="flex items-center gap-5">
        <Link
          href="/"
          className="text-xs font-semibold text-ink/60 hover:text-indigo transition-colors"
        >
          ← Back to homepage
        </Link>
        <SignOutButton />
      </div>
    </main>
  );
}
