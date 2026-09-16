// Reset Gallery — native mirror of
// src/app/dashboard/community/reset-gallery/page.tsx. Browsable grid, no
// comments/threading, heart tap only. Chronological, never algorithmic —
// "Show more" is a manual, real-content page-in, not an auto-loading feed.
// See migration_59_reset_feature_schema.sql and CLAUDE.md's Reset rebuild
// entry.

import { useCallback, useState } from "react";
import { View, Text, Pressable, Image, ActivityIndicator, ScrollView, StyleSheet, Alert } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Video, Audio, ResizeMode } from "expo-av";
import { supabase } from "../lib/supabase";
import { hasActiveSubscription } from "../lib/subscription";
import { Colors, Fonts } from "../constants/theme";
import DrillHeader from "../components/DrillHeader";
import ResetHeartButton from "../components/ResetHeartButton";

const PAGE_SIZE = 30;

type ShareRow = {
  id: string;
  user_id: string;
  activity_id: string | null;
  media_type: "text" | "photo" | "video" | "audio";
  media_path: string | null;
  caption: string | null;
  heart_count: number;
  created_at: string;
};

export default function ResetGalleryScreen() {
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [shares, setShares] = useState<ShareRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [namesByUserId, setNamesByUserId] = useState<Record<string, string>>({});
  const [heartedIds, setHeartedIds] = useState<Set<string>>(new Set());
  const [activityById, setActivityById] = useState<Record<string, { emoji: string; title: string }>>({});
  const [playingId, setPlayingId] = useState<string | null>(null);

  const load = useCallback(async (currentLimit: number) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }
    const subscribed = await hasActiveSubscription(supabase, user.id);
    setIsSubscribed(subscribed);
    if (!subscribed) {
      setLoading(false);
      return;
    }

    const { data: blockedRows } = await supabase.from("user_blocks").select("blocked_id").eq("blocker_id", user.id);
    const blockedIds = (blockedRows || []).map((b) => b.blocked_id);

    let query = supabase
      .from("reset_shares")
      .select("id, user_id, activity_id, media_type, media_path, caption, heart_count, created_at", { count: "exact" })
      .order("created_at", { ascending: false })
      .limit(currentLimit);
    if (blockedIds.length > 0) query = query.not("user_id", "in", `(${blockedIds.join(",")})`);

    const { data, count } = await query;
    const rows = (data || []) as ShareRow[];
    setShares(rows);
    setTotalCount(count ?? rows.length);

    if (rows.length > 0) {
      const userIds = Array.from(new Set(rows.map((s) => s.user_id)));
      const { data: authors } = await supabase.from("community_author_names").select("id, mom_name").in("id", userIds);
      setNamesByUserId(
        Object.fromEntries((authors || []).map((a) => [a.id, a.mom_name || "A mom in the village"]))
      );

      const { data: heartRows } = await supabase
        .from("reset_share_hearts")
        .select("share_id")
        .eq("user_id", user.id)
        .in("share_id", rows.map((s) => s.id));
      setHeartedIds(new Set((heartRows || []).map((h) => h.share_id)));

      const activityIds = Array.from(
        new Set(rows.map((s) => s.activity_id).filter((id): id is string => Boolean(id)))
      );
      if (activityIds.length > 0) {
        const { data: acts } = await supabase.from("reset_activities").select("id, emoji, title").in("id", activityIds);
        setActivityById(Object.fromEntries((acts || []).map((a) => [a.id, { emoji: a.emoji, title: a.title }])));
      }
    }
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load(limit);
    }, [load, limit])
  );

  async function playAudio(path: string, id: string) {
    try {
      const url = supabase.storage.from("reset-shares").getPublicUrl(path).data.publicUrl;
      setPlayingId(id);
      const { sound } = await Audio.Sound.createAsync({ uri: url });
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setPlayingId(null);
          sound.unloadAsync();
        }
      });
      await sound.playAsync();
    } catch {
      setPlayingId(null);
      Alert.alert("Couldn't play that clip", "Try again in a moment.");
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.terracotta} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <DrillHeader title="Reset Gallery" />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.eyebrow}>discovery, not a discussion</Text>
        <Text style={styles.title}>Reset Gallery</Text>
        <Text style={styles.body}>
          See how other mothers are resetting today — no comments, no following, just a heart if
          something makes you smile. Want to actually talk to someone? That&apos;s what{" "}
          <Text style={styles.link} onPress={() => router.push("/(tabs)/community")}>
            Community
          </Text>{" "}
          is for.
        </Text>

        {!isSubscribed ? (
          <View style={styles.lockedCard}>
            <Text style={styles.cardTitle}>Join to see the village&apos;s Resets</Text>
          </View>
        ) : shares.length === 0 ? (
          <View style={styles.lockedCard}>
            <Text style={styles.emptyText}>Nobody&apos;s shared a Reset yet — be the first.</Text>
          </View>
        ) : (
          <>
            {shares.map((s) => {
              const publicUrl = s.media_path
                ? supabase.storage.from("reset-shares").getPublicUrl(s.media_path).data.publicUrl
                : null;
              const act = s.activity_id ? activityById[s.activity_id] : null;
              return (
                <View key={s.id} style={styles.card}>
                  {act && (
                    <Text style={styles.activityLabel}>
                      {act.emoji} {act.title}
                    </Text>
                  )}

                  {s.media_type === "text" && <Text style={styles.textShare}>&ldquo;{s.caption}&rdquo;</Text>}

                  {s.media_type === "photo" && publicUrl && (
                    <Image source={{ uri: publicUrl }} style={styles.media} />
                  )}

                  {s.media_type === "video" && publicUrl && (
                    <Video
                      source={{ uri: publicUrl }}
                      style={styles.media}
                      useNativeControls
                      resizeMode={ResizeMode.COVER}
                    />
                  )}

                  {s.media_type === "audio" && publicUrl && (
                    <Pressable
                      style={styles.audioButton}
                      onPress={() => playAudio(s.media_path!, s.id)}
                      disabled={playingId === s.id}
                    >
                      <Text style={styles.audioButtonText}>
                        {playingId === s.id ? "▶ Playing…" : "▶ Play voice note"}
                      </Text>
                    </Pressable>
                  )}

                  {s.media_type !== "text" && s.caption && <Text style={styles.caption}>{s.caption}</Text>}

                  <View style={styles.footerRow}>
                    <View>
                      <Text style={styles.authorName}>{namesByUserId[s.user_id]}</Text>
                      <Text style={styles.date}>
                        {new Date(s.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </Text>
                    </View>
                    <ResetHeartButton
                      shareId={s.id}
                      initialHearted={heartedIds.has(s.id)}
                      initialCount={s.heart_count}
                    />
                  </View>
                </View>
              );
            })}

            {shares.length < totalCount && (
              <Pressable style={styles.showMoreButton} onPress={() => setLimit((l) => l + PAGE_SIZE)}>
                <Text style={styles.showMoreText}>Show more</Text>
              </Pressable>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.ivory },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: Colors.ivory },
  eyebrow: {
    fontFamily: Fonts.bodyBold,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: Colors.terracotta,
    marginBottom: 4,
  },
  title: { fontFamily: Fonts.display, fontSize: 24, color: Colors.indigo, marginBottom: 8 },
  body: { fontFamily: Fonts.body, fontSize: 13.5, color: Colors.ink + "a6", lineHeight: 20, marginBottom: 20 },
  link: { color: Colors.terracotta, fontFamily: Fonts.bodySemiBold, textDecorationLine: "underline" },
  lockedCard: { backgroundColor: Colors.ivory2, borderRadius: 18, borderWidth: 1, borderColor: Colors.line, padding: 24, alignItems: "center" },
  cardTitle: { fontFamily: Fonts.bodyBold, fontSize: 15, color: Colors.indigo },
  emptyText: { fontFamily: Fonts.display, fontStyle: "italic", fontSize: 15, color: Colors.sageDeep, textAlign: "center" },
  card: { backgroundColor: Colors.ivory2, borderRadius: 16, borderWidth: 1, borderColor: Colors.line, padding: 14, marginBottom: 12 },
  activityLabel: { fontFamily: Fonts.bodyBold, fontSize: 11, color: Colors.terracotta, marginBottom: 8 },
  textShare: { fontFamily: Fonts.body, fontStyle: "italic", fontSize: 14, color: Colors.ink + "cc", marginBottom: 10 },
  media: { width: "100%", height: 220, borderRadius: 12, backgroundColor: "#fff", marginBottom: 10 },
  audioButton: { backgroundColor: Colors.terracotta + "18", borderRadius: 999, paddingVertical: 10, alignItems: "center", marginBottom: 10 },
  audioButtonText: { fontFamily: Fonts.bodySemiBold, fontSize: 13, color: Colors.terracotta },
  caption: { fontFamily: Fonts.body, fontSize: 12.5, color: Colors.ink + "b0", marginBottom: 10 },
  footerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 6 },
  authorName: { fontFamily: Fonts.bodySemiBold, fontSize: 12, color: Colors.sageDeep },
  date: { fontFamily: Fonts.body, fontSize: 10.5, color: Colors.ink + "60" },
  showMoreButton: { alignSelf: "center", marginTop: 8, marginBottom: 20 },
  showMoreText: { fontFamily: Fonts.bodySemiBold, fontSize: 13, color: Colors.terracotta, textDecorationLine: "underline" },
});
