// Rediscover Profile — native port of
// src/app/dashboard/rediscover/profile/page.tsx + ProfileForm.tsx combined
// into one screen (native doesn't split server/client components the way
// web does). Her identity inside Rediscover, extending her existing
// Village profile rather than a separate account — listings and needs are
// managed on their own screens (Showcase / Collaborate), not here.

import { useCallback, useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, StyleSheet } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";
import { Colors, Fonts, CardStyle } from "../constants/theme";
import DrillHeader from "../components/DrillHeader";

type Flag = {
  key: string;
  label: string;
  value: boolean;
  set: (v: boolean) => void;
};

export default function RediscoverProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [listingCount, setListingCount] = useState(0);
  const [needCount, setNeedCount] = useState(0);
  const [recommendCount, setRecommendCount] = useState(0);

  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [remoteOk, setRemoteOk] = useState(false);
  const [openToCollaboration, setOpenToCollaboration] = useState(false);
  const [openToWork, setOpenToWork] = useState(false);
  const [openToPromotion, setOpenToPromotion] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const load = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const [{ data: profile }, { count: listings }, { count: needs }, { count: recommends }] = await Promise.all([
      supabase
        .from("user_rediscover_profile")
        .select("headline, bio, location, remote_ok, open_to_collaboration, open_to_work, open_to_promotion, is_active")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase.from("rediscover_listings").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("is_active", true),
      supabase.from("rediscover_needs").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("is_active", true),
      supabase.from("rediscover_recommendations").select("recommender_user_id", { count: "exact", head: true }).eq("recommended_user_id", user.id),
    ]);

    setHeadline(profile?.headline ?? "");
    setBio(profile?.bio ?? "");
    setLocation(profile?.location ?? "");
    setRemoteOk(profile?.remote_ok ?? false);
    setOpenToCollaboration(profile?.open_to_collaboration ?? false);
    setOpenToWork(profile?.open_to_work ?? false);
    setOpenToPromotion(profile?.open_to_promotion ?? false);
    setIsActive(profile?.is_active ?? true);
    setListingCount(listings ?? 0);
    setNeedCount(needs ?? 0);
    setRecommendCount(recommends ?? 0);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function save() {
    setSaving(true);
    setSaved(false);
    setError("");
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      setError("Something went wrong — please log in again.");
      return;
    }
    const { error: upsertError } = await supabase.from("user_rediscover_profile").upsert(
      {
        user_id: user.id,
        headline: headline || null,
        bio: bio || null,
        location: location || null,
        remote_ok: remoteOk,
        open_to_collaboration: openToCollaboration,
        open_to_work: openToWork,
        open_to_promotion: openToPromotion,
        is_active: isActive,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
    setSaving(false);
    if (upsertError) setError("Couldn't save — please try again.");
    else setSaved(true);
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.goldDeep} />
      </View>
    );
  }

  const flags: Flag[] = [
    { key: "remote", label: "Remote work", value: remoteOk, set: setRemoteOk },
    { key: "collab", label: "Collaboration", value: openToCollaboration, set: setOpenToCollaboration },
    { key: "work", label: "Work / projects", value: openToWork, set: setOpenToWork },
    { key: "promo", label: "Being promoted", value: openToPromotion, set: setOpenToPromotion },
  ];

  return (
    <View style={styles.screen}>
      <DrillHeader title="Your Rediscover Profile" />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 50 }}>
        <Text style={styles.intro}>
          Everything below is yours to edit or leave blank. You control what
          shows — nothing here is shared outside Mom&apos;s Village.
        </Text>

        <View style={styles.statsRow}>
          <Pressable style={styles.statCard} onPress={() => router.push("/rediscover-showcase")}>
            <Text style={styles.statNumber}>{listingCount}</Text>
            <Text style={styles.statLabel}>listing{listingCount === 1 ? "" : "s"} · manage →</Text>
          </Pressable>
          <Pressable style={styles.statCard} onPress={() => router.push("/rediscover-collaborate")}>
            <Text style={styles.statNumber}>{needCount}</Text>
            <Text style={styles.statLabel}>looking for · manage →</Text>
          </Pressable>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{recommendCount}</Text>
            <Text style={styles.statLabel}>recommend you</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Headline</Text>
          <TextInput
            style={styles.input}
            value={headline}
            onChangeText={setHeadline}
            placeholder="e.g. Fashion Designer · Ludhiana"
            placeholderTextColor={Colors.ink + "66"}
            maxLength={80}
          />

          <Text style={styles.label}>About my work</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            maxLength={600}
            placeholderTextColor={Colors.ink + "66"}
          />

          <Text style={styles.label}>Location</Text>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="e.g. Ludhiana"
            placeholderTextColor={Colors.ink + "66"}
            maxLength={80}
          />

          <Text style={styles.label}>Open to</Text>
          <View style={styles.flagRow}>
            {flags.map((flag) => (
              <Pressable
                key={flag.key}
                style={[styles.flagChip, flag.value && styles.flagChipSelected]}
                onPress={() => flag.set(!flag.value)}
              >
                <Text style={[styles.flagChipText, flag.value && styles.flagChipTextSelected]}>
                  {flag.value ? "✓ " : ""}
                  {flag.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable style={styles.checkboxRow} onPress={() => setIsActive((v) => !v)}>
            <Ionicons name={isActive ? "checkbox" : "square-outline"} size={18} color={isActive ? Colors.goldDeep : Colors.ink + "66"} />
            <Text style={styles.checkboxText}>My profile and listings are visible to other mothers</Text>
          </Pressable>

          <View style={styles.saveRow}>
            <Pressable style={[styles.button, { opacity: saving ? 0.6 : 1 }]} onPress={save} disabled={saving}>
              {saving ? <ActivityIndicator color={Colors.ivory} /> : <Text style={styles.buttonText}>Save profile</Text>}
            </Pressable>
            {saved && <Text style={styles.savedText}>Saved.</Text>}
            {!!error && <Text style={styles.errorText}>{error}</Text>}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.ivory },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: Colors.ivory },
  intro: { fontSize: 13, fontFamily: Fonts.body, color: Colors.ink + "a6", lineHeight: 19, marginBottom: 16, marginTop: 4 },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  statCard: { ...CardStyle, flex: 1, padding: 12 },
  statNumber: { fontSize: 22, fontFamily: Fonts.display, color: Colors.indigo },
  statLabel: { fontSize: 11, fontFamily: Fonts.body, color: Colors.ink + "8c", marginTop: 2 },
  card: { ...CardStyle, padding: 18 },
  label: { fontSize: 11, fontFamily: Fonts.bodyBold, textTransform: "uppercase", letterSpacing: 0.4, color: Colors.sageDeep, marginBottom: 8, marginTop: 12 },
  input: { borderWidth: 1, borderColor: Colors.line, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, fontFamily: Fonts.body, backgroundColor: Colors.ivory, color: Colors.ink },
  textarea: { minHeight: 80 },
  flagRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  flagChip: { paddingVertical: 7, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1.5, borderColor: Colors.line },
  flagChipSelected: { backgroundColor: Colors.goldDeep + "16", borderColor: Colors.goldDeep + "66" },
  flagChipText: { fontSize: 12, fontFamily: Fonts.bodyBold, color: Colors.ink + "80" },
  flagChipTextSelected: { color: Colors.goldDeep },
  checkboxRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: Colors.line },
  checkboxText: { flex: 1, fontSize: 13, fontFamily: Fonts.body, color: Colors.ink + "a6" },
  saveRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 16 },
  button: { backgroundColor: Colors.indigo, borderRadius: 999, paddingVertical: 12, paddingHorizontal: 22, alignItems: "center" },
  buttonText: { color: Colors.ivory, fontFamily: Fonts.bodyBold, fontSize: 13 },
  savedText: { fontSize: 12, fontFamily: Fonts.bodySemiBold, color: Colors.sageDeep },
  errorText: { fontSize: 12, fontFamily: Fonts.bodySemiBold, color: Colors.terracotta },
});
