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
import { holdstore } from "@/holdstore";
import { useShallow } from "zustand/shallow";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const [isSignedIn, signOut] = holdstore(
    useShallow((state) => [state.isSignedIn, state.signOut])
  );

  // Load fonts
  const [fontsLoaded] = useFonts({
    Keania: require("../assets/fonts/KeaniaOne-Regular.ttf"),
    Lalezar: require("../assets/fonts/Lalezar-Regular.ttf"),
  });

  const handleAuthentication = useCallback(async () => {
    try {
      const userCode = await SecureStore.getItemAsync("userCode");
      router.push(userCode ? "/auth" : "/setup");
    } catch (error) {
      console.error("Authentication error:", error);
    } finally {
      await SplashScreen.hideAsync();
    }
  }, []);
  // Clear SecureStore (if needed, for debugging)
  const clearAll = async () => {
    await SecureStore.deleteItemAsync("userCode");
  };
  // useEffect(() => {
  //   clearAll()
  // },[])
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive/) && nextAppState === "active") {
        handleAuthentication();
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );
    return () => subscription.remove();
  }, [handleAuthentication]);

  useEffect(() => {
    if (fontsLoaded) handleAuthentication();
  }, [fontsLoaded, handleAuthentication]);

  if (!fontsLoaded) return null;

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
                name={isSignedIn ? "index" : "auth"}
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
  const DATABASE_VERSION = 1;
  const { user_version: currentDbVersion } = await db.getFirstAsync<{
    user_version: number;
  }>("PRAGMA user_version");

  if (currentDbVersion >= DATABASE_VERSION) return;

  await db.execAsync(`
    PRAGMA journal_mode = 'wal';
    CREATE TABLE IF NOT EXISTS clipboard_content (
      id INTEGER PRIMARY KEY NOT NULL,
      content TEXT NOT NULL,
      content_type TEXT NOT NULL,
      copied_at TEXT DEFAULT CURRENT_TIMESTAMP,
      metadata TEXT
    );
    PRAGMA user_version = ${DATABASE_VERSION};
  `);
}
