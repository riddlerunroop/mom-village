// Community tab — placeholder for Phase 5 of the 2026-07-31 agreed build
// plan (search, trending, start-discussion, replies, report/block against
// the same community_threads/community_replies tables as the website).
// Links to the real web version for now.

import { View, Text, Pressable, StyleSheet, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/theme";
import ScreenHeader from "../../components/ScreenHeader";

export default function CommunityScreen() {
  return (
    <View style={styles.screen}>
      <ScreenHeader />
      <View style={styles.content}>
        <Ionicons name="people-outline" size={40} color={Colors.goldDeep} />
        <Text style={styles.title}>Community</Text>
        <Text style={styles.body}>
          Discussions, replies, and the report/block tools are coming to
          the app in a later phase of this build. For now, open Community
          on the website.
        </Text>
        <Pressable
          style={styles.button}
          onPress={() => Linking.openURL("https://www.momvillage.in/dashboard/community")}
        >
          <Text style={styles.buttonText}>Open Community on momvillage.in</Text>
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
