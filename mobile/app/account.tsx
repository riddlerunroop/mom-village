// Account — standalone route (NOT a tab), reached via the profile icon in
// ScreenHeader on every tab-root screen. Phase 7 of the agreed plan: full
// rebuild replacing Phase 1's placeholder rows with the real thing —
// editable profile fields (with the same deliberate-second-confirm on a
// date change as web's AccountForm.tsx), blocked-members unblock list,
// privacy/deletion request, and real legal/trust links. Reminders stays a
// "coming soon" placeholder — native push needs its own APNs/FCM
// infrastructure, Phase 8.

import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";
import { Colors } from "../constants/theme";

const WEB_BASE = "https://www.momvillage.in";

type BlockedMom = { id: string; name: string };

export default function AccountScreen() {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [phone, setPhone] = useState("");

  const [momName, setMomName] = useState("");
  const [babyName, setBabyName] = useState("");
  const [city, setCity] = useState("");
  const [isBorn, setIsBorn] = useState(false);
  const [date, setDate] = useState(""); // baby_dob if born, else due_date
  const [originalDate, setOriginalDate] = useState("");
  const [confirmingDateChange, setConfirmingDateChange] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [subscriptionLabel, setSubscriptionLabel] = useState("Not subscribed");
  const [hasSubscription, setHasSubscription] = useState(false);

  const [blocked, setBlocked] = useState<BlockedMom[]>([]);

  const [deletionPending, setDeletionPending] = useState(false);
  const [confirmingDeletion, setConfirmingDeletion] = useState(false);
  const [requestingDeletion, setRequestingDeletion] = useState(false);

  const load = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);
    setPhone(user.phone || "");

    const { data: profile } = await supabase
      .from("profiles")
      .select("mom_name, baby_name, city, baby_dob, due_date")
      .eq("id", user.id)
      .maybeSingle();

    const born = Boolean(profile?.baby_dob);
    setIsBorn(born);
    setMomName(profile?.mom_name ?? "");
    setBabyName(profile?.baby_name ?? "");
    setCity(profile?.city ?? "");
    const d = born ? profile?.baby_dob ?? "" : profile?.due_date ?? "";
    setDate(d);
    setOriginalDate(d);

    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("status, plan, current_period_end")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    if (subscription) {
      setHasSubscription(true);
      const renews = subscription.current_period_end
        ? ` (renews ${new Date(subscription.current_period_end).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })})`
        : "";
      setSubscriptionLabel(`Active — ${subscription.plan}${renews}`);
    } else {
      setHasSubscription(false);
      setSubscriptionLabel("Not subscribed");
    }

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
    } else {
      setBlocked([]);
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

  const dateChanged = date !== originalDate;

  async function saveNow() {
    if (!userId) return;
    setSaving(true);
    setConfirmingDateChange(false);

    const { error } = await supabase
      .from("profiles")
      .update({
        mom_name: momName || null,
        baby_name: babyName || null,
        city: city || null,
        ...(isBorn ? { baby_dob: date || null } : { due_date: date || null }),
      })
      .eq("id", userId);

    setSaving(false);
    if (error) {
      Alert.alert("Couldn't save", error.message);
      return;
    }
    setOriginalDate(date);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function handleSaveTap() {
    if (dateChanged && !confirmingDateChange) {
      setConfirmingDateChange(true);
      return;
    }
    saveNow();
  }

  async function unblock(id: string) {
    if (!userId) return;
    setBlocked((prev) => prev.filter((b) => b.id !== id));
    await supabase.from("user_blocks").delete().eq("blocker_id", userId).eq("blocked_id", id);
  }

  async function requestDeletion() {
    if (!userId) return;
    setRequestingDeletion(true);
    const { error } = await supabase.from("account_deletion_requests").insert({ user_id: userId });
    setRequestingDeletion(false);
    if (error) {
      Alert.alert("Couldn't submit", "Something went wrong — try again, or contact us directly.");
      return;
    }
    setDeletionPending(true);
    setConfirmingDeletion(false);
  }

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
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
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
        <Row label="Membership" value={subscriptionLabel} />
      </View>

      <Text style={styles.sectionLabel}>Edit your details</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Your name</Text>
        <TextInput style={styles.input} value={momName} onChangeText={setMomName} placeholder="Optional" placeholderTextColor={Colors.ink + "55"} />

        <Text style={styles.label}>Baby's name</Text>
        <TextInput style={styles.input} value={babyName} onChangeText={setBabyName} placeholder="Optional" placeholderTextColor={Colors.ink + "55"} />

        <Text style={styles.label}>{isBorn ? "Baby's date of birth" : "Due date"}</Text>
        <TextInput
          style={styles.input}
          value={date}
          onChangeText={(v) => {
            setDate(v);
            setConfirmingDateChange(false);
          }}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={Colors.ink + "55"}
        />

        <Text style={styles.label}>City</Text>
        <TextInput style={styles.input} value={city} onChangeText={setCity} placeholder="Optional" placeholderTextColor={Colors.ink + "55"} />

        <Text style={styles.helpText}>
          Changing {isBorn ? "her date of birth" : "your due date"} updates which Monthly Chart,
          Care chart, and vaccination schedule you see right away. Anything already logged
          (vaccination records, memories, check-ins) stays exactly as it is.
        </Text>

        {confirmingDateChange && (
          <View style={styles.confirmBox}>
            <Text style={styles.confirmText}>
              You're changing {isBorn ? "her date of birth" : "your due date"} from{" "}
              {originalDate || "—"} to {date}. Continue?
            </Text>
            <View style={styles.rowButtons}>
              <Pressable onPress={saveNow}>
                <Text style={styles.confirmYes}>Yes, update it</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setDate(originalDate);
                  setConfirmingDateChange(false);
                }}
              >
                <Text style={styles.confirmCancel}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        )}

        {saved && <Text style={styles.savedText}>Saved.</Text>}

        <Pressable style={[styles.saveButton, saving && { opacity: 0.6 }]} onPress={handleSaveTap} disabled={saving}>
          <Text style={styles.saveButtonText}>{saving ? "Saving…" : "Save changes"}</Text>
        </Pressable>
      </View>

      <PlaceholderRow icon="notifications-outline" label="Reminders" note="Coming soon — needs native push setup" />

      <Text style={styles.sectionLabel}>Blocked members</Text>
      <View style={styles.card}>
        <Text style={styles.body}>
          Mothers you've blocked in Community — you won't see their posts or replies. Unblock
          anytime.
        </Text>
        {blocked.length === 0 ? (
          <Text style={styles.emptyText}>You haven't blocked anyone in Community.</Text>
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

      <Text style={styles.sectionLabel}>Membership</Text>
      <View style={styles.card}>
        <Text style={styles.body}>
          {hasSubscription
            ? "You can cancel anytime — cancelling stops future billing, and you keep access through the end of what you've already paid for."
            : "You don't currently have an active membership."}{" "}
          Self-serve cancellation isn't live yet — contact us to cancel or ask about your
          membership.
        </Text>
        <Pressable style={styles.linkButton} onPress={() => Linking.openURL(`${WEB_BASE}/dashboard/account`)}>
          <Text style={styles.linkButtonText}>{hasSubscription ? "Manage on momvillage.in" : "Subscribe on momvillage.in"}</Text>
        </Pressable>
      </View>

      <Text style={styles.sectionLabel}>Privacy &amp; account deletion</Text>
      <View style={styles.card}>
        <Text style={styles.body}>
          See our Privacy Policy for what we collect and how it's used. You can request full
          deletion of your account and personal data below.
        </Text>
        {deletionPending ? (
          <Text style={styles.savedText}>
            Deletion requested — we'll action this within 30 days. Contact us if you change your
            mind.
          </Text>
        ) : !confirmingDeletion ? (
          <Pressable onPress={() => setConfirmingDeletion(true)}>
            <Text style={styles.deleteText}>Request account deletion</Text>
          </Pressable>
        ) : (
          <View style={styles.confirmBox}>
            <Text style={styles.confirmText}>
              This requests permanent deletion of your account and personal data — profile, voice
              logs, photos, vaccination records, and more — within 30 days. This can't be undone
              once actioned. Are you sure?
            </Text>
            <View style={styles.rowButtons}>
              <Pressable onPress={requestDeletion} disabled={requestingDeletion}>
                <Text style={styles.confirmYes}>{requestingDeletion ? "…" : "Yes, request deletion"}</Text>
              </Pressable>
              <Pressable onPress={() => setConfirmingDeletion(false)}>
                <Text style={styles.confirmCancel}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>

      <Text style={styles.sectionLabel}>About &amp; policies</Text>
      <View style={styles.card}>
        <LegalRow label="About" path="/about" />
        <LegalRow label="Contact & Help" path="/contact" />
        <LegalRow label="Privacy Policy" path="/privacy" />
        <LegalRow label="Terms of Use" path="/terms" />
        <LegalRow label="Community Guidelines" path="/community-guidelines" />
        <LegalRow label="Cancellation & Refund Policy" path="/refund-policy" last />
        <LegalRow label="Safety & Emergency Support" path="/safety" last emphasized />
      </View>

      <Pressable style={styles.signOut} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign out</Text>
      </Pressable>
    </ScrollView>
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

function LegalRow({
  label,
  path,
  last,
  emphasized,
}: {
  label: string;
  path: string;
  last?: boolean;
  emphasized?: boolean;
}) {
  return (
    <Pressable
      style={[styles.legalRow, last && { borderBottomWidth: 0 }]}
      onPress={() => Linking.openURL(`${WEB_BASE}${path}`)}
    >
      <Text style={[styles.legalRowText, emphasized && { color: Colors.terracotta, fontWeight: "700" }]}>{label}</Text>
      <Ionicons name="open-outline" size={15} color={Colors.ink + "66"} />
    </Pressable>
  );
}

function PlaceholderRow({ icon, label, note }: { icon: keyof typeof Ionicons.glyphMap; label: string; note: string }) {
  return (
    <View style={[styles.placeholderRow]}>
      <Ionicons name={icon} size={20} color={Colors.sageDeep} />
      <Text style={styles.placeholderLabel}>{label}</Text>
      <Text style={styles.placeholderNote}>{note}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.ivory },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: Colors.ivory },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  wordmark: { fontSize: 16, fontWeight: "700", color: Colors.indigo },
  title: { fontSize: 24, fontWeight: "700", color: Colors.indigo, marginBottom: 16 },
  sectionLabel: { fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5, color: Colors.sageDeep, marginTop: 20, marginBottom: 8 },
  card: { backgroundColor: Colors.ivory2, borderRadius: 18, borderWidth: 1, borderColor: Colors.line, padding: 18, marginBottom: 6 },
  body: { fontSize: 13, color: Colors.ink + "a6", lineHeight: 19, marginBottom: 12 },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.line },
  rowLabel: { fontSize: 11, fontWeight: "700", color: Colors.sageDeep, textTransform: "uppercase" },
  rowValue: { fontSize: 14, color: Colors.ink },
  label: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.4, color: Colors.sageDeep, marginBottom: 6, marginTop: 10 },
  input: { borderWidth: 1, borderColor: Colors.line, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, backgroundColor: "#fff", color: Colors.ink },
  helpText: { fontSize: 11, color: Colors.ink + "73", marginTop: 12, lineHeight: 16 },
  confirmBox: { borderWidth: 2, borderColor: Colors.terracotta, backgroundColor: Colors.terracotta + "1a", borderRadius: 12, padding: 12, marginTop: 12 },
  confirmText: { fontSize: 13, color: Colors.ink + "cc", marginBottom: 10 },
  rowButtons: { flexDirection: "row", gap: 20 },
  confirmYes: { fontSize: 12, fontWeight: "700", color: Colors.terracotta },
  confirmCancel: { fontSize: 12, fontWeight: "700", color: Colors.ink + "80" },
  savedText: { fontSize: 13, fontWeight: "700", color: Colors.sageDeep, marginTop: 12 },
  saveButton: { backgroundColor: Colors.goldDeep, borderRadius: 999, paddingVertical: 12, alignItems: "center", marginTop: 16 },
  saveButtonText: { color: Colors.ivory, fontWeight: "700", fontSize: 14 },
  placeholderRow: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: Colors.ivory2, borderRadius: 14, borderWidth: 1, borderColor: Colors.line, padding: 14, marginTop: 20, marginBottom: 6, opacity: 0.7 },
  placeholderLabel: { flex: 1, fontSize: 14, fontWeight: "600", color: Colors.indigo },
  placeholderNote: { fontSize: 11, color: Colors.ink + "80" },
  emptyText: { fontSize: 13, fontStyle: "italic", color: Colors.ink + "70" },
  blockRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8, borderTopWidth: 1, borderTopColor: Colors.line },
  blockName: { fontSize: 13, color: Colors.ink },
  unblockText: { fontSize: 12, fontWeight: "700", color: Colors.sageDeep },
  linkButton: { backgroundColor: Colors.goldDeep, borderRadius: 999, paddingVertical: 12, alignItems: "center" },
  linkButtonText: { color: Colors.ivory, fontWeight: "700", fontSize: 13 },
  deleteText: { fontSize: 13, fontWeight: "700", color: Colors.terracotta },
  legalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.line },
  legalRowText: { fontSize: 13, color: Colors.ink, fontWeight: "600" },
  signOut: { alignItems: "center", paddingVertical: 16, marginTop: 20 },
  signOutText: { color: Colors.terracotta, fontWeight: "700", fontSize: 14 },
});
