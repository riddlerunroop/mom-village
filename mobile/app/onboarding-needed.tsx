// Fallback screen — only reached now if a mother lands in the app without
// a complete profile AND somehow bypasses the native onboarding flow (e.g.
// she backed out of onboarding.tsx before finishing, or an old session
// redirected here directly). Native onboarding (Phase 2, 2026-07-31) is
// the real path now — this used to always punt to the website, but a
// mobile-only signup can finish entirely in the app today.

import { View, Text, Pressable, StyleSheet } from "react-native";
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
        Your account isn&apos;t fully set up yet. Let&apos;s finish the last couple of questions —
        it only takes a minute.
      </Text>
      <Pressable style={styles.button} onPress={() => router.replace("/onboarding")}>
        <Text style={styles.buttonText}>Continue setting up</Text>
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
