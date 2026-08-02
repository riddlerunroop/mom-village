// Community tab — rebuilt 2026-08-02 to match Roop's mockup + her own
// clarified brief. She reviewed a full "how real Orkut Communities worked"
// document alongside a single-screen mockup and confirmed the scope
// directly: Mom Village stays ONE flat forum ("mom village is a community
// in itself" — no separate named sub-communities to create/join, unlike
// real Orkut/MTV-style communities). What carries over from the brief is
// only what fits a single forum well: pinned/locked threads, real likes,
// bookmarks, simple polls, and topic browsing — all built this pass
// (migration_52). Search, block filtering, and the starter-prompt empty
// state are unchanged from the original Phase 5 build.

import { useCallback, useState } from "react";
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
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";
import { hasActiveSubscription } from "../../lib/subscription";
import { Colors, Fonts, CardStyle, iconBadge } from "../../constants/theme";
import ScreenHeader from "../../components/ScreenHeader";

const STARTER_PROMPTS = [
  "What's one thing that surprised you about this stage?",
  "Anyone else's baby doing something new this week?",
  "What's a government scheme you wish you'd known about earlier?",
  "How did you decide when (or whether) to go back to work?",
  "What's something you needed to hear today?",
];

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

type Thread = {
  id: string;
  title: string;
  body: string;
  tags: string[];
  reply_count: number;
  like_count: number;
  is_pinned: boolean;
  is_locked: boolean;
  last_activity_at: string;
  user_id: string;
};

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.floor(ms / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const days = Math.floor(hr / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function AvatarInitial({ name }: { name: string }) {
  const letter = (name || "?").trim().charAt(0).toUpperCase() || "?";
  return (
    <View style={styles.avatar}>
      <Text style={styles.avatarText}>{letter}</Text>
    </View>
  );
}

function ThreadCard({
  thread,
  authorName,
  liked,
  bookmarked,
  onPress,
  onToggleLike,
  onToggleBookmark,
  featured,
}: {
  thread: Thread;
  authorName: string;
  liked: boolean;
  bookmarked: boolean;
  onPress: () => void;
  onToggleLike: () => void;
  onToggleBookmark: () => void;
  featured?: boolean;
}) {
  return (
    <Pressable style={[styles.threadCard, featured && styles.threadCardFeatured]} onPress={onPress}>
      <View style={styles.threadHeaderRow}>
        <AvatarInitial name={authorName} />
        <View style={{ flex: 1 }}>
          <Text style={styles.threadAuthor}>{authorName}</Text>
          <Text style={styles.threadTime}>{timeAgo(thread.last_activity_at)}</Text>
        </View>
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

      <Text style={styles.threadTitle}>{thread.title}</Text>
      <Text style={styles.threadBody} numberOfLines={2}>
        {thread.body}
      </Text>

      <View style={styles.threadActionsRow}>
        <Pressable style={styles.actionButton} onPress={onToggleLike} hitSlop={8}>
          <Ionicons name={liked ? "heart" : "heart-outline"} size={16} color={liked ? Colors.terracotta : Colors.indigo} />
          <Text style={styles.actionText}>{thread.like_count}</Text>
        </Pressable>
        <View style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={15} color={Colors.indigo} />
          <Text style={styles.actionText}>{thread.reply_count}</Text>
        </View>
        <Pressable style={[styles.actionButton, { marginLeft: "auto" }]} onPress={onToggleBookmark} hitSlop={8}>
          <Ionicons name={bookmarked ? "bookmark" : "bookmark-outline"} size={15} color={Colors.indigo} />
        </Pressable>
      </View>
    </Pressable>
  );
}

export default function CommunityScreen() {
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<"recent" | "trending">("recent");
  const [threads, setThreads] = useState<Thread[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  const load = useCallback(async (searchTerm: string, tag: string | null, sort: "recent" | "trending") => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    setMyUserId(user.id);

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
      .select("id, title, body, tags, reply_count, like_count, is_pinned, is_locked, last_activity_at, user_id")
      .order("is_pinned", { ascending: false })
      .limit(50);

    q = sort === "trending" ? q.order("like_count", { ascending: false }) : q.order("last_activity_at", { ascending: false });

    if (blockedIds.length > 0) {
      q = q.not("user_id", "in", `(${blockedIds.join(",")})`);
    }
    if (tag) {
      q = q.contains("tags", [tag]);
    }
    if (searchTerm.trim().length > 0) {
      q = q.textSearch("search_doc", searchTerm.trim(), { type: "websearch", config: "english" });
    }

    const { data } = await q;
    const rows = data || [];
    setThreads(rows);

    const [{ data: likeRows }, { data: bookmarkRows }] = await Promise.all([
      supabase.from("community_thread_likes").select("thread_id").eq("user_id", user.id),
      supabase.from("user_community_bookmarks").select("thread_id").eq("user_id", user.id),
    ]);
    setLikedIds(new Set((likeRows || []).map((r) => r.thread_id)));
    setBookmarkedIds(new Set((bookmarkRows || []).map((r) => r.thread_id)));

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
      load(activeQuery, activeTag, sortMode);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeQuery, activeTag, sortMode])
  );

  function runSearch() {
    setActiveTag(null);
    setActiveQuery(query);
  }

  function toggleTag(tag: string) {
    setQuery("");
    setActiveQuery("");
    setActiveTag((prev) => (prev === tag ? null : tag));
  }

  function startFromPrompt(prompt: string) {
    router.push({ pathname: "/community-new", params: { title: prompt } });
  }

  async function toggleLike(threadId: string) {
    if (!myUserId) return;
    const isLiked = likedIds.has(threadId);
    // Optimistic update — feels instant, and a failed request just gets
    // corrected on the next focus/reload rather than blocking the tap.
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (isLiked) next.delete(threadId);
      else next.add(threadId);
      return next;
    });
    setThreads((prev) =>
      prev.map((t) => (t.id === threadId ? { ...t, like_count: Math.max(0, t.like_count + (isLiked ? -1 : 1)) } : t))
    );
    if (isLiked) {
      await supabase.from("community_thread_likes").delete().eq("thread_id", threadId).eq("user_id", myUserId);
    } else {
      await supabase.from("community_thread_likes").upsert({ thread_id: threadId, user_id: myUserId });
    }
  }

  async function toggleBookmark(threadId: string) {
    if (!myUserId) return;
    const isBookmarked = bookmarkedIds.has(threadId);
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (isBookmarked) next.delete(threadId);
      else next.add(threadId);
      return next;
    });
    if (isBookmarked) {
      await supabase.from("user_community_bookmarks").delete().eq("thread_id", threadId).eq("user_id", myUserId);
    } else {
      await supabase.from("user_community_bookmarks").upsert({ thread_id: threadId, user_id: myUserId });
    }
  }

  function openThread(threadId: string) {
    router.push({ pathname: "/community-thread", params: { threadId } });
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.goldDeep} />
      </View>
    );
  }

  const trending = sortMode === "trending" && threads.length > 0 ? threads[0] : null;
  const listThreads = trending ? threads.slice(1) : threads;

  return (
    <View style={styles.screen}>
      <ScreenHeader />
      <View style={{ paddingHorizontal: 20, paddingTop: 16, flex: 1 }}>
        <Text style={styles.title}>Community</Text>

        {!isSubscribed ? (
          <View style={styles.lockedCard}>
            <Text style={styles.cardTitle}>You&apos;re not doing this alone</Text>
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
          <FlatList
            data={listThreads}
            keyExtractor={(t) => t.id}
            contentContainerStyle={{ paddingBottom: 24 }}
            ListHeaderComponent={
              <>
                <View style={styles.searchRow}>
                  <Ionicons name="search" size={16} color={Colors.ink + "66"} style={{ marginRight: 8 }} />
                  <TextInput
                    style={styles.searchInput}
                    value={query}
                    onChangeText={setQuery}
                    placeholder="Search discussions"
                    placeholderTextColor={Colors.ink + "66"}
                    returnKeyType="search"
                    onSubmitEditing={runSearch}
                  />
                </View>

                {!!activeQuery && (
                  <Text style={styles.searchResultNote}>
                    {threads.length > 0
                      ? `Showing results for "${activeQuery}"`
                      : `No past discussions found for "${activeQuery}" — be the first to start one.`}
                  </Text>
                )}

                {threads.length > 0 && !activeQuery && (
                  <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionLabel}>
                      {sortMode === "trending" ? "Trending discussion" : "Recent discussions"}
                    </Text>
                    <Pressable onPress={() => setSortMode((m) => (m === "trending" ? "recent" : "trending"))} hitSlop={8}>
                      <Text style={styles.seeAll}>{sortMode === "trending" ? "Show recent" : "See all"}</Text>
                    </Pressable>
                  </View>
                )}

                {trending && (
                  <ThreadCard
                    thread={trending}
                    authorName={names[trending.user_id] || "A mom in the village"}
                    liked={likedIds.has(trending.id)}
                    bookmarked={bookmarkedIds.has(trending.id)}
                    onPress={() => openThread(trending.id)}
                    onToggleLike={() => toggleLike(trending.id)}
                    onToggleBookmark={() => toggleBookmark(trending.id)}
                    featured
                  />
                )}

                <Pressable style={styles.startButton} onPress={() => router.push("/community-new")}>
                  <Ionicons name="add" size={18} color={Colors.ivory} />
                  <Text style={styles.startButtonText}>Start a discussion</Text>
                </Pressable>

                <Pressable onPress={() => Linking.openURL("https://www.momvillage.in/community-guidelines")}>
                  <Text style={styles.guidelinesLink}>
                    Posts here are member experience, not medical or financial advice — see our
                    Community Guidelines.
                  </Text>
                </Pressable>

                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionLabel}>Browse topics</Text>
                </View>
                <View style={styles.topicGrid}>
                  {TOPIC_TAGS.map((tag) => {
                    const selected = activeTag === tag;
                    return (
                      <Pressable
                        key={tag}
                        style={[styles.topicChip, selected && styles.topicChipSelected]}
                        onPress={() => toggleTag(tag)}
                      >
                        <Text style={[styles.topicChipText, selected && styles.topicChipTextSelected]}>{tag}</Text>
                      </Pressable>
                    );
                  })}
                </View>

                {threads.length === 0 && !activeQuery && !activeTag ? (
                  <View style={styles.emptyCard}>
                    <View style={styles.emptyIconBadge}>
                      <Ionicons name="chatbubbles-outline" size={20} color={Colors.indigo} />
                    </View>
                    <Text style={styles.emptyTitle}>No discussions yet — start the first one.</Text>
                    <Text style={styles.emptyHint}>Not sure what to ask? Try one of these:</Text>
                    {STARTER_PROMPTS.map((prompt) => (
                      <Pressable key={prompt} style={styles.promptRow} onPress={() => startFromPrompt(prompt)}>
                        <Text style={styles.promptText}>{prompt}</Text>
                      </Pressable>
                    ))}
                  </View>
                ) : (
                  <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionLabel}>
                      {activeTag ? `Tagged "${activeTag}"` : "All discussions"}
                    </Text>
                  </View>
                )}
              </>
            }
            renderItem={({ item }) => (
              <ThreadCard
                thread={item}
                authorName={names[item.user_id] || "A mom in the village"}
                liked={likedIds.has(item.id)}
                bookmarked={bookmarkedIds.has(item.id)}
                onPress={() => openThread(item.id)}
                onToggleLike={() => toggleLike(item.id)}
                onToggleBookmark={() => toggleBookmark(item.id)}
              />
            )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.ivory },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: Colors.ivory },
  title: { fontSize: 28, fontFamily: Fonts.display, color: Colors.indigo, marginBottom: 14 },
  lockedCard: { ...CardStyle, padding: 20 },
  cardTitle: { fontSize: 16, fontFamily: Fonts.bodySemiBold, color: Colors.indigo, marginBottom: 8 },
  body: { fontSize: 13, fontFamily: Fonts.body, color: Colors.ink + "a6", lineHeight: 19, marginBottom: 12 },
  button: { backgroundColor: Colors.goldDeep, borderRadius: 999, paddingVertical: 13, alignItems: "center" },
  buttonText: { color: Colors.ivory, fontFamily: Fonts.bodyBold, fontSize: 14 },

  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.line,
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 20,
  },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 13, fontFamily: Fonts.body, color: Colors.ink },
  searchResultNote: { fontSize: 11, fontFamily: Fonts.body, color: Colors.ink + "80", marginBottom: 10 },

  sectionHeaderRow: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", marginBottom: 10 },
  sectionLabel: { fontSize: 15, fontFamily: Fonts.bodySemiBold, color: Colors.indigo },
  seeAll: { fontSize: 12, fontFamily: Fonts.bodyBold, color: Colors.goldDeep },

  startButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: Colors.goldDeep,
    borderRadius: 999,
    paddingVertical: 14,
    marginBottom: 12,
  },
  startButtonText: { color: Colors.ivory, fontFamily: Fonts.bodyBold, fontSize: 14 },
  guidelinesLink: { fontSize: 11, fontFamily: Fonts.body, color: Colors.ink + "73", lineHeight: 16, marginBottom: 22, textDecorationLine: "underline" },

  topicGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 22 },
  topicChip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1.5, borderColor: Colors.line, backgroundColor: "#FFFFFF" },
  topicChipSelected: { backgroundColor: Colors.indigo, borderColor: Colors.indigo },
  topicChipText: { fontSize: 12, fontFamily: Fonts.bodyBold, color: Colors.indigo },
  topicChipTextSelected: { color: Colors.ivory },

  emptyCard: { ...CardStyle, padding: 20, alignItems: "center" },
  emptyIconBadge: { ...iconBadge(Colors.indigo, 44), marginBottom: 10 },
  emptyTitle: { fontSize: 15, fontFamily: Fonts.displayItalic, color: Colors.sageDeep, marginBottom: 14, textAlign: "center" },
  emptyHint: { fontSize: 10, fontFamily: Fonts.bodyBold, textTransform: "uppercase", letterSpacing: 0.4, color: Colors.ink + "66", marginBottom: 10 },
  promptRow: { backgroundColor: Colors.ivory2, borderRadius: 12, borderWidth: 1, borderColor: Colors.line, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 8, width: "100%" },
  promptText: { fontSize: 13, fontFamily: Fonts.body, color: Colors.ink + "bf" },

  threadCard: { ...CardStyle, padding: 16, marginBottom: 12 },
  threadCardFeatured: { borderColor: Colors.gold + "70", marginBottom: 16 },
  threadHeaderRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.goldDeep, alignItems: "center", justifyContent: "center" },
  avatarText: { color: Colors.ivory, fontFamily: Fonts.bodyBold, fontSize: 13 },
  threadAuthor: { fontSize: 12, fontFamily: Fonts.bodySemiBold, color: Colors.indigo },
  threadTime: { fontSize: 10, fontFamily: Fonts.body, color: Colors.ink + "73" },
  badge: { flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: Colors.ivory2, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 9, fontFamily: Fonts.bodyBold, color: Colors.ink + "80", textTransform: "uppercase" },
  threadTitle: { fontSize: 15, fontFamily: Fonts.bodySemiBold, color: Colors.indigo, marginBottom: 4 },
  threadBody: { fontSize: 13, fontFamily: Fonts.body, color: Colors.ink + "a6", lineHeight: 18, marginBottom: 12 },
  threadActionsRow: { flexDirection: "row", alignItems: "center", gap: 18 },
  actionButton: { flexDirection: "row", alignItems: "center", gap: 5 },
  actionText: { fontSize: 12, fontFamily: Fonts.bodyBold, color: Colors.ink + "80" },
});
