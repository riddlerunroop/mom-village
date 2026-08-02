import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useFonts } from "expo-font";
import { Fraunces_600SemiBold } from "@expo-google-fonts/fraunces/600SemiBold";
import { Fraunces_700Bold } from "@expo-google-fonts/fraunces/700Bold";
import { Fraunces_600SemiBold_Italic } from "@expo-google-fonts/fraunces/600SemiBold_Italic";
import { Karla_400Regular } from "@expo-google-fonts/karla/400Regular";
import { Karla_600SemiBold } from "@expo-google-fonts/karla/600SemiBold";
import { Karla_700Bold } from "@expo-google-fonts/karla/700Bold";
import { AuthProvider, useAuth } from "../lib/AuthContext";
import { Colors } from "../constants/theme";

function RootNavigator() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const inTabsGroup = segments[0] === "(tabs)";
    const onLoginScreen = segments[0] === "login";

    if (!session && inTabsGroup) {
      // Not signed in and trying to reach the app itself — bounce to login.
      router.replace("/login");
    } else if (session && onLoginScreen) {
      // Already signed in but somehow looking at the login screen (e.g. app
      // relaunched with a session still valid) — go straight into the app.
      router.replace("/");
    }
  }, [session, loading, segments, router]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: Colors.ivory,
        }}
      >
        <ActivityIndicator color={Colors.goldDeep} />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Fraunces_600SemiBold,
    Fraunces_700Bold,
    Fraunces_600SemiBold_Italic,
    Karla_400Regular,
    Karla_600SemiBold,
    Karla_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: Colors.ivory,
        }}
      >
        <ActivityIndicator color={Colors.goldDeep} />
      </View>
    );
  }

  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
