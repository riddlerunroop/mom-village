// Library tab — bookshelf, rebuilt 2026-08-01 to match Roop's specific
// "Your books" mockup: a wordmark/title header, a "Continue reading" shelf
// (books standing on a wooden ledge, with a circular % ring + title/tagline
// under each), then a "More to explore" shelf of the remaining books.
// "See all" now pushes to /library-all, a real full list of every book —
// fixed same session after Roop caught it live ("see all button doesn't
// work.. and all books aree not there": both shelves only ever show a
// handful at a time, so two Parenting titles were never reachable from
// here at all). "More to explore"'s selection is still just "whatever
// isn't already in Continue reading," not a deeper recommendation feature
// — a reasonable remaining gap now that every book is reachable via See all.
//
// Real per-book unlock logic (subscription OR individual/bundle purchase —
// same user_book_purchases table as web) is preserved from the prior
// build, just restyled into the new shelf card. No in-app purchase flow
// here (per this project's standing no-IAP decision) — a locked book
// links out to the web Library to buy instead.

import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Linking,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Circle } from "react-native-svg";
import { supabase } from "../../lib/supabase";
import { hasActiveSubscription } from "../../lib/subscription";
import { hasPurchasedBundle } from "../../lib/purchases";
import { LIBRARY_BOOKS, getBookMeta } from "../../lib/library";
import { loadBookContent } from "../../lib/libraryContent";
import { Colors, Fonts } from "../../constants/theme";
import ScreenHeader from "../../components/ScreenHeader";

// A muted warm wood tone for the shelf ledge — not part of the app's core
// design tokens (nothing else in the app needs a "wood" color), so kept
// local to this file rather than added to constants/theme.ts. Picked to
// sit comfortably next to the existing gold/goldDeep family.
const SHELF_WOOD = "#C6996A";
const SHELF_WOOD_EDGE = "#A67A4E";

type InProgressBook = {
  slug: string;
  title: string;
  tagline: string;
  cover: string;
  percent: number;
};

