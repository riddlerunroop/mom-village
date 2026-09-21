// Rediscover — now its own top-level tab, 2026-09-21. Moved out of a
// pushed route reached only via Care's landing screen and Community's
// banner (mobile/app/rediscover.tsx, built 2026-09-19) into a real 6th tab
// in the bottom bar, per Roop's explicit call: Rediscover has grown into a
// real marketplace (profiles, listings, needs, messaging, recommendations)
// and should read as a fully independent pillar, not something tucked
// inside Care. See CLAUDE.md's "Rediscover placement" entry for the full
// decision. Community's banner link (community.tsx) still points at
// "/rediscover" and keeps working unchanged, since a group folder like
// (tabs) doesn't change the route's URL segment — only the file's location
// on disk moved, so nothing that already links to "/rediscover" needed to
// change. Content/logic below is otherwise identical to the file this
// replaces; only the header (DrillHeader → ScreenHeader, since this is now
// a tab root, not a pushed screen with a back arrow) and relative import
// depth (one directory deeper under app/(tabs)/) changed.

import { useCallback, useState } from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator, StyleSheet, Linking } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";
import { hasActiveSubscription } from "../../lib/subscription";
import { Colors, Fonts, CardStyle, iconBadge } from "../../constants/theme";
import ScreenHeader from "../../components/ScreenHeader";

const DOORS = [
  { key: "explore", icon: "leaf-outline" as const, title: "Explore", body: "I don't know my thing yet — show me ideas.", route: "/rediscover-explore" as const },
  { key: "showcase", icon: "sparkles-outline" as const, title: "Showcase", body: "I have a product, talent, skill, or business.", route: "/rediscover-showcase" as const },
  { key: "find", icon: "search-outline" as const, title: "Find", body: "I need a product, service, or skill.", route: "/rediscover-find" as const },
  { key: "collaborate", icon: "people-outline" as const, title: "Collaborate", body: "I want to build something with another mother.", route: "/rediscover-collaborate" as const },
];

export default function RediscoverLandingScreen() {
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [headline, setHeadline] = useState<string | null>(null);
  const [hasProfile, setHasProfile] = useState(false);

  const load = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }
    const subscribed = await hasActiveSubscription(supabase, user.id);
    setIsSubscribed(subscribed);
    if (subscribed) {
      const { data: profile } = await supabase
        .from("user_rediscover_profile")
        .select("headline")
        .eq("user_id", user.id)
        .maybeSingle();
      setHasProfile(Boolean(profile));
      setHeadline(profile?.headline ?? null);
    }
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.goldDeep} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 50 }}>
        <Text style={styles.kicker}>something of yours can begin here</Text>
        <Text style={styles.title}>Rediscover</Text>
        <Text style={styles.intro}>
          Maybe you already know what you want to do. Maybe you have a skill
          to offer, or something you want to earn from. Or maybe you have no
          idea yet — this is your place to find out, at whatever pace you
          have time for.
        </Text>

        {!isSubscribed ? (
          <View style={styles.lockedCard}>
            <Text style={styles.lockedTitle}>Find skills, work, and collaborators in your Village</Text>
            <Text style={styles.lockedBody}>
              Join to showcase what you make or offer, find what you need, and
              connect with other mothers building something of their own.
            </Text>
            <Pressable
              style={styles.button}
              onPress={() => Linking.openURL("https://www.momvillage.in/dashboard/account")}
            >
              <Text style={styles.buttonText}>Subscribe on momvillage.in</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <Pressable style={styles.profileCard} onPress={() => router.push("/rediscover-profile")}>
              <View>
                <Text style={styles.profileLabel}>{hasProfile ? "Your Rediscover Profile" : "Get started"}</Text>
                <Text style={styles.profileBody}>
                  {hasProfile
                    ? headline || "Manage your profile, listings, and what you're looking for."
                    : "Set up your Rediscover Profile — takes a minute, and you can leave anything blank."}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.goldDeep} />
            </Pressable>

            <View style={styles.doorGrid}>
              {DOORS.map((door) => (
                <Pressable key={door.key} style={styles.doorCard} onPress={() => router.push(door.route)}>
                  <View style={iconBadge(Colors.goldDeep, 38)}>
                    <Ionicons name={door.icon} size={17} color={Colors.goldDeep} />
                  </View>
                  <Text style={styles.doorTitle}>{door.title}</Text>
                  <Text style={styles.doorBody}>{door.body}</Text>
                </Pressable>
              ))}
            </View>

            <Pressable style={styles.messagesCard} onPress={() => router.push("/rediscover-messages")}>
              <View>
                <Text style={styles.profileLabel}>messages</Text>
                <Text style={styles.profileBody}>Conversations you&apos;ve started with other mothers.</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.goldDeep} />
            </Pressable>

            <Text style={styles.disclaimer}>
              Mom&apos;s Village doesn&apos;t verify anyone&apos;s qualifications, products, or business
              standing, and takes no fee on anything you arrange with another mother.{" "}
              <Text
                style={styles.disclaimerLink}
                onPress={() => Linking.openURL("https://www.momvillage.in/rediscover-disclaimer")}
              >
                Read the full disclaimer
              </Text>
              .
            </Text>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.ivory },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: Colors.ivory },
  kicker: { fontSize: 11, fontFamily: Fonts.bodyBold, textTransform: "uppercase", letterSpacing: 0.6, color: Colors.goldDeep, marginBottom: 6, marginTop: 4 },
  title: { fontSize: 26, fontFamily: Fonts.display, color: Colors.indigo, marginBottom: 8 },
  intro: { fontSize: 14, fontFamily: Fonts.body, color: Colors.ink + "a6", lineHeight: 20, marginBottom: 22 },
  lockedCard: { ...CardStyle, padding: 20 },
  lockedTitle: { fontSize: 16, fontFamily: Fonts.bodySemiBold, color: Colors.indigo, marginBottom: 8 },
  lockedBody: { fontSize: 13, fontFamily: Fonts.body, color: Colors.ink + "a6", lineHeight: 19, marginBottom: 16 },
  button: { backgroundColor: Colors.goldDeep, borderRadius: 999, paddingVertical: 13, alignItems: "center" },
  buttonText: { color: Colors.ivory, fontFamily: Fonts.bodyBold, fontSize: 14 },
  profileCard: { ...CardStyle, flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, marginBottom: 16, gap: 10 },
  profileLabel: { fontSize: 10, fontFamily: Fonts.bodyBold, textTransform: "uppercase", letterSpacing: 0.5, color: Colors.sageDeep, marginBottom: 4 },
  profileBody: { fontSize: 13, fontFamily: Fonts.body, color: Colors.ink + "a6", flexShrink: 1 },
  doorGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 16 },
  doorCard: { ...CardStyle, width: "47%", padding: 16 },
  doorTitle: { fontSize: 16, fontFamily: Fonts.display, color: Colors.indigo, marginTop: 10, marginBottom: 4 },
  doorBody: { fontSize: 12, fontFamily: Fonts.body, color: Colors.ink + "8c", lineHeight: 17 },
  messagesCard: { ...CardStyle, flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, marginBottom: 20, gap: 10 },
  disclaimer: { fontSize: 11, fontFamily: Fonts.body, color: Colors.ink + "70", lineHeight: 16 },
  disclaimerLink: { color: Colors.goldDeep, textDecorationLine: "underline" },
});
