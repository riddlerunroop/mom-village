"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Step = "checking" | "phone" | "otp";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState<Step>("checking");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // The moment this page loads, quietly check if she's already logged in.
  // If so, skip the form entirely — no phone number, no OTP, straight to her dashboard.
  // Only show the login form if she genuinely has no active session.
  useEffect(() => {
    async function checkExistingSession() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setStep("phone");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("due_date, baby_dob")
        .eq("id", user.id)
        .maybeSingle();

      if (profile && (profile.due_date || profile.baby_dob)) {
        router.replace("/dashboard");
      } else {
        router.replace("/onboarding");
      }
    }

    checkExistingSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Normalizes to E.164 format e.g. +919876543210, assumes India (+91) if no country code typed
  function formatPhone(raw: string) {
    const digits = raw.replace(/\D/g, "");
    if (digits.startsWith("91") && digits.length === 12) return `+${digits}`;
    if (digits.length === 10) return `+91${digits}`;
    return `+${digits}`;
  }

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formatted = formatPhone(phone);
    const { error } = await supabase.auth.signInWithOtp({
      phone: formatted,
    });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setPhone(formatted);
    setStep("otp");
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token: otp,
      type: "sms",
    });

    if (error) {
      setLoading(false);
      setError(error.message);
      return;
    }

    // Check if she's already completed onboarding (has a profile with a due date/DOB set)
    const userId = data.user?.id;
    if (userId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, due_date, baby_dob")
        .eq("id", userId)
        .maybeSingle();

      setLoading(false);
      if (profile && (profile.due_date || profile.baby_dob)) {
        router.push("/dashboard");
      } else {
        router.push("/onboarding");
      }
    } else {
      setLoading(false);
      router.push("/onboarding");
    }
  }

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center px-6">
      <div className="w-full max-w-[420px]">
        <div className="text-center mb-8">
          <div className="font-display text-2xl font-semibold text-indigo mb-1">
            mom<span className="text-gold-deep">village</span>
          </div>
          <p className="text-sm text-ink/65">
            {step === "checking"
              ? "Just a second…"
              : step === "phone"
              ? "No passwords. Just your phone number."
              : "Check your phone for the code."}
          </p>
        </div>

        <div className="bg-ivory-2 rounded-2xl border border-line p-7">
          {step === "checking" && (
            <p className="text-center text-sm text-sage-deep py-6">
              Checking if you're already signed in…
            </p>
          )}

          {step === "phone" && (
            <form onSubmit={handleSendOtp}>
              <label className="block text-xs font-semibold uppercase tracking-wide text-sage-deep mb-2">
                Phone number
              </label>
              <input
                type="tel"
                required
                placeholder="98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-line bg-ivory text-ink text-base mb-4 focus:outline-none focus:border-indigo"
              />
              {error && (
                <p className="text-terracotta text-sm mb-4">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-full bg-gold-deep text-ivory font-semibold text-sm disabled:opacity-60"
              >
                {loading ? "Sending code…" : "Send me a code"}
              </button>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={handleVerifyOtp}>
              <label className="block text-xs font-semibold uppercase tracking-wide text-sage-deep mb-2">
                6-digit code
              </label>
              <input
                type="text"
                inputMode="numeric"
                required
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-line bg-ivory text-ink text-base mb-4 tracking-[0.3em] text-center focus:outline-none focus:border-indigo"
              />
              {error && (
                <p className="text-terracotta text-sm mb-4">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-full bg-gold-deep text-ivory font-semibold text-sm disabled:opacity-60 mb-3"
              >
                {loading ? "Verifying…" : "Verify & continue"}
              </button>
              <button
                type="button"
                onClick={() => setStep("phone")}
                className="w-full text-center text-xs text-sage-deep font-semibold"
              >
                Wrong number? Go back
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-[13px] text-sage-deep italic font-display mt-6">
          Built by a mom. Not a corporation selling diapers.
        </p>
      </div>
    </div>
  );
}
