import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { AuthProvider } from "../context/auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import CaseFitHeader from "@/components/CaseFitHeader"; // compact black header (for modal etc.)

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          {/* Tabs hide their own header here; they add the black header in (tabs)/_layout.tsx */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

          <Stack.Screen name="request" options={{ headerShown: false }} />

          {/* Login shows compact black header (matches your component) */}
          <Stack.Screen
            name="login"
            options={{
              header: () => <CaseFitHeader showBack showHelp />,
            }}
          />

          {/* Example modal – keep a compact black header with a back button */}
          <Stack.Screen
            name="modal"
            options={{
              presentation: "modal",
              header: () => <CaseFitHeader showBack />,
            }}
          />

          <Stack.Screen
            name="legal"
            options={{
              headerShown: false,
            }}
          />
        </Stack>

        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}
