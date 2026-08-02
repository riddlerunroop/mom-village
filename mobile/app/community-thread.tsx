// Thread detail — native port of [threadId]/page.tsx + ReplyForm +
// ReportButton + BlockButton, Phase 5. Extended 2026-08-02 with pin/lock
// display, real likes + bookmark, and simple poll voting (migration_52) —
// all while keeping the single-flat-forum model (no separate communities).
// Same insert-only report flow throughout (Roop reviews reports directly
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "../lib/supabase";
import { Colors, Fonts, CardStyle } from "../constants/theme";

type Thread = {
  id: string;
  title: string;
  body: string;
  tags: string[];
  created_at: string;
  user_id: string;
  like_count: number;
  is_pinned: boolean;
  is_locked: boolean;
};
type Reply = { id: string; body: string; created_at: string; user_id: string };
type PollOption = { id: string; label: string; sort_order: number };
type Poll = { id: string; question: string };

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

function PollCard({
  poll,
  options,
  votesByOption,
  totalVotes,
  myVote,
  onVote,
}: {
  poll: Poll;
  options: PollOption[];
  votesByOption: Record<string, number>;
  totalVotes: number;
  myVote: string | null;
  onVote: (optionId: string) => void;
}) {
  return (
    <View style={styles.pollCard}>
      <View style={styles.pollHeaderRow}>
        <Ionicons name="bar-chart-outline" size={14} color={Colors.goldDeep} />
        <Text style={styles.pollQuestion}>{poll.question}</Text>
      </View>
      {options.map((opt) => {
        const count = votesByOption[opt.id] || 0;
        const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
        const isMine = myVote === opt.id;
        return (
          <Pressable key={opt.id} style={styles.pollOptionRow} onPress={() => onVote(opt.id)}>
            <View style={styles.pollOptionTop}>
              <View style={styles.pollOptionLabelRow}>
                <Ionicons
                  name={isMine ? "radio-button-on" : "radio-button-off"}
                  size={14}
                  color={isMine ? Colors.goldDeep : Colors.ink + "66"}
                />
                <Text style={[styles.pollOptionLabel, isMine && styles.pollOptionLabelMine]}>{opt.label}</Text>
              </View>
              {myVote !== null && <Text style={styles.pollOptionPct}>{pct}%</Text>}
            </View>
            {myVote !== null && (
              <View style={styles.pollBarTrack}>
                <View style={[styles.pollBarFill, { width: `${pct}%` }, isMine && styles.pollBarFillMine]} />
              </View>
            )}
          </Pressable>
        );
      })}
      <Text style={styles.pollFooter}>
        {totalVotes} {totalVotes === 1 ? "vote" : "votes"}
        {myVote === null ? " — tap an option to vote" : " — tap another option to change your vote"}
      </Text>
    </View>
  );
}

