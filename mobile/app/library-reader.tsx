// Native Library reader — Phase 4 of the 2026-07-31 agreed build plan.
// Reads the exact same paginated content JSON and page_index semantics as
// web's BookReader.tsx (0 = cover, 1..N = content pages, N+1 = end page),
// so progress/bookmarks stay identical whichever platform she reads on.
//
// Known, accepted difference from web (flagged when the full-parity brief
// was reviewed): no physical page-flip animation — react-pageflip is a
// browser-only library with no React Native equivalent. This reader is
// still calm and immersive (table of contents, bookmarks, "continue where
// you left off," a progress bar) with a plain Prev/Next turn instead of a
// page-curl effect.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Modal,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";
import { hasActiveSubscription } from "../lib/subscription";
import { hasPurchasedBook } from "../lib/purchases";
import { getBookMeta } from "../lib/library";
import { loadBookContent } from "../lib/libraryContent";
import { Colors } from "../constants/theme";
import type { LibraryBlock, LibraryPage } from "../types/library-content";

function BlockView({ block }: { block: LibraryBlock }) {
  switch (block.type) {
    case "h":
      return <Text style={styles.blockHeading}>{block.text}</Text>;
    case "list":
      return (
        <View style={{ marginVertical: 6 }}>
          {block.items.map((item, i) => (
            <View key={i} style={styles.listRow}>
              <Text style={styles.listBullet}>{block.ordered ? `${i + 1}.` : "•"}</Text>
              <Text style={styles.listText}>{item}</Text>
            </View>
          ))}
        </View>
      );
    case "box":
      return (
        <View style={styles.box}>
          {!!block.label && <Text style={styles.boxLabel}>{block.label}</Text>}
          <Text style={styles.boxText}>{block.text}</Text>
        </View>
      );
    case "table":
      return (
        <View style={styles.table}>
          {block.rows.map((row, ri) => (
            <View key={ri} style={[styles.tableRow, ri === 0 && styles.tableHeaderRow]}>
              {row.map((cell, ci) => (
                <Text key={ci} style={[styles.tableCell, ri === 0 && styles.tableHeaderCell]}>
                  {cell}
                </Text>
              ))}
            </View>
          ))}
        </View>
      );
    case "p":
    default:
      return <Text style={styles.blockP}>{block.text}</Text>;
  }
}

