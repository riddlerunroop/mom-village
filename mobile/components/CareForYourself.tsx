// Care for Yourself — native mirror of src/components/CareForYourself.tsx.
// The seven-day personal-care rhythm (Sunday=Hair love ... Saturday=My
// care day — Saturday has its own dedicated 30-note bank). A mother
// always knows what KIND of care a given day brings; she never knows in
// advance which of that category's rotating notes she'll see — see
// lib/careForYourselfCalculator.ts for the deterministic per-user,
// per-week rotation. Completion is a single soft, non-punitive action —
// "♡ Made time for me" — no streaks, no missed-day warnings, no "X/7"
// counters. Fully replaces the old generic per-week care_for_yourself
// text field, per Roop's "replace it everywhere" decision. See
// CLAUDE.md's "Care for Yourself" entry for the full spec.
//
// All 210 real Care Notes are loaded and safety_flag = 'approved' — Roop's
// explicit 2026-09-18 call: these are general, low-stakes statements a
// mother is free to follow or not, not individualized medical guidance, so
// no outside clinical/dermatology review is needed before calling them
// final. The liability-waiving disclaimer she asked for instead is the
// small caption rendered below every note, not a per-note review process.
// See CLAUDE.md.

import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { supabase } from "../lib/supabase";
import { Colors, Fonts, iconBadge } from "../constants/theme";
import { CARE_CATEGORY_META, careWeekAcknowledgment, type CareCategory } from "../lib/careForYourselfCalculator";

export type CareForYourselfNoteRow = {
  id: string;
  category: string;
  content_type: string;
  headline: string;
  care_note: string;
  tiny_action: string | null;
};

export default function CareForYourself({
  category,
  note,
  alreadyDoneToday,
  weekCompletionCount,
}: {
  category: CareCategory;
  note: CareForYourselfNoteRow | null;
  alreadyDoneToday: boolean;
  weekCompletionCount: number;
}) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(alreadyDoneToday);
  const [busy, setBusy] = useState(false);
  const meta = CARE_CATEGORY_META[category];

  // Optimistic +1 the moment she taps done today, so the count doesn't
  // wait for a reload to reflect what she just did.
  const displayedCount = weekCompletionCount + (done && !alreadyDoneToday ? 1 : 0);
  const acknowledgment = careWeekAcknowledgment(displayedCount);

  async function markDone() {
    if (busy || done) return;
    setBusy(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const today = new Date().toISOString().slice(0, 10);
      await supabase.from("user_care_completions").upsert(
        { user_id: user.id, completed_date: today, category, note_id: note?.id ?? null },
        { onConflict: "user_id,completed_date,category" }
      );
    }
    setDone(true);
    setBusy(false);
  }

  if (!note) return null;

  return (
    <Pressable style={styles.card} onPress={() => setOpen((o) => !o)}>
      <View style={styles.headerRow}>
        <View style={iconBadge(Colors.indigo, 40)}>
          <Text style={{ fontSize: 18 }}>{meta.emoji}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.eyebrow}>
            {meta.dayLabel.toUpperCase()} · {meta.label.toUpperCase()}
          </Text>
          <Text style={[styles.title, done && styles.titleDone]}>Care for yourself</Text>
        </View>
        <Text style={styles.chevron}>{open ? "︿" : "﹀"}</Text>
      </View>

      {open && (
        <View style={styles.body}>
          {note.headline ? <Text style={styles.headline}>{note.headline}</Text> : null}
          <Text style={styles.noteText}>{note.care_note}</Text>

          {note.tiny_action ? (
            <Text style={styles.tinyAction}>Today: {note.tiny_action}</Text>
          ) : null}

          <Text style={styles.disclaimer}>
            General suggestions, not tailored medical advice — patch test anything new, and check
            with a healthcare professional if you have allergies, a skin or hair condition, or are
            pregnant or breastfeeding.
          </Text>

          <Pressable
            style={[styles.doneButton, done && styles.doneButtonActive]}
            onPress={markDone}
            disabled={busy}
          >
            <Text style={[styles.doneButtonText, done && styles.doneButtonTextActive]}>
              {done ? "♥ Made time for me" : "♡ Made time for me"}
            </Text>
          </Pressable>

          {acknowledgment ? <Text style={styles.acknowledgment}>{acknowledgment}</Text> : null}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  headerRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  eyebrow: {
    fontSize: 11,
    fontFamily: Fonts.bodyBold,
    color: Colors.goldDeep,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  title: { fontSize: 16, fontFamily: Fonts.bodySemiBold, color: Colors.indigo },
  titleDone: { color: Colors.ink + "80", textDecorationLine: "line-through" },
  chevron: { fontSize: 14, color: Colors.ink + "60", marginTop: 2 },
  body: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: Colors.line, gap: 8 },
  headline: { fontSize: 13, fontFamily: Fonts.bodyBold, color: Colors.indigo },
  noteText: { fontSize: 14, fontFamily: Fonts.body, color: Colors.ink, lineHeight: 20 },
  tinyAction: { fontSize: 13, fontFamily: Fonts.displayItalic, color: Colors.sageDeep },
  doneButton: {
    alignSelf: "flex-start",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.indigo + "4d",
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 4,
  },
  doneButtonActive: {
    borderColor: Colors.terracotta + "4d",
    backgroundColor: Colors.terracotta + "1a",
  },
  doneButtonText: { fontSize: 13, fontFamily: Fonts.bodyBold, color: Colors.indigo },
  doneButtonTextActive: { color: Colors.terracotta },
  acknowledgment: { fontSize: 12, fontFamily: Fonts.body, color: Colors.ink + "73" },
  disclaimer: { fontSize: 11, fontFamily: Fonts.body, color: Colors.ink + "66", lineHeight: 15 },
});
