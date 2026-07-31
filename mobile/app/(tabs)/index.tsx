// Today tab — the app's home screen, per the 2026-07-31 layout brief.
// Merges what used to be two separate screens (a "Home hub" and a
// separate "Monthly Chart" tab) into one, matching the brief's mockup:
// greeting + stage + progress header, "this month's three priorities,"
// quick actions, then the six Monthly Chart categories as collapsible
// cards. Queries the same monthly_chart_content table as the website.

import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  Linking,
} from "react-native";
import { router } from "expo-router";
import { supabase } from "../../lib/supabase";
import { hasActiveSubscription } from "../../lib/subscription";
import { calculateMonthNumber, monthLabel, journeyProgress } from "../../lib/monthCalculator";
import { getCurrentSeason } from "../../lib/season";
import { Colors } from "../../constants/theme";
import ScreenHeader from "../../components/ScreenHeader";
import CollapsibleCard from "../../components/CollapsibleCard";

const CHART_SECTIONS = [
  { key: "baby_development", label: "Baby's Development", accent: Colors.gold },
  { key: "mum_wellbeing", label: "Parenting & Your Wellbeing", accent: Colors.terracotta },
  { key: "buy_now", label: "Buy / Arrange Now", accent: Colors.sageDeep },
  { key: "hold_off", label: "Hold Off On", accent: Colors.gold },
  { key: "movement_rest", label: "Movement & Rest", accent: Colors.sageDeep },
  { key: "appointments_safety", label: "Appointments & Safety", accent: Colors.terracotta },
];

const PRIORITY_LABELS: Record<string, string> = {
  appointments_safety: "Safety this month",
  buy_now: "Worth buying",
  baby_development: "What's changing",
};
const PRIORITY_SECTIONS = ["appointments_safety", "buy_now", "baby_development"];

type ChartItem = {
  id: string;
  section: string;
  body: string;
  sort_order: number | null;
};

