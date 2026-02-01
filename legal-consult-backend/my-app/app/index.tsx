// my-app/app/index.tsx
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../context/auth";

/**
 * App entry point:
 * Always start at /splash first — splash handles app readiness (e.g., API health, assets, etc.)
 * After splash completes, it routes to /login or /requests automatically.
 */
export default function Index() {
  const { token, hydrated } = useAuth();

  // Wait until SecureStore is read (avoid flickering)
  if (!hydrated) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color="#000000" />
      </View>
    );
  }

  // 🚀 Always begin at splash
  return <Redirect href="/splash" />;
}