export default function LibraryScreen() {
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [hasBundle, setHasBundle] = useState(false);
  const [purchasedSlugs, setPurchasedSlugs] = useState<Set<string>>(new Set());
  const [inProgress, setInProgress] = useState<InProgressBook[]>([]);

  const load = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const subscribed = await hasActiveSubscription(supabase, user.id);
    setIsSubscribed(subscribed);

    if (!subscribed) {
      setHasBundle(await hasPurchasedBundle(supabase, user.id));
      const { data: purchases } = await supabase
        .from("user_book_purchases")
        .select("book_slug")
        .eq("user_id", user.id)
        .eq("status", "paid");
      setPurchasedSlugs(new Set((purchases || []).map((p) => p.book_slug).filter(Boolean)));
    }

    if (subscribed) {
      const { data: progressRows } = await supabase
        .from("user_reading_progress")
        .select("book_slug, page_index, updated_at")
        .eq("user_id", user.id)
        .gt("page_index", 0)
        .order("updated_at", { ascending: false })
        .limit(3);

      const rows = (progressRows || [])
        .map((r) => {
          const meta = getBookMeta(r.book_slug);
          if (!meta) return null;
          // Same leaf-index convention as the reader itself (0 = cover,
          // 1..N = content, N+1 = end) — reused here just to turn a raw
          // page_index into the % shown under each "Continue reading" book.
          const totalLeaves = (loadBookContent(meta.slug)?.pages.length ?? 0) + 2;
          const percent = totalLeaves > 0 ? Math.round((r.page_index / totalLeaves) * 100) : 0;
          return { slug: meta.slug, title: meta.title, tagline: meta.tagline, cover: meta.cover, percent };
        })
        .filter((x): x is InProgressBook => x !== null);
      setInProgress(rows);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.goldDeep} />
      </View>
    );
  }

  const isUnlocked = (slug: string) => isSubscribed || hasBundle || purchasedSlugs.has(slug);
  const inProgressSlugs = new Set(inProgress.map((b) => b.slug));
  const moreToExplore = LIBRARY_BOOKS.filter((b) => !inProgressSlugs.has(b.slug)).slice(0, 3);

  return (
    <View style={styles.screen}>
      <ScreenHeader />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.title}>Your books</Text>

        {!isSubscribed && !hasBundle && (
          <View style={styles.lockedCard}>
            <View style={styles.lockedIconBadge}>
              <Ionicons name="library-outline" size={22} color={Colors.gold} />
            </View>
            <Text style={styles.cardTitle}>All six books, included</Text>
            <Text style={styles.body}>
              Membership includes full access to every book — or buy any one individually, or
              all six as a bundle, on the website.
            </Text>
            <Pressable
              style={styles.button}
              onPress={() => Linking.openURL("https://www.momvillage.in/dashboard/library")}
            >
              <Text style={styles.buttonText}>Open Library on momvillage.in</Text>
            </Pressable>
          </View>
        )}

        {inProgress.length > 0 && (
          <View style={{ marginBottom: 30 }}>
            <View style={styles.shelfHeaderRow}>
              <Text style={styles.shelfLabel}>Continue reading</Text>
              <Pressable onPress={() => router.push("/library-all")} hitSlop={8}>
                <Text style={styles.seeAll}>See all</Text>
              </Pressable>
            </View>

            <Shelf
              books={inProgress.map((b) => ({ slug: b.slug, cover: b.cover, unlocked: true }))}
            />

            <View style={styles.progressRow}>
              {inProgress.map((b) => (
                <Pressable
                  key={b.slug}
                  style={styles.progressCol}
                  onPress={() => router.push({ pathname: "/library-reader", params: { slug: b.slug } })}
                >
                  <ProgressRing percent={b.percent} />
                  <Text style={styles.progressTitle} numberOfLines={1}>
                    {b.title}
                  </Text>
                  <Text style={styles.progressTagline} numberOfLines={2}>
                    {b.tagline}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {moreToExplore.length > 0 && (
          <View style={{ marginBottom: 24 }}>
            <View style={styles.shelfHeaderRow}>
              <Text style={styles.shelfLabel}>More to explore</Text>
              <Pressable onPress={() => router.push("/library-all")} hitSlop={8}>
                <Text style={styles.seeAll}>See all</Text>
              </Pressable>
            </View>

            <Shelf
              books={moreToExplore.map((b) => ({ slug: b.slug, cover: b.cover, unlocked: isUnlocked(b.slug) }))}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// A row of book covers standing on a wooden shelf ledge, matching Roop's
// mockup — replaces the old flat grid-of-cards look. Tapping a cover opens
// the reader if she has access, or the web Library to buy it if not.
function Shelf({ books }: { books: { slug: string; cover: string; unlocked: boolean }[] }) {
  return (
    <View>
      <View style={styles.shelfRow}>
        {books.map((book) => (
          <Pressable
            key={book.slug}
            style={styles.shelfBookCard}
            onPress={() =>
              book.unlocked
                ? router.push({ pathname: "/library-reader", params: { slug: book.slug } })
                : Linking.openURL(`https://www.momvillage.in/dashboard/library/${book.slug}`)
            }
          >
            <View style={styles.coverWrap}>
              <Image source={{ uri: book.cover }} style={styles.cover} />
              {!book.unlocked && (
                <View style={styles.lockedBadge}>
                  <Text style={styles.lockedBadgeText}>₹249</Text>
                </View>
              )}
            </View>
          </Pressable>
        ))}
      </View>
      <View style={styles.shelfLedge}>
        <View style={styles.shelfLedgeEdge} />
      </View>
    </View>
  );
}

// A thin circular progress ring (react-native-svg), matching the mockup's
// "60% / 35% / 20%" reading-progress indicators under Continue reading.
function ProgressRing({ percent, size = 44 }: { percent: number; size?: number }) {
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, percent));
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
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
      <Text style={styles.progressPercent}>{clamped}%</Text>
    </View>
  );
}

const cardShadow = {
  borderWidth: 1,
  borderColor: Colors.line,
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.ivory },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: Colors.ivory },
  title: { fontSize: 28, fontFamily: Fonts.display, color: Colors.indigo, marginBottom: 18 },
  lockedCard: { backgroundColor: "#FFFFFF", borderRadius: 18, padding: 20, marginBottom: 20, ...cardShadow },
  lockedIconBadge: { width: 44, height: 44, borderRadius: 14, backgroundColor: Colors.ivory, borderWidth: 1.5, borderColor: Colors.gold + "70", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  cardTitle: { fontSize: 16, fontFamily: Fonts.bodySemiBold, color: Colors.indigo, marginBottom: 8 },
  body: { fontSize: 13, fontFamily: Fonts.body, color: Colors.ink + "a6", lineHeight: 19, marginBottom: 12 },
  button: { backgroundColor: Colors.goldDeep, borderRadius: 999, paddingVertical: 13, alignItems: "center" },
  buttonText: { color: Colors.ivory, fontFamily: Fonts.bodyBold, fontSize: 14 },

  shelfHeaderRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    borderBottomWidth: 1.5,
    borderBottomColor: Colors.gold + "50",
    paddingBottom: 8,
    marginBottom: 16,
  },
  shelfLabel: { fontSize: 16, fontFamily: Fonts.bodySemiBold, color: Colors.indigo },
  seeAll: { fontSize: 12, fontFamily: Fonts.bodyBold, color: Colors.goldDeep },

  shelfRow: { flexDirection: "row", gap: "5%", paddingHorizontal: 4 },
  shelfBookCard: { width: "30%" },
  coverWrap: {
    aspectRatio: 0.72,
    borderRadius: 4,
    overflow: "hidden",
    backgroundColor: Colors.ink,
    ...cardShadow,
  },
  cover: { width: "100%", height: "100%" },
  lockedBadge: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: Colors.indigo + "cc", paddingVertical: 4, alignItems: "center" },
  lockedBadgeText: { color: Colors.ivory, fontSize: 9, fontFamily: Fonts.bodyBold, textTransform: "uppercase", letterSpacing: 0.4 },

  // The wooden shelf ledge the covers appear to stand on — a light top
  // "plank" surface and a darker front edge strip beneath it for depth.
  shelfLedge: {
    height: 14,
    backgroundColor: SHELF_WOOD,
    borderRadius: 3,
    marginTop: -2,
    marginHorizontal: 4,
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  shelfLedgeEdge: {
    height: 4,
    backgroundColor: SHELF_WOOD_EDGE,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    marginTop: 10,
  },

  progressRow: { flexDirection: "row", gap: "5%", paddingHorizontal: 4, marginTop: 16 },
  progressCol: { width: "30%", alignItems: "flex-start" },
  progressPercent: { fontSize: 10, fontFamily: Fonts.bodyBold, color: Colors.indigo },
  progressTitle: { fontSize: 12.5, fontFamily: Fonts.bodySemiBold, color: Colors.indigo, marginBottom: 2 },
  progressTagline: { fontSize: 10.5, fontFamily: Fonts.body, color: Colors.ink + "8c", lineHeight: 14 },
});
