// A collapsible section card — used for the Today tab's six Monthly Chart
// categories, per the 2026-07-31 layout brief ("Show six collapsible
// cards"). Starts collapsed; tapping the header expands/collapses.

import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/theme";

export default function CollapsibleCard({
  title,
  accent,
  defaultOpen = false,
  children,
}: {
  title: string;
  accent: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <View style={[styles.card, { borderTopColor: accent }]}>
      <Pressable style={styles.header} onPress={() => setOpen((o) => !o)}>
        <Text style={styles.title}>{title}</Text>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={18}
          color={Colors.ink + "80"}
        />
      </Pressable>
      {open && <View style={styles.body}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.ivory2,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.line,
    borderTopWidth: 3,
    marginBottom: 10,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
  },
  title: { fontSize: 15, fontWeight: "700", color: Colors.indigo },
  body: { paddingHorizontal: 14, paddingBottom: 14 },
});
