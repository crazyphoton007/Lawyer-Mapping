// import React, { useEffect, useRef } from "react";
// import { Tabs } from "expo-router";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { Feather } from "@expo/vector-icons";
// import CaseFitHeader from "@/components/CaseFitHeader";
// import { Animated, Easing, View, StyleSheet, Platform } from "react-native";
// import { LinearGradient } from "expo-linear-gradient";

// const INK = "#000000";
// const MUTED = "#9CA3AF";
// const CARD = "#FFFFFF";
// const BORDER = "#E5E7EB";

// /* ----------------------------- Explore Glow Icon ---------------------------- */
// type GlowColor = "blue" | "green";
// const GLOW_COLOR: GlowColor = "blue"; // keep Explore as-is (blue)

// function GlowIcon({ focused }: { focused: boolean }) {
//   const pulse = useRef(new Animated.Value(0)).current;

//   useEffect(() => {
//     const loop = Animated.loop(
//       Animated.sequence([
//         Animated.timing(pulse, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
//         Animated.timing(pulse, { toValue: 0, duration: 1400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
//       ])
//     );
//     loop.start();
//     return () => loop.stop();
//   }, [pulse]);

//   const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] });
//   const outerOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.7] });

//   const palette =
//     GLOW_COLOR === "green"
//       ? { ring: "rgba(0, 230, 118, 0.6)", grad: ["#B9F6CA", "#00E676", "#00C853"] }
//       : { ring: "rgba(30, 136, 229, 0.6)", grad: ["#81D4FA", "#1E88E5", "#0D47A1"] };

//   return (
//     <View style={styles.iconWrap}>
//       <Animated.View
//         style={[
//           styles.outerGlow,
//           { backgroundColor: palette.ring, opacity: focused ? outerOpacity : 0.35, transform: [{ scale }] },
//         ]}
//       />
//       <LinearGradient colors={palette.grad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.coreDisc, focused && styles.coreDiscActive]} />
//       <Animated.View style={[styles.sparkle, { opacity: focused ? outerOpacity : 0.4, transform: [{ scale }] }]} />
//     </View>
//   );
// }

// /* ------------------------- Court Connect Neon Green Icon ------------------------- */
// /* Flashing neon ring + small heartbeat dot (no label on tab) */
// function CourtIcon({ focused }: { focused: boolean }) {
//   const glow = useRef(new Animated.Value(0)).current;      // soft flash / sparkle
//   const beat = useRef(new Animated.Value(0)).current;      // tiny dot heartbeat

//   useEffect(() => {
//     const glowLoop = Animated.loop(
//       Animated.sequence([
//         Animated.timing(glow, { toValue: 1, duration: 1100, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
//         Animated.timing(glow, { toValue: 0, duration: 1100, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
//       ])
//     );
//     const beatLoop = Animated.loop(
//       Animated.sequence([
//         Animated.timing(beat, { toValue: 1, duration: 380, easing: Easing.bezier(0.3, 0.0, 0.7, 1.0), useNativeDriver: true }),
//         Animated.timing(beat, { toValue: 0, duration: 420, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
//         Animated.delay(240), // little pause to mimic heartbeat cadence
//       ])
//     );
//     glowLoop.start();
//     beatLoop.start();
//     return () => { glowLoop.stop(); beatLoop.stop(); };
//   }, [glow, beat]);

//   const ringScale = glow.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] });
//   const ringOpacity = glow.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.7] });
//   const dotScale = beat.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.35] });
//   const dotOpacity = beat.interpolate({ inputRange: [0, 1], outputRange: [0.65, 1] });

