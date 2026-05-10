import { Stack } from "expo-router";
import CaseFitHeader from "@/components/CaseFitHeader";

export default function CourtConnectLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ header: () => <CaseFitHeader showBack /> }} />
      <Stack.Screen name="view" options={{ headerShown: false }} />
    </Stack>
  );
}
