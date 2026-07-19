import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasTurnedOne } from "@/lib/monthCalculator";
import Birthday1Client from "./Birthday1Client";

export default async function Birthday1Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("baby_name, baby_dob, birthday_1_seen")
    .eq("id", user!.id)
    .maybeSingle();

  // Only relevant once baby's actually turned one and she hasn't seen this yet
  if (!profile?.baby_dob || profile.birthday_1_seen || !hasTurnedOne(profile.baby_dob)) {
    redirect("/dashboard");
  }

  const babyName = profile.baby_name || "your little one";

  return <Birthday1Client babyName={babyName} />;
}
