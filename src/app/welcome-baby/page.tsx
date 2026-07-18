import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { calculateMonthNumber, monthLabel } from "@/lib/monthCalculator";
import WelcomeBabyClient from "./WelcomeBabyClient";

export default async function WelcomeBabyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("baby_name, baby_dob, birth_welcome_seen")
    .eq("id", user!.id)
    .maybeSingle();

  // Only relevant once baby's actually born and she hasn't seen this yet
  if (!profile?.baby_dob || profile.birth_welcome_seen) {
    redirect("/dashboard");
  }

  const currentMonth = calculateMonthNumber(profile.baby_dob);
  const hasGap = currentMonth > 0; // she's entering DOB after month 0 has already passed
  const babyName = profile.baby_name || "your little one";
  const label = monthLabel(currentMonth);

  return (
    <WelcomeBabyClient
      babyName={babyName}
      hasGap={hasGap}
      currentMonthLabel={label}
    />
  );
}
