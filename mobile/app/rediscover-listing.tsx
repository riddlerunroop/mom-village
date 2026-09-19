// Rediscover — listing detail, native port of
// src/app/dashboard/rediscover/listing/[id]/page.tsx + its Recommend/Save/
// Report/Message button components, combined into one screen file the same
// way community-thread.tsx keeps its Report/Block controls local.

import { useCallback, useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, StyleSheet, Linking } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { supabase } from "../lib/supabase";
import { Colors, Fonts, CardStyle } from "../constants/theme";
import DrillHeader from "../components/DrillHeader";
import { familyLabel } from "../lib/rediscoverCategories";

type Listing = {
  id: string;
  category_family: string;
  category: string;
  title: string;
  description: string | null;
  user_id: string;
};
type Profile = {
  headline: string | null;
  bio: string | null;
  location: string | null;
  remote_ok: boolean;
};

function ContactDisclaimer() {
  return (
    <View style={styles.disclaimerBox}>
      <Text style={styles.disclaimerText}>
        Mom&apos;s Village doesn&apos;t verify anyone&apos;s qualifications,
        products, or business standing, and takes no side if something goes
        wrong between you. Before you agree to anything: settle what&apos;s
        being delivered and by when, keep your own record of the
        conversation, and keep a screenshot of any payment made or received.{" "}
        <Text style={styles.disclaimerLink} onPress={() => Linking.openURL("https://www.momvillage.in/rediscover-disclaimer")}>
          Read the full disclaimer
        </Text>
        .
      </Text>
    </View>
  );
}

function RecommendControl({ recommendedUserId, initialCount, initialRecommended, isOwn }: {
  recommendedUserId: string;
  initialCount: number;
  initialRecommended: boolean;
  isOwn: boolean;
}) {
  const [count, setCount] = useState(initialCount);
  const [recommended, setRecommended] = useState(initialRecommended);
  const [busy, setBusy] = useState(false);

  if (isOwn) {
    return (
      <Text style={styles.recommendStatic}>
        Recommended by {count} mother{count === 1 ? "" : "s"}
      </Text>
    );
  }

  async function toggle() {
    if (busy) return;
    setBusy(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setBusy(false);
      return;
    }
    if (recommended) {
      await supabase.from("rediscover_recommendations").delete().eq("recommender_user_id", user.id).eq("recommended_user_id", recommendedUserId);
      setRecommended(false);
      setCount((c) => Math.max(0, c - 1));
    } else {
      await supabase
        .from("rediscover_recommendations")
        .upsert({ recommender_user_id: user.id, recommended_user_id: recommendedUserId }, { onConflict: "recommender_user_id,recommended_user_id" });
      setRecommended(true);
      setCount((c) => c + 1);
    }
    setBusy(false);
  }

  return (
    <Pressable style={[styles.pillButton, recommended && styles.pillButtonActive]} onPress={toggle} disabled={busy}>
      <Text style={[styles.pillButtonText, recommended && styles.pillButtonTextActive]}>
        {recommended ? "♥ Recommended" : "♡ Recommend"} · {count}
      </Text>
    </Pressable>
  );
}

function SaveControl({ listingId, initialSaved }: { listingId: string; initialSaved: boolean }) {
  const [saved, setSaved] = useState(initialSaved);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (busy) return;
    setBusy(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setBusy(false);
      return;
    }
    if (saved) {
      await supabase.from("user_rediscover_saved_listings").delete().eq("user_id", user.id).eq("listing_id", listingId);
      setSaved(false);
    } else {
      await supabase.from("user_rediscover_saved_listings").upsert({ user_id: user.id, listing_id: listingId }, { onConflict: "user_id,listing_id" });
      setSaved(true);
    }
    setBusy(false);
  }

  return (
    <Pressable style={[styles.pillButton, saved && styles.pillButtonGold]} onPress={toggle} disabled={busy}>
      <Text style={[styles.pillButtonText, saved && styles.pillButtonTextGold]}>{saved ? "★ Saved" : "☆ Save"}</Text>
    </Pressable>
  );
}

