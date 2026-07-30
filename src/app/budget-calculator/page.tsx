import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasActiveSubscription } from "@/lib/subscription";
import { hasPurchasedBudgetMap } from "@/lib/purchases";
import LockedPreview from "@/components/LockedPreview";
import BuyButton from "@/components/BuyButton";
import BudgetCalculatorClient from "./BudgetCalculatorClient";

// Page-specific metadata added 2026-07-30 — audit finding #6 (Important).
export const metadata: Metadata = {
  title: "Minimum Budget Planner — Mom Village",
  description:
    "A realistic, judgment-free budget for pregnancy through your child's third birthday — built around what you actually need, not an inflated shopping list.",
};

// This route lives outside /dashboard on purpose — it's the stand-alone
// ₹49 front-door product, reachable without a full membership (Razorpay
// integration, 2026-07-30). Sign-in is still required (so a purchase or
// membership can actually be attached to someone), but membership is no
// longer the only way in — buying the map on its own works too.
export default async function BudgetCalculatorPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/budget-calculator");
  }

  const isSubscribed = await hasActiveSubscription(supabase, user!.id);
  const isPurchased = isSubscribed ? true : await hasPurchasedBudgetMap(supabase, user!.id);

  if (!isPurchased) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[480px]">
          <LockedPreview
            title="Your minimum budget planner is ready to be personalized"
            teaser="Get a realistic, judgment-free budget built around your own choices — not an inflated shopping list."
          >
            <p className="text-xs text-ivory/70 mb-3">
              Just want the budget map, not full membership?
            </p>
            <BuyButton type="budget_map" label="Get it for ₹49" />
          </LockedPreview>
        </div>
      </div>
    );
  }

  return <BudgetCalculatorClient />;
}
