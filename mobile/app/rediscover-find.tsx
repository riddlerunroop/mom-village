// Rediscover — Find, native port of
// src/app/dashboard/rediscover/find/page.tsx. "I need a product, service,
// or skill." Browsing works like Spotify's genre pages — filter by
// family/category, no matching algorithm in V1.

import { useCallback, useState } from "react";
import { View, Text, Pressable, FlatList, ActivityIndicator, StyleSheet } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { supabase } from "../lib/supabase";
import { Colors, Fonts, CardStyle } from "../constants/theme";
import DrillHeader from "../components/DrillHeader";
import { CATEGORY_FAMILIES, familyLabel } from "../lib/rediscoverCategories";

type Listing = {
  id: string;
  category_family: string;
  category: string;
  title: string;
  description: string | null;
  user_id: string;
};

export default function RediscoverFindScreen() {
  const { family: initialFamily, category: initialCategory } = useLocalSearchParams<{ family?: string; category?: string }>();
  const [family, setFamily] = useState<string | null>(initialFamily ?? null);
  const [category] = useState<string | null>(initialCategory ?? null);
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<Listing[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});

  const load = useCallback(async (fam: string | null, cat: string | null) => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data: blockedRows } = await supabase.from("user_blocks").select("blocked_id").eq("blocker_id", user.id);
    const blockedIds = (blockedRows || []).map((b) => b.blocked_id);

    let q = supabase
      .from("rediscover_listings")
      .select("id, category_family, category, title, description, user_id")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(60);
    if (fam) q = q.eq("category_family", fam);
    if (cat) q = q.eq("category", cat);
    if (blockedIds.length > 0) q = q.not("user_id", "in", `(${blockedIds.join(",")})`);

    const { data } = await q;
    const rows = data ?? [];
    setListings(rows);

    if (rows.length > 0) {
      const { data: authors } = await supabase
        .from("community_author_names")
        .select("id, mom_name")
        .in("id", [...new Set(rows.map((l) => l.user_id))]);
      setNames(Object.fromEntries((authors ?? []).map((a) => [a.id, a.mom_name || "A mother in the Village"])));
    }
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load(family, category);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [family, category])
  );

  const headerTitle = category ? category : family ? familyLabel(family) : "Browse what other mothers offer";

  return (
    <View style={styles.screen}>
      <DrillHeader title="Find" />
      <View style={{ padding: 20, flex: 1 }}>
        <Text style={styles.kicker}>🔎 find</Text>
        <Text style={styles.title}>{headerTitle}</Text>

        {loading ? (
          <ActivityIndicator color={Colors.goldDeep} style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={listings}
            keyExtractor={(l) => l.id}
            contentContainerStyle={{ paddingBottom: 30 }}
            ListHeaderComponent={
              <View style={styles.chipRow}>
                <Pressable style={[styles.chip, !family && styles.chipSelected]} onPress={() => setFamily(null)}>
                  <Text style={[styles.chipText, !family && styles.chipTextSelected]}>All</Text>
                </Pressable>
                {CATEGORY_FAMILIES.map((f) => (
                  <Pressable key={f.key} style={[styles.chip, family === f.key && styles.chipSelected]} onPress={() => setFamily(f.key)}>
                    <Text style={[styles.chipText, family === f.key && styles.chipTextSelected]}>{f.label}</Text>
                  </Pressable>
                ))}
              </View>
            }
            ListEmptyComponent={
              <Pressable onPress={() => router.push("/rediscover-showcase")}>
                <Text style={styles.emptyText}>
                  Nothing here yet — be the first to <Text style={styles.emptyLink}>add a listing</Text> in this category.
                </Text>
              </Pressable>
            }
            renderItem={({ item }) => (
              <Pressable style={styles.listingCard} onPress={() => router.push({ pathname: "/rediscover-listing", params: { id: item.id } })}>
                <Text style={styles.listingFamily}>
                  {familyLabel(item.category_family)} · {item.category}
                </Text>
                <Text style={styles.listingTitle}>{item.title}</Text>
                {!!item.description && (
                  <Text style={styles.listingBody} numberOfLines={2}>
                    {item.description}
                  </Text>
                )}
                <Text style={styles.listingAuthor}>{names[item.user_id]}</Text>
              </Pressable>
            )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.ivory },
  kicker: { fontSize: 11, fontFamily: Fonts.bodyBold, textTransform: "uppercase", letterSpacing: 0.6, color: Colors.goldDeep, marginBottom: 6, marginTop: 4 },
  title: { fontSize: 22, fontFamily: Fonts.display, color: Colors.indigo, marginBottom: 14 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 16 },
  chip: { paddingVertical: 7, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1.5, borderColor: Colors.line, backgroundColor: "#FFFFFF" },
  chipSelected: { backgroundColor: Colors.indigo, borderColor: Colors.indigo },
  chipText: { fontSize: 12, fontFamily: Fonts.bodyBold, color: Colors.indigo },
  chipTextSelected: { color: Colors.ivory },
  emptyText: { fontSize: 13, fontFamily: Fonts.body, color: Colors.ink + "80", lineHeight: 19 },
  emptyLink: { color: Colors.goldDeep, textDecorationLine: "underline", fontFamily: Fonts.bodyBold },
  listingCard: { ...CardStyle, padding: 16, marginBottom: 12 },
  listingFamily: { fontSize: 10, fontFamily: Fonts.bodyBold, textTransform: "uppercase", letterSpacing: 0.4, color: Colors.sageDeep, marginBottom: 4 },
  listingTitle: { fontSize: 16, fontFamily: Fonts.display, color: Colors.indigo, marginBottom: 4 },
  listingBody: { fontSize: 13, fontFamily: Fonts.body, color: Colors.ink + "a6", lineHeight: 18 },
  listingAuthor: { fontSize: 11, fontFamily: Fonts.body, color: Colors.ink + "66", marginTop: 8 },
});
