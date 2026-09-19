// Rediscover — Showcase, native port of
// src/app/dashboard/rediscover/showcase/page.tsx + ShowcaseManager.tsx
// combined into one screen. "I have a product, talent, skill, or
// business." — add/edit/hide/delete her own listings. No native <select>
// equivalent is wired up in this app yet, so category/family pick uses the
// same chip-row pattern already established for Community's topic tags.

import { useCallback, useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, StyleSheet } from "react-native";
import { useFocusEffect } from "expo-router";
import { supabase } from "../lib/supabase";
import { Colors, Fonts, CardStyle } from "../constants/theme";
import DrillHeader from "../components/DrillHeader";
import { CATEGORY_FAMILIES, categoriesForFamily, familyLabel, type RediscoverCategoryFamily } from "../lib/rediscoverCategories";

type Listing = {
  id: string;
  category_family: string;
  category: string;
  title: string;
  description: string | null;
  is_active: boolean;
};

export default function RediscoverShowcaseScreen() {
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<Listing[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [family, setFamily] = useState<RediscoverCategoryFamily>("products");
  const [category, setCategory] = useState(categoriesForFamily("products")[0]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("rediscover_listings")
      .select("id, category_family, category, title, description, is_active")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setListings(data ?? []);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  function startEdit(listing: Listing) {
    setEditingId(listing.id);
    setFamily(listing.category_family as RediscoverCategoryFamily);
    setCategory(listing.category);
    setTitle(listing.title);
    setDescription(listing.description ?? "");
  }

  function resetForm() {
    setEditingId(null);
    setFamily("products");
    setCategory(categoriesForFamily("products")[0]);
    setTitle("");
    setDescription("");
  }

  async function saveListing() {
    if (!title.trim()) {
      setError("Give it a title first.");
      return;
    }
    setSaving(true);
    setError("");
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      setError("Something went wrong — please log in again.");
      return;
    }

    if (editingId) {
      const { error: updateError } = await supabase
        .from("rediscover_listings")
        .update({
          category_family: family,
          category,
          title: title.trim(),
          description: description.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingId);
      setSaving(false);
      if (updateError) {
        setError("Couldn't save — please try again.");
        return;
      }
      setListings((prev) =>
        prev.map((l) =>
          l.id === editingId
            ? { ...l, category_family: family, category, title: title.trim(), description: description.trim() || null }
            : l
        )
      );
      resetForm();
    } else {
      const { data, error: insertError } = await supabase
        .from("rediscover_listings")
        .insert({ user_id: user.id, category_family: family, category, title: title.trim(), description: description.trim() || null })
        .select("id, category_family, category, title, description, is_active")
        .single();
      setSaving(false);
      if (insertError || !data) {
        setError("Couldn't save — please try again.");
        return;
      }
      setListings((prev) => [data as Listing, ...prev]);
      resetForm();
    }
  }

  async function toggleActive(listing: Listing) {
    const { error: updateError } = await supabase.from("rediscover_listings").update({ is_active: !listing.is_active }).eq("id", listing.id);
    if (!updateError) setListings((prev) => prev.map((l) => (l.id === listing.id ? { ...l, is_active: !l.is_active } : l)));
  }

  async function deleteListing(id: string) {
    const { error: deleteError } = await supabase.from("rediscover_listings").delete().eq("id", id);
    if (!deleteError) {
      setListings((prev) => prev.filter((l) => l.id !== id));
      if (editingId === id) resetForm();
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.goldDeep} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <DrillHeader title="Showcase" />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 50 }}>
        <Text style={styles.kicker}>✨ showcase</Text>
        <Text style={styles.title}>What you make or offer</Text>
        <Text style={styles.intro}>
          Add one listing per product, skill, or service — you can have as
          many as you like. Hide or delete any of them any time.
        </Text>

        <View style={styles.card}>
          <Text style={styles.formTitle}>{editingId ? "Edit listing" : "Add a listing"}</Text>

          <Text style={styles.label}>Category</Text>
          <View style={styles.chipRow}>
            {CATEGORY_FAMILIES.map((f) => (
              <Pressable
                key={f.key}
                style={[styles.chip, family === f.key && styles.chipSelected]}
                onPress={() => {
                  setFamily(f.key);
                  setCategory(categoriesForFamily(f.key)[0]);
                }}
              >
                <Text style={[styles.chipText, family === f.key && styles.chipTextSelected]}>{f.label}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Specific tag</Text>
          <View style={styles.chipRow}>
            {categoriesForFamily(family).map((c) => (
              <Pressable key={c} style={[styles.chip, category === c && styles.chipSelected]} onPress={() => setCategory(c)}>
                <Text style={[styles.chipText, category === c && styles.chipTextSelected]}>{c}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Phulkari Suits"
            placeholderTextColor={Colors.ink + "66"}
            maxLength={80}
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            placeholderTextColor={Colors.ink + "66"}
            maxLength={600}
          />

          <View style={styles.saveRow}>
            <Pressable style={[styles.button, { opacity: saving ? 0.6 : 1 }]} onPress={saveListing} disabled={saving}>
              <Text style={styles.buttonText}>{saving ? "Saving…" : editingId ? "Save changes" : "Add listing"}</Text>
            </Pressable>
            {editingId && (
              <Pressable onPress={resetForm}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
            )}
            {!!error && <Text style={styles.errorText}>{error}</Text>}
          </View>
        </View>

        <Text style={styles.sectionLabel}>Your listings</Text>
        {listings.length === 0 && <Text style={styles.emptyText}>Nothing yet — add your first listing above.</Text>}
        {listings.map((listing) => (
          <View key={listing.id} style={styles.listingCard}>
            <Text style={styles.listingFamily}>
              {familyLabel(listing.category_family)} · {listing.category}
            </Text>
            <Text style={styles.listingTitle}>{listing.title}</Text>
            {!!listing.description && <Text style={styles.listingBody}>{listing.description}</Text>}
            {!listing.is_active && <Text style={styles.hiddenLabel}>Hidden from other mothers</Text>}
            <View style={styles.listingActions}>
              <Pressable onPress={() => startEdit(listing)}>
                <Text style={styles.actionEdit}>Edit</Text>
              </Pressable>
              <Pressable onPress={() => toggleActive(listing)}>
                <Text style={styles.actionMuted}>{listing.is_active ? "Hide" : "Show"}</Text>
              </Pressable>
              <Pressable onPress={() => deleteListing(listing.id)}>
                <Text style={styles.actionDelete}>Delete</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.ivory },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: Colors.ivory },
  kicker: { fontSize: 11, fontFamily: Fonts.bodyBold, textTransform: "uppercase", letterSpacing: 0.6, color: Colors.goldDeep, marginBottom: 6, marginTop: 4 },
  title: { fontSize: 24, fontFamily: Fonts.display, color: Colors.indigo, marginBottom: 8 },
  intro: { fontSize: 13, fontFamily: Fonts.body, color: Colors.ink + "a6", lineHeight: 19, marginBottom: 18 },
  card: { ...CardStyle, padding: 18, marginBottom: 22 },
  formTitle: { fontSize: 16, fontFamily: Fonts.display, color: Colors.indigo, marginBottom: 8 },
  label: { fontSize: 11, fontFamily: Fonts.bodyBold, textTransform: "uppercase", letterSpacing: 0.4, color: Colors.sageDeep, marginBottom: 8, marginTop: 12 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: { paddingVertical: 7, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1.5, borderColor: Colors.line, backgroundColor: "#FFFFFF" },
  chipSelected: { backgroundColor: Colors.indigo, borderColor: Colors.indigo },
  chipText: { fontSize: 12, fontFamily: Fonts.bodyBold, color: Colors.indigo },
  chipTextSelected: { color: Colors.ivory },
  input: { borderWidth: 1, borderColor: Colors.line, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, fontFamily: Fonts.body, backgroundColor: Colors.ivory, color: Colors.ink },
  textarea: { minHeight: 80 },
  saveRow: { flexDirection: "row", alignItems: "center", gap: 14, marginTop: 16, flexWrap: "wrap" },
  button: { backgroundColor: Colors.indigo, borderRadius: 999, paddingVertical: 12, paddingHorizontal: 22 },
  buttonText: { color: Colors.ivory, fontFamily: Fonts.bodyBold, fontSize: 13 },
  cancelText: { fontSize: 12, fontFamily: Fonts.body, color: Colors.ink + "80", textDecorationLine: "underline" },
  errorText: { fontSize: 12, fontFamily: Fonts.bodySemiBold, color: Colors.terracotta },
  sectionLabel: { fontSize: 16, fontFamily: Fonts.display, color: Colors.indigo, marginBottom: 10 },
  emptyText: { fontSize: 13, fontFamily: Fonts.body, color: Colors.ink + "80" },
  listingCard: { ...CardStyle, padding: 14, marginBottom: 10 },
  listingFamily: { fontSize: 10, fontFamily: Fonts.bodyBold, textTransform: "uppercase", letterSpacing: 0.4, color: Colors.sageDeep, marginBottom: 4 },
  listingTitle: { fontSize: 15, fontFamily: Fonts.bodySemiBold, color: Colors.indigo },
  listingBody: { fontSize: 13, fontFamily: Fonts.body, color: Colors.ink + "a6", marginTop: 4, lineHeight: 18 },
  hiddenLabel: { fontSize: 11, fontFamily: Fonts.bodySemiBold, color: Colors.ink + "66", marginTop: 6 },
  listingActions: { flexDirection: "row", gap: 16, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: Colors.line },
  actionEdit: { fontSize: 12, fontFamily: Fonts.bodyBold, color: Colors.indigo, textDecorationLine: "underline" },
  actionMuted: { fontSize: 12, fontFamily: Fonts.body, color: Colors.ink + "80", textDecorationLine: "underline" },
  actionDelete: { fontSize: 12, fontFamily: Fonts.body, color: Colors.terracotta, textDecorationLine: "underline" },
});