export default function LibraryReaderScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const meta = slug ? getBookMeta(slug) : undefined;

  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [pages, setPages] = useState<LibraryPage[]>([]);
  const [current, setCurrent] = useState(0);
  const [showResumeNote, setShowResumeNote] = useState(false);
  const [showContents, setShowContents] = useState(false);
  const [bookmarks, setBookmarks] = useState<Set<number>>(new Set());
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    if (!slug || !meta) {
      setLoading(false);
      return;
    }
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const subscribed = await hasActiveSubscription(supabase, user.id);
    const purchased = subscribed ? true : await hasPurchasedBook(supabase, user.id, slug);
    setAllowed(purchased);
    if (!purchased) {
      setLoading(false);
      return;
    }

    const content = loadBookContent(slug);
    const bookPages = content?.pages ?? [];
    setPages(bookPages);

    const [{ data: progress }, { data: bookmarkRows }] = await Promise.all([
      supabase
        .from("user_reading_progress")
        .select("page_index")
        .eq("user_id", user.id)
        .eq("book_slug", slug)
        .maybeSingle(),
      supabase
        .from("user_book_bookmarks")
        .select("page_index")
        .eq("user_id", user.id)
        .eq("book_slug", slug),
    ]);

    const maxLeaf = bookPages.length + 1;
    const initial = Math.max(0, Math.min(progress?.page_index ?? 0, maxLeaf));
    setCurrent(initial);
    setShowResumeNote(initial > 0);
    setBookmarks(new Set((bookmarkRows || []).map((r) => r.page_index)));
    setLoading(false);
  }, [slug, meta]);

  useEffect(() => {
    load();
  }, [load]);

  const saveProgress = useCallback(
    (pageIndex: number) => {
      if (!slug) return;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;
        await supabase.from("user_reading_progress").upsert(
          { user_id: user.id, book_slug: slug, page_index: pageIndex, updated_at: new Date().toISOString() },
          { onConflict: "user_id,book_slug" }
        );
      }, 700);
    },
    [slug]
  );

  const totalLeaves = pages.length + 2;

  const chapters = useMemo(
    () => pages.map((p, i) => ({ ...p, leaf: i + 1 })).filter((p) => p.isChapterStart),
    [pages]
  );

  function goTo(leaf: number) {
    const clamped = Math.max(0, Math.min(leaf, totalLeaves - 1));
    setCurrent(clamped);
    setShowResumeNote(false);
    setShowContents(false);
    saveProgress(clamped);
  }

  async function toggleBookmark() {
    if (!slug) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const isBookmarked = bookmarks.has(current);
    const next = new Set(bookmarks);
    if (isBookmarked) {
      next.delete(current);
      setBookmarks(next);
      await supabase
        .from("user_book_bookmarks")
        .delete()
        .eq("user_id", user.id)
        .eq("book_slug", slug)
        .eq("page_index", current);
    } else {
      next.add(current);
      setBookmarks(next);
      await supabase
        .from("user_book_bookmarks")
        .upsert({ user_id: user.id, book_slug: slug, page_index: current }, { onConflict: "user_id,book_slug,page_index" });
    }
  }

  if (!meta) {
    return (
      <View style={styles.center}>
        <Text style={styles.body}>Book not found.</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.goldDeep} />
      </View>
    );
  }

  if (!allowed) {
    return (
      <View style={styles.center}>
        <Text style={styles.cardTitle}>{meta.title}</Text>
        <Text style={styles.body}>You don't have access to this book yet.</Text>
        <Pressable style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const isContentPage = current >= 1 && current <= pages.length;
  const sortedBookmarks = Array.from(bookmarks).sort((a, b) => a - b);

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={22} color={Colors.indigo} />
        </Pressable>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {isContentPage && (
            <Pressable
              style={[styles.pillButton, bookmarks.has(current) && styles.pillButtonActive]}
              onPress={toggleBookmark}
            >
              <Text style={[styles.pillButtonText, bookmarks.has(current) && styles.pillButtonTextActive]}>
                {bookmarks.has(current) ? "★ Bookmarked" : "☆ Bookmark"}
              </Text>
            </Pressable>
          )}
          <Pressable style={styles.pillButton} onPress={() => setShowContents(true)}>
            <Text style={styles.pillButtonText}>Contents</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.progressWrap}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.min(100, (current / totalLeaves) * 100)}%` }]} />
        </View>
        <Text style={styles.progressLabel}>
          {current === 0 ? "Cover" : current > pages.length ? "The End" : `Page ${current} of ${pages.length}`}
        </Text>
      </View>

      {showResumeNote && <Text style={styles.resumeNote}>Picking up where you left off</Text>}

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        {current === 0 && (
          <View style={styles.coverPage}>
            <Image source={{ uri: meta.cover }} style={styles.coverImage} />
          </View>
        )}

        {isContentPage && (
          <View>
            {pages[current - 1].isChapterStart && (
              <View style={{ marginBottom: 14 }}>
                <Text style={styles.chapterKicker}>Chapter {pages[current - 1].chapterNumber}</Text>
                <Text style={styles.chapterTitle}>{pages[current - 1].chapterTitle}</Text>
                {!!pages[current - 1].epigraph && (
                  <Text style={styles.epigraph}>{pages[current - 1].epigraph}</Text>
                )}
                <View style={styles.chapterRule} />
              </View>
            )}
            {pages[current - 1].blocks.map((b, i) => (
              <BlockView key={i} block={b} />
            ))}
          </View>
        )}

        {current > pages.length && (
          <View style={styles.endPage}>
            <View style={styles.chapterRule} />
            <Text style={styles.endEyebrow}>You've reached the end of</Text>
            <Text style={styles.endTitle}>{meta.title}</Text>
            <Text style={styles.endNote}>With love, Mom's Village</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.navRow}>
        <Pressable style={styles.navButton} onPress={() => goTo(current - 1)} disabled={current === 0}>
          <Text style={[styles.navButtonText, current === 0 && { opacity: 0.4 }]}>‹ Prev</Text>
        </Pressable>
        <Pressable
          style={styles.navButton}
          onPress={() => goTo(current + 1)}
          disabled={current === totalLeaves - 1}
        >
          <Text style={[styles.navButtonText, current === totalLeaves - 1 && { opacity: 0.4 }]}>Next ›</Text>
        </Pressable>
      </View>

      <Modal visible={showContents} animationType="slide" transparent onRequestClose={() => setShowContents(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setShowContents(false)}>
          <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Contents</Text>
            <ScrollView>
              {sortedBookmarks.length > 0 && (
                <View style={{ marginBottom: 14 }}>
                  <Text style={styles.modalSectionLabel}>Your bookmarks</Text>
                  {sortedBookmarks.map((leaf) => (
                    <Pressable key={leaf} onPress={() => goTo(leaf)}>
                      <Text style={styles.modalBookmarkRow}>★ Page {leaf}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
              <Text style={[styles.modalSectionLabel, { color: Colors.sageDeep }]}>Chapters</Text>
              {chapters.map((c) => (
                <Pressable key={c.leaf} onPress={() => goTo(c.leaf)}>
                  <Text style={styles.modalChapterRow}>
                    <Text style={{ color: Colors.ink + "66" }}>{c.chapterNumber}. </Text>
                    {c.chapterTitle}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.ivory },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: Colors.ivory, padding: 24, gap: 12 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 8,
  },
  pillButton: { paddingVertical: 7, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, borderColor: Colors.line },
  pillButtonActive: { backgroundColor: Colors.goldDeep, borderColor: Colors.goldDeep },
  pillButtonText: { fontSize: 11, fontWeight: "700", color: Colors.ink + "99" },
  pillButtonTextActive: { color: Colors.ivory },
  progressWrap: { paddingHorizontal: 20, marginBottom: 4 },
  progressTrack: { height: 4, borderRadius: 999, backgroundColor: Colors.ivory2, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: Colors.goldDeep, borderRadius: 999 },
  progressLabel: { fontSize: 11, color: Colors.ink + "73", fontWeight: "700", textAlign: "center", marginTop: 4 },
  resumeNote: { fontSize: 11, color: Colors.sageDeep, fontWeight: "700", textAlign: "center", marginTop: 6 },
  coverPage: { aspectRatio: 0.7, borderRadius: 14, overflow: "hidden", backgroundColor: Colors.ink },
  coverImage: { width: "100%", height: "100%" },
  chapterKicker: { fontSize: 10, textTransform: "uppercase", letterSpacing: 0.6, color: Colors.goldDeep, fontWeight: "700", marginBottom: 4 },
  chapterTitle: { fontSize: 20, fontWeight: "700", color: Colors.indigo, marginBottom: 6, lineHeight: 26 },
  epigraph: { fontSize: 13, fontStyle: "italic", color: Colors.sageDeep, lineHeight: 18, marginBottom: 6 },
  chapterRule: { width: 32, height: 2, backgroundColor: Colors.gold, marginVertical: 8 },
  blockP: { fontSize: 14, lineHeight: 22, color: Colors.ink + "e6", marginBottom: 8 },
  blockHeading: { fontSize: 16, fontWeight: "700", color: Colors.indigo, marginTop: 10, marginBottom: 6 },
  listRow: { flexDirection: "row", marginBottom: 4, gap: 6 },
  listBullet: { fontSize: 14, color: Colors.ink + "99", width: 18 },
  listText: { fontSize: 14, lineHeight: 20, color: Colors.ink + "e6", flex: 1 },
  box: { backgroundColor: Colors.ivory2, borderRadius: 12, borderWidth: 1, borderColor: Colors.line, padding: 14, marginVertical: 10 },
  boxLabel: { fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.4, color: Colors.sageDeep, marginBottom: 4 },
  boxText: { fontSize: 13, lineHeight: 19, color: Colors.ink + "e6" },
  table: { borderRadius: 10, borderWidth: 1, borderColor: Colors.line, overflow: "hidden", marginVertical: 10 },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: Colors.line },
  tableHeaderRow: { backgroundColor: Colors.ivory2 },
  tableCell: { flex: 1, fontSize: 11, padding: 8, color: Colors.ink + "d9" },
  tableHeaderCell: { fontWeight: "700", color: Colors.indigo },
  endPage: { alignItems: "center", paddingVertical: 40 },
  endEyebrow: { fontSize: 14, fontStyle: "italic", color: Colors.sageDeep, marginBottom: 4 },
  endTitle: { fontSize: 19, fontWeight: "700", color: Colors.indigo, marginBottom: 10 },
  endNote: { fontSize: 12, color: Colors.ink + "99" },
  navRow: { flexDirection: "row", gap: 12, paddingHorizontal: 20, paddingVertical: 14, borderTopWidth: 1, borderTopColor: Colors.line },
  navButton: { flex: 1, alignItems: "center", paddingVertical: 12, borderRadius: 999, backgroundColor: Colors.ivory2, borderWidth: 1, borderColor: Colors.line },
  navButtonText: { fontSize: 14, fontWeight: "700", color: Colors.indigo },
  modalBackdrop: { flex: 1, backgroundColor: "#00000055", justifyContent: "flex-end" },
  modalSheet: { backgroundColor: Colors.ivory, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: "70%" },
  modalTitle: { fontSize: 16, fontWeight: "700", color: Colors.indigo, marginBottom: 12 },
  modalSectionLabel: { fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.4, color: Colors.goldDeep, marginBottom: 6 },
  modalBookmarkRow: { fontSize: 13, color: Colors.ink + "bf", paddingVertical: 6 },
  modalChapterRow: { fontSize: 13, color: Colors.ink + "cc", paddingVertical: 8 },
  cardTitle: { fontSize: 16, fontWeight: "700", color: Colors.indigo },
  body: { fontSize: 13, color: Colors.ink + "a6" },
  button: { backgroundColor: Colors.goldDeep, borderRadius: 999, paddingVertical: 12, paddingHorizontal: 20 },
  buttonText: { color: Colors.ivory, fontWeight: "700" },
});
