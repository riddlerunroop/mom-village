// Account — standalone route (NOT a tab), reached via the profile icon in
// ScreenHeader on every tab-root screen, per the 2026-07-31 layout brief.
// Full rebuild (child profile editing, real reminders toggle, blocked
// members, privacy/deletion request, help) is Phase 7 of the agreed plan —
// this pass just relocates the existing v1 account screen behind the new
// entry point and adds the placeholder rows the brief calls for, clearly
// marked as not-yet-functional rather than silently missing.

import { useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, ActivityIndicator, StyleSheet, Linking } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";
import { hasActiveSubscription } from "../lib/subscription";
import { Colors } from "../constants/theme";

export default function AccountScreen() {
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState("");
  const [momName, setMomName] = useState<string | null>(null);
  const [babyName, setBabyName] = useState<string | null>(null);
  const [city, setCity] = useState<string | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const load = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    setPhone(user.phone || "");

    const { data: profile } = await supabase
      .from("profiles")
      .select("mom_name, baby_name, city")
      .eq("id", user.id)
      .maybeSingle();

    setMomName(profile?.mom_name ?? null);
    setBabyName(profile?.baby_name ?? null);
    setCity(profile?.city ?? null);

    setIsSubscribed(await hasActiveSubscription(supabase, user.id));
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace("/login");
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
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={22} color={Colors.indigo} />
        </Pressable>
        <Text style={styles.wordmark}>
          mom<Text style={{ color: Colors.goldDeep }}>village</Text>
        </Text>
        <View style={{ width: 22 }} />
      </View>

      <Text style={styles.title}>Account details</Text>

      <View style={styles.card}>
        <Row label="Phone" value={phone} />
        {momName && <Row label="Your name" value={momName} />}
        {babyName && <Row label="Baby's name" value={babyName} />}
        {city && <Row label="City" value={city} />}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Membership</Text>
        <Text style={styles.body}>
          {isSubscribed
            ? "You have an active membership. Manage or cancel it from the website."
            : "You don't have an active membership yet."}
        </Text>
        <Pressable
          style={styles.button}
          onPress={() => Linking.openURL("https://www.momvillage.in/dashboard/account")}
        >
          <Text style={styles.buttonText}>
            {isSubscribed ? "Manage on momvillage.in" : "Subscribe on momvillage.in"}
          </Text>
        </Pressable>
      </View>

      <PlaceholderRow icon="person-outline" label="Child profile" note="Coming soon" />
      <PlaceholderRow icon="notifications-outline" label="Reminders" note="Coming soon — needs native push setup" />
      <PlaceholderRow icon="lock-closed-outline" label="Privacy & account deletion" note="Coming soon" />
      <PlaceholderRow
        icon="help-circle-outline"
        label="Help"
        note="Open on website"
        onPress={() => Linking.openURL("https://www.momvillage.in/contact")}
      />

      <Pressable style={styles.signOut} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign out</Text>
      </Pressable>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function PlaceholderRow({
  icon,
  label,
  note,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  note: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      style={[styles.placeholderRow, !onPress && { opacity: 0.6 }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <Ionicons name={icon} size={20} color={Colors.sageDeep} />
      <Text style={styles.placeholderLabel}>{label}</Text>
      <Text style={styles.placeholderNote}>{note}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.ivory, padding: 20 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: Colors.ivory },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  wordmark: { fontSize: 16, fontWeight: "700", color: Colors.indigo },
  title: { fontSize: 24, fontWeight: "700", color: Colors.indigo, marginBottom: 16 },
  card: { backgroundColor: Colors.ivory2, borderRadius: 18, borderWidth: 1, borderColor: Colors.line, padding: 18, marginBottom: 14 },
  cardTitle: { fontSize: 16, fontWeight: "700", color: Colors.indigo, marginBottom: 8 },
  body: { fontSize: 14, color: Colors.ink, lineHeight: 20, marginBottom: 14 },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.line },
  rowLabel: { fontSize: 12, fontWeight: "700", color: Colors.sageDeep, textTransform: "uppercase" },
  rowValue: { fontSize: 14, color: Colors.ink },
  button: { backgroundColor: Colors.goldDeep, borderRadius: 999, paddingVertical: 12, alignItems: "center" },
  buttonText: { color: Colors.ivory, fontWeight: "700", fontSize: 14 },
  placeholderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.ivory2,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.line,
    padding: 14,
    marginBottom: 10,
  },
  placeholderLabel: { flex: 1, fontSize: 14, fontWeight: "600", color: Colors.indigo },
  placeholderNote: { fontSize: 11, color: Colors.ink + "80" },
  signOut: { alignItems: "center", paddingVertical: 14, marginTop: 8 },
  signOutText: { color: Colors.terracotta, fontWeight: "700", fontSize: 14 },
});
