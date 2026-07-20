import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasTurnedAge } from "@/lib/monthCalculator";
import Birthday3Client from "./Birthday3Client";

export default async function Birthday3Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("baby_name, baby_dob, birthday_3_seen")
    .eq("id", user!.id)
    .maybeSingle();

  // Only relevant once baby's actually turned three and she hasn't seen this yet
  if (!profile?.baby_dob || profile.birthday_3_seen || !hasTurnedAge(profile.baby_dob, 3)) {
    redirect("/dashboard");
  }

  const babyName = profile.baby_name || "your little one";

  return <Birthday3Client babyName={babyName} />;
}
