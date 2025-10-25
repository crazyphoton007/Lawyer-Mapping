import { Stack, router } from "expo-router";
import { Pressable, Text } from "react-native";

export default function LegalLayout() {
  return (
    <Stack
      screenOptions={{
        presentation: "modal", // 👈 open as modal
        headerShadowVisible: false,
        headerTitleStyle: { fontSize: 18, fontWeight: "700" },
      }}
    >
      <Stack.Screen
        name="privacy"
        options={{
          title: "Privacy Policy",
          headerRight: () => (
            <Pressable
              onPress={() => router.back()}
              hitSlop={10}
              style={{ paddingHorizontal: 8 }}
            >
              <Text style={{ fontWeight: "600", color: "#0B1220" }}>Close</Text>
            </Pressable>
          ),
        }}
      />
      <Stack.Screen
        name="terms"
        options={{
          title: "Terms & Conditions",
          headerRight: () => (
            <Pressable
              onPress={() => router.back()}
              hitSlop={10}
              style={{ paddingHorizontal: 8 }}
            >
              <Text style={{ fontWeight: "600", color: "#0B1220" }}>Close</Text>
            </Pressable>
          ),
        }}
      />
    </Stack>
  );
}
