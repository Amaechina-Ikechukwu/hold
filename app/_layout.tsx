import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { router, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useCallback, useRef } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";
import { NotificationProvider } from "@/components/contexts/InAppNotificationContext";
import * as SecureStore from "expo-secure-store";
import { AppState, AppStateStatus } from "react-native";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const appState = useRef<AppStateStatus>(AppState.currentState);
  // Load fonts
  const [loaded] = useFonts({
    Keania: require("../assets/fonts/KeaniaOne-Regular.ttf"),
    Lalezar: require("../assets/fonts/Lalezar-Regular.ttf"),
  });

  // Ensure authentication and navigation are handled properly
  const handleAuthentication = useCallback(async () => {
    try {
      const value = await SecureStore.getItemAsync("userCode");
      if (value) {
        // User has a PIN set, navigate to auth screen
        router.push("/auth");
      } else {
        // No PIN set, navigate to setup screen
        router.push("/setup");
      }
    } catch (error) {
      console.error("Error during authentication:", error);
    } finally {
      // Ensure splash screen is hidden after navigation
      await SplashScreen.hideAsync();
    }
  }, []);

  // Clear SecureStore (if needed, for debugging)
  const clearAll = async () => {
    await SecureStore.deleteItemAsync("userCode");
  };
  // Listen for app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        handleAuthentication(); // Trigger authentication when app comes to foreground
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );
    return () => subscription.remove(); // Clean up the listener
  }, [handleAuthentication]);
  // Execute authentication flow on component mount
  useEffect(() => {
    if (loaded) {
      handleAuthentication();
    }
  }, [loaded, handleAuthentication]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <NotificationProvider>
        <Stack>
          <Stack.Screen
            name="index"
            options={{
              headerShown: false,
              statusBarBackgroundColor: "white",
              contentStyle: { backgroundColor: "#0D0D0D" },
            }}
          />
          <Stack.Screen
            name="auth"
            options={{
              headerShown: false,
              statusBarTranslucent: true,
              contentStyle: { backgroundColor: "#0D0D0D" },
            }}
          />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </NotificationProvider>
    </ThemeProvider>
  );
}
