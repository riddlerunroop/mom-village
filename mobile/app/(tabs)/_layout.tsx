// Six-tab nav: Today / Care / Wealth / Library / Community / Rediscover.
// Started as five per the 2026-07-31 layout brief; Rediscover added as its
// own 6th tab 2026-09-21, per Roop's explicit call to pull it out of Care
// Chart entirely — it had grown into a real marketplace (profiles,
// listings, needs, messaging, recommendations) and deserved to read as an
// independent pillar, not something tucked inside Care. See CLAUDE.md's
// "Rediscover placement" entry. Account stays OUT of the tab bar — it's
// reached via the profile icon in ScreenHeader (see components/
// ScreenHeader.tsx and app/account.tsx).

import { Text } from "react-native";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/theme";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.goldDeep,
        tabBarInactiveTintColor: Colors.ink + "70",
        tabBarStyle: { backgroundColor: Colors.ivory, borderTopColor: Colors.line },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Today",
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="care"
        options={{
          title: "Care",
          tabBarIcon: ({ color, size }) => <Ionicons name="heart" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="wealth"
        options={{
          title: "Wealth",
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size - 2, fontWeight: "800" }}>₹</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: "Library",
          tabBarIcon: ({ color, size }) => <Ionicons name="book" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: "Community",
          tabBarIcon: ({ color, size }) => <Ionicons name="people" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="rediscover"
        options={{
          title: "Rediscover",
          tabBarIcon: ({ color, size }) => <Ionicons name="sparkles" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
