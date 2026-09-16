// The rebuilt Reset feature (migration_59/60, 2026-09-16) — native mirror
// of src/components/ResetOfTheDay.tsx. One fixed "Reset of the day" card
// (no reshuffle), "I'm doing this" or a no-guilt "not today" skip (never
// recorded), then a small badge moment and an optional "Share your Reset
// with the Village" link. See lib/resetCalculator.ts and CLAUDE.md.

import { useState } from "react";
import { View, Text, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import { router } from "expo-router";
import { supabase } from "../lib/supabase";
import { Colors, Fonts } from "../constants/theme";
import { justUnlockedResetBadge, RESET_BADGE_LABELS } from "../lib/resetCalculator";

export type ResetActivityRow = {
  id: string;
  card_number: number;
  emoji: string;
  title: string;
  body: string;
};

export default function ResetOfTheDay({
  activity,
  alreadyDoneToday,
  totalCompletions,
}: {
  activity: ResetActivityRow;
  alreadyDoneToday: boolean;
  totalCompletions: number;
}) {
  const [phase, setPhase] = useState<"offer" | "skipped" | "done">(
    alreadyDoneToday ? "done" : "offer"
  );
  const [busy, setBusy] = useState(false);
  const [total, setTotal] = useState(totalCompletions);
  const [justUnlocked, setJustUnlocked] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function markDone() {
    setBusy(true);
    setError("");
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setBusy(false);
      return;
    }
    const today = new Date().toISOString().slice(0, 10);
    const { error: insertError } = await supabase.from("user_reset_completions").insert({
      user_id: user.id,
      completed_date: today,
      activity_id: activity.id,
    });

    setBusy(false);
    if (insertError) {
      if (insertError.code !== "23505") {
        setError("Couldn't save that — try again in a moment.");
        return;
      }
    } else {
      const newTotal = total + 1;
      setTotal(newTotal);
      setJustUnlocked(justUnlockedResetBadge(newTotal));
    }
    setPhase("done");
  }

  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>Need a Reset?</Text>

      {phase === "offer" && (
        <>
          <View style={styles.headerRow}>
            <Text style={styles.emoji}>{activity.emoji}</Text>
            <Text style={styles.title}>{activity.title}</Text>
          </View>
          <Text style={styles.body}>{activity.body}</Text>
          <View style={styles.buttonRow}>
            <Pressable style={styles.primaryButton} onPress={markDone} disabled={busy}>
              {busy ? (
                <ActivityIndicator color={Colors.ivory} size="small" />
              ) : (
                <Text style={styles.primaryButtonText}>I&apos;m doing this</Text>
              )}
            </Pressable>
            <Pressable onPress={() => setPhase("skipped")} disabled={busy}>
              <Text style={styles.skipText}>Not today</Text>
            </Pressable>
          </View>
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </>
      )}

      {phase === "skipped" && (
        <Text style={styles.skippedText}>No worries — there&apos;s always tomorrow&apos;s Reset.</Text>
      )}

      {phase === "done" && (
        <>
          <View style={styles.headerRow}>
            <Text style={styles.emoji}>{activity.emoji}</Text>
            <View>
              <Text style={styles.title}>{activity.title}</Text>
              <Text style={styles.doneLabel}>Reset done ✓</Text>
            </View>
          </View>

          {justUnlocked ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                🏆 {RESET_BADGE_LABELS[justUnlocked] ?? `${justUnlocked} Resets`}
              </Text>
            </View>
          ) : null}

          <Text style={styles.countText}>
            {total} Reset{total === 1 ? "" : "s"} and counting.
          </Text>

          <Pressable
            style={styles.shareButton}
            onPress={() => router.push(`/reset-share-new?activityId=${activity.id}`)}
          >
            <Text style={styles.shareButtonText}>Share your Reset with the Village →</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.terracotta + "14",
    borderTopWidth: 3,
    borderTopColor: Colors.terracotta,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  eyebrow: {
    fontFamily: Fonts.bodyBold,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: Colors.terracotta,
    marginBottom: 10,
  },
  headerRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 10 },
  emoji: { fontSize: 30, lineHeight: 34 },
  title: { fontFamily: Fonts.display, fontSize: 17, color: Colors.indigo },
  body: { fontFamily: Fonts.body, fontSize: 14, lineHeight: 20, color: Colors.ink + "CC", marginBottom: 14 },
  buttonRow: { flexDirection: "row", alignItems: "center", gap: 16, flexWrap: "wrap" },
  primaryButton: {
    backgroundColor: Colors.terracotta,
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 24,
  },
  primaryButtonText: { fontFamily: Fonts.bodyBold, fontSize: 14, color: Colors.ivory },
  skipText: { fontFamily: Fonts.bodySemiBold, fontSize: 14, color: Colors.ink + "70" },
  error: { color: Colors.terracotta, fontSize: 12, marginTop: 8 },
  skippedText: { fontFamily: Fonts.body, fontStyle: "italic", fontSize: 14, color: Colors.ink + "90" },
  doneLabel: { fontFamily: Fonts.bodySemiBold, fontSize: 12, color: Colors.sageDeep, marginTop: 2 },
  badge: {
    backgroundColor: Colors.gold + "25",
    borderWidth: 1,
    borderColor: Colors.gold + "60",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
  },
  badgeText: { fontFamily: Fonts.bodySemiBold, fontSize: 14, color: Colors.goldDeep },
  countText: { fontFamily: Fonts.body, fontSize: 12, color: Colors.ink + "70", marginBottom: 14 },
  shareButton: {
    borderWidth: 1.5,
    borderColor: Colors.terracotta,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignSelf: "flex-start",
  },
  shareButtonText: { fontFamily: Fonts.bodySemiBold, fontSize: 14, color: Colors.terracotta },
});
