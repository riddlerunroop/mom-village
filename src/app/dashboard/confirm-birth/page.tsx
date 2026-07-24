import { createClient } from "@/lib/supabase/server";
import ConfirmBirthClient from "./ConfirmBirthClient";

// Reached from the pulsing nav badge / dashboard banner that appears once
// she's in her final pregnancy month or overdue. A short, focused form —
// just the birth date and delivery type — so she can log it the moment she
// remembers, whether that's the day of or weeks later. On save, baby_dob
// gets set and the dashboard layout's existing redirect chain automatically
// takes her to the welcome-baby moment; nothing here duplicates that logic.
export default async function ConfirmBirthPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("baby_name")
    .eq("id", user!.id)
    .maybeSingle();

  return (
    <main className="max-w-[520px] mx-auto px-6 py-14">
      <div className="text-center mb-8">
        <div className="text-xs tracking-[0.12em] uppercase text-sage-deep font-semibold mb-2">
          congratulations
        </div>
        <h1 className="font-display text-[26px] text-indigo">
          Has {profile?.baby_name || "your little one"} arrived?
        </h1>
        <p className="text-sm text-ink/65 mt-2">
          Tell us her birth date and we&apos;ll start counting her very first
          month from the day she was actually born — not your due date.
        </p>
      </div>
      <ConfirmBirthClient />
    </main>
  );
}
