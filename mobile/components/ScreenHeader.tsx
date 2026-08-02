// Shared top bar used on every tab-root screen (Today/Care/Wealth/Library/
// Community), per the 2026-07-31 layout brief: "momvillage" wordmark +
// a profile icon in the top-right leading to Account (which also holds
// reminders/membership/help/policies/sign-out — Account is deliberately
// NOT its own tab per the brief).

import { View, Text, Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, Fonts } from "../constants/theme";

export default function ScreenHeader() {
  // Real safe-area top inset, not a guessed fixed value — without this the
  // wordmark collided with the phone's own status bar (clock/signal icons)
  // on several Android devices, caught live 2026-08-01.
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.row, { paddingTop: insets.top + 10 }]}>
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
    paddingBottom: 10,
    backgroundColor: Colors.ivory,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  wordmark: { fontSize: 19, fontFamily: Fonts.displayBold, color: Colors.indigo },
  profileButton: { padding: 2 },
});
