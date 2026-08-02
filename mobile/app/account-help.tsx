// Help & policies — split out of the old single-page account.tsx,
// 2026-08-02, to match Roop's mockup's drill-down structure. These are
// static, already-locked legal/informational pages (see CLAUDE.md's
// "About & policies" note) — opening the live website page is deliberate,
// not a shortcut, since duplicating them into the app bundle would only
// create a second copy to keep in sync every time a policy changes.

import { View, Text, Pressable, ScrollView, StyleSheet, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Fonts, CardStyle } from "../constants/theme";
import DrillHeader from "../components/DrillHeader";

const WEB_BASE = "https://www.momvillage.in";

const LINKS: { label: string; path: string; emphasized?: boolean }[] = [
  { label: "Contact & Help", path: "/contact" },
  { label: "About", path: "/about" },
  { label: "Privacy Policy", path: "/privacy" },
  { label: "Terms of Use", path: "/terms" },
  { label: "Community Guidelines", path: "/community-guidelines" },
  { label: "Cancellation & Refund Policy", path: "/refund-policy" },
  { label: "Safety & Emergency Support", path: "/safety", emphasized: true },
];

export default function AccountHelpScreen() {
  return (
    <View style={styles.screen}>
      <DrillHeader title="Help & policies" />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={styles.card}>
          {LINKS.map((link, i) => (
            <Pressable
              key={link.path}
              style={[styles.row, i < LINKS.length - 1 && styles.rowDivider]}
              onPress={() => Linking.openURL(`${WEB_BASE}${link.path}`)}
            >
              <Text style={[styles.rowText, link.emphasized && { color: Colors.terracotta, fontFamily: Fonts.bodyBold }]}>
                {link.label}
              </Text>
              <Ionicons name="open-outline" size={15} color={Colors.ink + "66"} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.ivory },
  card: { ...CardStyle, overflow: "hidden" },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 14, paddingHorizontal: 16 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: Colors.line },
  rowText: { fontSize: 14, fontFamily: Fonts.bodySemiBold, color: Colors.indigo },
});
