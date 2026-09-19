// Rediscover — Collaborate, native port of
// src/app/dashboard/rediscover/collaborate/page.tsx + NeedManager.tsx
// combined into one screen. "I want to build something with another
// mother." — the Find Collaborators feed over rediscover_needs, plus
// managing her own posted needs below it.

import { useCallback, useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, StyleSheet } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { supabase } from "../lib/supabase";
import { Colors, Fonts, CardStyle } from "../constants/theme";
import DrillHeader from "../components/DrillHeader";
import { CATEGORY_FAMILIES, categoriesForFamily, familyLabel, type RediscoverCategoryFamily } from "../lib/rediscoverCategories";

type Need = { id: string; category_family: string; category: string; note: string; user_id: string };
type MyNeed = { id: string; category_family: string; category: string; note: string; is_active: boolean };

function MessageChip({ otherUserId, relatedNeedId }: { otherUserId: string; relatedNeedId: string }) {
  const [busy, setBusy] = useState(false);

  async function start() {
    setBusy(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setBusy(false);
      return;
    }
    const { data: existing } = await supabase
      .from("rediscover_conversations")
      .select("id")
      .or(`and(user_a.eq.${user.id},user_b.eq.${otherUserId}),and(user_a.eq.${otherUserId},user_b.eq.${user.id})`)
      .maybeSingle();
    if (existing) {
      setBusy(false);
      router.push({ pathname: "/rediscover-message-thread", params: { id: existing.id } });
      return;
    }
    const { data: created, error: insertError } = await supabase
      .from("rediscover_conversations")
      .insert({ user_a: user.id, user_b: otherUserId, related_need_id: relatedNeedId })
      .select("id")
      .single();
    if (insertError) {
      const { data: retry } = await supabase
        .from("rediscover_conversations")
        .select("id")
        .or(`and(user_a.eq.${user.id},user_b.eq.${otherUserId}),and(user_a.eq.${otherUserId},user_b.eq.${user.id})`)
        .maybeSingle();
      setBusy(false);
      if (retry) router.push({ pathname: "/rediscover-message-thread", params: { id: retry.id } });
      return;
    }
    setBusy(false);
    router.push({ pathname: "/rediscover-message-thread", params: { id: created.id } });
  }

  return (
    <Pressable style={styles.button} onPress={start} disabled={busy}>
      <Text style={styles.buttonText}>{busy ? "…" : "Message"}</Text>
    </Pressable>
  );
}

function ReportChip({ needId }: { needId: string }) {
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
    await supabase.from("rediscover_reports").insert({ reporter_id: user.id, need_id: needId, reason: reason.trim() });
    setSubmitting(false);
    setDone(true);
    setOpen(false);
  }

  if (done) return <Text style={styles.doneLabel}>Reported</Text>;
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
        placeholder="What's wrong?"
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

