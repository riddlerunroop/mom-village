// Minimum Budget Planner — native port of BudgetCalculatorClient.tsx,
// Phase 3 of the 2026-07-31 agreed build plan. Same lib/budgetCalculator.ts
// logic (ported verbatim, no browser dependency), same question flow, same
// user_budget_plan table (inputs jsonb, recomputed fresh on load — never a
// stale saved total).

import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";
import { Colors } from "../constants/theme";
import {
  calculateMinimumBudget,
  formatINR,
  HAND_ME_DOWN_CATEGORY_LABELS,
  NECESSITY_LABELS,
  type BudgetCalculatorInput,
  type BudgetResult,
  type CityTier,
  type DeliveryFacility,
  type DeliveryTypeChoice,
  type DiaperingPlan,
  type FeedingPlan,
  type HandMeDownCategory,
  type InsuranceCoverage,
  type Necessity,
} from "../lib/budgetCalculator";

const NECESSITY_COLOR: Record<Necessity, string> = {
  essential: Colors.terracotta,
  optional: Colors.goldDeep,
  skip_for_now: Colors.ink + "70",
};

const HAND_ME_DOWN_KEYS = Object.keys(HAND_ME_DOWN_CATEGORY_LABELS) as HandMeDownCategory[];

function formatSavedDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function ToggleGroup<T extends string>({
  label,
  helpText,
  options,
  value,
  onChange,
}: {
  label: string;
  helpText?: string;
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (v: T) => void;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {!!helpText && <Text style={styles.helpText}>{helpText}</Text>}
      <View style={styles.toggleRow}>
        {options.map((opt) => (
          <Pressable
            key={opt.value}
            style={[styles.toggleChip, value === opt.value && styles.toggleChipSelected]}
            onPress={() => onChange(opt.value)}
          >
            <Text
              style={[styles.toggleChipText, value === opt.value && styles.toggleChipTextSelected]}
            >
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export default function WealthBudgetScreen() {
  const [currentlyPregnant, setCurrentlyPregnant] = useState<"yes" | "no" | null>(null);
  const [babyCount, setBabyCount] = useState<"1" | "2" | "3" | null>(null);
  const [deliveryFacility, setDeliveryFacility] = useState<DeliveryFacility | null>(null);
  const [deliveryType, setDeliveryType] = useState<DeliveryTypeChoice | null>(null);
  const [cityTier, setCityTier] = useState<CityTier | null>(null);
  const [insuranceCoverage, setInsuranceCoverage] = useState<InsuranceCoverage | null>(null);
  const [feedingPlan, setFeedingPlan] = useState<FeedingPlan | null>(null);
  const [diaperingPlan, setDiaperingPlan] = useState<DiaperingPlan | null>(null);
  const [hasHandMeDowns, setHasHandMeDowns] = useState<"yes" | "no" | null>(null);
  const [handMeDownCategories, setHandMeDownCategories] = useState<HandMeDownCategory[]>([]);

  const [result, setResult] = useState<BudgetResult | null>(null);
  const [loadingSaved, setLoadingSaved] = useState(true);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [editing, setEditing] = useState(true);

  const load = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoadingSaved(false);
      return;
    }
    const { data } = await supabase
      .from("user_budget_plan")
      .select("inputs, updated_at")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data?.inputs) {
      const saved = data.inputs as BudgetCalculatorInput;
      setCurrentlyPregnant(saved.currentlyPregnant ? "yes" : "no");
      setBabyCount(String(Math.min(3, saved.babyCount || 1)) as "1" | "2" | "3");
      setDeliveryFacility(saved.deliveryFacility ?? null);
      setDeliveryType(saved.deliveryType ?? null);
      setCityTier(saved.cityTier ?? "tier2");
      setInsuranceCoverage(saved.insuranceCoverage ?? null);
      setFeedingPlan(saved.feedingPlan ?? null);
      setDiaperingPlan(saved.diaperingPlan ?? null);
      setHasHandMeDowns(saved.hasHandMeDowns ? "yes" : "no");
      setHandMeDownCategories(saved.handMeDownCategories ?? []);
      setResult(calculateMinimumBudget(saved));
      setLastSavedAt(data.updated_at as string);
      setEditing(false);
    }
    setLoadingSaved(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const canCalculate =
    currentlyPregnant !== null &&
    babyCount !== null &&
    (currentlyPregnant === "no" ||
      (deliveryFacility !== null &&
        (deliveryFacility === "public" || (deliveryType !== null && cityTier !== null)))) &&
    feedingPlan !== null &&
    diaperingPlan !== null &&
    hasHandMeDowns !== null;

  async function handleCalculate() {
    if (!canCalculate) return;
    const input: BudgetCalculatorInput = {
      currentlyPregnant: currentlyPregnant === "yes",
      babyCount: Number(babyCount),
      deliveryFacility: deliveryFacility || "public",
      deliveryType: deliveryType || "not_sure",
      cityTier: cityTier || "tier2",
      insuranceCoverage: insuranceCoverage || "not_sure",
      feedingPlan: feedingPlan!,
      diaperingPlan: diaperingPlan!,
      hasHandMeDowns: hasHandMeDowns === "yes",
      handMeDownCategories,
    };
    setResult(calculateMinimumBudget(input));
    setEditing(false);

    setSaveState("saving");
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const nowIso = new Date().toISOString();
      const { error } = await supabase
        .from("user_budget_plan")
        .upsert({ user_id: user.id, inputs: input, updated_at: nowIso }, { onConflict: "user_id" });
      if (!error) {
        setLastSavedAt(nowIso);
        setSaveState("saved");
      } else {
        setSaveState("idle");
      }
    }
  }

  function toggleHandMeDownCategory(cat: HandMeDownCategory) {
    setHandMeDownCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  if (loadingSaved) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.goldDeep} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={22} color={Colors.indigo} />
        </Pressable>
        <Text style={styles.topBarTitle}>Budget Planner</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {editing ? (
          <>
            <Text style={styles.eyebrow}>the real minimum, not the inflated version</Text>
            <Text style={styles.title}>Minimum Budget Planner</Text>
            <Text style={styles.intro}>
              A handful of honest questions, and a realistic number — built around what you
              actually need, not what marketing tells you to buy.
            </Text>
            {!!lastSavedAt && (
              <Text style={styles.savedNote}>
                You have a saved plan from {formatSavedDate(lastSavedAt)} — your answers below are
                already filled in. Update anything and recalculate to save your changes.
              </Text>
            )}

            <View style={styles.card}>
              <ToggleGroup
                label="Are you still pregnant, or has baby arrived?"
                helpText="Decides whether pregnancy & delivery costs are included, or we start from newborn essentials."
                value={currentlyPregnant}
                onChange={setCurrentlyPregnant}
                options={[
                  { value: "yes", label: "Still pregnant" },
                  { value: "no", label: "Baby's here" },
                ]}
              />

              <ToggleGroup
                label="How many babies?"
                helpText="Costs scale per baby — twins/triplets show a higher total, though one-time items like furniture may not fully double in real life."
                value={babyCount}
                onChange={setBabyCount}
                options={[
                  { value: "1", label: "1" },
                  { value: "2", label: "2" },
                  { value: "3", label: "3+" },
                ]}
              />

              {currentlyPregnant === "yes" && (
                <>
                  <ToggleGroup
                    label="Government or private delivery facility?"
                    helpText="Government facilities are free or near-free under JSSK; private hospitals cost more but may offer more choice."
                    value={deliveryFacility}
                    onChange={setDeliveryFacility}
                    options={[
                      { value: "public", label: "Government" },
                      { value: "private", label: "Private" },
                    ]}
                  />

                  {deliveryFacility === "private" && (
                    <>
                      <ToggleGroup
                        label="Normal delivery or C-section?"
                        helpText="A C-section typically costs more at a private hospital — this only affects the estimate, not what actually happens during delivery."
                        value={deliveryType}
                        onChange={setDeliveryType}
                        options={[
                          { value: "normal", label: "Normal" },
                          { value: "c_section", label: "C-section" },
                          { value: "not_sure", label: "Not sure yet" },
                        ]}
                      />
                      <ToggleGroup
                        label="What kind of city will you deliver in?"
                        helpText="Adjusts the private delivery estimate directionally, not as a precise citywide average."
                        value={cityTier}
                        onChange={setCityTier}
                        options={[
                          { value: "metro", label: "Metro" },
                          { value: "tier2", label: "Tier-2" },
                          { value: "tier3_or_rural", label: "Smaller town" },
                        ]}
                      />
                      <ToggleGroup
                        label="Any insurance or government health coverage?"
                        helpText="Doesn't change the number shown — real coverage varies too much by policy — but we'll add a note in your results."
                        value={insuranceCoverage}
                        onChange={setInsuranceCoverage}
                        options={[
                          { value: "private_insurance", label: "Private" },
                          { value: "government_scheme", label: "Govt." },
                          { value: "none", label: "None" },
                          { value: "not_sure", label: "Not sure" },
                        ]}
                      />
                    </>
                  )}
                </>
              )}

              <ToggleGroup
                label="Feeding plan?"
                helpText="Breastfeeding costs close to nothing directly; formula adds a real, ongoing monthly cost."
                value={feedingPlan}
                onChange={setFeedingPlan}
                options={[
                  { value: "breastfeeding", label: "Breastfeeding" },
                  { value: "formula", label: "Formula" },
                  { value: "undecided", label: "Not decided" },
                ]}
              />

              <ToggleGroup
                label="Diapering plan?"
                helpText="Cloth costs more upfront but less over time; disposable is the reverse. Mixed lands in between."
                value={diaperingPlan}
                onChange={setDiaperingPlan}
                options={[
                  { value: "cloth", label: "Cloth" },
                  { value: "disposable", label: "Disposable" },
                  { value: "mixed", label: "Mixed" },
                ]}
              />

              <ToggleGroup
                label="Starting from scratch, or have hand-me-downs?"
                helpText="Even a few hand-me-downs meaningfully lower your newborn essentials cost."
                value={hasHandMeDowns}
                onChange={setHasHandMeDowns}
                options={[
                  { value: "no", label: "From scratch" },
                  { value: "yes", label: "Have some" },
                ]}
              />

              {hasHandMeDowns === "yes" && (
                <View style={styles.field}>
                  <Text style={styles.label}>What do you already have?</Text>
                  <Text style={styles.helpText}>
                    Select what you already have — anything left unchecked is assumed you still
                    need to buy.
                  </Text>
                  <View style={styles.wrapRow}>
                    {HAND_ME_DOWN_KEYS.map((cat) => {
                      const checked = handMeDownCategories.includes(cat);
                      return (
                        <Pressable
                          key={cat}
                          style={[styles.toggleChip, checked && styles.toggleChipSelected]}
                          onPress={() => toggleHandMeDownCategory(cat)}
                        >
                          <Text
                            style={[styles.toggleChipText, checked && styles.toggleChipTextSelected]}
                          >
                            {checked ? "✓ " : ""}
                            {HAND_ME_DOWN_CATEGORY_LABELS[cat]}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              )}

              <Pressable
                style={[styles.button, { opacity: canCalculate ? 1 : 0.5, marginTop: 4 }]}
                onPress={handleCalculate}
                disabled={!canCalculate}
              >
                <Text style={styles.buttonText}>
                  {result ? "Recalculate & save" : "Show my minimum budget"}
                </Text>
              </Pressable>
            </View>
          </>
        ) : (
          result && (
            <>
              <Text style={styles.eyebrow}>your real number</Text>
              <Text style={styles.title}>Your minimum realistic budget</Text>
              <Text style={styles.intro}>
                Pregnancy through your child&apos;s third birthday. Honest, budget-conscious 2026
                estimates for urban India — not a guarantee, and not the premium version. Actual
                costs vary by city, hospital, and choices, so treat this as a floor to plan
                around, with your own buffer on top.
              </Text>
              {!!lastSavedAt && (
                <Text style={styles.savedNote}>
                  {saveState === "saving" ? "Saving…" : `Saved — last updated ${formatSavedDate(lastSavedAt)}`}
                </Text>
              )}

              <View style={styles.totalBox}>
                <Text style={styles.totalLabel}>total minimum, pregnancy through age 3</Text>
                <Text style={styles.totalValue}>
                  {formatINR(result.total.low)} – {formatINR(result.total.high)}
                </Text>
              </View>

              <View style={styles.necessityRow}>
                {(["essential", "optional", "skip_for_now"] as Necessity[]).map((n) => (
                  <View key={n} style={[styles.necessityBox, { borderColor: NECESSITY_COLOR[n] }]}>
                    <Text style={[styles.necessityLabel, { color: NECESSITY_COLOR[n] }]}>
                      {NECESSITY_LABELS[n]}
                    </Text>
                    <Text style={styles.necessityValue}>
                      {formatINR(result.necessityTotals[n].low)}–{formatINR(result.necessityTotals[n].high)}
                    </Text>
                  </View>
                ))}
              </View>

              {result.schemeCallouts.length > 0 && (
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Government support & coverage notes</Text>
                  {result.schemeCallouts.map((c, i) => (
                    <Text key={i} style={styles.bulletText}>
                      •  {c}
                    </Text>
                  ))}
                </View>
              )}

              {result.stages.map((stage) => (
                <View key={stage.key} style={styles.card}>
                  <View style={styles.stageHeaderRow}>
                    <Text style={styles.cardTitle}>{stage.label}</Text>
                    <Text style={styles.stageTotal}>
                      {formatINR(stage.subtotal.low)}–{formatINR(stage.subtotal.high)}
                    </Text>
                  </View>
                  {stage.lines.map((line, i) => (
                    <View key={i} style={styles.lineItem}>
                      <View style={styles.lineHeaderRow}>
                        <Text style={styles.lineLabel}>{line.label}</Text>
                        <Text style={styles.lineRange}>
                          {formatINR(line.range.low)}–{formatINR(line.range.high)}
                        </Text>
                      </View>
                      <Text style={[styles.necessityPill, { color: NECESSITY_COLOR[line.necessity] }]}>
                        {NECESSITY_LABELS[line.necessity]}
                      </Text>
                      <Text style={styles.lineNote}>{line.note}</Text>
                    </View>
                  ))}
                </View>
              ))}

              <Pressable style={styles.buttonOutline} onPress={() => setEditing(true)}>
                <Text style={styles.buttonOutlineText}>Edit my answers</Text>
              </Pressable>
            </>
          )
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.ivory },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: Colors.ivory },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  topBarTitle: { fontSize: 15, fontWeight: "700", color: Colors.indigo },
  eyebrow: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: Colors.sageDeep,
    textAlign: "center",
    marginBottom: 6,
  },
  title: { fontSize: 24, fontWeight: "700", color: Colors.indigo, textAlign: "center", marginBottom: 8 },
  intro: { fontSize: 13, color: Colors.ink + "a6", textAlign: "center", lineHeight: 19, marginBottom: 6 },
  savedNote: { fontSize: 12, color: Colors.sageDeep, fontWeight: "700", textAlign: "center", marginBottom: 14, marginTop: 6 },
  card: {
    backgroundColor: Colors.ivory2,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.line,
    padding: 18,
    marginBottom: 14,
  },
  cardTitle: { fontSize: 15, fontWeight: "700", color: Colors.indigo, marginBottom: 8 },
  field: { marginBottom: 18 },
  label: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    color: Colors.sageDeep,
    marginBottom: 4,
  },
  helpText: { fontSize: 11, color: Colors.ink + "80", marginBottom: 8 },
  toggleRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  wrapRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  toggleChip: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.sageDeep + "66",
  },
  toggleChipSelected: { backgroundColor: Colors.sageDeep, borderColor: Colors.sageDeep },
  toggleChipText: { fontSize: 13, fontWeight: "600", color: Colors.sageDeep },
  toggleChipTextSelected: { color: Colors.ivory },
  button: { backgroundColor: Colors.goldDeep, borderRadius: 999, paddingVertical: 14, alignItems: "center" },
  buttonText: { color: Colors.ivory, fontWeight: "700", fontSize: 14 },
  buttonOutline: {
    borderWidth: 1.5,
    borderColor: Colors.sageDeep,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 30,
  },
  buttonOutlineText: { color: Colors.sageDeep, fontWeight: "700", fontSize: 14 },
  totalBox: { backgroundColor: Colors.indigo, borderRadius: 18, padding: 20, alignItems: "center", marginBottom: 14 },
  totalLabel: { fontSize: 11, textTransform: "uppercase", letterSpacing: 0.6, color: Colors.gold, fontWeight: "700", marginBottom: 6 },
  totalValue: { fontSize: 24, fontWeight: "700", color: Colors.ivory },
  necessityRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  necessityBox: { flex: 1, borderWidth: 1.5, borderRadius: 12, padding: 10, alignItems: "center" },
  necessityLabel: { fontSize: 9, fontWeight: "700", textTransform: "uppercase", marginBottom: 4, textAlign: "center" },
  necessityValue: { fontSize: 11, fontWeight: "700", color: Colors.ink, textAlign: "center" },
  bulletText: { fontSize: 13, color: Colors.ink + "bf", lineHeight: 19, marginBottom: 6 },
  stageHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 },
  stageTotal: { fontSize: 13, fontWeight: "700", color: Colors.goldDeep },
  lineItem: { marginBottom: 12 },
  lineHeaderRow: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  lineLabel: { fontSize: 13, fontWeight: "700", color: Colors.ink, flex: 1 },
  lineRange: { fontSize: 12, color: Colors.ink + "a6" },
  necessityPill: { fontSize: 10, fontWeight: "700", textTransform: "uppercase", marginTop: 2 },
  lineNote: { fontSize: 12, color: Colors.ink + "8c", marginTop: 3, lineHeight: 17 },
});
