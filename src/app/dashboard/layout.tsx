import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/SignOutButton";
import DashboardNav from "@/components/DashboardNav";
import { hasTurnedOne, hasTurnedAge } from "@/lib/monthCalculator";

// Shared shell for every logged-in page: checks she's authenticated and has
// completed onboarding, then renders the same header + nav everywhere —
// this is what makes the app feel like one continuous village, not
// disconnected pages.
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("due_date, baby_dob, birth_welcome_seen, birthday_1_seen, birthday_2_seen, birthday_3_seen")
    .eq("id", user!.id)
    .maybeSingle();

  if (!profile || (!profile.due_date && !profile.baby_dob)) {
    redirect("/onboarding");
  }

  // If baby's born and she hasn't seen the welcome moment yet, show it first —
  // but don't loop: skip this check if she's already on that page.
  if (profile.baby_dob && !profile.birth_welcome_seen) {
    redirect("/welcome-baby");
  }

  // Once she's past the birth-welcome moment, check for the first-birthday
  // celebration — only relevant once baby's actually turned one.
  if (
    profile.baby_dob &&
    !profile.birthday_1_seen &&
    hasTurnedOne(profile.baby_dob)
  ) {
    redirect("/birthday-1");
  }

  // Then the second-birthday celebration — only once baby's actually turned two.
  if (
    profile.baby_dob &&
    !profile.birthday_2_seen &&
    hasTurnedAge(profile.baby_dob, 2)
  ) {
    redirect("/birthday-2");
  }

  // Then the third-birthday celebration — only once baby's actually turned
  // three. This also sends off the Monthly Chart's 1,000-day journey, which
  // concludes at month 36 / the third birthday.
  if (
    profile.baby_dob &&
    !profile.birthday_3_seen &&
    hasTurnedAge(profile.baby_dob, 3)
  ) {
    redirect("/birthday-3");
  }

  return (
    <div className="min-h-screen bg-ivory">
      <header className="border-b border-line px-6 py-5 flex items-center justify-between max-w-[900px] mx-auto">
        <div className="font-display text-xl font-semibold text-indigo">
          mom<span className="text-gold-deep">village</span>
        </div>
        <SignOutButton />
      </header>
      <DashboardNav />
      {children}
    </div>
  );
}
