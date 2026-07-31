// Placeholder for a genuinely new mobile-only signup who hasn't completed
// onboarding (due_date/baby_dob not set) yet. Full native onboarding is a
// v1.5/v2 item, not built this pass — same account works either way, so
// finishing on the website unblocks her here too, next time she opens the
// app (RootLayout/each screen's load() re-checks profile completeness).

import { View, Text, Pressable, StyleSheet, Linking } from "react-native";
import { router } from "expo-router";
import { supabase } from "../lib/supabase";
import { Colors } from "../constants/theme";

export default function OnboardingNeededScreen() {
  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Almost there</Text>
      <Text style={styles.body}>
        Your account isn&apos;t fully set up yet. For now, finish onboarding
        on the website with this same phone number — your profile will then
        show up here automatically, since it&apos;s the same account either
        way.
      </Text>
      <Pressable
        style={styles.button}
        onPress={() => Linking.openURL("https://www.momvillage.in/onboarding")}
      >
        <Text style={styles.buttonText}>Open momvillage.in</Text>
      </Pressable>
      <Pressable onPress={handleSignOut}>
        <Text style={styles.link}>Sign out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.ivory,
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
  },
  title: { fontSize: 22, fontWeight: "700", color: Colors.indigo, marginBottom: 12 },
  body: {
    fontSize: 14,
    color: Colors.ink,
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 24,
    maxWidth: 340,
  },
  button: {
    backgroundColor: Colors.goldDeep,
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 28,
    marginBottom: 16,
  },
  buttonText: { color: Colors.ivory, fontWeight: "700" },
  link: { color: Colors.sageDeep, fontWeight: "600", fontSize: 13 },
});
