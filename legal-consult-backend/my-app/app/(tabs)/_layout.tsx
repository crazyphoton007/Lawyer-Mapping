// my-app/app/(tabs)/_layout.tsx
import React, { useEffect, useRef } from "react";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import CaseFitHeader from "@/components/CaseFitHeader";
import { Animated, Easing, View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const INK = "#000000";
const MUTED = "#9CA3AF";
const CARD = "#FFFFFF";
const BORDER = "#E5E7EB";

// ---- Glow Icon (for Explore) ----
type GlowColor = "blue" | "green";

// Change this to "green" if you prefer neon green by default
const GLOW_COLOR: GlowColor = "blue";

function GlowIcon({ focused }: { focused: boolean }) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const scale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.12],
  });
  const outerOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0.7],
  });

  const palette =
    GLOW_COLOR === "green"
      ? {
          ring: "rgba(0, 230, 118, 0.6)",
          grad: ["#B9F6CA", "#00E676", "#00C853"],
        }
      : {
          ring: "rgba(30, 136, 229, 0.6)",
          grad: ["#81D4FA", "#1E88E5", "#0D47A1"],
        };

  return (
    <View style={styles.iconWrap}>
      {/* soft outer glow */}
      <Animated.View
        style={[
          styles.outerGlow,
          {
            backgroundColor: palette.ring,
            opacity: focused ? outerOpacity : 0.35,
            transform: [{ scale }],
          },
        ]}
      />
      {/* core gradient disc */}
      <LinearGradient
        colors={palette.grad}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.coreDisc, focused && styles.coreDiscActive]}
      />
      {/* tiny sparkling dot */}
      <Animated.View
        style={[
          styles.sparkle,
          {
            opacity: focused ? outerOpacity : 0.4,
            transform: [{ scale }],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  outerGlow: {
    position: "absolute",
    width: 28,
    height: 28,
    borderRadius: 14,
    // iOS glow
    shadowColor: "#00C6FF",
    shadowOpacity: 0.6,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    // Android soft glow-ish
    elevation: 6,
  },
  coreDisc: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  coreDiscActive: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  sparkle: {
    position: "absolute",
    top: 5,
    right: 6,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#FFFFFF",
  },
});

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
          height: BASE_HEIGHT + insets.bottom, // ← safe-area aware
          paddingBottom: Math.max(insets.bottom, 6), // ← no overlap with home indicator
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
        />
      }

      <Tabs.Screen
        name="_articles"
        options={{
          href: null, // removes from deep links
          // tabBarButton: () => null, // hides from the bottom bar
        }}
      />

      <Tabs.Screen
        name="learn"
        options={{
          title: "Explore",
          tabBarLabel: "Explore",
          tabBarIcon: ({ focused }) => <GlowIcon focused={focused} />,
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
