// Native onboarding — Phase 2 of the 2026-07-31 phased build plan, so a
// brand-new mobile-only signup no longer gets punted to the website (see
// onboarding-needed.tsx, which now only appears if she somehow lands here
// without a session, or backs out before finishing).
//
// Four screens per the brief, all in one route with internal step state
// (mirrors login.tsx's Step pattern) since the data collected across steps
// gets submitted together:
//   1. Welcome
//   2. About you — name/city/pregnant-or-born/dates
//   3. What matters most right now — multi-select, saved to profiles.interests
//      (new nullable column, migration_51 — no web-onboarding equivalent yet)
//   4. First preview — a compact look at her current month's real content
//
// Submits to `profiles` on leaving step 2 (so her core profile is saved even
// if she quits before finishing) using the exact same upsert shape as the
// website's src/app/onboarding/page.tsx. `interests` is saved as its own
// update once step 3 is confirmed. No city field exists in the web
// onboarding flow either (it's editable later via the web AccountForm) —
// kept optional here for the same reason: nothing later in the app
// currently depends on it being set.

import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { supabase } from "../lib/supabase";
import { Colors } from "../constants/theme";
import { calculateMonthNumber, monthLabel } from "../lib/monthCalculator";

type Step = "welcome" | "about" | "interests" | "preview";
type Stage = "not_born" | "born";

const INTEREST_OPTIONS: { value: string; label: string }[] = [
  { value: "baby_development", label: "Baby's development" },
  { value: "recovery_wellbeing", label: "My recovery and wellbeing" },
  { value: "buy_and_skip", label: "What to buy and what to skip" },
  { value: "money_and_schemes", label: "Money and government schemes" },
  { value: "feeding_and_sleep", label: "Feeding and sleep" },
  { value: "work_and_independence", label: "Returning to work or financial independence" },
  { value: "finding_other_mothers", label: "Finding other mothers" },
];

const DATE_PLACEHOLDER = "YYYY-MM-DD";

function isValidDate(s: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(new Date(s).getTime());
}

