// Account — standalone route (NOT a tab), reached via the profile icon in
// ScreenHeader on every tab-root screen. Rebuilt 2026-08-02 to match Roop's
// mockup: a profile summary card up top, then tappable rows (Membership /
// Child profile / Reminder / Privacy & account deletion / Help) drilling
// into their own screens, instead of one long scrolling form. All the real
// functionality from the prior build (editable fields, blocked-members
// unblock, deletion request, legal links) is preserved — just relocated
// into account-profile.tsx / account-child.tsx / account-membership.tsx /
// account-privacy.tsx / account-help.tsx.
//
// The mockup's Reminder row shows a toggle switch — deliberately NOT built
// as a real control here: native push needs its own APNs/FCM setup (still
// a documented Phase 8 gap), and this app never ships a toggle that looks
// live but does nothing. Instead this row shows her REAL next-due dose
// (computed from the same UIP schedule already tracked on /vaccinations)
// and taps through to that real screen, where the actual due/overdue
// banner already lives.

import { useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "../lib/supabase";
import { hasActiveSubscription } from "../lib/subscription";
import {
  expandScheduleOccurrences,
  getOccurrenceStatus,
  ageInDays,
  doseLabel,
} from "../lib/vaccinationSchedule";
import { Colors, Fonts, CardStyle } from "../constants/theme";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function AccountScreen() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [momName, setMomName] = useState("");
  const [phone, setPhone] = useState("");
  const [hasSubscription, setHasSubscription] = useState(false);
  const [nextDose, setNextDose] = useState<{ label: string; when: string } | null>(null);

  const load = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    setPhone(user.phone || "");

    const subscribed = await hasActiveSubscription(supabase, user.id);
    setHasSubscription(subscribed);

    const { data: profile } = await supabase
      .from("profiles")
      .select("mom_name, baby_dob")
      .eq("id", user.id)
      .maybeSingle();
    setMomName(profile?.mom_name ?? "");

    if (subscribed && profile?.baby_dob) {
      const { data: records } = await supabase
        .from("user_vaccination_records")
        .select("occurrence_key, date_given")
        .eq("user_id", user.id);
      const givenByKey = Object.fromEntries((records || []).map((r) => [r.occurrence_key, r.date_given]));
      const babyAgeDays = ageInDays(profile.baby_dob);
      const upcoming = expandScheduleOccurrences()
        .sort((a, b) => a.dueFromDays - b.dueFromDays)
        .find((o) => getOccurrenceStatus(o, babyAgeDays, givenByKey[o.occurrenceKey] || null) !== "given");

      if (upcoming) {
        const dueDays = upcoming.dueUntilDays ?? upcoming.dueFromDays + 30;
        const dueDate = new Date(new Date(profile.baby_dob).getTime() + dueDays * 24 * 60 * 60 * 1000);
        setNextDose({ label: doseLabel(upcoming.spec), when: formatDate(dueDate.toISOString()) });
      } else {
        setNextDose(null);
      }
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

  const displayName = momName || "Your profile";
  const initial = (momName || "?").trim().charAt(0).toUpperCase() || "?";

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 20, paddingBottom: 50 }}>
      <View style={[styles.topBar, { marginTop: insets.top }]}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={22} color={Colors.indigo} />
        </Pressable>
        <Text style={styles.wordmark}>
          mom<Text style={{ color: Colors.goldDeep }}>village</Text>
        </Text>
        <View style={{ width: 22 }} />
      </View>

      <Text style={styles.title}>Account details</Text>

      <Pressable style={styles.profileCard} onPress={() => router.push("/account-profile")}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.profileName}>{displayName}</Text>
          <Text style={styles.profileSub}>{phone}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={Colors.ink + "66"} />
      </Pressable>

      <View style={styles.rowGroup}>
        <AccountRow
          icon="ribbon-outline"
          label="Membership"
          value={hasSubscription ? "Active" : "Not subscribed"}
          valueColor={hasSubscription ? Colors.goldDeep : Colors.ink + "80"}
          onPress={() => router.push("/account-membership")}
        />
        <AccountRow
          icon="person-outline"
          label="Child profile"
          onPress={() => router.push("/account-child")}
        />
        <AccountRow
          icon="shield-checkmark-outline"
          label={nextDose ? `Next vaccination: ${nextDose.label}` : "Vaccinations"}
          note={nextDose ? nextDose.when : "Track your child's schedule"}
          onPress={() => router.push("/vaccinations")}
          last
        />
      </View>

      <View style={styles.rowGroup}>
        <AccountRow
          icon="lock-closed-outline"
          label="Privacy & account deletion"
          onPress={() => router.push("/account-privacy")}
        />
        <AccountRow icon="help-circle-outline" label="Help" onPress={() => router.push("/account-help")} last />
      </View>

      <View style={styles.motifRow}>
        <Ionicons name="flower-outline" size={22} color={Colors.gold} />
      </View>

      <Pressable
        style={styles.signOut}
        onPress={async () => {
          await supabase.auth.signOut();
          router.replace("/login");
        }}
      >
        <Text style={styles.signOutText}>Sign out</Text>
      </Pressable>
    </ScrollView>
  );
}

function AccountRow({
  icon,
  label,
  value,
  valueColor,
  note,
  onPress,
  last,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  valueColor?: string;
  note?: string;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <Pressable style={[styles.row, !last && styles.rowDivider]} onPress={onPress}>
      <Ionicons name={icon} size={20} color={Colors.indigo} style={{ marginRight: 12 }} />
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        {!!note && <Text style={styles.rowNote}>{note}</Text>}
      </View>
      {!!value && <Text style={[styles.rowValue, valueColor && { color: valueColor }]}>{value}</Text>}
      <Ionicons name="chevron-forward" size={18} color={Colors.ink + "66"} style={{ marginLeft: 8 }} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.ivory },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: Colors.ivory },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  wordmark: { fontSize: 17, fontFamily: Fonts.displayBold, color: Colors.indigo },
  title: { fontSize: 26, fontFamily: Fonts.display, color: Colors.indigo, marginBottom: 18 },
  profileCard: { ...CardStyle, flexDirection: "row", alignItems: "center", padding: 16, marginBottom: 16, gap: 14 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.goldDeep, alignItems: "center", justifyContent: "center" },
  avatarText: { color: Colors.ivory, fontFamily: Fonts.bodyBold, fontSize: 19 },
  profileName: { fontSize: 16, fontFamily: Fonts.bodySemiBold, color: Colors.indigo, marginBottom: 2 },
  profileSub: { fontSize: 12, fontFamily: Fonts.body, color: Colors.ink + "80" },
  rowGroup: { ...CardStyle, marginBottom: 16, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 16 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: Colors.line },
  rowLabel: { fontSize: 14, fontFamily: Fonts.bodySemiBold, color: Colors.indigo },
  rowNote: { fontSize: 11, fontFamily: Fonts.body, color: Colors.ink + "80", marginTop: 2 },
  rowValue: { fontSize: 13, fontFamily: Fonts.bodyBold, color: Colors.ink + "80", marginRight: 2 },
  motifRow: { alignItems: "center", marginVertical: 20 },
  signOut: { alignItems: "center", paddingVertical: 16 },
  signOutText: { color: Colors.terracotta, fontFamily: Fonts.bodyBold, fontSize: 14 },
});
