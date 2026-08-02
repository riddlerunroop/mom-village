// Privacy & account deletion — split out of the old single-page
// account.tsx, 2026-08-02, to match Roop's mockup's drill-down structure.
// Groups everything privacy/safety-related in one place: blocked members
// (previously a separate section on the old page) and the account
// deletion request flow.

import { useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator, StyleSheet, Linking } from "react-native";
import { supabase } from "../lib/supabase";
import { Colors, Fonts, CardStyle } from "../constants/theme";
import DrillHeader from "../components/DrillHeader";

const WEB_BASE = "https://www.momvillage.in";

type BlockedMom = { id: string; name: string };

export default function AccountPrivacyScreen() {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [blocked, setBlocked] = useState<BlockedMom[]>([]);
  const [deletionPending, setDeletionPending] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [requesting, setRequesting] = useState(false);

  const load = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);

    const { data: blockRows } = await supabase
      .from("user_blocks")
      .select("blocked_id")
      .eq("blocker_id", user.id);
    const blockedIds = (blockRows || []).map((r) => r.blocked_id);
    if (blockedIds.length > 0) {
      const { data: authors } = await supabase
        .from("community_author_names")
        .select("id, mom_name")
        .in("id", blockedIds);
      setBlocked((authors || []).map((a) => ({ id: a.id, name: a.mom_name || "A mom in the village" })));
    }

    const { data: deletionRequest } = await supabase
      .from("account_deletion_requests")
      .select("status")
      .eq("user_id", user.id)
      .eq("status", "pending")
      .maybeSingle();
    setDeletionPending(Boolean(deletionRequest));
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function unblock(id: string) {
    if (!userId) return;
    setBlocked((prev) => prev.filter((b) => b.id !== id));
    await supabase.from("user_blocks").delete().eq("blocker_id", userId).eq("blocked_id", id);
  }

  async function requestDeletion() {
    if (!userId) return;
    setRequesting(true);
    const { error } = await supabase.from("account_deletion_requests").insert({ user_id: userId });
    setRequesting(false);
    if (!error) {
      setDeletionPending(true);
      setConfirming(false);
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
      <DrillHeader title="Privacy & account deletion" />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.sectionLabel}>Blocked members</Text>
        <View style={styles.card}>
          <Text style={styles.body}>
            Mothers you&apos;ve blocked in Community — you won&apos;t see their posts or replies.
            Unblock anytime.
          </Text>
          {blocked.length === 0 ? (
            <Text style={styles.emptyText}>You haven&apos;t blocked anyone in Community.</Text>
          ) : (
            blocked.map((b) => (
              <View key={b.id} style={styles.blockRow}>
                <Text style={styles.blockName}>{b.name}</Text>
                <Pressable onPress={() => unblock(b.id)}>
                  <Text style={styles.unblockText}>Unblock</Text>
                </Pressable>
              </View>
            ))
          )}
        </View>

        <Text style={styles.sectionLabel}>Privacy & deletion</Text>
        <View style={styles.card}>
          <Text style={styles.body}>
            See our Privacy Policy for what we collect and how it&apos;s used. You can request full
            deletion of your account and personal data below.
          </Text>
          <Pressable onPress={() => Linking.openURL(`${WEB_BASE}/privacy`)}>
            <Text style={styles.linkText}>Read the Privacy Policy</Text>
          </Pressable>

          {deletionPending ? (
            <Text style={styles.savedText}>
              Deletion requested — we&apos;ll action this within 30 days. Contact us if you change
              your mind.
            </Text>
          ) : !confirming ? (
            <Pressable style={{ marginTop: 14 }} onPress={() => setConfirming(true)}>
              <Text style={styles.deleteText}>Request account deletion</Text>
            </Pressable>
          ) : (
            <View style={styles.confirmBox}>
              <Text style={styles.confirmText}>
                This requests permanent deletion of your account and personal data — profile, voice
                logs, photos, vaccination records, and more — within 30 days. This can&apos;t be
                undone once actioned. Are you sure?
              </Text>
              <View style={styles.rowButtons}>
                <Pressable onPress={requestDeletion} disabled={requesting}>
                  <Text style={styles.confirmYes}>{requesting ? "…" : "Yes, request deletion"}</Text>
                </Pressable>
                <Pressable onPress={() => setConfirming(false)}>
                  <Text style={styles.confirmCancel}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.ivory },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: Colors.ivory },
  sectionLabel: { fontSize: 12, fontFamily: Fonts.bodyBold, textTransform: "uppercase", letterSpacing: 0.5, color: Colors.sageDeep, marginBottom: 8, marginTop: 4 },
  card: { ...CardStyle, padding: 18, marginBottom: 20 },
  body: { fontSize: 13, fontFamily: Fonts.body, color: Colors.ink + "a6", lineHeight: 19, marginBottom: 10 },
  emptyText: { fontSize: 13, fontFamily: Fonts.displayItalic, color: Colors.ink + "70" },
  blockRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8, borderTopWidth: 1, borderTopColor: Colors.line },
  blockName: { fontSize: 13, fontFamily: Fonts.body, color: Colors.ink },
  unblockText: { fontSize: 12, fontFamily: Fonts.bodyBold, color: Colors.sageDeep },
  linkText: { fontSize: 12, fontFamily: Fonts.bodyBold, color: Colors.goldDeep, marginBottom: 6, textDecorationLine: "underline" },
  savedText: { fontSize: 13, fontFamily: Fonts.bodyBold, color: Colors.sageDeep, marginTop: 8 },
  deleteText: { fontSize: 13, fontFamily: Fonts.bodyBold, color: Colors.terracotta },
  confirmBox: { borderWidth: 2, borderColor: Colors.terracotta, backgroundColor: Colors.terracotta + "1a", borderRadius: 12, padding: 12, marginTop: 12 },
  confirmText: { fontSize: 13, fontFamily: Fonts.body, color: Colors.ink + "cc", marginBottom: 10 },
  rowButtons: { flexDirection: "row", gap: 20 },
  confirmYes: { fontSize: 12, fontFamily: Fonts.bodyBold, color: Colors.terracotta },
  confirmCancel: { fontSize: 12, fontFamily: Fonts.bodyBold, color: Colors.ink + "80" },
});