//   return (
//     <View style={styles.iconWrap}>
//       {/* neon green outer sparkle */}
//       <Animated.View
//         style={[
//           styles.outerGlow,
//           {
//             backgroundColor: "rgba(0, 255, 140, 0.55)",
//             opacity: focused ? ringOpacity : 0.35,
//             transform: [{ scale: ringScale }],
//             // greenish soft glow
//             shadowColor: "#00FF8C",
//           },
//         ]}
//       />
//       {/* green gradient core */}
//       <LinearGradient
//         colors={["#B9F6CA", "#00E676", "#00C853"]}
//         start={{ x: 0, y: 0 }}
//         end={{ x: 1, y: 1 }}
//         style={[styles.coreDisc, focused && styles.coreDiscActive]}
//       >
//         {/* subtle glyph to hint "grid / courts" */}
//         <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
//           <Feather name="grid" size={12} color="#001b0d" />
//         </View>
//       </LinearGradient>

//       {/* tiny heartbeat dot */}
//       <Animated.View
//         style={[
//           styles.heartDot,
//           {
//             opacity: focused ? dotOpacity : 0.7,
//             transform: [{ scale: dotScale }],
//           },
//         ]}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   iconWrap: {
//     width: 28,
//     height: 28,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   outerGlow: {
//     position: "absolute",
//     width: 28,
//     height: 28,
//     borderRadius: 14,
//     // iOS glow
//     shadowColor: "#676c6dff",
//     shadowOpacity: 0.6,
//     shadowRadius: 10,
//     shadowOffset: { width: 0, height: 0 },
//     // Android soft glow-ish
//     elevation: 6,
//   },
//   coreDisc: {
//     width: 18,
//     height: 18,
//     borderRadius: 9,
//     overflow: "hidden",
//   },
//   coreDiscActive: {
//     width: 20,
//     height: 20,
//     borderRadius: 10,
//   },
//   sparkle: {
//     position: "absolute",
//     top: 5,
//     right: 6,
//     width: 4,
//     height: 4,
//     borderRadius: 2,
//     backgroundColor: "#FFFFFF",
//   },
//   heartDot: {
//     position: "absolute",
//     top: 3,
//     right: 4,
//     width: 5,
//     height: 5,
//     borderRadius: 2.5,
//     backgroundColor: "#ff000dff",
//     // give it a crisp glow
//     shadowColor: Platform.OS === "ios" ? "#2e302fff" : "#434544ff",
//     shadowOpacity: 0.9,
//     shadowRadius: 6,
//     shadowOffset: { width: 0, height: 0 },
//     elevation: 4,
//   },
// });

// export default function TabLayout() {
//   const insets = useSafeAreaInsets();
//   const BASE_HEIGHT = 58;

//   return (
//     <Tabs
//       screenOptions={{
//         headerShown: true,
//         header: () => <CaseFitHeader />,
//         tabBarActiveTintColor: INK,
//         tabBarInactiveTintColor: MUTED,
//         tabBarLabelStyle: { fontSize: 12, fontWeight: "700", marginTop: 2 },
//         tabBarStyle: {
//           backgroundColor: CARD,
//           borderTopWidth: 1,
//           borderTopColor: BORDER,
//           height: BASE_HEIGHT + insets.bottom,
//           paddingBottom: Math.max(insets.bottom, 6),
//           paddingTop: 6,
//         },
//       }}
//     >
//       {/* Articles */}
//       <Tabs.Screen
//         name="articles"
//         options={{
//           title: "Articles",
//           tabBarIcon: ({ color, size }) => <Feather name="book-open" size={size ?? 22} color={color} />,
//         }}
//       />
//       {/* hidden helper route */}
//       <Tabs.Screen name="_articles" options={{ href: null }} />

//       {/* Explore */}
//       <Tabs.Screen
//         name="learn"
//         options={{
//           title: "Explore",
//           tabBarLabel: "Explore",
//           tabBarIcon: ({ focused }) => <GlowIcon focused={focused} />,
//         }}
//       />

//       {/* Consult */}
//       <Tabs.Screen
//         name="consult"
//         options={{
//           title: "Consult",
//           tabBarIcon: ({ color, size }) => <Feather name="users" size={size ?? 22} color={color} />,
//         }}
//       />

