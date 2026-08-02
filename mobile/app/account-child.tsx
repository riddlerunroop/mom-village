// Child profile — split out of the old single-page account.tsx, 2026-08-02,
// to match Roop's mockup's drill-down structure. Keeps the same deliberate
// second-confirm-on-date-change behaviour from the original build (this
// date drives which Monthly Chart/Care chart/vaccination schedule she
// sees, so a silent change would be a real, consequential surprise).

import { useCallback, useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, StyleSheet } from "react-native";
import { supabase } from "../lib/supabase";
import { Colors, Fonts, CardStyle } from "../constants/theme";
import DrillHeader from "../components/DrillHeader";

export default function AccountChildScreen() {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [babyName, setBabyName] = useState("");
  const [isBorn, setIsBorn] = useState(false);
  const [date, setDate] = useState("");
  const [originalDate, setOriginalDate] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);

    const { data: profile } = await supabase
      .from("profiles")
      .select("baby_name, baby_dob, due_date")
      .eq("id", user.id)
      .maybeSingle();

    const born = Boolean(profile?.baby_dob);
    setIsBorn(born);
    setBabyName(profile?.baby_name ?? "");
    const d = born ? profile?.baby_dob ?? "" : profile?.due_date ?? "";
    setDate(d);
    setOriginalDate(d);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const dateChanged = date !== originalDate;

  async function saveNow() {
    if (!userId) return;
    setSaving(true);
    setConfirming(false);
    const { error } = await supabase
      .from("profiles")
      .update({
        baby_name: babyName || null,
        ...(isBorn ? { baby_dob: date || null } : { due_date: date || null }),
      })
      .eq("id", userId);
    setSaving(false);
    if (!error) {
      setOriginalDate(date);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  }

  function handleSaveTap() {
    if (dateChanged && !confirming) {
      setConfirming(true);
      return;
    }
    saveNow();
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
      <DrillHeader title="Child profile" />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={styles.card}>
          <Text style={styles.label}>Baby&apos;s name</Text>
          <TextInput
            style={styles.input}
            value={babyName}
            onChangeText={setBabyName}
            placeholder="Optional"
            placeholderTextColor={Colors.ink + "55"}
          />

          <Text style={styles.label}>{isBorn ? "Baby's date of birth" : "Due date"}</Text>
          <TextInput
            style={styles.input}
            value={date}
            onChangeText={(v) => {
              setDate(v);
              setConfirming(false);
            }}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={Colors.ink + "55"}
          />

          <Text style={styles.helpText}>
            Changing {isBorn ? "her date of birth" : "your due date"} updates which Monthly Chart,
            Care chart, and vaccination schedule you see right away. Anything already logged
            (vaccination records, memories, check-ins) stays exactly as it is.
          </Text>

          {confirming && (
            <View style={styles.confirmBox}>
              <Text style={styles.confirmText}>
                You&apos;re changing {isBorn ? "her date of birth" : "your due date"} from{" "}
                {originalDate || "—"} to {date}. Continue?
              </Text>
              <View style={styles.rowButtons}>
                <Pressable onPress={saveNow}>
                  <Text style={styles.confirmYes}>Yes, update it</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setDate(originalDate);
                    setConfirming(false);
                  }}
                >
                  <Text style={styles.confirmCancel}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          )}

          {saved && <Text style={styles.savedText}>Saved.</Text>}

          <Pressable style={[styles.button, saving && { opacity: 0.6 }]} onPress={handleSaveTap} disabled={saving}>
            <Text style={styles.buttonText}>{saving ? "Saving…" : "Save changes"}</Text>
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
  label: { fontSize: 11, fontFamily: Fonts.bodyBold, textTransform: "uppercase", letterSpacing: 0.4, color: Colors.sageDeep, marginBottom: 8, marginTop: 12 },
  input: { borderWidth: 1, borderColor: Colors.line, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, fontFamily: Fonts.body, backgroundColor: "#FFFFFF", color: Colors.ink },
  helpText: { fontSize: 11, fontFamily: Fonts.body, color: Colors.ink + "73", marginTop: 12, lineHeight: 16 },
  confirmBox: { borderWidth: 2, borderColor: Colors.terracotta, backgroundColor: Colors.terracotta + "1a", borderRadius: 12, padding: 12, marginTop: 12 },
  confirmText: { fontSize: 13, fontFamily: Fonts.body, color: Colors.ink + "cc", marginBottom: 10 },
  rowButtons: { flexDirection: "row", gap: 20 },
  confirmYes: { fontSize: 12, fontFamily: Fonts.bodyBold, color: Colors.terracotta },
  confirmCancel: { fontSize: 12, fontFamily: Fonts.bodyBold, color: Colors.ink + "80" },
  savedText: { fontSize: 13, fontFamily: Fonts.bodyBold, color: Colors.sageDeep, marginTop: 12 },
  button: { backgroundColor: Colors.goldDeep, borderRadius: 999, paddingVertical: 13, alignItems: "center", marginTop: 18 },
  buttonText: { color: Colors.ivory, fontFamily: Fonts.bodyBold, fontSize: 14 },
});
