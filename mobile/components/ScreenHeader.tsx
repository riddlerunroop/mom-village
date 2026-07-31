// Shared top bar used on every tab-root screen (Today/Care/Wealth/Library/
// Community), per the 2026-07-31 layout brief: "momvillage" wordmark +
// a profile icon in the top-right leading to Account (which also holds
// reminders/membership/help/policies/sign-out — Account is deliberately
// NOT its own tab per the brief).

import { View, Text, Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/theme";

export default function ScreenHeader() {
  return (
    <View style={styles.row}>
      <Text style={styles.wordmark}>
        mom<Text style={{ color: Colors.goldDeep }}>village</Text>
      </Text>
      <Pressable
        onPress={() => router.push("/account")}
        hitSlop={10}
        style={styles.profileButton}
      >
        <Ionicons name="person-circle-outline" size={28} color={Colors.indigo} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  wordmark: { fontSize: 18, fontWeight: "700", color: Colors.indigo },
  profileButton: { padding: 2 },
});