export default function CommunityThreadScreen() {
  const { threadId } = useLocalSearchParams<{ threadId: string }>();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [thread, setThread] = useState<Thread | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [posting, setPosting] = useState(false);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [poll, setPoll] = useState<Poll | null>(null);
  const [pollOptions, setPollOptions] = useState<PollOption[]>([]);
  const [pollVotes, setPollVotes] = useState<{ option_id: string; user_id: string }[]>([]);

  const load = useCallback(async () => {
    if (!threadId) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    setMyUserId(user.id);

    const { data: threadRow } = await supabase
      .from("community_threads")
      .select("id, title, body, tags, created_at, user_id, like_count, is_pinned, is_locked")
      .eq("id", threadId)
      .maybeSingle();
    setThread(threadRow);
    if (!threadRow) {
      setLoading(false);
      return;
    }

    const [{ data: replyRows }, { data: blockedRows }, { data: myLike }, { data: myBookmark }, { data: pollRow }] =
      await Promise.all([
        supabase
          .from("community_replies")
          .select("id, body, created_at, user_id")
          .eq("thread_id", threadId)
          .order("created_at", { ascending: true }),
        supabase.from("user_blocks").select("blocked_id").eq("blocker_id", user.id),
        supabase
          .from("community_thread_likes")
          .select("thread_id")
          .eq("thread_id", threadId)
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase
          .from("user_community_bookmarks")
          .select("thread_id")
          .eq("thread_id", threadId)
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase.from("community_polls").select("id, question").eq("thread_id", threadId).maybeSingle(),
      ]);

    const blockedIds = new Set((blockedRows || []).map((b) => b.blocked_id));
    const visibleReplies = (replyRows || []).filter((r) => !blockedIds.has(r.user_id));
    setReplies(visibleReplies);
    setLiked(!!myLike);
    setBookmarked(!!myBookmark);

    if (pollRow) {
      setPoll(pollRow);
      const [{ data: optionRows }, { data: voteRows }] = await Promise.all([
        supabase.from("community_poll_options").select("id, label, sort_order").eq("poll_id", pollRow.id).order("sort_order"),
        supabase.from("community_poll_votes").select("option_id, user_id").eq("poll_id", pollRow.id),
      ]);
      setPollOptions(optionRows || []);
      setPollVotes(voteRows || []);
    } else {
      setPoll(null);
      setPollOptions([]);
      setPollVotes([]);
    }

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

  async function toggleLike() {
    if (!myUserId || !thread) return;
    const next = !liked;
    setLiked(next);
    setThread((t) => (t ? { ...t, like_count: Math.max(0, t.like_count + (next ? 1 : -1)) } : t));
    if (next) {
      await supabase.from("community_thread_likes").upsert({ thread_id: thread.id, user_id: myUserId });
    } else {
      await supabase.from("community_thread_likes").delete().eq("thread_id", thread.id).eq("user_id", myUserId);
    }
  }

  async function toggleBookmark() {
    if (!myUserId || !thread) return;
    const next = !bookmarked;
    setBookmarked(next);
    if (next) {
      await supabase.from("user_community_bookmarks").upsert({ thread_id: thread.id, user_id: myUserId });
    } else {
      await supabase.from("user_community_bookmarks").delete().eq("thread_id", thread.id).eq("user_id", myUserId);
    }
  }

  async function voteOption(optionId: string) {
    if (!myUserId || !poll) return;
    setPollVotes((prev) => [...prev.filter((v) => v.user_id !== myUserId), { option_id: optionId, user_id: myUserId }]);
    await supabase
      .from("community_poll_votes")
      .upsert({ poll_id: poll.id, option_id: optionId, user_id: myUserId }, { onConflict: "poll_id,user_id" });
  }

  async function submitReply() {
    if (!threadId || replyBody.trim().length === 0 || thread?.is_locked) return;
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

  const myVote = pollVotes.find((v) => v.user_id === myUserId)?.option_id ?? null;
  const votesByOption: Record<string, number> = {};
  pollVotes.forEach((v) => {
    votesByOption[v.option_id] = (votesByOption[v.option_id] || 0) + 1;
  });

  return (
    <View style={styles.screen}>
      <View style={[styles.topBar, { paddingTop: insets.top + 10 }]}>
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
              {(thread.is_pinned || thread.is_locked) && (
                <View style={{ flexDirection: "row", gap: 8, marginBottom: 10 }}>
                  {thread.is_pinned && (
                    <View style={styles.badge}>
                      <Ionicons name="pin" size={10} color={Colors.goldDeep} />
                      <Text style={styles.badgeText}>Pinned</Text>
                    </View>
                  )}
                  {thread.is_locked && (
                    <View style={styles.badge}>
                      <Ionicons name="lock-closed" size={10} color={Colors.ink + "80"} />
                      <Text style={styles.badgeText}>Closed</Text>
                    </View>
                  )}
                </View>
              )}
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

              <View style={styles.threadActionsRow}>
                <Pressable style={styles.actionButton} onPress={toggleLike} hitSlop={8}>
                  <Ionicons name={liked ? "heart" : "heart-outline"} size={17} color={liked ? Colors.terracotta : Colors.indigo} />
                  <Text style={styles.actionText}>{thread.like_count}</Text>
                </Pressable>
                <View style={styles.actionButton}>
                  <Ionicons name="chatbubble-outline" size={16} color={Colors.indigo} />
                  <Text style={styles.actionText}>{replies.length}</Text>
                </View>
                <Pressable style={[styles.actionButton, { marginLeft: "auto" }]} onPress={toggleBookmark} hitSlop={8}>
                  <Ionicons name={bookmarked ? "bookmark" : "bookmark-outline"} size={16} color={Colors.indigo} />
                  <Text style={styles.actionText}>{bookmarked ? "Saved" : "Save"}</Text>
                </Pressable>
              </View>
            </View>

            {poll && (
              <PollCard
                poll={poll}
                options={pollOptions}
                votesByOption={votesByOption}
                totalVotes={pollVotes.length}
                myVote={myVote}
                onVote={voteOption}
              />
            )}

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
          thread.is_locked ? (
            <View style={styles.lockedNotice}>
              <Ionicons name="lock-closed" size={16} color={Colors.ink + "80"} />
              <Text style={styles.lockedNoticeText}>This discussion has been closed to new replies.</Text>
            </View>
          ) : (
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
          )
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
    paddingBottom: 10,
    backgroundColor: Colors.ivory,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  topBarTitle: { fontSize: 15, fontFamily: Fonts.bodyBold, color: Colors.indigo },
  body: { fontSize: 13, fontFamily: Fonts.body, color: Colors.ink + "a6" },
  threadCard: { ...CardStyle, padding: 18, marginBottom: 16 },
  threadTitle: { fontSize: 19, fontFamily: Fonts.display, color: Colors.indigo, marginBottom: 10 },
  threadBody: { fontSize: 13, fontFamily: Fonts.body, color: Colors.ink + "cc", lineHeight: 20, marginBottom: 10 },
  metaRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap", marginBottom: 12 },
  metaAuthor: { fontSize: 11, fontFamily: Fonts.bodyBold, color: Colors.sageDeep },
  metaDot: { fontSize: 11, color: Colors.ink + "66" },
  metaText: { fontSize: 11, fontFamily: Fonts.body, color: Colors.ink + "80" },
  metaAction: { fontSize: 11, fontFamily: Fonts.bodyBold, color: Colors.ink + "66" },
  doneLabel: { fontSize: 11, fontFamily: Fonts.bodyBold, color: Colors.sageDeep },
  badge: { flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: Colors.ivory2, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3, alignSelf: "flex-start" },
  badgeText: { fontSize: 9, fontFamily: Fonts.bodyBold, color: Colors.ink + "80", textTransform: "uppercase" },
  threadActionsRow: { flexDirection: "row", alignItems: "center", gap: 18, borderTopWidth: 1, borderTopColor: Colors.line, paddingTop: 12 },
  actionButton: { flexDirection: "row", alignItems: "center", gap: 5 },
  actionText: { fontSize: 12, fontFamily: Fonts.bodyBold, color: Colors.ink + "80" },
  repliesHeader: { fontSize: 16, fontFamily: Fonts.bodySemiBold, color: Colors.indigo, marginBottom: 12 },
  replyCard: { backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1, borderColor: Colors.line, padding: 14, marginBottom: 10 },
  inlineForm: { flexDirection: "row", alignItems: "center", gap: 10 },
  inlineInput: { fontSize: 11, fontFamily: Fonts.body, borderWidth: 1, borderColor: Colors.line, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: Colors.ivory, width: 130, color: Colors.ink },
  inlineConfirmText: { fontSize: 11, fontFamily: Fonts.body, color: Colors.ink + "99" },
  inlineSend: { fontSize: 11, fontFamily: Fonts.bodyBold, color: Colors.terracotta },
  inlineCancel: { fontSize: 11, fontFamily: Fonts.body, color: Colors.ink + "66" },
  lockedNotice: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: Colors.ivory2, borderRadius: 14, borderWidth: 1, borderColor: Colors.line, padding: 16, marginTop: 10 },
  lockedNoticeText: { fontSize: 12, fontFamily: Fonts.body, color: Colors.ink + "99", flex: 1 },
  replyFormCard: { ...CardStyle, padding: 18, marginTop: 10 },
  label: { fontSize: 11, fontFamily: Fonts.bodyBold, textTransform: "uppercase", letterSpacing: 0.4, color: Colors.sageDeep, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: Colors.line, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, fontFamily: Fonts.body, backgroundColor: Colors.ivory, color: Colors.ink },
  textarea: { minHeight: 90, marginBottom: 12 },
  button: { backgroundColor: Colors.goldDeep, borderRadius: 999, paddingVertical: 13, alignItems: "center" },
  buttonText: { color: Colors.ivory, fontFamily: Fonts.bodyBold, fontSize: 14 },

  pollCard: { ...CardStyle, padding: 16, marginBottom: 16, borderColor: Colors.gold + "70" },
  pollHeaderRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 },
  pollQuestion: { fontSize: 14, fontFamily: Fonts.bodySemiBold, color: Colors.indigo, flex: 1 },
  pollOptionRow: { marginBottom: 10 },
  pollOptionTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 },
  pollOptionLabelRow: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
  pollOptionLabel: { fontSize: 13, fontFamily: Fonts.body, color: Colors.ink + "cc" },
  pollOptionLabelMine: { fontFamily: Fonts.bodyBold, color: Colors.indigo },
  pollOptionPct: { fontSize: 12, fontFamily: Fonts.bodyBold, color: Colors.ink + "80" },
  pollBarTrack: { height: 6, borderRadius: 999, backgroundColor: Colors.ivory2, overflow: "hidden" },
  pollBarFill: { height: "100%", backgroundColor: Colors.ink + "40", borderRadius: 999 },
  pollBarFillMine: { backgroundColor: Colors.goldDeep },
  pollFooter: { fontSize: 11, fontFamily: Fonts.body, color: Colors.ink + "73", marginTop: 4 },
});