//       {/* Court Connect — icon only (no label), inserted between Consult and My Requests */}
//       <Tabs.Screen
//         name="court-connect"
//         options={{
//           title: "Court Connect",
//           tabBarLabel: () => null, // ← icon only
//           tabBarIcon: ({ focused }) => <CourtIcon focused={focused} />,
//         }}
//       />

//       {/* My Requests */}
//       <Tabs.Screen
//         name="requests"
//         options={{
//           title: "My Requests",
//           tabBarIcon: ({ color, size }) => <Feather name="file-text" size={size ?? 22} color={color} />,
//         }}
//       />

//       {/* Profile */}
//       <Tabs.Screen
//         name="profile"
//         options={{
//           title: "Profile",
//           tabBarIcon: ({ color, size }) => <Feather name="user" size={size ?? 22} color={color} />,
//         }}
//       />
//     </Tabs>
//   );
// }



import React, { useEffect, useRef } from "react";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import CaseFitHeader from "@/components/CaseFitHeader";
import { Animated, Easing, View, StyleSheet, Platform, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const INK = "#000000";
const MUTED = "#9CA3AF";
const CARD = "#FFFFFF";
const BORDER = "#E5E7EB";

/* ----------------------------- Explore Glow Icon ---------------------------- */
type GlowColor = "blue" | "green";
const GLOW_COLOR: GlowColor = "blue"; // keep Explore as-is (blue)

function GlowIcon({ focused }: { focused: boolean }) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] });
  const outerOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.7] });

  const palette =
    GLOW_COLOR === "green"
      ? { ring: "rgba(0, 230, 118, 0.6)", grad: ["#B9F6CA", "#00E676", "#00C853"] }
      : { ring: "rgba(30, 136, 229, 0.6)", grad: ["#81D4FA", "#1E88E5", "#0D47A1"] };

  return (
    <View style={styles.iconWrap}>
      <Animated.View
        style={[
          styles.outerGlow,
          { backgroundColor: palette.ring, opacity: focused ? outerOpacity : 0.35, transform: [{ scale }] },
        ]}
      />
      <LinearGradient colors={palette.grad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.coreDisc, focused && styles.coreDiscActive]} />
      <Animated.View style={[styles.sparkle, { opacity: focused ? outerOpacity : 0.4, transform: [{ scale }] }]} />
    </View>
  );
}

