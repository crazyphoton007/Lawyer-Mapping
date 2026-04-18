// my-app/app/index.tsx
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../context/auth";

/**
 * App entry point:
 * Let the native splash cover startup, then route directly once auth storage is hydrated.
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

  return <Redirect href={token ? "/(tabs)/requests" : "/login"} />;
}
