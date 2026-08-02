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
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";
import { hasActiveSubscription } from "../../lib/subscription";
import { calculateMonthNumber, monthLabel, journeyProgress } from "../../lib/monthCalculator";
import { getCurrentSeason } from "../../lib/season";
import { Colors, Fonts, iconBadge } from "../../constants/theme";
import ScreenHeader from "../../components/ScreenHeader";
import CollapsibleCard from "../../components/CollapsibleCard";

// One icon color for the whole screen (navy), matching Roop's mockups —
// every icon badge on Today/Care uses the same plain cream circle + navy
// icon, never a different tint per item.
const CHART_SECTIONS = [
  { key: "baby_development", label: "Baby's Development", icon: "leaf-outline" as const },
  { key: "mum_wellbeing", label: "Parenting & Your Wellbeing", icon: "heart-outline" as const },
  { key: "buy_now", label: "Buy / Arrange Now", icon: "bag-handle-outline" as const },
  { key: "hold_off", label: "Hold Off On", icon: "pause-circle-outline" as const },
  { key: "movement_rest", label: "Movement & Rest", icon: "moon-outline" as const },
  { key: "appointments_safety", label: "Appointments & Safety", icon: "shield-checkmark-outline" as const },
];

const PRIORITY_LABELS: Record<string, string> = {
  appointments_safety: "Safety this month",
  buy_now: "Worth buying",
  baby_development: "What's changing",
};
const PRIORITY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  appointments_safety: "shield-checkmark-outline",
  buy_now: "bag-handle-outline",
  baby_development: "sparkles-outline",
};
const PRIORITY_SECTIONS = ["appointments_safety", "buy_now", "baby_development"];

