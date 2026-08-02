// A collapsible section card — used for the Today tab's six Monthly Chart
// categories, per the 2026-07-31 layout brief ("Show six collapsible
// cards"). Starts collapsed; tapping the header expands/collapses.

import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Fonts, iconBadge } from "../constants/theme";

const BADGE_SIZE = 40;

export default function CollapsibleCard({
  title,
  icon = "ellipse-outline",
  iconColor = Colors.indigo,
  defaultOpen = false,
  children,
}: {
  title: string;
  accent?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <View style={styles.card}>
      <Pressable style={styles.header} onPress={() => setOpen((o) => !o)}>
        <View style={iconBadge(iconColor, BADGE_SIZE)}>
          <Ionicons name={icon} size={18} color={iconColor} />
        </View>
        <Text style={styles.title}>{title}</Text>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={18}
          color={Colors.ink + "60"}
        />
      </Pressable>
      {open && <View style={styles.body}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.line,
    marginBottom: 12,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
  },
  title: { flex: 1, fontSize: 15, fontFamily: Fonts.bodySemiBold, color: Colors.indigo },
  body: { paddingHorizontal: 14, paddingBottom: 16, paddingLeft: 14 + BADGE_SIZE + 12 },
});
