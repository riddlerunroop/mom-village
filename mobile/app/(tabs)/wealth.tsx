// Wealth tab — placeholder for Phase 3 of the 2026-07-31 agreed build plan
// (checklist, Minimum Budget Planner, Government Benefits & Savings
// Directory, Savings & Financial Planning Guidance). Links to the real,
// fully-built web version in the meantime rather than showing nothing.

import { View, Text, Pressable, StyleSheet, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/theme";
import ScreenHeader from "../../components/ScreenHeader";

export default function WealthScreen() {
  return (
    <View style={styles.screen}>
      <ScreenHeader />
      <View style={styles.content}>
        <Ionicons name="wallet-outline" size={40} color={Colors.goldDeep} />
        <Text style={styles.title}>Wealth & direction</Text>
        <Text style={styles.body}>
          Government schemes, your budget number, and savings guidance are
          coming to the app in a later phase of this build. For now, open
          the full Wealth section on the website.
        </Text>
        <Pressable
          style={styles.button}
          onPress={() => Linking.openURL("https://www.momvillage.in/dashboard/wealth")}
        >
          <Text style={styles.buttonText}>Open Wealth on momvillage.in</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.ivory },
  content: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  title: { fontSize: 22, fontWeight: "700", color: Colors.indigo, marginTop: 14, marginBottom: 10 },
  body: { fontSize: 14, color: Colors.ink, textAlign: "center", lineHeight: 21, marginBottom: 24 },
  button: { backgroundColor: Colors.goldDeep, borderRadius: 999, paddingVertical: 13, paddingHorizontal: 24 },
  buttonText: { color: Colors.ivory, fontWeight: "700", fontSize: 14 },
});
