// Phone/OTP login — mirrors src/app/login/page.tsx's logic exactly (same
// phone formatting, same validation, same Supabase calls) against the same
// Supabase project, so an account made here works on the website too.

import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { supabase } from "../lib/supabase";
import { Colors } from "../constants/theme";

type Step = "phone" | "otp";

function formatPhone(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length === 12) return `+${digits}`;
  if (digits.length === 10) return `+91${digits}`;
  return `+${digits}`;
}

export default function LoginScreen() {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [formattedPhone, setFormattedPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSendOtp() {
    setError("");
    const rawDigits = phone.replace(/\D/g, "");
    const looksValid =
      rawDigits.length === 10 || (rawDigits.startsWith("91") && rawDigits.length === 12);
    if (!looksValid) {
      setError("Enter a valid 10-digit phone number.");
      return;
    }

    setLoading(true);
    const formatted = formatPhone(phone);
    const { error } = await supabase.auth.signInWithOtp({ phone: formatted });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }
    setFormattedPhone(formatted);
    setStep("otp");
  }

  async function handleVerifyOtp() {
    setError("");
    const otpDigits = otp.replace(/\D/g, "");
    if (otpDigits.length !== 6) {
      setError("Enter the 6-digit code.");
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.verifyOtp({
      phone: formattedPhone,
      token: otp,
      type: "sms",
    });

    if (error) {
      setLoading(false);
      setError(error.message);
      return;
    }

    const userId = data.user?.id;
    if (userId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("due_date, baby_dob")
        .eq("id", userId)
        .maybeSingle();
      setLoading(false);
      if (profile && (profile.due_date || profile.baby_dob)) {
        router.replace("/");
      } else {
        router.replace("/onboarding-needed");
      }
    } else {
      setLoading(false);
      router.replace("/onboarding-needed");
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.wordmark}>
          mom<Text style={{ color: Colors.goldDeep }}>village</Text>
        </Text>
        <Text style={styles.subtitle}>
          {step === "phone"
            ? "No passwords. Just your phone number."
            : "Check your phone for the code."}
        </Text>

        {step === "phone" ? (
          <>
            <Text style={styles.label}>Phone number</Text>
            <TextInput
              style={styles.input}
              keyboardType="phone-pad"
              placeholder="98765 43210"
              placeholderTextColor={Colors.ink + "55"}
              value={phone}
              onChangeText={setPhone}
            />
            {!!error && <Text style={styles.error}>{error}</Text>}
            <Pressable style={styles.button} onPress={handleSendOtp} disabled={loading}>
              {loading ? (
                <ActivityIndicator color={Colors.ivory} />
              ) : (
                <Text style={styles.buttonText}>Send me a code</Text>
              )}
            </Pressable>
          </>
        ) : (
          <>
            <Text style={styles.label}>6-digit code</Text>
            <TextInput
              style={[styles.input, styles.otpInput]}
              keyboardType="number-pad"
              placeholder="123456"
              placeholderTextColor={Colors.ink + "55"}
              maxLength={6}
              value={otp}
              onChangeText={(t) => setOtp(t.replace(/\D/g, "").slice(0, 6))}
            />
            {!!error && <Text style={styles.error}>{error}</Text>}
            <Pressable style={styles.button} onPress={handleVerifyOtp} disabled={loading}>
              {loading ? (
                <ActivityIndicator color={Colors.ivory} />
              ) : (
                <Text style={styles.buttonText}>Verify & continue</Text>
              )}
            </Pressable>
            <Pressable
              onPress={() => {
                setStep("phone");
                setError("");
              }}
            >
              <Text style={styles.link}>Wrong number? Go back</Text>
            </Pressable>
          </>
        )}
      </View>
      <Text style={styles.tagline}>Built by a mom. Not a corporation selling diapers.</Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.ivory,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: Colors.ivory2,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.line,
    padding: 28,
  },
  wordmark: {
    fontSize: 26,
    fontWeight: "600",
    color: Colors.indigo,
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: { fontSize: 14, color: Colors.ink + "a6", textAlign: "center", marginBottom: 20 },
  label: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: Colors.sageDeep,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: Colors.ivory,
    marginBottom: 16,
    color: Colors.ink,
  },
  otpInput: { textAlign: "center", letterSpacing: 6 },
  error: { color: Colors.terracotta, fontSize: 14, marginBottom: 16 },
  button: {
    backgroundColor: Colors.goldDeep,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 8,
  },
  buttonText: { color: Colors.ivory, fontWeight: "700", fontSize: 15 },
  link: { textAlign: "center", color: Colors.sageDeep, fontWeight: "600", fontSize: 13, marginTop: 8 },
  tagline: { textAlign: "center", color: Colors.sageDeep, fontStyle: "italic", marginTop: 24, fontSize: 13 },
});
