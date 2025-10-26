import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../context/auth";

export default function Index() {
  const { token, hydrated } = useAuth();

  // Wait until SecureStore is read, to prevent flickering
  if (!hydrated) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  // ✅ If signed in, go straight to "My Requests" tab
  if (token) {
    return <Redirect href="/(tabs)/requests" />;
  }

  // ✅ If not signed in, show login screen
  return <Redirect href="/login" />;
}
