// Wealth tab — real landing screen, Phase 3 of the 2026-07-31 agreed build
// plan. Native port of src/app/dashboard/wealth/page.tsx: a real, saving
// "before you dive in" checklist (user_wealth_checklist, same table as web)
// plus cards to the Budget Planner, Schemes Directory, and Savings
// Guidance sub-screens built this same pass. The three-books link still
// opens the web Library reader — the native Library reader itself is
// Phase 4, not yet built.

import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Linking,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";
import { hasActiveSubscription } from "../../lib/subscription";
import { Colors } from "../../constants/theme";
import ScreenHeader from "../../components/ScreenHeader";

const CHECKLIST_ITEMS = [
  { key: "wealth_check_schemes", label: "Check which government schemes you may qualify for", route: "/wealth-schemes" as const },
  { key: "wealth_check_budget", label: "Get your realistic budget number", route: "/wealth-budget" as const },
  { key: "wealth_check_maternity_plan", label: "Start your maternity cash-flow plan", route: "/wealth-savings" as const },
];

export default function WealthScreen() {
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [doneKeys, setDoneKeys] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    setIsSubscribed(await hasActiveSubscription(supabase, user.id));

    const { data } = await supabase
      .from("user_wealth_checklist")
      .select("item_key")
      .eq("user_id", user.id)
      .in("item_key", CHECKLIST_ITEMS.map((i) => i.key));
    setDoneKeys(new Set((data || []).map((r) => r.item_key)));
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function toggle(key: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const isDone = doneKeys.has(key);
    const next = new Set(doneKeys);
    if (isDone) {
      next.delete(key);
      setDoneKeys(next);
      await supabase.from("user_wealth_checklist").delete().eq("user_id", user.id).eq("item_key", key);
    } else {
      next.add(key);
      setDoneKeys(next);
      await supabase
        .from("user_wealth_checklist")
        .upsert({ user_id: user.id, item_key: key }, { onConflict: "user_id,item_key" });
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.goldDeep} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.eyebrow}>her own security</Text>
        <Text style={styles.title}>Wealth & direction</Text>
        <Text style={styles.intro}>
          Government schemes, how to save for these first years, and how to stay financially
          independent.
        </Text>

        {!isSubscribed ? (
          <View style={styles.lockedCard}>
            <Text style={styles.cardTitle}>Real direction, not just information</Text>
            <Text style={styles.body}>
              Join to get guidance on schemes, savings, and staying financially independent
              through these early years.
            </Text>
            <Pressable
              style={styles.button}
              onPress={() => Linking.openURL("https://www.momvillage.in/dashboard/account")}
            >
              <Text style={styles.buttonText}>Subscribe on momvillage.in</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.checklistCard}>
              <Text style={styles.checklistTitle}>Before you dive in</Text>
              {CHECKLIST_ITEMS.map((item) => {
                const done = doneKeys.has(item.key);
                return (
                  <View key={item.key} style={styles.checklistRow}>
                    <Pressable onPress={() => toggle(item.key)} hitSlop={8}>
                      <Ionicons
                        name={done ? "checkbox" : "square-outline"}
                        size={20}
                        color={done ? Colors.sageDeep : Colors.ink + "55"}
                      />
                    </Pressable>
                    <Pressable style={{ flex: 1 }} onPress={() => router.push(item.route)}>
                      <Text style={[styles.checklistLabel, done && styles.checklistLabelDone]}>
                        {item.label}
                      </Text>
                    </Pressable>
                  </View>
                );
              })}
            </View>

            <Pressable style={styles.featureCard} onPress={() => router.push("/wealth-budget")}>
              <Text style={styles.featureEyebrow}>the real minimum, not the inflated version</Text>
              <Text style={styles.featureTitle}>Minimum Budget Planner</Text>
              <Text style={styles.featureBody}>
                A few honest questions, and a realistic number — pregnancy through your
                child&apos;s third birthday, built around what you actually need.
              </Text>
            </Pressable>

            <Pressable style={styles.card} onPress={() => router.push("/wealth-schemes")}>
              <Text style={styles.cardEyebrow}>what you're entitled to</Text>
              <Text style={styles.cardTitle}>Government Benefits & Savings Directory</Text>
              <Text style={styles.body}>
                PMSMA, JSSK, PMMVY, Ayushman Bharat, Sukanya Samriddhi, and more — what each one
                gives you, and how to actually access it.
              </Text>
            </Pressable>

            <Pressable style={styles.card} onPress={() => router.push("/wealth-savings")}>
              <Text style={styles.cardEyebrow}>general education, not advice</Text>
              <Text style={styles.cardTitle}>Savings & Financial Planning Guidance</Text>
              <Text style={styles.body}>
                Emergency funds, insurance, debt, PPF and Sukanya Samriddhi, and a maternity
                cash-flow planner — the order that tends to serve you best.
              </Text>
            </Pressable>

            <Pressable
              style={styles.card}
              onPress={() => Linking.openURL("https://www.momvillage.in/dashboard/library")}
            >
              <Text style={styles.cardEyebrow}>go deeper</Text>
              <Text style={styles.cardTitle}>Three books on money, in the Library</Text>
              <Text style={styles.body}>
                Money, Understood · Creating Your Own Opportunities · Building Your Financial
                Security — all included with your membership.
              </Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.ivory },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: Colors.ivory },
  eyebrow: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: Colors.sageDeep,
    marginBottom: 6,
  },
  title: { fontSize: 24, fontWeight: "700", color: Colors.indigo, marginBottom: 8 },
  intro: { fontSize: 13, color: Colors.ink + "a6", lineHeight: 19, marginBottom: 18 },
  lockedCard: { backgroundColor: Colors.ivory2, borderRadius: 18, borderWidth: 1, borderColor: Colors.line, padding: 20 },
  button: { backgroundColor: Colors.goldDeep, borderRadius: 999, paddingVertical: 13, alignItems: "center", marginTop: 6 },
  buttonText: { color: Colors.ivory, fontWeight: "700", fontSize: 14 },
  body: { fontSize: 13, color: Colors.ink + "a6", lineHeight: 19 },
  checklistCard: { backgroundColor: Colors.ivory2, borderRadius: 18, borderWidth: 1, borderColor: Colors.line, padding: 16, marginBottom: 14 },
  checklistTitle: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.4, color: Colors.sageDeep, marginBottom: 10 },
  checklistRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  checklistLabel: { fontSize: 13, color: Colors.ink + "d9", flex: 1 },
  checklistLabelDone: { color: Colors.ink + "55", textDecorationLine: "line-through" },
  featureCard: { backgroundColor: Colors.indigo, borderRadius: 18, padding: 18, marginBottom: 14 },
  featureEyebrow: { fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5, color: Colors.gold, marginBottom: 6 },
  featureTitle: { fontSize: 17, fontWeight: "700", color: Colors.ivory, marginBottom: 6 },
  featureBody: { fontSize: 13, color: Colors.ivory + "cc", lineHeight: 18 },
  card: { backgroundColor: Colors.ivory2, borderRadius: 18, borderWidth: 1, borderColor: Colors.line, padding: 18, marginBottom: 14 },
  cardEyebrow: { fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5, color: Colors.sageDeep, marginBottom: 6 },
  cardTitle: { fontSize: 16, fontWeight: "700", color: Colors.indigo, marginBottom: 6 },
});
