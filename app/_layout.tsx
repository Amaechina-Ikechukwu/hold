import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { NotificationProvider } from "@/components/contexts/InAppNotificationContext";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    Keania: require("../assets/fonts/KeaniaOne-Regular.ttf"),
    Lalezar: require("../assets/fonts/Lalezar-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

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