export default function RediscoverCollaborateScreen() {
  const { family: initialFamily } = useLocalSearchParams<{ family?: string }>();
  const [family, setFamily] = useState<string | null>(initialFamily ?? null);
  const [loading, setLoading] = useState(true);
  const [needs, setNeeds] = useState<Need[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [myNeeds, setMyNeeds] = useState<MyNeed[]>([]);

  const [postFamily, setPostFamily] = useState<RediscoverCategoryFamily>("business_operations");
  const [postCategory, setPostCategory] = useState(categoriesForFamily("business_operations")[0]);
  const [note, setNote] = useState("");
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState("");

  const load = useCallback(async (fam: string | null) => {
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
      .from("rediscover_needs")
      .select("id, category_family, category, note, user_id")
      .eq("is_active", true)
      .neq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(60);
    if (fam) q = q.eq("category_family", fam);
    if (blockedIds.length > 0) q = q.not("user_id", "in", `(${blockedIds.join(",")})`);

    const [{ data: needRows }, { data: mine }] = await Promise.all([
      q,
      supabase.from("rediscover_needs").select("id, category_family, category, note, is_active").eq("user_id", user.id).order("created_at", { ascending: false }),
    ]);
    const rows = needRows ?? [];
    setNeeds(rows);
    setMyNeeds(mine ?? []);

    if (rows.length > 0) {
      const { data: authors } = await supabase
        .from("community_author_names")
        .select("id, mom_name")
        .in("id", [...new Set(rows.map((n) => n.user_id))]);
      setNames(Object.fromEntries((authors ?? []).map((a) => [a.id, a.mom_name || "A mother in the Village"])));
    }
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load(family);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [family])
  );

  async function post() {
    if (!note.trim()) {
      setPostError("Say a little about what you're looking for.");
      return;
    }
    setPosting(true);
    setPostError("");
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setPosting(false);
      setPostError("Please log in again.");
      return;
    }
    const { data, error } = await supabase
      .from("rediscover_needs")
      .insert({ user_id: user.id, category_family: postFamily, category: postCategory, note: note.trim() })
      .select("id, category_family, category, note, is_active")
      .single();
    setPosting(false);
    if (error || !data) {
      setPostError("Couldn't post — please try again.");
      return;
    }
    setMyNeeds((prev) => [data as MyNeed, ...prev]);
    setNote("");
  }

  async function toggleActive(need: MyNeed) {
    const { error } = await supabase.from("rediscover_needs").update({ is_active: !need.is_active }).eq("id", need.id);
    if (!error) setMyNeeds((prev) => prev.map((n) => (n.id === need.id ? { ...n, is_active: !n.is_active } : n)));
  }

  async function remove(id: string) {
    const { error } = await supabase.from("rediscover_needs").delete().eq("id", id);
    if (!error) setMyNeeds((prev) => prev.filter((n) => n.id !== id));
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
      <DrillHeader title="Collaborate" />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 50 }}>
        <Text style={styles.kicker}>🤝 collaborate · find collaborators</Text>
        <Text style={styles.title}>What mothers are looking for</Text>
        <Text style={styles.intro}>
          A manufacturer, a photographer, a promoter, a collaborator — post
          what you need, or see what other mothers are looking for and reach
          out if you can help.
        </Text>

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

        {needs.length === 0 && <Text style={styles.emptyText}>Nothing here yet — check back, or post your own below.</Text>}
        {needs.map((need) => (
          <View key={need.id} style={styles.needCard}>
            <Text style={styles.needFamily}>
              {familyLabel(need.category_family)} · {need.category}
            </Text>
            <Text style={styles.needNote}>{need.note}</Text>
            <Text style={styles.needAuthor}>{names[need.user_id]}</Text>
            <View style={styles.needActions}>
              <MessageChip otherUserId={need.user_id} relatedNeedId={need.id} />
              <ReportChip needId={need.id} />
            </View>
          </View>
        ))}

        <Text style={[styles.sectionLabel, { marginTop: 20 }]}>What are you looking for?</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.chipRow}>
            {CATEGORY_FAMILIES.map((f) => (
              <Pressable
                key={f.key}
                style={[styles.chip, postFamily === f.key && styles.chipSelected]}
                onPress={() => {
                  setPostFamily(f.key);
                  setPostCategory(categoriesForFamily(f.key)[0]);
                }}
              >
                <Text style={[styles.chipText, postFamily === f.key && styles.chipTextSelected]}>{f.label}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.label}>Specific tag</Text>
          <View style={styles.chipRow}>
            {categoriesForFamily(postFamily).map((c) => (
              <Pressable key={c} style={[styles.chip, postCategory === c && styles.chipSelected]} onPress={() => setPostCategory(c)}>
                <Text style={[styles.chipText, postCategory === c && styles.chipTextSelected]}>{c}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.label}>What are you looking for?</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            value={note}
            onChangeText={setNote}
            placeholder="e.g. A manufacturer for children's clothing, small batches"
            placeholderTextColor={Colors.ink + "66"}
            multiline
            numberOfLines={2}
            textAlignVertical="top"
            maxLength={300}
          />
          <View style={styles.saveRow}>
            <Pressable style={[styles.button, { opacity: posting ? 0.6 : 1 }]} onPress={post} disabled={posting}>
              <Text style={styles.buttonText}>{posting ? "Posting…" : "Post"}</Text>
            </Pressable>
            {!!postError && <Text style={styles.errorText}>{postError}</Text>}
          </View>
        </View>

        {myNeeds.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>What you&apos;ve posted</Text>
            {myNeeds.map((need) => (
              <View key={need.id} style={styles.needCard}>
                <Text style={styles.needFamily}>
                  {familyLabel(need.category_family)} · {need.category}
                </Text>
                <Text style={styles.needNote}>{need.note}</Text>
                {!need.is_active && <Text style={styles.hiddenLabel}>Hidden from other mothers</Text>}
                <View style={styles.needActions}>
                  <Pressable onPress={() => toggleActive(need)}>
                    <Text style={styles.actionMuted}>{need.is_active ? "Hide" : "Show"}</Text>
                  </Pressable>
                  <Pressable onPress={() => remove(need.id)}>
                    <Text style={styles.actionDelete}>Delete</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.ivory },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: Colors.ivory },
  kicker: { fontSize: 11, fontFamily: Fonts.bodyBold, textTransform: "uppercase", letterSpacing: 0.6, color: Colors.goldDeep, marginBottom: 6, marginTop: 4 },
  title: { fontSize: 22, fontFamily: Fonts.display, color: Colors.indigo, marginBottom: 8 },
  intro: { fontSize: 13, fontFamily: Fonts.body, color: Colors.ink + "a6", lineHeight: 19, marginBottom: 16 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 14 },
  chip: { paddingVertical: 7, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1.5, borderColor: Colors.line, backgroundColor: "#FFFFFF" },
  chipSelected: { backgroundColor: Colors.indigo, borderColor: Colors.indigo },
  chipText: { fontSize: 12, fontFamily: Fonts.bodyBold, color: Colors.indigo },
  chipTextSelected: { color: Colors.ivory },
  emptyText: { fontSize: 13, fontFamily: Fonts.body, color: Colors.ink + "80", marginBottom: 10 },
  needCard: { ...CardStyle, padding: 14, marginBottom: 10 },
  needFamily: { fontSize: 10, fontFamily: Fonts.bodyBold, textTransform: "uppercase", letterSpacing: 0.4, color: Colors.sageDeep, marginBottom: 4 },
  needNote: { fontSize: 14, fontFamily: Fonts.body, color: Colors.ink, lineHeight: 19, marginBottom: 6 },
  needAuthor: { fontSize: 11, fontFamily: Fonts.body, color: Colors.ink + "66", marginBottom: 10 },
  needActions: { flexDirection: "row", alignItems: "center", gap: 14 },
  hiddenLabel: { fontSize: 11, fontFamily: Fonts.bodySemiBold, color: Colors.ink + "66", marginBottom: 8 },
  actionMuted: { fontSize: 12, fontFamily: Fonts.body, color: Colors.ink + "80", textDecorationLine: "underline" },
  actionDelete: { fontSize: 12, fontFamily: Fonts.body, color: Colors.terracotta, textDecorationLine: "underline" },
  sectionLabel: { fontSize: 16, fontFamily: Fonts.display, color: Colors.indigo, marginBottom: 10 },
  card: { ...CardStyle, padding: 18, marginBottom: 10 },
  label: { fontSize: 11, fontFamily: Fonts.bodyBold, textTransform: "uppercase", letterSpacing: 0.4, color: Colors.sageDeep, marginBottom: 8, marginTop: 10 },
  input: { borderWidth: 1, borderColor: Colors.line, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, fontFamily: Fonts.body, backgroundColor: Colors.ivory, color: Colors.ink },
  textarea: { minHeight: 60 },
  saveRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 14 },
  button: { backgroundColor: Colors.indigo, borderRadius: 999, paddingVertical: 10, paddingHorizontal: 20 },
  buttonText: { color: Colors.ivory, fontFamily: Fonts.bodyBold, fontSize: 13 },
  errorText: { fontSize: 12, fontFamily: Fonts.bodySemiBold, color: Colors.terracotta },
  metaAction: { fontSize: 11, fontFamily: Fonts.bodyBold, color: Colors.ink + "66" },
  doneLabel: { fontSize: 11, fontFamily: Fonts.bodyBold, color: Colors.sageDeep },
  inlineForm: { flexDirection: "row", alignItems: "center", gap: 8 },
  inlineInput: { fontSize: 11, fontFamily: Fonts.body, borderWidth: 1, borderColor: Colors.line, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: "#FFFFFF", width: 110, color: Colors.ink },
  inlineSend: { fontSize: 11, fontFamily: Fonts.bodyBold, color: Colors.terracotta },
  inlineCancel: { fontSize: 11, fontFamily: Fonts.body, color: Colors.ink + "66" },
});
