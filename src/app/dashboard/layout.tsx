import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/SignOutButton";
import DashboardNav from "@/components/DashboardNav";

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
    .select("due_date, baby_dob")
    .eq("id", user!.id)
    .maybeSingle();

  if (!profile || (!profile.due_date && !profile.baby_dob)) {
    redirect("/onboarding");
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