function MessageControl({ otherUserId, relatedListingId }: { otherUserId: string; relatedListingId: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function start() {
    setBusy(true);
    setError("");
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setBusy(false);
      setError("Please log in again.");
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
      .insert({ user_a: user.id, user_b: otherUserId, related_listing_id: relatedListingId })
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
      else setError("Couldn't start the conversation — please try again.");
      return;
    }
    setBusy(false);
    router.push({ pathname: "/rediscover-message-thread", params: { id: created.id } });
  }

  return (
    <View>
      <Pressable style={[styles.button, { opacity: busy ? 0.6 : 1 }]} onPress={start} disabled={busy}>
        <Text style={styles.buttonText}>{busy ? "…" : "Message"}</Text>
      </Pressable>
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

function ReportControl({ listingId, reportedUserId }: { listingId: string; reportedUserId: string }) {
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
    await supabase.from("rediscover_reports").insert({ reporter_id: user.id, listing_id: listingId, reported_user_id: reportedUserId, reason: reason.trim() });
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
    await supabase.from("user_blocks").upsert({ blocker_id: user.id, blocked_id: userId }, { onConflict: "blocker_id,blocked_id" });
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

export default function RediscoverListingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [listing, setListing] = useState<Listing | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [authorName, setAuthorName] = useState("A mother in the Village");
  const [isOwn, setIsOwn] = useState(false);
  const [recommendCount, setRecommendCount] = useState(0);
  const [myRecommend, setMyRecommend] = useState(false);
  const [mySaved, setMySaved] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }
    const { data: listingRow } = await supabase
      .from("rediscover_listings")
      .select("id, category_family, category, title, description, user_id")
      .eq("id", id)
      .maybeSingle();
    if (!listingRow) {
      setListing(null);
      setLoading(false);
      return;
    }
    setListing(listingRow);
    setIsOwn(listingRow.user_id === user.id);

    const [{ data: profileRow }, { data: authorRow }, { count }, { data: myRec }, { data: mySave }] = await Promise.all([
      supabase.from("user_rediscover_profile").select("headline, bio, location, remote_ok").eq("user_id", listingRow.user_id).maybeSingle(),
      supabase.from("community_author_names").select("mom_name").eq("id", listingRow.user_id).maybeSingle(),
      supabase.from("rediscover_recommendations").select("recommender_user_id", { count: "exact", head: true }).eq("recommended_user_id", listingRow.user_id),
      supabase.from("rediscover_recommendations").select("recommender_user_id").eq("recommender_user_id", user.id).eq("recommended_user_id", listingRow.user_id).maybeSingle(),
      supabase.from("user_rediscover_saved_listings").select("listing_id").eq("user_id", user.id).eq("listing_id", listingRow.id).maybeSingle(),
    ]);
    setProfile(profileRow ?? null);
    setAuthorName(authorRow?.mom_name || "A mother in the Village");
    setRecommendCount(count ?? 0);
    setMyRecommend(Boolean(myRec));
    setMySaved(Boolean(mySave));
    setLoading(false);
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.goldDeep} />
      </View>
    );
  }

  if (!listing) {
    return (
      <View style={styles.screen}>
        <DrillHeader title="Listing" />
        <View style={styles.center}>
          <Text style={styles.body}>Listing not found.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <DrillHeader title="Listing" />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 50 }}>
        <Text style={styles.family}>
          {familyLabel(listing.category_family)} · {listing.category}
        </Text>
        <Text style={styles.title}>{listing.title}</Text>
        {!!listing.description && <Text style={styles.body}>{listing.description}</Text>}

        <View style={styles.authorCard}>
          <View style={styles.authorRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.authorName}>{authorName}</Text>
              {!!profile?.headline && <Text style={styles.authorHeadline}>{profile.headline}</Text>}
              {!!profile?.location && (
                <Text style={styles.authorLocation}>
                  {profile.location}
                  {profile.remote_ok ? " · open to remote" : ""}
                </Text>
              )}
            </View>
            <RecommendControl recommendedUserId={listing.user_id} initialCount={recommendCount} initialRecommended={myRecommend} isOwn={isOwn} />
          </View>
          {!!profile?.bio && <Text style={styles.authorBio}>{profile.bio}</Text>}
        </View>

        {!isOwn ? (
          <>
            <ContactDisclaimer />
            <View style={styles.actionsRow}>
              <MessageControl otherUserId={listing.user_id} relatedListingId={listing.id} />
              <SaveControl listingId={listing.id} initialSaved={mySaved} />
            </View>
            <View style={styles.metaActionsRow}>
              <ReportControl listingId={listing.id} reportedUserId={listing.user_id} />
              <BlockControl userId={listing.user_id} authorName={authorName} />
            </View>
          </>
        ) : (
          <Pressable onPress={() => router.push("/rediscover-showcase")}>
            <Text style={styles.ownNote}>
              This is your own listing. <Text style={styles.ownNoteLink}>Manage it here</Text>.
            </Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.ivory },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: Colors.ivory },
  family: { fontSize: 11, fontFamily: Fonts.bodyBold, textTransform: "uppercase", letterSpacing: 0.4, color: Colors.sageDeep, marginBottom: 6, marginTop: 4 },
  title: { fontSize: 24, fontFamily: Fonts.display, color: Colors.indigo, marginBottom: 8 },
  body: { fontSize: 14, fontFamily: Fonts.body, color: Colors.ink + "b3", lineHeight: 20, marginBottom: 16 },
  authorCard: { ...CardStyle, padding: 16, marginBottom: 14 },
  authorRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 10 },
  authorName: { fontSize: 15, fontFamily: Fonts.bodySemiBold, color: Colors.indigo },
  authorHeadline: { fontSize: 13, fontFamily: Fonts.body, color: Colors.ink + "a6", marginTop: 2 },
  authorLocation: { fontSize: 11, fontFamily: Fonts.body, color: Colors.ink + "66", marginTop: 2 },
  authorBio: { fontSize: 13, fontFamily: Fonts.body, color: Colors.ink + "a6", marginTop: 10, lineHeight: 18 },
  recommendStatic: { fontSize: 11, fontFamily: Fonts.body, color: Colors.ink + "80" },
  pillButton: { paddingVertical: 7, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1.5, borderColor: Colors.line },
  pillButtonActive: { backgroundColor: Colors.sageDeep + "16", borderColor: Colors.sageDeep + "66" },
  pillButtonGold: { backgroundColor: Colors.goldDeep + "16", borderColor: Colors.goldDeep + "66" },
  pillButtonText: { fontSize: 11, fontFamily: Fonts.bodyBold, color: Colors.ink + "80" },
  pillButtonTextActive: { color: Colors.sageDeep },
  pillButtonTextGold: { color: Colors.goldDeep },
  disclaimerBox: { ...CardStyle, backgroundColor: Colors.ivory2, padding: 14, marginBottom: 14 },
  disclaimerText: { fontSize: 12, fontFamily: Fonts.body, color: Colors.ink + "99", lineHeight: 17 },
  disclaimerLink: { color: Colors.goldDeep, textDecorationLine: "underline" },
  actionsRow: { flexDirection: "row", gap: 12, marginBottom: 10 },
  button: { backgroundColor: Colors.indigo, borderRadius: 999, paddingVertical: 10, paddingHorizontal: 20 },
  buttonText: { color: Colors.ivory, fontFamily: Fonts.bodyBold, fontSize: 13 },
  errorText: { fontSize: 11, fontFamily: Fonts.body, color: Colors.terracotta, marginTop: 4 },
  metaActionsRow: { flexDirection: "row", gap: 18, alignItems: "center" },
  metaAction: { fontSize: 11, fontFamily: Fonts.bodyBold, color: Colors.ink + "66" },
  doneLabel: { fontSize: 11, fontFamily: Fonts.bodyBold, color: Colors.sageDeep },
  inlineForm: { flexDirection: "row", alignItems: "center", gap: 10 },
  inlineInput: { fontSize: 11, fontFamily: Fonts.body, borderWidth: 1, borderColor: Colors.line, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: "#FFFFFF", width: 130, color: Colors.ink },
  inlineConfirmText: { fontSize: 11, fontFamily: Fonts.body, color: Colors.ink + "99" },
  inlineSend: { fontSize: 11, fontFamily: Fonts.bodyBold, color: Colors.terracotta },
  inlineCancel: { fontSize: 11, fontFamily: Fonts.body, color: Colors.ink + "66" },
  ownNote: { fontSize: 12, fontFamily: Fonts.body, color: Colors.ink + "70", marginTop: 6 },
  ownNoteLink: { color: Colors.goldDeep, textDecorationLine: "underline" },
});
