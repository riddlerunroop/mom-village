// Start a discussion — native port of NewThreadClient.tsx, Phase 5.
// Same structured topic chips as web (replacing free-text tags), same
// community_threads insert shape.

import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";
import { Colors } from "../constants/theme";

const TOPIC_TAGS = [
  "Pregnancy",
  "Newborn",
  "Feeding",
  "Sleep",
  "Postpartum recovery",
  "Milestones",
  "Toddler behaviour",
  "Money & schemes",
  "Work & career",
  "Just venting",
];

export default function CommunityNewScreen() {
  const { title: prefillTitle } = useLocalSearchParams<{ title?: string }>();
  const [title, setTitle] = useState(prefillTitle || "");
  const [body, setBody] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = title.trim().length > 0 && body.trim().length > 0;

  function toggleTag(tag: string) {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  async function handleSubmit() {
    if (!canSubmit) return;
    setError("");
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      router.push("/login");
      return;
    }

    const { data, error: insertError } = await supabase
      .from("community_threads")
      .insert({ user_id: user.id, title: title.trim(), body: body.trim(), tags: selectedTags })
      .select("id")
      .single();

    setLoading(false);
    if (insertError || !data) {
      setError(insertError?.message || "Something went wrong — try again.");
      return;
    }
    router.replace({ pathname: "/community-thread", params: { threadId: data.id } });
  }

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={22} color={Colors.indigo} />
        </Pressable>
        <Text style={styles.topBarTitle}>Start a discussion</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.eyebrow}>start a discussion</Text>
        <Text style={styles.title}>What's on your mind?</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Anyone else's baby refusing solids at 7 months?"
            placeholderTextColor={Colors.ink + "66"}
          />

          <Text style={styles.label}>Tell us more</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            value={body}
            onChangeText={setBody}
            placeholder="Share what's going on — the more context, the easier it is for someone to help."
            placeholderTextColor={Colors.ink + "66"}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />

          <Text style={styles.label}>
            Topic <Text style={styles.labelHint}>(optional, pick any that fit)</Text>
          </Text>
          <View style={styles.tagRow}>
            {TOPIC_TAGS.map((tag) => {
              const selected = selectedTags.includes(tag);
              return (
                <Pressable
                  key={tag}
                  style={[styles.tagChip, selected && styles.tagChipSelected]}
                  onPress={() => toggleTag(tag)}
                >
                  <Text style={[styles.tagChipText, selected && styles.tagChipTextSelected]}>{tag}</Text>
                </Pressable>
              );
            })}
          </View>

          {!!error && <Text style={styles.error}>{error}</Text>}

          <Pressable
            style={[styles.button, { opacity: canSubmit ? 1 : 0.5 }]}
            onPress={handleSubmit}
            disabled={!canSubmit || loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.ivory} />
            ) : (
              <Text style={styles.buttonText}>Post to the village</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.ivory },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  topBarTitle: { fontSize: 15, fontWeight: "700", color: Colors.indigo },
  eyebrow: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: Colors.sageDeep,
    marginBottom: 6,
  },
  title: { fontSize: 22, fontWeight: "700", color: Colors.indigo, marginBottom: 18 },
  card: { backgroundColor: Colors.ivory2, borderRadius: 18, borderWidth: 1, borderColor: Colors.line, padding: 18 },
  label: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.4, color: Colors.sageDeep, marginBottom: 8, marginTop: 12 },
  labelHint: { textTransform: "none", fontWeight: "400", color: Colors.ink + "66" },
  input: { borderWidth: 1, borderColor: Colors.line, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, backgroundColor: Colors.ivory, color: Colors.ink },
  textarea: { minHeight: 110 },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tagChip: { paddingVertical: 7, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1.5, borderColor: Colors.sageDeep + "66" },
  tagChipSelected: { backgroundColor: Colors.sageDeep, borderColor: Colors.sageDeep },
  tagChipText: { fontSize: 11, fontWeight: "700", color: Colors.sageDeep },
  tagChipTextSelected: { color: Colors.ivory },
  error: { color: Colors.terracotta, fontSize: 13, marginTop: 12 },
  button: { backgroundColor: Colors.goldDeep, borderRadius: 999, paddingVertical: 14, alignItems: "center", marginTop: 18 },
  buttonText: { color: Colors.ivory, fontWeight: "700", fontSize: 14 },
});
