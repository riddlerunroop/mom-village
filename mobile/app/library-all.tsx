// "All your books" — the real destination for the bookshelf's "See all"
// links, which were previously just plain, non-interactive text (a
// deliberately flagged gap from the look-and-feel-first Library rebuild).
// Roop caught this live: "see all button doesn't work.. and all books
// aree not there" — the main screen's "More to explore" shelf only ever
// shows 3 books at a time, so two of the six (the last two Parenting
// titles) were never reachable at all. This screen lists every book,
// full stop, with the same unlock/progress logic as the bookshelf.

import { useCallback, useEffect, useState } from "react";
import { View, Text, Image, Pressable, ScrollView, ActivityIndicator, StyleSheet, Linking } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Circle } from "react-native-svg";
import { supabase } from "../lib/supabase";
import { hasActiveSubscription } from "../lib/subscription";
import { hasPurchasedBundle } from "../lib/purchases";
import { LIBRARY_BOOKS } from "../lib/library";
import type { LibrarySeries } from "../lib/library";
import { loadBookContent } from "../lib/libraryContent";
import { Colors, Fonts } from "../constants/theme";
import DrillHeader from "../components/DrillHeader";

type Row = {
  slug: string;
  title: string;
  tagline: string;
  series: LibrarySeries;
  seriesLabel: string;
  cover: string;
  unlocked: boolean;
  percent: number | null; // null = never started
};

// Roop's ask, 2026-08-02: not every mother browsing this list is tech-savvy
// enough to infer from six mixed titles which books are about money and
// which are about parenting — plain section headers over each group make
// it obvious at a glance, rather than relying on the small per-book series
// label alone (which the flat list previously did).
const SERIES_ICON: Record<LibrarySeries, keyof typeof Ionicons.glyphMap> = {
  wealth: "cash-outline",
  parenting: "heart-outline",
};

export default function LibraryAllScreen() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Row[]>([]);

  const load = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const subscribed = await hasActiveSubscription(supabase, user.id);
    const hasBundle = subscribed ? true : await hasPurchasedBundle(supabase, user.id);

    let purchasedSlugs = new Set<string>();
    if (!subscribed && !hasBundle) {
      const { data: purchases } = await supabase
        .from("user_book_purchases")
        .select("book_slug")
        .eq("user_id", user.id)
        .eq("status", "paid");
      purchasedSlugs = new Set((purchases || []).map((p) => p.book_slug).filter(Boolean));
    }

    const { data: progressRows } = await supabase
      .from("user_reading_progress")
      .select("book_slug, page_index")
      .eq("user_id", user.id);
    const progressBySlug = new Map((progressRows || []).map((r) => [r.book_slug, r.page_index]));

    const built: Row[] = LIBRARY_BOOKS.map((b) => {
      const unlocked = subscribed || hasBundle || purchasedSlugs.has(b.slug);
      const pageIndex = progressBySlug.get(b.slug);
      let percent: number | null = null;
      if (pageIndex && pageIndex > 0) {
        const totalLeaves = (loadBookContent(b.slug)?.pages.length ?? 0) + 2;
        percent = totalLeaves > 0 ? Math.round((pageIndex / totalLeaves) * 100) : 0;
      }
      return {
        slug: b.slug,
        title: b.title,
        tagline: b.tagline,
        series: b.series,
        seriesLabel: b.seriesLabel,
        cover: b.cover,
        unlocked,
        percent,
      };
    });

    setRows(built);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openBook(row: Row) {
    if (row.unlocked) {
      router.push({ pathname: "/library-reader", params: { slug: row.slug } });
    } else {
      Linking.openURL(`https://www.momvillage.in/dashboard/library/${row.slug}`);
    }
  }

  const wealthRows = rows.filter((r) => r.series === "wealth");
  const parentingRows = rows.filter((r) => r.series === "parenting");

  return (
    <View style={styles.screen}>
      <DrillHeader title="All your books" />
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.goldDeep} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <BookGroup title="Wealth & Financial Confidence Series" rows={wealthRows} onOpen={openBook} />
          <BookGroup title="Parenting Series" rows={parentingRows} onOpen={openBook} />
        </ScrollView>
      )}
    </View>
  );
}

function BookGroup({ title, rows, onOpen }: { title: string; rows: Row[]; onOpen: (row: Row) => void }) {
  if (rows.length === 0) return null;
  const series = rows[0].series;
  return (
    <View style={{ marginBottom: 26 }}>
      <View style={styles.sectionHeaderRow}>
        <View style={styles.sectionIconBadge}>
          <Ionicons name={SERIES_ICON[series]} size={15} color={Colors.goldDeep} />
        </View>
        <Text style={styles.sectionHeader}>{title}</Text>
      </View>
      {rows.map((row) => (
        <Pressable key={row.slug} style={styles.row} onPress={() => onOpen(row)}>
          <View style={styles.coverWrap}>
            <Image source={{ uri: row.cover }} style={styles.cover} />
            {!row.unlocked && (
              <View style={styles.lockedBadge}>
                <Text style={styles.lockedBadgeText}>₹249</Text>
              </View>
            )}
          </View>
          <View style={styles.info}>
            <Text style={styles.title} numberOfLines={2}>
              {row.title}
            </Text>
            <Text style={styles.tagline} numberOfLines={2}>
              {row.tagline}
            </Text>
          </View>
          {row.percent !== null ? (
            <ProgressRing percent={row.percent} />
          ) : (
            <View style={styles.statusChip}>
              <Text style={styles.statusChipText}>{row.unlocked ? "Start" : "Locked"}</Text>
            </View>
          )}
        </Pressable>
      ))}
    </View>
  );
}

function ProgressRing({ percent, size = 38 }: { percent: number; size?: number }) {
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, percent));
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={{ position: "absolute" }}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke={Colors.line} strokeWidth={strokeWidth} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={Colors.goldDeep}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <Text style={styles.ringPercent}>{clamped}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.ivory },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderBottomWidth: 1.5,
    borderBottomColor: Colors.gold + "50",
    paddingBottom: 10,
    marginBottom: 14,
  },
  sectionIconBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.ivory,
    borderWidth: 1.5,
    borderColor: Colors.gold + "70",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionHeader: { fontSize: 15, fontFamily: Fonts.bodySemiBold, color: Colors.indigo },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.line,
    padding: 10,
    marginBottom: 12,
  },
  coverWrap: { width: 52, height: 72, borderRadius: 4, overflow: "hidden", backgroundColor: Colors.ink },
  cover: { width: "100%", height: "100%" },
  lockedBadge: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: Colors.indigo + "cc", paddingVertical: 2, alignItems: "center" },
  lockedBadgeText: { color: Colors.ivory, fontSize: 7, fontFamily: Fonts.bodyBold, textTransform: "uppercase", letterSpacing: 0.3 },
  info: { flex: 1 },
  title: { fontSize: 14, fontFamily: Fonts.bodySemiBold, color: Colors.indigo, marginBottom: 2, lineHeight: 18 },
  tagline: { fontSize: 11, fontFamily: Fonts.body, color: Colors.ink + "8c", lineHeight: 14 },
  ringPercent: { fontSize: 9, fontFamily: Fonts.bodyBold, color: Colors.indigo },
  statusChip: { paddingVertical: 5, paddingHorizontal: 10, borderRadius: 999, borderWidth: 1, borderColor: Colors.gold + "70", backgroundColor: Colors.ivory },
  statusChipText: { fontSize: 10, fontFamily: Fonts.bodyBold, color: Colors.goldDeep },
});
