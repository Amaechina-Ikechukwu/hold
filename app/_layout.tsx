import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { router, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useCallback, useRef, useState } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";
import { NotificationProvider } from "@/components/contexts/InAppNotificationContext";
import * as SecureStore from "expo-secure-store";
import { AppState, AppStateStatus } from "react-native";
import { PushNotificationProvider } from "@/components/Notifications";
import { SQLiteDatabase, SQLiteProvider } from "expo-sqlite";
import * as DevClient from "expo-dev-client";
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
      if (appState.current.match(/inactive/) && nextAppState === "active") {
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
  // useEffect(() => {
  //   clearAll();
  // }, []);
  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <NotificationProvider>
        <PushNotificationProvider>
          <SQLiteProvider
            databaseName="clipboard.db"
            useSuspense
            onInit={migrateDbIfNeeded}
          >
            <Stack>
              <Stack.Screen
                name="index"
                options={{
                  headerShown: false,
                  statusBarBackgroundColor: "white",
                  contentStyle: {
                    backgroundColor: "#0D0D0D",
                    paddingVertical: 40,
                  },
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
          </SQLiteProvider>

          <StatusBar style="auto" />
        </PushNotificationProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}
async function migrateDbIfNeeded(db: SQLiteDatabase) {
  const DATABASE_VERSION = 1; // Update this as you add migrations
  let { user_version: currentDbVersion } = await db.getFirstAsync<{
    user_version: number;
  }>("PRAGMA user_version");

  if (currentDbVersion >= DATABASE_VERSION) {
    return; // Database is already up-to-date
  }

  if (currentDbVersion === 0) {
    // Check if the table already exists
    const tableExists = await db.getFirstAsync<{ count: number }>(
      "SELECT count(*) as count FROM sqlite_master WHERE type='table' AND name='clipboard_content'"
    );

    if (!tableExists || tableExists.count === 0) {
      // Initial migration: Create table if it doesn't exist
      await db.execAsync(`
PRAGMA journal_mode = 'wal';
CREATE TABLE clipboard_content (
  id INTEGER PRIMARY KEY NOT NULL,
  content TEXT NOT NULL,
  content_type TEXT NOT NULL,
  copied_at TEXT DEFAULT CURRENT_TIMESTAMP,
  metadata TEXT
);
      `);

      // Example initial data
      await db.runAsync(
        "INSERT INTO clipboard_content (content, content_type, metadata) VALUES (?, ?, ?)",
        "Example Text Content",
        "text",
        JSON.stringify({ example: true })
      );
    }

    currentDbVersion = 1;
  }

  // Future migrations can be added here as additional `if` blocks
  // Example: if (currentDbVersion === 1) { ... }

  // Update the database version
  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}