export default function OnboardingScreen() {
  const [step, setStep] = useState<Step>("welcome");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Step 2 — About you
  const [momName, setMomName] = useState("");
  const [city, setCity] = useState("");
  const [stage, setStage] = useState<Stage | null>(null);
  const [dueDate, setDueDate] = useState("");
  const [babyDob, setBabyDob] = useState("");
  const [deliveryType, setDeliveryType] = useState<"normal" | "c_section" | null>(null);

  // Step 3 — What matters most
  const [interests, setInterests] = useState<string[]>([]);

  // Step 4 — preview data
  const [monthText, setMonthText] = useState("");

  function toggleInterest(value: string) {
    setInterests((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  }

  async function handleSaveAbout() {
    setError("");
    if (!stage) {
      setError("Let us know whether baby has arrived yet.");
      return;
    }
    if (stage === "not_born" && !isValidDate(dueDate)) {
      setError("Enter your due date as YYYY-MM-DD.");
      return;
    }
    if (stage === "born" && !isValidDate(babyDob)) {
      setError("Enter baby's date of birth as YYYY-MM-DD.");
      return;
    }
    if (stage === "born" && !deliveryType) {
      setError("Let us know how you delivered.");
      return;
    }

    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      setError("Something went wrong — please sign in again.");
      return;
    }

    const { error: upsertError } = await supabase.from("profiles").upsert({
      id: user.id,
      mom_name: momName || null,
      city: city || null,
      due_date: stage === "not_born" ? dueDate : null,
      baby_dob: stage === "born" ? babyDob : null,
      delivery_type: stage === "born" ? deliveryType : "not_yet_delivered",
    });

    setSaving(false);
    if (upsertError) {
      setError(upsertError.message);
      return;
    }
    setStep("interests");
  }

  async function handleSaveInterests() {
    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").update({ interests }).eq("id", user.id);
    }

    // Build the first preview from whatever she just told us.
    const monthNumber =
      stage === "not_born" ? calculateMonthNumber(dueDate) : calculateMonthNumber(babyDob);
    setMonthText(monthLabel(monthNumber));

    setSaving(false);
    setStep("preview");
  }

  function handleFinish() {
    router.replace("/");
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {step === "welcome" && <WelcomeView onNext={() => setStep("about")} />}

        {step === "about" && (
          <AboutView
            momName={momName}
            setMomName={setMomName}
            city={city}
            setCity={setCity}
            stage={stage}
            setStage={setStage}
            dueDate={dueDate}
            setDueDate={setDueDate}
            babyDob={babyDob}
            setBabyDob={setBabyDob}
            deliveryType={deliveryType}
            setDeliveryType={setDeliveryType}
            error={error}
            saving={saving}
            onNext={handleSaveAbout}
          />
        )}

        {step === "interests" && (
          <InterestsView
            interests={interests}
            toggleInterest={toggleInterest}
            saving={saving}
            onNext={handleSaveInterests}
          />
        )}

        {step === "preview" && (
          <PreviewView babyName={momName} monthText={monthText} onFinish={handleFinish} />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function WelcomeView({ onNext }: { onNext: () => void }) {
  return (
    <View style={styles.card}>
      <Text style={styles.wordmark}>
        mom<Text style={{ color: Colors.goldDeep }}>village</Text>
      </Text>
      <Text style={styles.title}>You don&apos;t have to figure this out alone.</Text>
      <Text style={styles.body}>
        We&apos;ll build you a guide for exactly where you are — from a positive test all the way
        through your child&apos;s third birthday. A few quick questions first.
      </Text>
      <Pressable style={styles.button} onPress={onNext}>
        <Text style={styles.buttonText}>Build my village</Text>
      </Pressable>
    </View>
  );
}

function AboutView({
  momName,
  setMomName,
  city,
  setCity,
  stage,
  setStage,
  dueDate,
  setDueDate,
  babyDob,
  setBabyDob,
  deliveryType,
  setDeliveryType,
  error,
  saving,
  onNext,
}: {
  momName: string;
  setMomName: (v: string) => void;
  city: string;
  setCity: (v: string) => void;
  stage: Stage | null;
  setStage: (v: Stage) => void;
  dueDate: string;
  setDueDate: (v: string) => void;
  babyDob: string;
  setBabyDob: (v: string) => void;
  deliveryType: "normal" | "c_section" | null;
  setDeliveryType: (v: "normal" | "c_section") => void;
  error: string;
  saving: boolean;
  onNext: () => void;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>About you</Text>
      <Text style={styles.body}>Just enough to point the app at the right week for you.</Text>

      <Text style={styles.label}>Your name (optional)</Text>
      <TextInput
        style={styles.input}
        value={momName}
        onChangeText={setMomName}
        placeholder="What should we call you?"
        placeholderTextColor={Colors.ink + "55"}
      />

      <Text style={styles.label}>City (optional)</Text>
      <TextInput
        style={styles.input}
        value={city}
        onChangeText={setCity}
        placeholder="Your city"
        placeholderTextColor={Colors.ink + "55"}
      />

      <Text style={[styles.label, { marginTop: 4 }]}>Where are you right now?</Text>
      <View style={styles.choiceRow}>
        <Pressable
          style={[styles.chip, stage === "not_born" && styles.chipSelected]}
          onPress={() => setStage("not_born")}
        >
          <Text style={[styles.chipText, stage === "not_born" && styles.chipTextSelected]}>
            Pregnant
          </Text>
        </Pressable>
        <Pressable
          style={[styles.chip, stage === "born" && styles.chipSelected]}
          onPress={() => setStage("born")}
        >
          <Text style={[styles.chipText, stage === "born" && styles.chipTextSelected]}>
            Baby is here
          </Text>
        </Pressable>
      </View>

      {stage === "not_born" && (
        <>
          <Text style={styles.label}>Due date</Text>
          <TextInput
            style={styles.input}
            value={dueDate}
            onChangeText={setDueDate}
            placeholder={DATE_PLACEHOLDER}
            placeholderTextColor={Colors.ink + "55"}
            keyboardType={Platform.OS === "ios" ? "numbers-and-punctuation" : "default"}
          />
        </>
      )}

      {stage === "born" && (
        <>
          <Text style={styles.label}>Baby&apos;s date of birth</Text>
          <TextInput
            style={styles.input}
            value={babyDob}
            onChangeText={setBabyDob}
            placeholder={DATE_PLACEHOLDER}
            placeholderTextColor={Colors.ink + "55"}
            keyboardType={Platform.OS === "ios" ? "numbers-and-punctuation" : "default"}
          />
          <Text style={styles.label}>How did you deliver?</Text>
          <View style={styles.choiceRow}>
            <Pressable
              style={[styles.chip, deliveryType === "normal" && styles.chipSelected]}
              onPress={() => setDeliveryType("normal")}
            >
              <Text style={[styles.chipText, deliveryType === "normal" && styles.chipTextSelected]}>
                Vaginal birth
              </Text>
            </Pressable>
            <Pressable
              style={[styles.chip, deliveryType === "c_section" && styles.chipSelected]}
              onPress={() => setDeliveryType("c_section")}
            >
              <Text
                style={[styles.chipText, deliveryType === "c_section" && styles.chipTextSelected]}
              >
                C-section
              </Text>
            </Pressable>
          </View>
        </>
      )}

      {!!error && <Text style={styles.error}>{error}</Text>}

      <Pressable style={[styles.button, { marginTop: 20 }]} onPress={onNext} disabled={saving}>
        {saving ? (
          <ActivityIndicator color={Colors.ivory} />
        ) : (
          <Text style={styles.buttonText}>Continue</Text>
        )}
      </Pressable>
    </View>
  );
}

function InterestsView({
  interests,
  toggleInterest,
  saving,
  onNext,
}: {
  interests: string[];
  toggleInterest: (v: string) => void;
  saving: boolean;
  onNext: () => void;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>What matters most right now?</Text>
      <Text style={styles.body}>Pick as many as you like — we&apos;ll show these first.</Text>

      <View style={styles.optionList}>
        {INTEREST_OPTIONS.map((opt) => {
          const selected = interests.includes(opt.value);
          return (
            <Pressable
              key={opt.value}
              style={[styles.optionRow, selected && styles.optionRowSelected]}
              onPress={() => toggleInterest(opt.value)}
            >
              <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable style={[styles.button, { marginTop: 20 }]} onPress={onNext} disabled={saving}>
        {saving ? (
          <ActivityIndicator color={Colors.ivory} />
        ) : (
          <Text style={styles.buttonText}>Show my first month</Text>
        )}
      </Pressable>
    </View>
  );
}

function PreviewView({
  babyName,
  monthText,
  onFinish,
}: {
  babyName: string;
  monthText: string;
  onFinish: () => void;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Your village is ready{babyName ? `, ${babyName}` : ""}.</Text>
      <Text style={styles.body}>
        Here&apos;s where you are right now — your Today tab will keep this updated as you go.
      </Text>

      <View style={styles.previewBox}>
        <Text style={styles.previewLabel}>You&apos;re at</Text>
        <Text style={styles.previewMonth}>{monthText}</Text>
        <Text style={styles.previewNote}>
          Your Today tab has this month&apos;s real chart — development, what to buy, appointments
          and more, all matched to exactly where you are.
        </Text>
      </View>

      <Pressable style={[styles.button, { marginTop: 20 }]} onPress={onFinish}>
        <Text style={styles.buttonText}>Start my village</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.ivory },
  scroll: { flexGrow: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  card: {
    width: "100%",
    maxWidth: 460,
    backgroundColor: Colors.ivory2,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.line,
    padding: 26,
  },
  wordmark: {
    fontSize: 22,
    fontWeight: "600",
    color: Colors.indigo,
    textAlign: "center",
    marginBottom: 14,
  },
  title: { fontSize: 21, fontWeight: "700", color: Colors.indigo, marginBottom: 8 },
  body: { fontSize: 14, color: Colors.ink + "cc", lineHeight: 20, marginBottom: 18 },
  label: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: Colors.sageDeep,
    marginBottom: 8,
    marginTop: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: Colors.ivory,
    marginBottom: 12,
    color: Colors.ink,
  },
  error: { color: Colors.terracotta, fontSize: 14, marginTop: 4, marginBottom: 8 },
  button: {
    backgroundColor: Colors.goldDeep,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonText: { color: Colors.ivory, fontWeight: "700", fontSize: 15 },
  choiceRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.indigo,
  },
  chipSelected: { backgroundColor: Colors.indigo },
  chipText: { fontSize: 14, fontWeight: "700", color: Colors.indigo },
  chipTextSelected: { color: Colors.ivory },
  optionList: { gap: 8 },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.line,
    backgroundColor: Colors.ivory,
  },
  optionRowSelected: { borderColor: Colors.goldDeep, backgroundColor: Colors.gold + "22" },
  optionText: { fontSize: 14, color: Colors.ink, fontWeight: "600" },
  optionTextSelected: { color: Colors.indigo },
  previewBox: {
    backgroundColor: Colors.ivory,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.line,
    padding: 18,
    alignItems: "center",
  },
  previewLabel: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: Colors.sageDeep,
    marginBottom: 4,
  },
  previewMonth: { fontSize: 22, fontWeight: "700", color: Colors.indigo, marginBottom: 10 },
  previewNote: { fontSize: 13, color: Colors.ink + "cc", textAlign: "center", lineHeight: 19 },
});
