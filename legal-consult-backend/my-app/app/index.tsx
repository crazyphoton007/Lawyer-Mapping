import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../context/auth";

export default function Index() {
  const { token, hydrated } = useAuth();

  // Wait until SecureStore is read, so we don't flicker to the wrong screen
  if (!hydrated) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  // If signed in, go straight to Articles (or wherever you want)
  if (token) return <Redirect href="/articles" />;

  // If not signed in, go to Profile so user can log in
  return <Redirect href="/profile" />;
}