// Short bold takeaway + the rest tucked behind "Read more" — same pattern
// already used for the website's Monthly Chart cards, applied here so the
// priorities card reads as scannable highlights instead of a wall of text.
function splitFirstSentence(text: string): [string, string] {
  const match = text.match(/^(.*?[.!?])(\s+|$)([\s\S]*)$/);
  if (!match) return [text, ""];
  return [match[1], match[3] || ""];
}

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
  const [expandedPriorities, setExpandedPriorities] = useState<Set<string>>(new Set());

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
      router.replace("/onboarding");
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
        <View style={styles.titleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.kicker}>
              welcome back{momName ? `, ${momName}` : ""}
            </Text>
            <Text style={styles.title}>
              {babyName} — {label}
            </Text>
          </View>
          <Ionicons name="heart-outline" size={22} color={Colors.goldDeep} />
        </View>

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
                <View style={styles.prioritiesHeaderRow}>
                  <Ionicons name="star" size={14} color={Colors.gold} />
                  <Text style={styles.prioritiesTitle}>This month's three priorities</Text>
                </View>
                {priorities.map((item) => {
                  const [lead, rest] = splitFirstSentence(item.body);
                  const isOpen = expandedPriorities.has(item.id);
                  return (
                    <View key={item.id} style={styles.priorityRow}>
                      <View style={iconBadge(Colors.indigo, 32)}>
                        <Ionicons
                          name={PRIORITY_ICONS[item.sectionKey] || "sparkles-outline"}
                          size={15}
                          color={Colors.indigo}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.priorityLabel}>
                          {PRIORITY_LABELS[item.sectionKey] || "Worth knowing"}
                        </Text>
                        <Text style={styles.priorityBody}>{lead}</Text>
                        {rest.trim().length > 0 && (
                          <>
                            {isOpen && <Text style={styles.priorityBodyRest}>{rest}</Text>}
                            <Pressable
                              onPress={() =>
                                setExpandedPriorities((prev) => {
                                  const next = new Set(prev);
                                  if (isOpen) next.delete(item.id);
                                  else next.add(item.id);
                                  return next;
                                })
                              }
                            >
                              <Text style={styles.priorityReadMore}>
                                {isOpen ? "Show less" : "Read more"}
                              </Text>
                            </Pressable>
                          </>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            <View style={styles.quickActionsRow}>
              <QuickAction
                icon="medkit-outline"
                label="Track vaccinations"
                onPress={() => router.push("/vaccinations")}
              />
              <QuickAction
                icon="mic-outline"
                label="Log a memory"
                onPress={() => router.push("/memories")}
              />
              <QuickAction
                icon="time-outline"
                label="Past months"
                onPress={() => Linking.openURL("https://www.momvillage.in/dashboard/archive")}
              />
            </View>

            {CHART_SECTIONS.map((section) => {
              const sectionItems = items
                .filter((i) => i.section === section.key)
                .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
              return (
                <CollapsibleCard
                  key={section.key}
                  title={section.label}
                  icon={section.icon}
                >
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

function QuickAction({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.quickAction} onPress={onPress}>
      <Ionicons name={icon} size={16} color={Colors.indigo} />
      <Text style={styles.quickActionText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.ivory },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: Colors.ivory },
  content: { padding: 20, paddingBottom: 60 },
  titleRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12 },
  kicker: { fontSize: 11, fontFamily: Fonts.bodyBold, textTransform: "uppercase", letterSpacing: 1, color: Colors.sageDeep, marginBottom: 4 },
  title: { fontSize: 25, fontFamily: Fonts.display, color: Colors.indigo, marginBottom: 4 },
  progressTrack: { height: 8, borderRadius: 999, backgroundColor: Colors.ivory2, overflow: "hidden", marginBottom: 6, marginTop: 14 },
  progressFill: { height: "100%", backgroundColor: Colors.goldDeep, borderRadius: 999 },
  progressLabel: { fontSize: 11, fontFamily: Fonts.bodyBold, color: Colors.sageDeep, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 20 },
  lockedCard: { backgroundColor: Colors.ivory2, borderRadius: 20, borderWidth: 1, borderColor: Colors.line, padding: 20 },
  lockedTitle: { fontSize: 17, fontFamily: Fonts.bodyBold, color: Colors.indigo, marginBottom: 8 },
  lockedBody: { fontSize: 14, fontFamily: Fonts.body, color: Colors.ink, lineHeight: 20, marginBottom: 16 },
  button: { backgroundColor: Colors.goldDeep, borderRadius: 999, paddingVertical: 13, alignItems: "center" },
  buttonText: { color: Colors.ivory, fontFamily: Fonts.bodyBold, fontSize: 14 },
  prioritiesCard: {
    backgroundColor: Colors.indigo,
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    shadowColor: Colors.indigo,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  prioritiesHeaderRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 14 },
  prioritiesTitle: { fontSize: 12, fontFamily: Fonts.bodyBold, color: Colors.gold, textTransform: "uppercase", letterSpacing: 0.5 },
  priorityRow: { flexDirection: "row", gap: 12, marginBottom: 14 },
  priorityLabel: { fontSize: 10, fontFamily: Fonts.bodyBold, color: Colors.gold, textTransform: "uppercase", marginBottom: 3, letterSpacing: 0.3 },
  priorityBody: { fontSize: 13.5, fontFamily: Fonts.bodySemiBold, color: Colors.ivory, lineHeight: 19 },
  priorityBodyRest: { fontSize: 13, fontFamily: Fonts.body, color: Colors.ivory + "d0", lineHeight: 18, marginTop: 4 },
  priorityReadMore: { fontSize: 12, fontFamily: Fonts.bodyBold, color: Colors.gold, marginTop: 4 },
  quickActionsRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
  quickAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.line,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  quickActionText: { fontSize: 12.5, fontFamily: Fonts.bodyBold, color: Colors.indigo },
  emptyText: { fontSize: 13, fontFamily: Fonts.body, color: Colors.ink + "8c", fontStyle: "italic" },
  itemRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 10, gap: 10 },
  checkbox: { width: 20, height: 20, borderRadius: 6, borderWidth: 1.5, borderColor: Colors.sageDeep, alignItems: "center", justifyContent: "center", marginTop: 1 },
  checkboxDone: { backgroundColor: Colors.sageDeep },
  checkmark: { color: Colors.ivory, fontSize: 13, fontFamily: Fonts.bodyBold },
  itemText: { flex: 1, fontSize: 14, fontFamily: Fonts.body, color: Colors.ink, lineHeight: 20 },
  itemTextDone: { textDecorationLine: "line-through", color: Colors.ink + "70" },
});
