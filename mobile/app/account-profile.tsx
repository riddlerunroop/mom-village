// Your profile — split out of the old single-page account.tsx, 2026-08-02,
// to match Roop's mockup's drill-down structure. Just the mother's own
// details (name, city); baby's name/DOB/due date moved to account-child.tsx.

import { useCallback, useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, StyleSheet } from "react-native";
import { supabase } from "../lib/supabase";
import { Colors, Fonts, CardStyle } from "../constants/theme";
import DrillHeader from "../components/DrillHeader";

export default function AccountProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [momName, setMomName] = useState("");
  const [city, setCity] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);
    setPhone(user.phone || "");

    const { data: profile } = await supabase
      .from("profiles")
      .select("mom_name, city")
      .eq("id", user.id)
      .maybeSingle();
    setMomName(profile?.mom_name ?? "");
    setCity(profile?.city ?? "");
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function save() {
    if (!userId) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ mom_name: momName || null, city: city || null })
      .eq("id", userId);
    setSaving(false);
    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
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
      <DrillHeader title="Your profile" />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={styles.card}>
          <Text style={styles.label}>Phone</Text>
          <Text style={styles.readOnlyValue}>{phone}</Text>

          <Text style={styles.label}>Your name</Text>
          <TextInput
            style={styles.input}
            value={momName}
            onChangeText={setMomName}
            placeholder="Optional"
            placeholderTextColor={Colors.ink + "55"}
          />

          <Text style={styles.label}>City</Text>
          <TextInput
            style={styles.input}
            value={city}
            onChangeText={setCity}
            placeholder="Optional"
            placeholderTextColor={Colors.ink + "55"}
          />

          {saved && <Text style={styles.savedText}>Saved.</Text>}

          <Pressable style={[styles.button, saving && { opacity: 0.6 }]} onPress={save} disabled={saving}>
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
  readOnlyValue: { fontSize: 14, fontFamily: Fonts.body, color: Colors.ink + "99" },
  input: { borderWidth: 1, borderColor: Colors.line, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, fontFamily: Fonts.body, backgroundColor: "#FFFFFF", color: Colors.ink },
  savedText: { fontSize: 13, fontFamily: Fonts.bodyBold, color: Colors.sageDeep, marginTop: 12 },
  button: { backgroundColor: Colors.goldDeep, borderRadius: 999, paddingVertical: 13, alignItems: "center", marginTop: 18 },
  buttonText: { color: Colors.ivory, fontFamily: Fonts.bodyBold, fontSize: 14 },
});
