// Community tab — real forum, Phase 5 of the 2026-07-31 agreed build plan.
// Native port of src/app/dashboard/community/page.tsx: flat Orkut-style
// thread list (no groups), full-text search, empty-state starter prompts,
// and per-viewer block filtering — same community_threads/replies tables
// and community_author_names view as web, no schema changes needed.

import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Linking,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { supabase } from "../../lib/supabase";
import { hasActiveSubscription } from "../../lib/subscription";
import { Colors } from "../../constants/theme";
import ScreenHeader from "../../components/ScreenHeader";

const STARTER_PROMPTS = [
  "What's one thing that surprised you about this stage?",
  "Anyone else's baby doing something new this week?",
  "What's a government scheme you wish you'd known about earlier?",
  "How did you decide when (or whether) to go back to work?",
  "What's something you needed to hear today?",
];

type Thread = {
  id: string;
  title: string;
  body: string;
  tags: string[];
  reply_count: number;
  last_activity_at: string;
  user_id: string;
};

export default function CommunityScreen() {
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [threads, setThreads] = useState<Thread[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});

  const load = useCallback(async (searchTerm: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const subscribed = await hasActiveSubscription(supabase, user.id);
    setIsSubscribed(subscribed);
    if (!subscribed) {
      setLoading(false);
      return;
    }

    const { data: blockedRows } = await supabase
      .from("user_blocks")
      .select("blocked_id")
      .eq("blocker_id", user.id);
    const blockedIds = (blockedRows || []).map((b) => b.blocked_id);

    let q = supabase
      .from("community_threads")
      .select("id, title, body, tags, reply_count, last_activity_at, user_id")
      .order("last_activity_at", { ascending: false })
      .limit(50);

    if (blockedIds.length > 0) {
      q = q.not("user_id", "in", `(${blockedIds.join(",")})`);
    }
    if (searchTerm.trim().length > 0) {
      q = q.textSearch("search_doc", searchTerm.trim(), { type: "websearch", config: "english" });
    }

    const { data } = await q;
    const rows = data || [];
    setThreads(rows);

    if (rows.length > 0) {
      const userIds = Array.from(new Set(rows.map((t) => t.user_id)));
      const { data: authors } = await supabase
        .from("community_author_names")
        .select("id, mom_name")
        .in("id", userIds);
      setNames(
        Object.fromEntries((authors || []).map((a) => [a.id, a.mom_name || "A mom in the village"]))
      );
    }
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load(activeQuery);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeQuery])
  );

  function runSearch() {
    setActiveQuery(query);
  }

  function startFromPrompt(prompt: string) {
    router.push({ pathname: "/community-new", params: { title: prompt } });
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
      <ScreenHeader />
      <View style={{ paddingHorizontal: 20, paddingTop: 12, flex: 1 }}>
        <Text style={styles.eyebrow}>the whole village, talking</Text>
        <Text style={styles.title}>Community</Text>
        <Text style={styles.intro}>
          Start a discussion, or search to see if someone's already asked the same thing.
        </Text>
        <Pressable onPress={() => Linking.openURL("https://www.momvillage.in/community-guidelines")}>
          <Text style={styles.guidelinesLink}>
            Posts here are member experience, not medical or financial advice — see our Community
            Guidelines.
          </Text>
        </Pressable>

        {!isSubscribed ? (
          <View style={styles.lockedCard}>
            <Text style={styles.cardTitle}>You're not doing this alone</Text>
            <Text style={styles.body}>
              Join to read and start discussions with other moms in the village.
            </Text>
            <Pressable
              style={styles.button}
              onPress={() => Linking.openURL("https://www.momvillage.in/dashboard/account")}
            >
              <Text style={styles.buttonText}>Subscribe on momvillage.in</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.searchRow}>
              <TextInput
                style={styles.searchInput}
                value={query}
                onChangeText={setQuery}
                placeholder="Search past discussions…"
                placeholderTextColor={Colors.ink + "66"}
                returnKeyType="search"
                onSubmitEditing={runSearch}
              />
              <Pressable
                style={styles.startButton}
                onPress={() => router.push("/community-new")}
              >
                <Text style={styles.startButtonText}>Start</Text>
              </Pressable>
            </View>

            {!!activeQuery && (
              <Text style={styles.searchResultNote}>
                {threads.length > 0
                  ? `Showing results for "${activeQuery}"`
                  : `No past discussions found for "${activeQuery}" — be the first to start one.`}
              </Text>
            )}

            {threads.length === 0 && !activeQuery ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>No discussions yet — start the first one.</Text>
                <Text style={styles.emptyHint}>Not sure what to ask? Try one of these:</Text>
                {STARTER_PROMPTS.map((prompt) => (
                  <Pressable key={prompt} style={styles.promptRow} onPress={() => startFromPrompt(prompt)}>
                    <Text style={styles.promptText}>{prompt}</Text>
                  </Pressable>
                ))}
              </View>
            ) : (
              <FlatList
                data={threads}
                keyExtractor={(t) => t.id}
                contentContainerStyle={{ paddingBottom: 24 }}
                renderItem={({ item }) => (
                  <Pressable
                    style={styles.threadCard}
                    onPress={() => router.push({ pathname: "/community-thread", params: { threadId: item.id } })}
                  >
                    <Text style={styles.threadTitle}>{item.title}</Text>
                    <Text style={styles.threadBody} numberOfLines={2}>
                      {item.body}
                    </Text>
                    <View style={styles.threadMetaRow}>
                      <Text style={styles.threadAuthor}>{names[item.user_id]}</Text>
                      <Text style={styles.threadMetaDot}>·</Text>
                      <Text style={styles.threadMeta}>
                        {item.reply_count} {item.reply_count === 1 ? "reply" : "replies"}
                      </Text>
                      {item.tags.length > 0 && (
                        <>
                          <Text style={styles.threadMetaDot}>·</Text>
                          <Text style={styles.threadMeta} numberOfLines={1}>
                            {item.tags.join(", ")}
                          </Text>
                        </>
                      )}
                    </View>
                  </Pressable>
                )}
              />
            )}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.ivory },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: Colors.ivory },
  eyebrow: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: Colors.sageDeep,
    marginBottom: 6,
  },
  title: { fontSize: 24, fontWeight: "700", color: Colors.indigo, marginBottom: 6 },
  intro: { fontSize: 13, color: Colors.ink + "a6", lineHeight: 19, marginBottom: 4 },
  guidelinesLink: { fontSize: 11, color: Colors.ink + "73", lineHeight: 16, marginBottom: 16, textDecorationLine: "underline" },
  lockedCard: { backgroundColor: Colors.ivory2, borderRadius: 18, borderWidth: 1, borderColor: Colors.line, padding: 20 },
  cardTitle: { fontSize: 16, fontWeight: "700", color: Colors.indigo, marginBottom: 8 },
  body: { fontSize: 13, color: Colors.ink + "a6", lineHeight: 19, marginBottom: 12 },
  button: { backgroundColor: Colors.goldDeep, borderRadius: 999, paddingVertical: 13, alignItems: "center" },
  buttonText: { color: Colors.ivory, fontWeight: "700", fontSize: 14 },
  searchRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.line,
    backgroundColor: Colors.ivory2,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 13,
    color: Colors.ink,
  },
  startButton: { backgroundColor: Colors.goldDeep, borderRadius: 999, paddingHorizontal: 18, justifyContent: "center" },
  startButtonText: { color: Colors.ivory, fontWeight: "700", fontSize: 13 },
  searchResultNote: { fontSize: 11, color: Colors.ink + "80", marginBottom: 10 },
  emptyCard: { backgroundColor: Colors.ivory2, borderRadius: 18, borderWidth: 1, borderColor: Colors.line, padding: 20, alignItems: "center" },
  emptyTitle: { fontSize: 15, fontStyle: "italic", color: Colors.sageDeep, marginBottom: 14, textAlign: "center" },
  emptyHint: { fontSize: 10, textTransform: "uppercase", fontWeight: "700", color: Colors.ink + "66", marginBottom: 10 },
  promptRow: { backgroundColor: Colors.ivory, borderRadius: 12, borderWidth: 1, borderColor: Colors.line, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 8, width: "100%" },
  promptText: { fontSize: 13, color: Colors.ink + "bf" },
  threadCard: { backgroundColor: Colors.ivory2, borderRadius: 16, borderWidth: 1, borderColor: Colors.line, padding: 16, marginBottom: 10 },
  threadTitle: { fontSize: 15, fontWeight: "700", color: Colors.indigo, marginBottom: 4 },
  threadBody: { fontSize: 13, color: Colors.ink + "a6", lineHeight: 18, marginBottom: 8 },
  threadMetaRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 5 },
  threadAuthor: { fontSize: 11, fontWeight: "700", color: Colors.sageDeep },
  threadMetaDot: { fontSize: 11, color: Colors.ink + "66" },
  threadMeta: { fontSize: 11, color: Colors.ink + "80" },
});
