import { Stack, router } from "expo-router";
import { Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";

export default function LegalLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#000000",
        },
        headerTintColor: "#FFFFFF",
        headerShadowVisible: false,
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: "700",
        },
        headerLeft: () => (
          <Pressable
            onPress={() => router.back()}
            hitSlop={10}
            style={{ paddingHorizontal: 8, paddingVertical: 6 }}
          >
            <Feather name="arrow-left" size={24} color="#FFFFFF" />
          </Pressable>
        ),
      }}
    >
      <Stack.Screen
        name="privacy"
        options={{
          title: "Privacy Policy",
        }}
      />
      <Stack.Screen
        name="terms"
        options={{
          title: "Terms & Conditions",
        }}
      />
    </Stack>
  );
}
