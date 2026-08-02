// Start a discussion — native port of NewThreadClient.tsx, Phase 5.
// Extended 2026-08-02 with an optional simple poll (migration_52) — the
// brief's own example ("Which stroller is best? Nuna / Joie / Chicco") is
// exactly this shape, and it fits the single-flat-forum model without any
// new roles/community infrastructure.

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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "../lib/supabase";
import { Colors, Fonts, CardStyle } from "../constants/theme";

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

const MAX_POLL_OPTIONS = 5;

export default function CommunityNewScreen() {
  const { title: prefillTitle } = useLocalSearchParams<{ title?: string }>();
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState(prefillTitle || "");
  const [body, setBody] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [pollEnabled, setPollEnabled] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);

  const filledOptionCount = pollOptions.filter((o) => o.trim().length > 0).length;
  const pollValid = !pollEnabled || (pollQuestion.trim().length > 0 && filledOptionCount >= 2);
  const canSubmit = title.trim().length > 0 && body.trim().length > 0 && pollValid;

  function toggleTag(tag: string) {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  function updatePollOption(index: number, value: string) {
    setPollOptions((prev) => prev.map((o, i) => (i === index ? value : o)));
  }

  function addPollOption() {
    setPollOptions((prev) => (prev.length < MAX_POLL_OPTIONS ? [...prev, ""] : prev));
  }

  function removePollOption(index: number) {
    setPollOptions((prev) => (prev.length > 2 ? prev.filter((_, i) => i !== index) : prev));
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

    if (insertError || !data) {
      setLoading(false);
      setError(insertError?.message || "Something went wrong — try again.");
      return;
    }

    if (pollEnabled && pollValid) {
      const { data: pollRow, error: pollError } = await supabase
        .from("community_polls")
        .insert({ thread_id: data.id, question: pollQuestion.trim() })
        .select("id")
        .single();

      if (!pollError && pollRow) {
        const rows = pollOptions
          .map((label, i) => ({ poll_id: pollRow.id, label: label.trim(), sort_order: i }))
          .filter((o) => o.label.length > 0);
        await supabase.from("community_poll_options").insert(rows);
      }
      // A poll failing to attach shouldn't block the thread she just wrote
      // from posting — it's already saved by this point either way.
    }

    setLoading(false);
    router.replace({ pathname: "/community-thread", params: { threadId: data.id } });
  }

  return (
    <View style={styles.screen}>
      <View style={[styles.topBar, { paddingTop: insets.top + 10 }]}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={22} color={Colors.indigo} />
        </Pressable>
        <Text style={styles.topBarTitle}>Start a discussion</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.title}>What&apos;s on your mind?</Text>

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

          <Pressable style={styles.pollToggleRow} onPress={() => setPollEnabled((v) => !v)}>
            <Ionicons
              name={pollEnabled ? "checkbox" : "square-outline"}
              size={18}
              color={pollEnabled ? Colors.goldDeep : Colors.ink + "66"}
            />
            <Text style={styles.pollToggleText}>Add a poll (optional)</Text>
          </Pressable>

          {pollEnabled && (
            <View style={styles.pollBuilder}>
              <Text style={styles.label}>Poll question</Text>
              <TextInput
                style={styles.input}
                value={pollQuestion}
                onChangeText={setPollQuestion}
                placeholder="e.g. Which stroller is best?"
                placeholderTextColor={Colors.ink + "66"}
              />
              <Text style={styles.label}>Options</Text>
              {pollOptions.map((opt, i) => (
                <View key={i} style={styles.pollOptionInputRow}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    value={opt}
                    onChangeText={(v) => updatePollOption(i, v)}
                    placeholder={`Option ${i + 1}`}
                    placeholderTextColor={Colors.ink + "66"}
                  />
                  {pollOptions.length > 2 && (
                    <Pressable onPress={() => removePollOption(i)} hitSlop={8} style={{ marginLeft: 8 }}>
                      <Ionicons name="close-circle" size={20} color={Colors.ink + "66"} />
                    </Pressable>
                  )}
                </View>
              ))}
              {pollOptions.length < MAX_POLL_OPTIONS && (
                <Pressable onPress={addPollOption} style={styles.addOptionRow}>
                  <Ionicons name="add-circle-outline" size={16} color={Colors.goldDeep} />
                  <Text style={styles.addOptionText}>Add option</Text>
                </Pressable>
              )}
            </View>
          )}

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
    paddingBottom: 10,
    backgroundColor: Colors.ivory,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  topBarTitle: { fontSize: 15, fontFamily: Fonts.bodyBold, color: Colors.indigo },
  title: { fontSize: 22, fontFamily: Fonts.display, color: Colors.indigo, marginBottom: 18, marginTop: 4 },
  card: { ...CardStyle, padding: 18 },
  label: { fontSize: 11, fontFamily: Fonts.bodyBold, textTransform: "uppercase", letterSpacing: 0.4, color: Colors.sageDeep, marginBottom: 8, marginTop: 12 },
  labelHint: { textTransform: "none", fontFamily: Fonts.body, color: Colors.ink + "66" },
  input: { borderWidth: 1, borderColor: Colors.line, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, fontFamily: Fonts.body, backgroundColor: "#FFFFFF", color: Colors.ink },
  textarea: { minHeight: 110 },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tagChip: { paddingVertical: 7, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1.5, borderColor: Colors.sageDeep + "66" },
  tagChipSelected: { backgroundColor: Colors.sageDeep, borderColor: Colors.sageDeep },
  tagChipText: { fontSize: 11, fontFamily: Fonts.bodyBold, color: Colors.sageDeep },
  tagChipTextSelected: { color: Colors.ivory },
  pollToggleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 18 },
  pollToggleText: { fontSize: 13, fontFamily: Fonts.bodySemiBold, color: Colors.indigo },
  pollBuilder: { marginTop: 4 },
  pollOptionInputRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  addOptionRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 },
  addOptionText: { fontSize: 12, fontFamily: Fonts.bodyBold, color: Colors.goldDeep },
  error: { color: Colors.terracotta, fontSize: 13, fontFamily: Fonts.body, marginTop: 12 },
  button: { backgroundColor: Colors.goldDeep, borderRadius: 999, paddingVertical: 14, alignItems: "center", marginTop: 18 },
  buttonText: { color: Colors.ivory, fontFamily: Fonts.bodyBold, fontSize: 14 },
});
