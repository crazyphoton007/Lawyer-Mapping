// my-app/app/(tabs)/_layout.tsx
import React from "react";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import CaseFitHeader from "@/components/CaseFitHeader";
import { usePathname } from "expo-router";


const INK = "#000000";
const MUTED = "#9CA3AF";
const CARD = "#FFFFFF";
const BORDER = "#E5E7EB";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const BASE_HEIGHT = 58;

  return (
    <Tabs
      // Anchored, non-floating bar — like Robinhood/Amazon
      screenOptions={{
        headerShown: true,
        header: () => <CaseFitHeader />,
        tabBarActiveTintColor: INK,
        tabBarInactiveTintColor: MUTED,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "700",
          marginTop: 2,
        },
        tabBarStyle: {
          backgroundColor: CARD,
          borderTopWidth: 1,
          borderTopColor: BORDER,
          height: BASE_HEIGHT + insets.bottom,        // ← safe-area aware
          paddingBottom: Math.max(insets.bottom, 6),  // ← no overlap with home indicator
          paddingTop: 6,
        },
      }}
    >
     { 
      <Tabs.Screen
        name="articles"
        options={{
          title: "Articles",
          tabBarIcon: ({ color, size }) => (
            <Feather name="book-open" size={size ?? 22} color={color} />
          ),
        }}
      />}

      <Tabs.Screen
      name="_articles"
      options={{
        href: null,               // removes from deep links
        // tabBarButton: () => null, // hides from the bottom bar
       }}
      />

      <Tabs.Screen
        name="learn"
        options={{
          title: "Explore",
          tabBarLabel: "Explore",
        }}
      />


      <Tabs.Screen
        name="consult"
        options={{
          title: "Consult",
          tabBarIcon: ({ color, size }) => (
            <Feather name="users" size={size ?? 22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="requests"
        options={{
          title: "My Requests",
          tabBarIcon: ({ color, size }) => (
            <Feather name="file-text" size={size ?? 22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Feather name="user" size={size ?? 22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
