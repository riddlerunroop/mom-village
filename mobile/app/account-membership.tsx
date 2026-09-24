// Membership — split out of the old single-page account.tsx, 2026-08-02,
// to match Roop's mockup's drill-down structure.
// Real self-serve cancellation added 2026-09-24 — calls the same
// /api/razorpay/subscription/cancel route the website uses, via
// authedFetch (Bearer token, since native has no cookie session). Always
// cancel_at_cycle_end, never immediate.

import { useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator, StyleSheet, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";
import { authedFetch } from "../lib/api";
import { Colors, Fonts, CardStyle } from "../constants/theme";
import DrillHeader from "../components/DrillHeader";

const WEB_BASE = "https://www.momvillage.in";

export default function AccountMembershipScreen() {
  const [loading, setLoading] = useState(true);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [plan, setPlan] = useState("");
  const [renews, setRenews] = useState("");
  const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("status, plan, current_period_end, cancel_at_period_end")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    if (subscription) {
      setHasSubscription(true);
      setPlan(subscription.plan || "Membership");
      setCancelAtPeriodEnd(Boolean(subscription.cancel_at_period_end));
      setRenews(
        subscription.current_period_end
          ? new Date(subscription.current_period_end).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : ""
      );
    } else {
      setHasSubscription(false);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function cancelSubscription() {
    setCancelling(true);
    setError("");
    try {
      const res = await authedFetch("/api/razorpay/subscription/cancel", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Couldn't cancel just now. Try again in a moment.");
        setCancelling(false);
        return;
      }
      setConfirming(false);
      setCancelling(false);
      load();
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
      setCancelling(false);
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
      <DrillHeader title="Membership" />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={styles.card}>
          <View style={styles.statusRow}>
            <View style={styles.iconBadge}>
              <Ionicons name="ribbon-outline" size={20} color={Colors.goldDeep} />
            </View>
            <View>
              <Text style={styles.statusLabel}>
                {hasSubscription ? (cancelAtPeriodEnd ? "Cancelling" : "Active") : "Not subscribed"}
              </Text>
              {hasSubscription && !!plan && (
                <Text style={styles.statusSub}>
                  {plan}
                  {renews ? ` · ${cancelAtPeriodEnd ? "active until" : "renews"} ${renews}` : ""}
                </Text>
              )}
            </View>
          </View>

          {hasSubscription ? (
            cancelAtPeriodEnd ? (
              <Text style={styles.body}>
                Cancellation scheduled — you won&apos;t be charged again, and your access
                stays active until {renews || "the end of your current period"}.
              </Text>
            ) : confirming ? (
              <>
                <Text style={styles.body}>
                  This stops future renewals — you won&apos;t be charged again, and your
                  access stays exactly as it is{renews ? ` until ${renews}` : ""}.
                </Text>
                <View style={styles.confirmRow}>
                  <Pressable
                    style={[styles.button, styles.dangerButton, { flex: 1 }]}
                    onPress={cancelSubscription}
                    disabled={cancelling}
                  >
                    <Text style={styles.buttonText}>
                      {cancelling ? "Cancelling…" : "Yes, cancel"}
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[styles.button, styles.secondaryButton, { flex: 1 }]}
                    onPress={() => setConfirming(false)}
                  >
                    <Text style={styles.secondaryButtonText}>Never mind</Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.body}>
                  You can cancel anytime — cancelling stops future billing, and you keep
                  access through the end of what you&apos;ve already paid for.
                </Text>
                <Pressable style={[styles.button, styles.secondaryButton]} onPress={() => setConfirming(true)}>
                  <Text style={styles.secondaryButtonText}>Cancel subscription</Text>
                </Pressable>
              </>
            )
          ) : (
            <>
              <Text style={styles.body}>
                Join to unlock the full Monthly Chart, Care, Wealth, Community, and all six
                books.
              </Text>
              <Pressable style={styles.button} onPress={() => Linking.openURL(`${WEB_BASE}/dashboard/account`)}>
                <Text style={styles.buttonText}>Subscribe on momvillage.in</Text>
              </Pressable>
            </>
          )}

          {!!error && <Text style={styles.errorText}>{error}</Text>}
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
  button: { backgroundColor: Colors.goldDeep, borderRadius: 999, paddingVertical: 13, alignItems: "center", marginTop: 4 },
  buttonText: { color: Colors.ivory, fontFamily: Fonts.bodyBold, fontSize: 14 },
  confirmRow: { flexDirection: "row", gap: 10, marginTop: 4 },
  dangerButton: { backgroundColor: Colors.terracotta, marginTop: 0 },
  secondaryButton: { backgroundColor: "transparent", borderWidth: 1.5, borderColor: Colors.terracotta, marginTop: 4 },
  secondaryButtonText: { color: Colors.terracotta, fontFamily: Fonts.bodyBold, fontSize: 14 },
  errorText: { color: Colors.terracotta, fontSize: 12, fontFamily: Fonts.body, marginTop: 10 },
});
