// //For flashing visuals//

// import React, { useEffect, useRef } from "react";
// import { Pressable, View, Text, StyleSheet, Animated, Easing } from "react-native";
// import * as WebBrowser from "expo-web-browser";
// import { LinearGradient } from "expo-linear-gradient";

// type Props = {
//   title: string;
//   desc?: string;
//   url: string;
//   compact?: boolean;
//   style?: any;
// };

// export default function CourtConnectCard({ title, desc, url, compact, style }: Props) {
//   const pulse = useRef(new Animated.Value(0)).current;
//   const rotate = useRef(new Animated.Value(0)).current;

//   useEffect(() => {
//     // Glow pulse
//     const loop1 = Animated.loop(
//       Animated.sequence([
//         Animated.timing(pulse, { toValue: 1, duration: 1600, useNativeDriver: true }),
//         Animated.timing(pulse, { toValue: 0, duration: 1600, useNativeDriver: true }),
//       ])
//     );
//     // Circle rotation
//     const loop2 = Animated.loop(
//       Animated.timing(rotate, {
//         toValue: 1,
//         duration: 8000,
//         easing: Easing.linear,
//         useNativeDriver: true,
//       })
//     );
//     loop1.start();
//     loop2.start();
//     return () => {
//       loop1.stop();
//       loop2.stop();
//     };
//   }, [pulse, rotate]);

//   const glowOpacity = pulse.interpolate({
//     inputRange: [0, 1],
//     outputRange: [0.25, 0.6],
//   });

//   const spin = rotate.interpolate({
//     inputRange: [0, 1],
//     outputRange: ["0deg", "360deg"],
//   });

//   const height = compact ? 70 : 78;

//   return (
//     <Pressable onPress={() => WebBrowser.openBrowserAsync(url)} style={[{ borderRadius: 20 }, style]}>
//       <View style={{ borderRadius: 20, overflow: "hidden", height }}>
//         {/* Base gradient */}
//         <LinearGradient
//           colors={["#0A0A0A", "#151515", "#000"]}
//           start={{ x: 0, y: 0 }}
//           end={{ x: 1, y: 1 }}
//           style={[StyleSheet.absoluteFill]}
//         />

//         {/* Animated glow border */}
//         <Animated.View
//           pointerEvents="none"
//           style={[
//             StyleSheet.absoluteFill,
//             {
//               borderRadius: 20,
//               borderWidth: 1.5,
//               borderColor: "#FFF",
//               opacity: glowOpacity,
//             },
//           ]}
//         />

//         {/* Rotating spark ring */}
//         <Animated.View
//           style={[
//             styles.sparkRing,
//             {
//               transform: [{ rotate: spin }],
//               opacity: 0.8,
//             },
//           ]}
//         >
//           <LinearGradient
//             colors={["#00FFFF", "#8A2BE2", "#00FFFF"]}
//             start={{ x: 0, y: 0 }}
//             end={{ x: 1, y: 1 }}
//             style={StyleSheet.absoluteFill}
//           />
//         </Animated.View>

//         {/* Card content */}
//         <View style={styles.row}>
//           {/* Modern geometric logo (triangle + dot) */}
//           <View style={styles.logoBox}>
//             <View style={styles.triangle} />
//             <View style={styles.dot} />
//           </View>

//           <View style={{ flex: 1 }}>
//             <Text style={styles.title}>Court Connect • {title}</Text>
//             {!!desc && <Text style={styles.sub}>{desc}</Text>}
//           </View>

//           <Text style={styles.chev}>Open ›</Text>
//         </View>
//       </View>
//     </Pressable>
//   );
// }

// const styles = StyleSheet.create({
//   row: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 16,
//     gap: 14,
//   },
//   title: { color: "#FFF", fontSize: 15, fontWeight: "700" },
//   sub: { color: "rgba(255,255,255,0.7)", fontSize: 12 },
//   chev: { color: "#FFF", fontSize: 13, fontWeight: "700", marginLeft: 8 },
//   sparkRing: {
//     position: "absolute",
//     top: -10,
//     left: -10,
//     right: -10,
//     bottom: -10,
//     borderRadius: 200,
//   },
//   logoBox: {
//     width: 34,
//     height: 34,
//     justifyContent: "center",
//     alignItems: "center",
//     position: "relative",
//   },
//   triangle: {
//     width: 0,
//     height: 0,
//     borderLeftWidth: 10,
//     borderRightWidth: 10,
//     borderBottomWidth: 17,
//     borderLeftColor: "transparent",
//     borderRightColor: "transparent",
//     borderBottomColor: "#00FFFF",
//   },
//   dot: {
//     position: "absolute",
//     width: 6,
//     height: 6,
//     borderRadius: 3,
//     backgroundColor: "#8A2BE2",
//     bottom: 3,
//   },
// });


// **************************************************************************************************

// SImple theme

// import React, { useRef } from "react";
// import { Pressable, View, Text, StyleSheet, Animated } from "react-native";
// import * as WebBrowser from "expo-web-browser";

// type Props = {
//   title: string;
//   desc?: string;
//   url: string;
//   style?: any;
// };

// export default function CourtConnectCard({ title, desc, url, style }: Props) {
//   // very subtle press feedback (scale + opacity), no animations otherwise
//   const v = useRef(new Animated.Value(0)).current;
//   const scale = v.interpolate({ inputRange: [0, 1], outputRange: [1, 0.98] });
//   const alpha = v.interpolate({ inputRange: [0, 1], outputRange: [1, 0.8] });

