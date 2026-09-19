// Rediscover — a single conversation thread, native port of
// src/app/dashboard/rediscover/messages/[id]/page.tsx + MessageThread.tsx
// combined into one screen.

import { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, TextInput, Pressable, FlatList, ActivityIndicator, StyleSheet, Linking } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { supabase } from "../lib/supabase";
import { Colors, Fonts } from "../constants/theme";
import DrillHeader from "../components/DrillHeader";

type Message = { id: string; sender_id: string; body: string; created_at: string };

export default function RediscoverMessageThreadScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [selfId, setSelfId] = useState<string | null>(null);
  const [otherName, setOtherName] = useState("A mother in the Village");
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList<Message>>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }
    setSelfId(user.id);

    const { data: conversation } = await supabase.from("rediscover_conversations").select("id, user_a, user_b").eq("id", id).maybeSingle();
    if (!conversation || (conversation.user_a !== user.id && conversation.user_b !== user.id)) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    const otherId = conversation.user_a === user.id ? conversation.user_b : conversation.user_a;

    const [{ data: otherRow }, { data: messageRows }] = await Promise.all([
      supabase.from("community_author_names").select("mom_name").eq("id", otherId).maybeSingle(),
      supabase.from("rediscover_messages").select("id, sender_id, body, created_at").eq("conversation_id", id).order("created_at", { ascending: true }),
    ]);
    setOtherName(otherRow?.mom_name || "A mother in the Village");
    setMessages(messageRows ?? []);
    setLoading(false);

    // Mark the other person's messages read on open — best-effort, doesn't
    // block the UI.
    supabase
      .from("rediscover_messages")
      .update({ read_at: new Date().toISOString() })
      .eq("conversation_id", id)
      .neq("sender_id", user.id)
      .is("read_at", null)
      .then(() => {});
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  async function send() {
    if (!body.trim() || sending || !selfId || !id) return;
    setSending(true);
    const text = body.trim();
    setBody("");
    const { data, error } = await supabase
      .from("rediscover_messages")
      .insert({ conversation_id: id, sender_id: selfId, body: text })
      .select("id, sender_id, body, created_at")
      .single();
    setSending(false);
    if (!error && data) {
      setMessages((prev) => [...prev, data as Message]);
    } else {
      setBody(text);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.goldDeep} />
      </View>
    );
  }

  if (notFound) {
    return (
      <View style={styles.screen}>
        <DrillHeader title="Conversation" onBack={() => router.push("/rediscover-messages")} />
        <View style={styles.center}>
          <Text style={styles.body}>Conversation not found.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <DrillHeader title={otherName} onBack={() => router.push("/rediscover-messages")} />
      <View style={styles.disclaimerBox}>
        <Text style={styles.disclaimerText}>
          Mom&apos;s Village doesn&apos;t verify anyone here or take a side if
          something goes wrong — settle what&apos;s being delivered and by
          when, and keep your own record.{" "}
          <Text style={styles.disclaimerLink} onPress={() => Linking.openURL("https://www.momvillage.in/rediscover-disclaimer")}>
            Read the full disclaimer
          </Text>
          .
        </Text>
      </View>
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 10 }}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.sender_id === selfId ? styles.bubbleMine : styles.bubbleTheirs]}>
            <Text style={[styles.bubbleText, item.sender_id === selfId && styles.bubbleTextMine]}>{item.body}</Text>
          </View>
        )}
      />
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={body}
          onChangeText={setBody}
          placeholder="Write a message…"
          placeholderTextColor={Colors.ink + "66"}
          maxLength={2000}
        />
        <Pressable style={[styles.sendButton, { opacity: sending || !body.trim() ? 0.6 : 1 }]} onPress={send} disabled={sending || !body.trim()}>
          <Text style={styles.sendButtonText}>Send</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.ivory },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: Colors.ivory },
  body: { fontSize: 13, fontFamily: Fonts.body, color: Colors.ink + "a6" },
  disclaimerBox: { backgroundColor: Colors.ivory2, paddingHorizontal: 20, paddingVertical: 10 },
  disclaimerText: { fontSize: 11, fontFamily: Fonts.body, color: Colors.ink + "99", lineHeight: 16 },
  disclaimerLink: { color: Colors.goldDeep, textDecorationLine: "underline" },
  bubble: { maxWidth: "80%", borderRadius: 16, paddingHorizontal: 14, paddingVertical: 9, marginBottom: 8 },
  bubbleMine: { alignSelf: "flex-end", backgroundColor: Colors.indigo },
  bubbleTheirs: { alignSelf: "flex-start", backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: Colors.line },
  bubbleText: { fontSize: 14, fontFamily: Fonts.body, color: Colors.ink, lineHeight: 19 },
  bubbleTextMine: { color: Colors.ivory },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 20, paddingVertical: 12, borderTopWidth: 1, borderTopColor: Colors.line, backgroundColor: Colors.ivory },
  input: { flex: 1, borderWidth: 1, borderColor: Colors.line, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, fontFamily: Fonts.body, backgroundColor: "#FFFFFF", color: Colors.ink },
  sendButton: { backgroundColor: Colors.indigo, borderRadius: 999, paddingVertical: 10, paddingHorizontal: 18 },
  sendButtonText: { color: Colors.ivory, fontFamily: Fonts.bodyBold, fontSize: 13 },
});
