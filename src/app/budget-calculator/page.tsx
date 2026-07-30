import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasActiveSubscription } from "@/lib/subscription";
import LockedPreview from "@/components/LockedPreview";
import BudgetCalculatorClient from "./BudgetCalculatorClient";

// Page-specific metadata added 2026-07-30 — audit finding #6 (Important).
export const metadata: Metadata = {
  title: "Minimum Budget Planner — Mom Village",
  description:
    "A realistic, judgment-free budget for pregnancy through your child's third birthday — built around what you actually need, not an inflated shopping list.",
};

// This route lives outside /dashboard on purpose — it's designed to
// eventually work as a stand-alone ₹49 front-door product, reachable
// before someone subscribes, once Razorpay is wired up. Until then it's
// gated the same way everything else is: sign in + active subscription.
export default async function BudgetCalculatorPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const isSubscribed = await hasActiveSubscription(supabase, user!.id);

  if (!isSubscribed) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[480px]">
          <LockedPreview
            title="Your minimum budget planner is ready to be personalized"
            teaser="Join to get a realistic, judgment-free budget built around your own choices — not an inflated shopping list."
          />
        </div>
      </div>
    );
  }

  return <BudgetCalculatorClient />;
}
