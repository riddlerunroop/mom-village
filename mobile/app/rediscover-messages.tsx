// Rediscover — Messages list, native port of
// src/app/dashboard/rediscover/messages/page.tsx.

import { useCallback, useState } from "react";
import { View, Text, Pressable, FlatList, ActivityIndicator, StyleSheet } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { supabase } from "../lib/supabase";
import { Colors, Fonts, CardStyle } from "../constants/theme";
import DrillHeader from "../components/DrillHeader";

type Conversation = { id: string; user_a: string; user_b: string; last_message_at: string };

export default function RediscoverMessagesScreen() {
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [myUserId, setMyUserId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }
    setMyUserId(user.id);

    const { data } = await supabase
      .from("rediscover_conversations")
      .select("id, user_a, user_b, last_message_at")
      .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
      .order("last_message_at", { ascending: false });
    const rows = data ?? [];
    setConversations(rows);

    const otherIds = rows.map((c) => (c.user_a === user.id ? c.user_b : c.user_a));
    if (otherIds.length > 0) {
      const { data: authors } = await supabase.from("community_author_names").select("id, mom_name").in("id", [...new Set(otherIds)]);
      setNames(Object.fromEntries((authors ?? []).map((a) => [a.id, a.mom_name || "A mother in the Village"])));
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
      <DrillHeader title="Messages" />
      <View style={{ padding: 20, flex: 1 }}>
        {conversations.length === 0 ? (
          <Text style={styles.emptyText}>No conversations yet — start one from a listing or a need you find interesting.</Text>
        ) : (
          <FlatList
            data={conversations}
            keyExtractor={(c) => c.id}
            renderItem={({ item }) => {
              const otherId = item.user_a === myUserId ? item.user_b : item.user_a;
              return (
                <Pressable
                  style={styles.card}
                  onPress={() => router.push({ pathname: "/rediscover-message-thread", params: { id: item.id } })}
                >
                  <Text style={styles.name}>{names[otherId]}</Text>
                  <Text style={styles.date}>
                    {new Date(item.last_message_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </Text>
                </Pressable>
              );
            }}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.ivory },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: Colors.ivory },
  emptyText: { fontSize: 13, fontFamily: Fonts.body, color: Colors.ink + "80", lineHeight: 19, marginTop: 20 },
  card: { ...CardStyle, flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 14, marginBottom: 10 },
  name: { fontSize: 14, fontFamily: Fonts.bodySemiBold, color: Colors.indigo },
  date: { fontSize: 11, fontFamily: Fonts.body, color: Colors.ink + "66" },
});
