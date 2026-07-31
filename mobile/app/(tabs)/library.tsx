// Library tab — real bookshelf, Phase 4 of the 2026-07-31 agreed build
// plan. Native port of src/app/dashboard/library/page.tsx: two series
// grids (Wealth, Parenting), a "Continue reading" strip pulled from
// user_reading_progress, and per-book unlock logic (subscription OR
// individual/bundle purchase — same user_book_purchases table as web).
// No in-app purchase flow here (per this project's standing no-IAP
// decision) — a locked book links out to the web Library to buy instead.

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
import { supabase } from "../../lib/supabase";
import { hasActiveSubscription } from "../../lib/subscription";
import { hasPurchasedBundle } from "../../lib/purchases";
import { LIBRARY_BOOKS, getBookMeta, type LibraryBookMeta } from "../../lib/library";
import { Colors } from "../../constants/theme";
import ScreenHeader from "../../components/ScreenHeader";

type InProgressBook = { slug: string; title: string; cover: string; pageIndex: number };

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
          return meta ? { slug: meta.slug, title: meta.title, cover: meta.cover, pageIndex: r.page_index } : null;
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
  const wealthBooks = LIBRARY_BOOKS.filter((b) => b.series === "wealth");
  const parentingBooks = LIBRARY_BOOKS.filter((b) => b.series === "parenting");

  return (
    <View style={styles.screen}>
      <ScreenHeader />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.eyebrow}>the library</Text>
        <Text style={styles.title}>Your books</Text>
        <Text style={styles.intro}>
          Three books on finance, three on parenting. Included with your membership, readable
          right here in the app.
        </Text>

        {!isSubscribed && !hasBundle && (
          <View style={styles.lockedCard}>
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
          <View style={{ marginBottom: 24 }}>
            <Text style={styles.sectionLabel}>Continue reading</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
              {inProgress.map((b) => (
                <Pressable
                  key={b.slug}
                  style={styles.continueCard}
                  onPress={() => router.push({ pathname: "/library-reader", params: { slug: b.slug } })}
                >
                  <Image source={{ uri: b.cover }} style={styles.continueCover} />
                  <View style={{ paddingVertical: 8, paddingRight: 12, flex: 1 }}>
                    <Text style={styles.continueTitle} numberOfLines={2}>
                      {b.title}
                    </Text>
                    <Text style={styles.continueLink}>Continue →</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        <BookSection
          label={wealthBooks[0].seriesLabel}
          accent={Colors.goldDeep}
          books={wealthBooks}
          isUnlocked={isUnlocked}
        />
        <BookSection
          label={parentingBooks[0].seriesLabel}
          accent={Colors.sageDeep}
          books={parentingBooks}
          isUnlocked={isUnlocked}
        />
      </ScrollView>
    </View>
  );
}

function BookSection({
  label,
  accent,
  books,
  isUnlocked,
}: {
  label: string;
  accent: string;
  books: LibraryBookMeta[];
  isUnlocked: (slug: string) => boolean;
}) {
  return (
    <View style={{ marginBottom: 24 }}>
      <Text style={[styles.sectionLabel, { color: accent }]}>{label}</Text>
      <View style={styles.grid}>
        {books.map((book) => {
          const unlocked = isUnlocked(book.slug);
          return (
            <Pressable
              key={book.slug}
              style={styles.bookCard}
              onPress={() =>
                unlocked
                  ? router.push({ pathname: "/library-reader", params: { slug: book.slug } })
                  : Linking.openURL(`https://www.momvillage.in/dashboard/library/${book.slug}`)
              }
            >
              <View style={styles.coverWrap}>
                <Image source={{ uri: book.cover }} style={styles.cover} />
                {!unlocked && (
                  <View style={styles.lockedBadge}>
                    <Text style={styles.lockedBadgeText}>Buy for ₹249</Text>
                  </View>
                )}
              </View>
              <Text style={styles.bookTitle} numberOfLines={2}>
                {book.title}
              </Text>
              <Text style={styles.bookTagline} numberOfLines={2}>
                {book.tagline}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const CARD_WIDTH = "31%";

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
  title: { fontSize: 24, fontWeight: "700", color: Colors.indigo, marginBottom: 8 },
  intro: { fontSize: 13, color: Colors.ink + "a6", lineHeight: 19, marginBottom: 18 },
  lockedCard: { backgroundColor: Colors.ivory2, borderRadius: 18, borderWidth: 1, borderColor: Colors.line, padding: 20, marginBottom: 20 },
  cardTitle: { fontSize: 16, fontWeight: "700", color: Colors.indigo, marginBottom: 8 },
  body: { fontSize: 13, color: Colors.ink + "a6", lineHeight: 19, marginBottom: 12 },
  button: { backgroundColor: Colors.goldDeep, borderRadius: 999, paddingVertical: 13, alignItems: "center" },
  buttonText: { color: Colors.ivory, fontWeight: "700", fontSize: 14 },
  sectionLabel: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 10 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: "3.5%", rowGap: 16 },
  bookCard: { width: CARD_WIDTH },
  coverWrap: { aspectRatio: 0.773, borderRadius: 10, overflow: "hidden", borderWidth: 1, borderColor: Colors.line, backgroundColor: Colors.ink, marginBottom: 6 },
  cover: { width: "100%", height: "100%" },
  lockedBadge: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: Colors.ink + "b3", paddingVertical: 4, alignItems: "center" },
  lockedBadgeText: { color: Colors.ivory, fontSize: 9, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.4 },
  bookTitle: { fontSize: 12, fontWeight: "700", color: Colors.indigo, lineHeight: 15 },
  bookTagline: { fontSize: 10, color: Colors.ink + "8c", lineHeight: 13, marginTop: 2 },
  continueCard: { flexDirection: "row", backgroundColor: Colors.ivory2, borderRadius: 14, borderWidth: 1, borderColor: Colors.line, overflow: "hidden", width: "100%" },
  continueCover: { width: 44, height: 56 },
  continueTitle: { fontSize: 12, fontWeight: "700", color: Colors.indigo, lineHeight: 15 },
  continueLink: { fontSize: 10, color: Colors.terracotta, fontWeight: "700", marginTop: 3 },
});
