// Shared header for pushed/drilled-in screens (anything reached via
// router.push rather than a tab root) — a back arrow, centered title, and a
// spacer to keep the title visually centered. Extracted 2026-08-01 while
// fixing the same status-bar-overlap bug this pattern had wherever it was
// copy-pasted (wealth-budget/schemes/savings, and originally Care's own
// drill header before this component existed) — every copy used a fixed
// paddingTop instead of the device's real safe-area inset. Use this instead
// of hand-rolling another local topBar so the fix can't regress per-screen.

import { View, Text, Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, Fonts } from "../constants/theme";

export default function DrillHeader({
  title,
  onBack,
}: {
  title: string;
  onBack?: () => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.row, { paddingTop: insets.top + 10 }]}>
      <Pressable onPress={onBack ?? (() => router.back())} hitSlop={10}>
        <Ionicons name="arrow-back" size={22} color={Colors.indigo} />
      </Pressable>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={{ width: 22 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: Colors.ivory,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  title: { flex: 1, textAlign: "center", fontSize: 15, fontFamily: Fonts.bodyBold, color: Colors.indigo },
});
