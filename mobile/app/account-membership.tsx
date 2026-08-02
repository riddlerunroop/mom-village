// Membership — split out of the old single-page account.tsx, 2026-08-02,
// to match Roop's mockup's drill-down structure. Same honest "self-serve
// cancellation isn't live yet" copy as before — no fake cancel button.

import { useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator, StyleSheet, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";
import { Colors, Fonts, CardStyle } from "../constants/theme";
import DrillHeader from "../components/DrillHeader";

const WEB_BASE = "https://www.momvillage.in";

export default function AccountMembershipScreen() {
  const [loading, setLoading] = useState(true);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [plan, setPlan] = useState("");
  const [renews, setRenews] = useState("");

  const load = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("status, plan, current_period_end")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    if (subscription) {
      setHasSubscription(true);
      setPlan(subscription.plan || "Membership");
      setRenews(
        subscription.current_period_end
          ? new Date(subscription.current_period_end).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : ""
      );
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
      <DrillHeader title="Membership" />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={styles.card}>
          <View style={styles.statusRow}>
            <View style={styles.iconBadge}>
              <Ionicons name="ribbon-outline" size={20} color={Colors.goldDeep} />
            </View>
            <View>
              <Text style={styles.statusLabel}>{hasSubscription ? "Active" : "Not subscribed"}</Text>
              {hasSubscription && !!plan && <Text style={styles.statusSub}>{plan}{renews ? ` · renews ${renews}` : ""}</Text>}
            </View>
          </View>

          <Text style={styles.body}>
            {hasSubscription
              ? "You can cancel anytime — cancelling stops future billing, and you keep access through the end of what you've already paid for."
              : "Join to unlock the full Monthly Chart, Care, Wealth, Community, and all six books."}{" "}
            Self-serve cancellation isn&apos;t live yet — contact us to cancel or ask about your
            membership.
          </Text>

          <Pressable style={styles.button} onPress={() => Linking.openURL(`${WEB_BASE}/dashboard/account`)}>
            <Text style={styles.buttonText}>{hasSubscription ? "Manage on momvillage.in" : "Subscribe on momvillage.in"}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.ivory },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: Colors.ivory },
  card: { ...CardStyle, padding: 18 },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
  iconBadge: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.ivory, borderWidth: 1.5, borderColor: Colors.gold + "70", alignItems: "center", justifyContent: "center" },
  statusLabel: { fontSize: 16, fontFamily: Fonts.bodySemiBold, color: Colors.indigo },
  statusSub: { fontSize: 12, fontFamily: Fonts.body, color: Colors.ink + "80", marginTop: 2 },
  body: { fontSize: 13, fontFamily: Fonts.body, color: Colors.ink + "a6", lineHeight: 19, marginBottom: 16 },
  button: { backgroundColor: Colors.goldDeep, borderRadius: 999, paddingVertical: 13, alignItems: "center" },
  buttonText: { color: Colors.ivory, fontFamily: Fonts.bodyBold, fontSize: 14 },
});