export default function TodayScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [momName, setMomName] = useState<string | null>(null);
  const [babyName, setBabyName] = useState("your little one");
  const [label, setLabel] = useState("");
  const [progress, setProgress] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [items, setItems] = useState<ChartItem[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("baby_dob, due_date, delivery_type, baby_name, mom_name")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile || (!profile.baby_dob && !profile.due_date)) {
      router.replace("/onboarding-needed");
      return;
    }

    const subscribed = await hasActiveSubscription(supabase, user.id);
    setIsSubscribed(subscribed);

    const referenceDate = profile.baby_dob || profile.due_date;
    const monthNumber = calculateMonthNumber(referenceDate);
    setLabel(monthLabel(monthNumber));
    setProgress(journeyProgress(monthNumber));
    setBabyName(profile.baby_name || "your little one");
    setMomName(profile.mom_name ?? null);

    if (subscribed) {
      const deliveryType = profile.delivery_type || "any";
      const season = getCurrentSeason();
      const { data: chartContent } = await supabase
        .from("monthly_chart_content")
        .select("id, section, body, sort_order")
        .eq("month_number", monthNumber)
        .or(`delivery_type.eq.${deliveryType},delivery_type.eq.any`)
        .or(`season.eq.${season},season.eq.any`)
        .order("sort_order");

      setItems(chartContent || []);

      if (chartContent && chartContent.length > 0) {
        const { data: doneRows } = await supabase
          .from("user_monthly_chart_progress")
          .select("content_id")
          .eq("user_id", user.id)
          .in(
            "content_id",
            chartContent.map((c) => c.id)
          );
        setCompletedIds(new Set((doneRows || []).map((r) => r.content_id)));
      } else {
        setCompletedIds(new Set());
      }
    } else {
      setItems([]);
      setCompletedIds(new Set());
    }

    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleItem(id: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const isDone = completedIds.has(id);
    const next = new Set(completedIds);
    if (isDone) {
      next.delete(id);
      setCompletedIds(next);
      await supabase
        .from("user_monthly_chart_progress")
        .delete()
        .eq("user_id", user.id)
        .eq("content_id", id);
    } else {
      next.add(id);
      setCompletedIds(next);
      await supabase
        .from("user_monthly_chart_progress")
        .upsert({ user_id: user.id, content_id: id });
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.goldDeep} />
      </View>
    );
  }

  const priorities = PRIORITY_SECTIONS.map((sectionKey) => {
    const item = items
      .filter((c) => c.section === sectionKey)
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))[0];
    return item ? { ...item, sectionKey } : null;
  }).filter((x): x is NonNullable<typeof x> => x !== null);

  return (
    <View style={styles.screen}>
      <ScreenHeader />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
          />
        }
      >
        <Text style={styles.kicker}>
          welcome back{momName ? `, ${momName}` : ""}
        </Text>
        <Text style={styles.title}>
          {babyName} — {label}
        </Text>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressLabel}>
          {progress}% through the 1000-day journey
        </Text>

        {!isSubscribed ? (
          <View style={styles.lockedCard}>
            <Text style={styles.lockedTitle}>Your full Monthly Chart is waiting</Text>
            <Text style={styles.lockedBody}>
              You're at {label.toLowerCase()} — subscribe on the website to
              see exactly what to buy, skip, and expect this month.
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
            {priorities.length > 0 && (
              <View style={styles.prioritiesCard}>
                <Text style={styles.prioritiesTitle}>This month's three priorities</Text>
                {priorities.map((item, i) => (
                  <View key={item.id} style={styles.priorityRow}>
                    <Text style={styles.priorityLabel}>
                      {PRIORITY_LABELS[item.sectionKey] || "Worth knowing"}
                    </Text>
                    <Text style={styles.priorityBody}>
                      {i + 1}. {item.body}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.quickActionsRow}>
              <QuickAction
                label="Track vaccinations"
                onPress={() => Linking.openURL("https://www.momvillage.in/dashboard/vaccinations")}
              />
              <QuickAction
                label="Log a memory"
                onPress={() => Linking.openURL("https://www.momvillage.in/dashboard/memories")}
              />
              <QuickAction
                label="Past months"
                onPress={() => Linking.openURL("https://www.momvillage.in/dashboard/archive")}
              />
            </View>

            {CHART_SECTIONS.map((section) => {
              const sectionItems = items
                .filter((i) => i.section === section.key)
                .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
              return (
                <CollapsibleCard key={section.key} title={section.label} accent={section.accent}>
                  {sectionItems.length === 0 ? (
                    <Text style={styles.emptyText}>
                      Nothing for this section this month — check back soon.
                    </Text>
                  ) : (
                    sectionItems.map((item) => {
                      const done = completedIds.has(item.id);
                      return (
                        <Pressable
                          key={item.id}
                          style={styles.itemRow}
                          onPress={() => toggleItem(item.id)}
                        >
                          <View style={[styles.checkbox, done && styles.checkboxDone]}>
                            {done && <Text style={styles.checkmark}>✓</Text>}
                          </View>
                          <Text style={[styles.itemText, done && styles.itemTextDone]}>
                            {item.body}
                          </Text>
                        </Pressable>
                      );
                    })
                  )}
                </CollapsibleCard>
              );
            })}
          </>
        )}
      </ScrollView>
    </View>
  );
}

function QuickAction({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.quickAction} onPress={onPress}>
      <Text style={styles.quickActionText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.ivory },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: Colors.ivory },
  content: { padding: 20, paddingBottom: 60 },
  kicker: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, color: Colors.sageDeep, marginBottom: 4 },
  title: { fontSize: 24, fontWeight: "700", color: Colors.indigo, marginBottom: 4 },
  progressTrack: { height: 8, borderRadius: 999, backgroundColor: Colors.ivory2, overflow: "hidden", marginBottom: 6, marginTop: 12 },
  progressFill: { height: "100%", backgroundColor: Colors.goldDeep, borderRadius: 999 },
  progressLabel: { fontSize: 11, fontWeight: "700", color: Colors.sageDeep, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 20 },
  lockedCard: { backgroundColor: Colors.ivory2, borderRadius: 20, borderWidth: 1, borderColor: Colors.line, padding: 20 },
  lockedTitle: { fontSize: 17, fontWeight: "700", color: Colors.indigo, marginBottom: 8 },
  lockedBody: { fontSize: 14, color: Colors.ink, lineHeight: 20, marginBottom: 16 },
  button: { backgroundColor: Colors.goldDeep, borderRadius: 999, paddingVertical: 13, alignItems: "center" },
  buttonText: { color: Colors.ivory, fontWeight: "700", fontSize: 14 },
  prioritiesCard: { backgroundColor: Colors.indigo, borderRadius: 18, padding: 16, marginBottom: 14 },
  prioritiesTitle: { fontSize: 12, fontWeight: "700", color: Colors.gold, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 },
  priorityRow: { marginBottom: 10 },
  priorityLabel: { fontSize: 10, fontWeight: "800", color: Colors.gold, textTransform: "uppercase", marginBottom: 2 },
  priorityBody: { fontSize: 13, color: Colors.ivory, lineHeight: 18 },
  quickActionsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 18 },
  quickAction: { borderWidth: 1.5, borderColor: Colors.sageDeep, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 14 },
  quickActionText: { fontSize: 12, fontWeight: "700", color: Colors.sageDeep },
  emptyText: { fontSize: 13, color: Colors.ink + "8c", fontStyle: "italic" },
  itemRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 10, gap: 10 },
  checkbox: { width: 20, height: 20, borderRadius: 6, borderWidth: 1.5, borderColor: Colors.sageDeep, alignItems: "center", justifyContent: "center", marginTop: 1 },
  checkboxDone: { backgroundColor: Colors.sageDeep },
  checkmark: { color: Colors.ivory, fontSize: 13, fontWeight: "700" },
  itemText: { flex: 1, fontSize: 14, color: Colors.ink, lineHeight: 20 },
  itemTextDone: { textDecorationLine: "line-through", color: Colors.ink + "70" },
});