//   return (
//     <Pressable
//       onPress={() => WebBrowser.openBrowserAsync(url)}
//       onPressIn={() => Animated.timing(v, { toValue: 1, duration: 80, useNativeDriver: true }).start()}
//       onPressOut={() => Animated.timing(v, { toValue: 0, duration: 120, useNativeDriver: true }).start()}
//       style={style}
//     >
//       <Animated.View style={[styles.row, { transform: [{ scale }], opacity: alpha }]}>
//         {/* Minimal AI glyph (tiny diamond inside circle) */}
//         <View style={styles.iconWrap}>
//           <View style={styles.iconCircle}>
//             <View style={styles.glyph} />
//           </View>
//         </View>

//         <View style={{ flex: 1, minWidth: 0 }}>
//           <Text numberOfLines={1} style={styles.title}>
//             Court Connect • {title}
//           </Text>
//           {!!desc && (
//             <Text numberOfLines={1} style={styles.sub}>
//               {desc}
//             </Text>
//           )}
//         </View>

//         <Text style={styles.chev}>›</Text>
//       </Animated.View>

//       {/* single divider under the row */}
//       <View style={styles.divider} />
//     </Pressable>
//   );
// }

// const INK = "#0B1220";

// const styles = StyleSheet.create({
//   row: {
//     backgroundColor: "#FFFFFF",
//     paddingHorizontal: 12,
//     paddingVertical: 12,     // ~52–56px total height
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   iconWrap: { width: 32, alignItems: "center" },
//   iconCircle: {
//     width: 22, height: 22, borderRadius: 11,
//     borderWidth: 1, borderColor: "#111",
//     alignItems: "center", justifyContent: "center",
//     backgroundColor: "#fff",
//   },
//   glyph: {
//     width: 10, height: 10, transform: [{ rotate: "45deg" }],
//     backgroundColor: "#111",
//     borderRadius: 2,
//   },
//   title: { color: INK, fontSize: 14.5, fontWeight: "700" },
//   sub: { color: "rgba(17,17,17,0.6)", fontSize: 12, marginTop: 2 },
//   chev: { color: INK, fontSize: 18, fontWeight: "700", paddingLeft: 8, paddingRight: 2 },
//   divider: { height: StyleSheet.hairlineWidth, backgroundColor: "#E9EAEE", marginLeft: 56 },
// });
// **************************************************************************************************

import React, { useEffect, useRef } from "react";
import { Pressable, View, Text, StyleSheet, Animated, Easing } from "react-native";
import * as WebBrowser from "expo-web-browser";

type Props = {
  title: string;
  desc?: string;
  url: string;
  style?: any;
};

export default function CourtConnectCard({ title, desc, url, style }: Props) {
  const aPulse = useRef(new Animated.Value(0)).current;
  const aSpin = useRef(new Animated.Value(0)).current;
  const aSpark = useRef(new Animated.Value(0)).current;
  const aPress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(aPulse, { toValue: 1, duration: 1400, useNativeDriver: true }),
        Animated.timing(aPulse, { toValue: 0, duration: 1400, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(aSpin, {
        toValue: 1,
        duration: 6000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(aSpark, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.timing(aSpark, { toValue: 0.2, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const scale = aPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] });
  const glowOpacity = aPulse.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.8] });
  const spin = aSpin.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
  const pressScale = aPress.interpolate({ inputRange: [0, 1], outputRange: [1, 0.97] });
  const pressAlpha = aPress.interpolate({ inputRange: [0, 1], outputRange: [1, 0.85] });

  return (
    <Pressable
      onPress={() => WebBrowser.openBrowserAsync(url)}
      onPressIn={() => Animated.timing(aPress, { toValue: 1, duration: 80, useNativeDriver: true }).start()}
      onPressOut={() => Animated.timing(aPress, { toValue: 0, duration: 120, useNativeDriver: true }).start()}
      style={style}
    >
      <Animated.View style={[styles.row, { transform: [{ scale: pressScale }], opacity: pressAlpha }]}>
        {/* --- NEON ICON --- */}
        <View style={styles.iconWrap}>
          {/* Main glowing circle */}
          <Animated.View
            style={[
              styles.neonCircle,
              {
                transform: [{ scale }],
                opacity: glowOpacity,
                shadowColor: "#1482fffa",
              },
            ]}
          />

          {/* Spinning ring */}
          <Animated.View
            style={[
              styles.ring,
              {
                transform: [{ rotate: spin }],
                borderColor: "rgba(20, 153, 255, 0.9)",
              },
            ]}
          />

          {/* Spark dot */}
          <Animated.View
            style={[
              styles.spark,
              {
                opacity: aSpark,
              },
            ]}
          />
        </View>

        <View style={{ flex: 1, minWidth: 0 }}>
          <Text numberOfLines={1} style={styles.title}>
            Court Connect • {title}
          </Text>
          {!!desc && (
            <Text numberOfLines={1} style={styles.sub}>
              {desc}
            </Text>
          )}
        </View>

        <Text style={styles.chev}>›</Text>
      </Animated.View>

      <View style={styles.divider} />
    </Pressable>
  );
}

const INK = "#0B1220";

const styles = StyleSheet.create({
  row: {
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  iconWrap: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  neonCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#1482fffa",
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  ring: {
    position: "absolute",
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    borderStyle: "dashed",
  },
  spark: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 3.5,
    backgroundColor: "#1900ffff",
    top: 3,
    right: 3,
    shadowColor: "#bb00ffdb",
    shadowOpacity: 1.0,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  title: { color: INK, fontSize: 14.5, fontWeight: "700" },
  sub: { color: "rgba(17,17,17,0.6)", fontSize: 12, marginTop: 2 },
  chev: { color: INK, fontSize: 18, fontWeight: "700", paddingLeft: 8, paddingRight: 2 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: "#E9EAEE", marginLeft: 60 },
});
