// Rediscover — Explore, native port of
// src/app/dashboard/rediscover/explore/page.tsx. Deliberately lightweight:
// a curated, static "could this be your thing?" list linking straight into
// Find, filtered by that category. No experiments/tracking/pattern
// detection — that heavier engine stays deferred to a later version.

import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Colors, Fonts, CardStyle } from "../constants/theme";
import DrillHeader from "../components/DrillHeader";
import { EXPLORE_PROMPTS } from "../lib/rediscoverCategories";

export default function RediscoverExploreScreen() {
  return (
    <View style={styles.screen}>
      <DrillHeader title="Explore" />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 50 }}>
        <Text style={styles.kicker}>🌱 explore</Text>
        <Text style={styles.title}>Could this be your thing?</Text>
        <Text style={styles.intro}>
          No pressure to decide anything today. Tap whatever catches your eye
          — it just takes you to what other mothers are already doing with
          it, so you can see what it actually looks like in practice.
        </Text>

        <View style={styles.grid}>
          {EXPLORE_PROMPTS.map((prompt) => (
            <Pressable
              key={prompt.category}
              style={styles.chip}
              onPress={() =>
                router.push({ pathname: "/rediscover-find", params: { family: prompt.family, category: prompt.category } })
              }
            >
              <Text style={styles.chipText}>{prompt.category}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable onPress={() => router.push("/rediscover-find")}>
          <Text style={styles.link}>Have something in mind that&apos;s not here? Browse every category →</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.ivory },
  kicker: { fontSize: 11, fontFamily: Fonts.bodyBold, textTransform: "uppercase", letterSpacing: 0.6, color: Colors.goldDeep, marginBottom: 6, marginTop: 4 },
  title: { fontSize: 24, fontFamily: Fonts.display, color: Colors.indigo, marginBottom: 8 },
  intro: { fontSize: 14, fontFamily: Fonts.body, color: Colors.ink + "a6", lineHeight: 20, marginBottom: 20 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 24 },
  chip: { ...CardStyle, paddingVertical: 10, paddingHorizontal: 14 },
  chipText: { fontSize: 13, fontFamily: Fonts.bodySemiBold, color: Colors.indigo },
  link: { fontSize: 12, fontFamily: Fonts.bodySemiBold, color: Colors.goldDeep },
});
