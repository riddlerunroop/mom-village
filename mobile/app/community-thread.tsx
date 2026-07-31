// Thread detail — native port of [threadId]/page.tsx + ReplyForm +
// ReportButton + BlockButton, Phase 5. Same tables, same per-viewer block
// filtering, same insert-only report flow (Roop reviews reports directly
// in Supabase, no in-app admin panel — matches every other content-review
// workflow in this project).

import { useCallback, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";
import { Colors } from "../constants/theme";

type Thread = {
  id: string;
  title: string;
  body: string;
  tags: string[];
  created_at: string;
  user_id: string;
};
type Reply = { id: string; body: string; created_at: string; user_id: string };

function formatWhen(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function ReportControl({ threadId, replyId }: { threadId?: string; replyId?: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function submit() {
    if (!reason.trim()) return;
    setSubmitting(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSubmitting(false);
      return;
    }
    await supabase
      .from("community_reports")
      .insert({ reporter_id: user.id, thread_id: threadId ?? null, reply_id: replyId ?? null, reason: reason.trim() });
    setSubmitting(false);
    setDone(true);
    setOpen(false);
  }

  if (done) return <Text style={styles.doneLabel}>Reported — thank you</Text>;
  if (!open)
    return (
      <Pressable onPress={() => setOpen(true)}>
        <Text style={styles.metaAction}>Report</Text>
      </Pressable>
    );
  return (
    <View style={styles.inlineForm}>
      <TextInput
        style={styles.inlineInput}
        value={reason}
        onChangeText={setReason}
        placeholder="What's wrong with this?"
        placeholderTextColor={Colors.ink + "66"}
      />
      <Pressable onPress={submit} disabled={submitting || !reason.trim()}>
        <Text style={styles.inlineSend}>{submitting ? "…" : "Send"}</Text>
      </Pressable>
      <Pressable onPress={() => setOpen(false)}>
        <Text style={styles.inlineCancel}>Cancel</Text>
      </Pressable>
    </View>
  );
}

function BlockControl({ userId, authorName }: { userId: string; authorName: string }) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function submit() {
    setSubmitting(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSubmitting(false);
      return;
    }
    await supabase
      .from("user_blocks")
      .upsert({ blocker_id: user.id, blocked_id: userId }, { onConflict: "blocker_id,blocked_id" });
    setSubmitting(false);
    setDone(true);
    setOpen(false);
  }

  if (done) return <Text style={styles.doneLabel}>Blocked</Text>;
  if (!open)
    return (
      <Pressable onPress={() => setOpen(true)}>
        <Text style={styles.metaAction}>Block</Text>
      </Pressable>
    );
  return (
    <View style={styles.inlineForm}>
      <Text style={styles.inlineConfirmText}>Block {authorName}?</Text>
      <Pressable onPress={submit} disabled={submitting}>
        <Text style={styles.inlineSend}>{submitting ? "…" : "Confirm"}</Text>
      </Pressable>
      <Pressable onPress={() => setOpen(false)}>
        <Text style={styles.inlineCancel}>Cancel</Text>
      </Pressable>
    </View>
  );
}

export default function CommunityThreadScreen() {
  const { threadId } = useLocalSearchParams<{ threadId: string }>();
  const [loading, setLoading] = useState(true);
  const [thread, setThread] = useState<Thread | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [posting, setPosting] = useState(false);

  const load = useCallback(async () => {
    if (!threadId) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    setMyUserId(user.id);

    const { data: threadRow } = await supabase
      .from("community_threads")
      .select("id, title, body, tags, created_at, user_id")
      .eq("id", threadId)
      .maybeSingle();
    setThread(threadRow);
    if (!threadRow) {
      setLoading(false);
      return;
    }

    const { data: replyRows } = await supabase
      .from("community_replies")
      .select("id, body, created_at, user_id")
      .eq("thread_id", threadId)
      .order("created_at", { ascending: true });

    const { data: blockedRows } = await supabase
      .from("user_blocks")
      .select("blocked_id")
      .eq("blocker_id", user.id);
    const blockedIds = new Set((blockedRows || []).map((b) => b.blocked_id));
    const visibleReplies = (replyRows || []).filter((r) => !blockedIds.has(r.user_id));
    setReplies(visibleReplies);

    const allUserIds = Array.from(new Set([threadRow.user_id, ...visibleReplies.map((r) => r.user_id)]));
    const { data: authors } = await supabase
      .from("community_author_names")
      .select("id, mom_name")
      .in("id", allUserIds);
    setNames(Object.fromEntries((authors || []).map((a) => [a.id, a.mom_name || "A mom in the village"])));
    setLoading(false);
  }, [threadId]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [load])
  );

  async function submitReply() {
    if (!threadId || replyBody.trim().length === 0) return;
    setPosting(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setPosting(false);
      router.push("/login");
      return;
    }
    await supabase
      .from("community_replies")
      .insert({ thread_id: threadId, user_id: user.id, body: replyBody.trim() });
    setReplyBody("");
    setPosting(false);
    load();
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.goldDeep} />
      </View>
    );
  }

  if (!thread) {
    return (
      <View style={styles.center}>
        <Text style={styles.body}>Discussion not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={22} color={Colors.indigo} />
        </Pressable>
        <Text style={styles.topBarTitle}>Discussion</Text>
        <View style={{ width: 22 }} />
      </View>

      <FlatList
        data={replies}
        keyExtractor={(r) => r.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        ListHeaderComponent={
          <>
            <View style={styles.threadCard}>
              <Text style={styles.threadTitle}>{thread.title}</Text>
              <Text style={styles.threadBody}>{thread.body}</Text>
              <View style={styles.metaRow}>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, flex: 1 }}>
                  <Text style={styles.metaAuthor}>{names[thread.user_id]}</Text>
                  <Text style={styles.metaDot}>·</Text>
                  <Text style={styles.metaText}>{formatWhen(thread.created_at)}</Text>
                  {thread.tags.length > 0 && (
                    <>
                      <Text style={styles.metaDot}>·</Text>
                      <Text style={styles.metaText}>{thread.tags.join(", ")}</Text>
                    </>
                  )}
                </View>
                <View style={{ flexDirection: "row", gap: 12 }}>
                  {thread.user_id !== myUserId && (
                    <BlockControl userId={thread.user_id} authorName={names[thread.user_id]} />
                  )}
                  <ReportControl threadId={thread.id} />
                </View>
              </View>
            </View>

            <Text style={styles.repliesHeader}>
              {replies.length === 0 ? "No replies yet" : `${replies.length} ${replies.length === 1 ? "reply" : "replies"}`}
            </Text>
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.replyCard}>
            <Text style={styles.threadBody}>{item.body}</Text>
            <View style={styles.metaRow}>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, flex: 1 }}>
                <Text style={styles.metaAuthor}>{names[item.user_id]}</Text>
                <Text style={styles.metaDot}>·</Text>
                <Text style={styles.metaText}>{formatWhen(item.created_at)}</Text>
              </View>
              <View style={{ flexDirection: "row", gap: 12 }}>
                {item.user_id !== myUserId && (
                  <BlockControl userId={item.user_id} authorName={names[item.user_id]} />
                )}
                <ReportControl replyId={item.id} />
              </View>
            </View>
          </View>
        )}
        ListFooterComponent={
          <View style={styles.replyFormCard}>
            <Text style={styles.label}>Reply</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              value={replyBody}
              onChangeText={setReplyBody}
              placeholder="Share what worked for you, or ask a follow-up…"
              placeholderTextColor={Colors.ink + "66"}
              multiline
              textAlignVertical="top"
            />
            <Pressable
              style={[styles.button, { opacity: replyBody.trim().length > 0 ? 1 : 0.5 }]}
              onPress={submitReply}
              disabled={posting || replyBody.trim().length === 0}
            >
              {posting ? <ActivityIndicator color={Colors.ivory} /> : <Text style={styles.buttonText}>Post reply</Text>}
            </Pressable>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.ivory },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: Colors.ivory },
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
  body: { fontSize: 13, color: Colors.ink + "a6" },
  threadCard: { backgroundColor: Colors.ivory2, borderRadius: 18, borderWidth: 1, borderColor: Colors.line, padding: 18, marginBottom: 18 },
  threadTitle: { fontSize: 19, fontWeight: "700", color: Colors.indigo, marginBottom: 10 },
  threadBody: { fontSize: 13, color: Colors.ink + "cc", lineHeight: 20, marginBottom: 10 },
  metaRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" },
  metaAuthor: { fontSize: 11, fontWeight: "700", color: Colors.sageDeep },
  metaDot: { fontSize: 11, color: Colors.ink + "66" },
  metaText: { fontSize: 11, color: Colors.ink + "80" },
  metaAction: { fontSize: 11, color: Colors.ink + "66", fontWeight: "700" },
  doneLabel: { fontSize: 11, color: Colors.sageDeep, fontWeight: "700" },
  repliesHeader: { fontSize: 16, fontWeight: "700", color: Colors.indigo, marginBottom: 12 },
  replyCard: { backgroundColor: Colors.ivory, borderRadius: 14, borderWidth: 1, borderColor: Colors.line, padding: 14, marginBottom: 10 },
  inlineForm: { flexDirection: "row", alignItems: "center", gap: 10 },
  inlineInput: { fontSize: 11, borderWidth: 1, borderColor: Colors.line, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: Colors.ivory, width: 130, color: Colors.ink },
  inlineConfirmText: { fontSize: 11, color: Colors.ink + "99" },
  inlineSend: { fontSize: 11, fontWeight: "700", color: Colors.terracotta },
  inlineCancel: { fontSize: 11, color: Colors.ink + "66" },
  replyFormCard: { backgroundColor: Colors.ivory2, borderRadius: 18, borderWidth: 1, borderColor: Colors.line, padding: 18, marginTop: 10 },
  label: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.4, color: Colors.sageDeep, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: Colors.line, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, backgroundColor: Colors.ivory, color: Colors.ink },
  textarea: { minHeight: 90, marginBottom: 12 },
  button: { backgroundColor: Colors.goldDeep, borderRadius: 999, paddingVertical: 13, alignItems: "center" },
  buttonText: { color: Colors.ivory, fontWeight: "700", fontSize: 14 },
});
