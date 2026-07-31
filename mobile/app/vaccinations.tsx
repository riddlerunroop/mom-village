// Vaccinations — native port of src/app/dashboard/vaccinations/page.tsx,
// Phase 6 of the 2026-07-31 agreed build plan. Same UIP schedule logic
// (lib/vaccinationSchedule.ts, ported verbatim), same overdue/due-soon
// banner, same user_vaccination_records table.

import { useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, FlatList, ActivityIndicator, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";
import { hasActiveSubscription } from "../lib/subscription";
import {
  expandScheduleOccurrences,
  getOccurrenceStatus,
  ageInDays,
  doseLabel,
  type DoseStatus,
} from "../lib/vaccinationSchedule";
import { Colors } from "../constants/theme";

const STATUS_STYLES: Record<DoseStatus, { label: string; bg: string; color: string }> = {
  overdue: { label: "Overdue", bg: Colors.terracotta + "26", color: Colors.terracotta },
  due_soon: { label: "Due soon", bg: Colors.gold + "33", color: Colors.goldDeep },
  upcoming: { label: "Upcoming", bg: "transparent", color: Colors.ink + "66" },
  given: { label: "Given", bg: Colors.sageDeep + "26", color: Colors.sageDeep },
};

type Row = { occurrenceKey: string; label: string; status: DoseStatus; regional?: boolean; note?: string };

export default function VaccinationsScreen() {
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [babyDob, setBabyDob] = useState<string | null>(null);
  const [babyName, setBabyName] = useState("your little one");
  const [rows, setRows] = useState<Row[]>([]);
  const [overdueCount, setOverdueCount] = useState(0);
  const [dueSoonCount, setDueSoonCount] = useState(0);

  const load = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const subscribed = await hasActiveSubscription(supabase, user.id);
    setIsSubscribed(subscribed);

    const { data: profile } = await supabase
      .from("profiles")
      .select("baby_dob, baby_name")
      .eq("id", user.id)
      .maybeSingle();

    setBabyDob(profile?.baby_dob ?? null);
    setBabyName(profile?.baby_name || "your little one");

    if (subscribed && profile?.baby_dob) {
      const { data: records } = await supabase
        .from("user_vaccination_records")
        .select("occurrence_key, date_given")
        .eq("user_id", user.id);

      const givenByKey = Object.fromEntries((records || []).map((r) => [r.occurrence_key, r.date_given]));
      const babyAgeDays = ageInDays(profile.baby_dob);
      const occurrences = expandScheduleOccurrences().sort((a, b) => a.dueFromDays - b.dueFromDays);

      let overdue = 0;
      let dueSoon = 0;
      const newRows = occurrences.map((o) => {
        const status = getOccurrenceStatus(o, babyAgeDays, givenByKey[o.occurrenceKey] || null);
        if (status === "overdue") overdue += 1;
        if (status === "due_soon") dueSoon += 1;
        return { occurrenceKey: o.occurrenceKey, label: doseLabel(o.spec), status, regional: o.spec.regional, note: o.spec.note };
      });
      setRows(newRows);
      setOverdueCount(overdue);
      setDueSoonCount(dueSoon);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
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
        <Text style={styles.topBarTitle}>Vaccinations</Text>
        <View style={{ width: 22 }} />
      </View>

      <FlatList
        data={isSubscribed && babyDob ? rows : []}
        keyExtractor={(r) => r.occurrenceKey}
        contentContainerStyle={{ padding: 20 }}
        ListHeaderComponent={
          <>
            <Text style={styles.eyebrow}>{babyName}'s vaccination card</Text>
            <Text style={styles.body}>
              Track doses against the government schedule, and log a new one by photographing the
              card — this is a reference, not medical advice; always follow your pediatrician's
              guidance.
            </Text>

            {!isSubscribed ? (
              <View style={styles.lockedCard}>
                <Text style={styles.cardTitle}>Never lose track of a dose</Text>
                <Text style={styles.body}>
                  Join to track your child's vaccination schedule and get reminders here in the
                  app.
                </Text>
              </View>
            ) : !babyDob ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>
                  Once your baby's born, their vaccination schedule will show up here.
                </Text>
              </View>
            ) : (
              <>
                {(overdueCount > 0 || dueSoonCount > 0) && (
                  <View style={[styles.banner, { backgroundColor: overdueCount > 0 ? Colors.terracotta + "1a" : Colors.gold + "1a" }]}>
                    <Text style={styles.bannerText}>
                      {overdueCount > 0
                        ? `${overdueCount} ${overdueCount === 1 ? "dose is" : "doses are"} overdue`
                        : `${dueSoonCount} ${dueSoonCount === 1 ? "dose is" : "doses are"} coming up soon`}
                    </Text>
                  </View>
                )}

                <Pressable style={styles.logButton} onPress={() => router.push("/vaccinations-log")}>
                  <Text style={styles.logButtonText}>Log a dose</Text>
                </Pressable>
              </>
            )}
          </>
        }
        renderItem={({ item }) => {
          const style = STATUS_STYLES[item.status];
          return (
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowLabel}>{item.label}</Text>
                {(item.regional || item.note) && (
                  <Text style={styles.rowNote}>
                    {item.regional ? "Phased/regional rollout — ask your doctor. " : ""}
                    {item.note}
                  </Text>
                )}
              </View>
              <View style={[styles.statusPill, { backgroundColor: style.bg }]}>
                <Text style={[styles.statusPillText, { color: style.color }]}>{style.label}</Text>
              </View>
            </View>
          );
        }}
      />
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
    marginBottom: 8,
  },
  body: { fontSize: 13, color: Colors.ink + "a6", lineHeight: 19, marginBottom: 16 },
  lockedCard: { backgroundColor: Colors.ivory2, borderRadius: 18, borderWidth: 1, borderColor: Colors.line, padding: 20 },
  cardTitle: { fontSize: 16, fontWeight: "700", color: Colors.indigo, marginBottom: 8 },
  emptyCard: { backgroundColor: Colors.ivory2, borderRadius: 18, borderWidth: 1, borderColor: Colors.line, padding: 24, alignItems: "center" },
  emptyText: { fontSize: 14, fontStyle: "italic", color: Colors.sageDeep, textAlign: "center" },
  banner: { borderRadius: 16, padding: 16, marginBottom: 14 },
  bannerText: { fontSize: 15, fontStyle: "italic", color: Colors.indigo },
  logButton: { backgroundColor: Colors.goldDeep, borderRadius: 999, paddingVertical: 13, alignItems: "center", marginBottom: 16 },
  logButtonText: { color: Colors.ivory, fontWeight: "700", fontSize: 14 },
  row: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 10, backgroundColor: Colors.ivory2, borderRadius: 14, borderWidth: 1, borderColor: Colors.line, padding: 14, marginBottom: 8 },
  rowLabel: { fontSize: 13, fontWeight: "700", color: Colors.ink },
  rowNote: { fontSize: 11, color: Colors.ink + "80", marginTop: 3 },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  statusPillText: { fontSize: 11, fontWeight: "700" },
});