/* ------------------------- Court Connect Neon Green Icon ------------------------- */
/* Logo inside a green, sparkling ring + heartbeat dot (no label on tab) */
function CourtIcon({ focused }: { focused: boolean }) {
  const glow = useRef(new Animated.Value(0)).current;      // soft flash / sparkle
  const beat = useRef(new Animated.Value(0)).current;      // tiny dot heartbeat

  useEffect(() => {
    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 1100, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0, duration: 1100, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    const beatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(beat, { toValue: 1, duration: 380, easing: Easing.bezier(0.3, 0.0, 0.7, 1.0), useNativeDriver: true }),
        Animated.timing(beat, { toValue: 0, duration: 420, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.delay(240), // little pause to mimic heartbeat cadence
      ])
    );
    glowLoop.start();
    beatLoop.start();
    return () => { glowLoop.stop(); beatLoop.stop(); };
  }, [glow, beat]);

  const ringScale = glow.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] });
  const ringOpacity = glow.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.7] });
  const dotScale = beat.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.35] });
  const dotOpacity = beat.interpolate({ inputRange: [0, 1], outputRange: [0.65, 1] });

  // If your PNG is monochrome and you want it tinted, set this to true.
  const USE_TINT = false;

  return (
    <View style={styles.courtIconWrap}>
      {/* neon green outer sparkle */}
      <Animated.View
        style={[
          styles.courtOuterGlow,
          {
            backgroundColor: "rgba(17, 17, 17, 0.55)",
            opacity: focused ? ringOpacity : 0.35,
            transform: [{ scale: ringScale }],
          },
        ]}
      />
      {/* logo filling entire circle */}
      <View
        style={[focused ? styles.courtCoreDiscActive : styles.courtCoreDisc, { overflow: "hidden", alignItems: "center", justifyContent: "center" }]}
      >
        <Image
          source={require("@/assets/images/court_connect.png")}
          style={{
            width: focused ? 50 : 46,
            height: focused ? 50 : 46,
            resizeMode: "cover",
            borderRadius: focused ? 25 : 23,
          }}
        />
      </View>

      {/* tiny heartbeat dot */}
      <Animated.View
        style={[
          styles.heartDot,
          {
            opacity: focused ? dotOpacity : 0.7,
            transform: [{ scale: dotScale }],
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
  courtIconWrap: {
    width: 74,
    height: 74,
    alignItems: "center",
    justifyContent: "center",
  },
  outerGlow: {
    position: "absolute",
    width: 28,
    height: 28,
    borderRadius: 14,
    // baseline shadow (overridden by CourtIcon values)
    shadowColor: "#676c6dff",
    shadowOpacity: 0.6,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  courtOuterGlow: {
    position: "absolute",
    width: 74,
    height: 74,
    borderRadius: 37,
    shadowColor: "#444645ff",
    shadowOpacity: 0.6,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  coreDisc: {
    width: 18,
    height: 18,
    borderRadius: 9,
    overflow: "hidden",
  },
  coreDiscActive: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  courtCoreDisc: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: "hidden",
  },
  courtCoreDiscActive: {
    width: 64,
    height: 64,
    borderRadius: 32,
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
  heartDot: {
    position: "absolute",
    top: 6,
    right: 7,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ff0800ff",
    shadowColor: Platform.OS === "ios" ? "#0037ffff" : "#0003c8ff",
    shadowOpacity: 0.9,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
});

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const BASE_HEIGHT = 58;

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        header: () => <CaseFitHeader />,
        tabBarActiveTintColor: INK,
        tabBarInactiveTintColor: MUTED,
        tabBarLabelStyle: { fontSize: 12, fontWeight: "700", marginTop: 2 },
        tabBarStyle: {
          backgroundColor: CARD,
          borderTopWidth: 1,
          borderTopColor: BORDER,
          height: BASE_HEIGHT + insets.bottom,
          paddingBottom: Math.max(insets.bottom, 6),
          paddingTop: 6,
        },
      }}
    >
      {/* Articles */}
      <Tabs.Screen
        name="articles"
        options={{
          title: "Articles",
          tabBarIcon: ({ color, size }) => <Feather name="book-open" size={size ?? 22} color={color} />,
        }}
      />
      {/* hidden helper route */}
      <Tabs.Screen name="_articles" options={{ href: null }} />

      {/* Explore */}
      <Tabs.Screen
        name="learn"
        options={{
          title: "Explore",
          tabBarLabel: "Explore",
          tabBarIcon: ({ focused }) => <GlowIcon focused={focused} />,
        }}
      />

      {/* Consult */}
      <Tabs.Screen
        name="consult"
        options={{
          title: "Consult",
          tabBarIcon: ({ color, size }) => <Feather name="users" size={size ?? 22} color={color} />,
        }}
      />

      {/* Court Connect — icon only (no label) */}
      <Tabs.Screen
        name="court-connect"
        options={{
          title: "Court Connect",
          tabBarLabel: () => null,
          tabBarIcon: ({ focused }) => <CourtIcon focused={focused} />,
        }}
      />

      {/* My Requests */}
      <Tabs.Screen
        name="requests"
        options={{
          title: "Requests",
          tabBarIcon: ({ color, size }) => <Feather name="file-text" size={size ?? 22} color={color} />,
        }}
      />

      {/* Profile */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <Feather name="user" size={size ?? 22} color={color} />,
        }}
      />
    </Tabs>
  );
}
