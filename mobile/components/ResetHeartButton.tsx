// Native mirror of src/app/dashboard/community/reset-gallery/HeartButton.tsx
// — the Reset Gallery's one and only interaction. Heart tap, no comments,
// no visible "liked by" list.

import { useState } from "react";
import { Pressable, Text, StyleSheet } from "react-native";
import { supabase } from "../lib/supabase";
import { Colors, Fonts } from "../constants/theme";

export default function ResetHeartButton({
  shareId,
  initialHearted,
  initialCount,
}: {
  shareId: string;
  initialHearted: boolean;
  initialCount: number;
}) {
  const [hearted, setHearted] = useState(initialHearted);
  const [count, setCount] = useState(initialCount);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setBusy(false);
      return;
    }
    if (hearted) {
      await supabase.from("reset_share_hearts").delete().eq("share_id", shareId).eq("user_id", user.id);
      setHearted(false);
      setCount((c) => Math.max(0, c - 1));
    } else {
      await supabase.from("reset_share_hearts").insert({ share_id: shareId, user_id: user.id });
      setHearted(true);
      setCount((c) => c + 1);
    }
    setBusy(false);
  }

  return (
    <Pressable onPress={toggle} disabled={busy} style={styles.row}>
      <Text style={styles.emoji}>{hearted ? "❤️" : "🤍"}</Text>
      {count > 0 && <Text style={[styles.count, hearted && { color: Colors.terracotta }]}>{count}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 4 },
  emoji: { fontSize: 16 },
  count: { fontFamily: Fonts.bodySemiBold, fontSize: 13, color: Colors.ink + "60" },
});
