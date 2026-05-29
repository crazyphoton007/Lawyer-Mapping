import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { ReactNode, useEffect, useRef } from "react";
import { ActivityIndicator, Animated, Easing, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  tone?: "maintenance" | "offline" | "error";
  eyebrow?: string;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  loading?: boolean;
  compact?: boolean;
  children?: ReactNode;
};

const TONES = {
  maintenance: {
    icon: "tool" as const,
    accent: "#8B7CFF",
    accent2: "#D8B4FE",
    eyebrow: "caseFit maintenance",
    title: "Hang on! We are under maintenance",
  },
  offline: {
    icon: "wifi-off" as const,
    accent: "#60A5FA",
    accent2: "#A5F3FC",
    eyebrow: "caseFit connection",
    title: "Connection needs attention",
  },
  error: {
    icon: "alert-circle" as const,
    accent: "#F87171",
    accent2: "#FDBA74",
    eyebrow: "caseFit service",
    title: "Something needs a quick check",
  },
};

function MaintenanceIllustration({
  tone,
  floatY,
  spin,
}: {
  tone: Props["tone"];
  floatY: Animated.AnimatedInterpolation<string | number>;
  spin: Animated.AnimatedInterpolation<string | number>;
}) {
  const theme = TONES[tone || "error"];

  return (
    <View style={styles.illustrationWrap}>
      <Animated.View style={[styles.floatingCard, styles.cardLarge, { transform: [{ translateY: floatY }] }]}>
        <LinearGradient colors={["#E9D5FF", "#A5B4FC"]} style={styles.cardFace} />
      </Animated.View>

      <Animated.View style={[styles.floatingCard, styles.cardMid, { transform: [{ translateY: floatY }] }]}>
        <LinearGradient colors={["#C7D2FE", "#F5D0FE"]} style={styles.cardFace} />
      </Animated.View>

      <View style={styles.serverStack}>
        {[0, 1, 2].map((index) => (
          <View key={index} style={styles.serverRow}>
            <View style={[styles.serverBadge, { backgroundColor: index === 1 ? theme.accent2 : "#C4B5FD" }]}>
              <Feather name={index === 0 ? "upload-cloud" : "download-cloud"} size={18} color="#1E1B4B" />
            </View>
            <View style={styles.serverLights}>
              <View style={styles.lightOff} />
              <View style={styles.lightOff} />
              <View style={[styles.lightOn, { backgroundColor: theme.accent }]} />
            </View>
          </View>
        ))}
      </View>

      <Animated.View style={[styles.gear, styles.gearLeft, { transform: [{ rotate: spin }] }]}>
        <Feather name="settings" size={42} color="rgba(255,255,255,0.16)" />
      </Animated.View>
      <Animated.View style={[styles.gear, styles.gearRight, { transform: [{ rotate: spin }] }]}>
        <Feather name={theme.icon} size={48} color={theme.accent2} />
      </Animated.View>
    </View>
  );
}

export default function PremiumErrorState({
  tone = "error",
  eyebrow,
  title,
  message,
  actionLabel = "Check again",
  onAction,
  secondaryLabel,
  onSecondary,
  loading,
  compact,
  children,
}: Props) {
  const theme = TONES[tone];
  const float = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    const rotateLoop = Animated.loop(
      Animated.timing(rotate, { toValue: 1, duration: 9000, easing: Easing.linear, useNativeDriver: true })
    );

    floatLoop.start();
    rotateLoop.start();

    return () => {
      floatLoop.stop();
      rotateLoop.stop();
    };
  }, [float, rotate]);

  const floatY = float.interpolate({ inputRange: [0, 1], outputRange: [0, -12] });
  const spin = rotate.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
  const headline = tone === "maintenance" ? "Hang on!\nWe are under maintenance" : title || theme.title;
  const bodyCopy = tone === "maintenance"
    ? "We apologise for any inconvenience caused. We’ve almost done."
    : message;

  const content = (
    <LinearGradient colors={["#25218B", "#17145F", "#0C103E"]} style={[styles.screen, compact && styles.compactScreen]}>
      <View style={styles.orbPink} />
      <View style={styles.orbBlue} />
      <View style={styles.lineOne} />
      <View style={styles.lineTwo} />

      <View style={styles.phoneFrame}>
        <LinearGradient colors={["rgba(255,255,255,0.22)", "rgba(255,255,255,0.04)"]} style={styles.frameStroke}>
          <View style={styles.innerScreen}>
            <Text style={styles.logoMark}>caseFit</Text>

            <MaintenanceIllustration tone={tone} floatY={floatY} spin={spin} />

            <View style={styles.copyBlock}>
              <Text style={styles.title}>{headline}</Text>
              <Text style={styles.message}>{bodyCopy}</Text>
            </View>

            {children}

            {onAction ? (
              <Pressable style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]} onPress={onAction}>
                <LinearGradient colors={["#6D63FF", "#4F46E5"]} style={styles.primaryFill}>
                  {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryText}>{actionLabel}</Text>}
                </LinearGradient>
              </Pressable>
            ) : null}

            {secondaryLabel && onSecondary ? (
              <Pressable style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]} onPress={onSecondary}>
                <Text style={styles.secondaryText}>{secondaryLabel}</Text>
              </Pressable>
            ) : null}
          </View>
        </LinearGradient>
      </View>
    </LinearGradient>
  );

  if (compact) return content;

  return <SafeAreaView style={styles.safe}>{content}</SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#17145F",
  },
  screen: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 18,
    overflow: "hidden",
  },
  compactScreen: {
    minHeight: "100%",
  },
  orbPink: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(244, 114, 182, 0.22)",
    left: -80,
    bottom: -40,
  },
  orbBlue: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(125, 211, 252, 0.18)",
    right: -70,
    top: 80,
  },
  lineOne: {
    position: "absolute",
    width: 260,
    height: 1,
    backgroundColor: "rgba(248, 113, 113, 0.36)",
    left: -30,
    bottom: 72,
    transform: [{ rotate: "-18deg" }],
  },
  lineTwo: {
    position: "absolute",
    width: 300,
    height: 1,
    backgroundColor: "rgba(165, 180, 252, 0.42)",
    right: -70,
    top: 220,
    transform: [{ rotate: "-12deg" }],
  },
  phoneFrame: {
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    borderRadius: 56,
    minHeight: "88%",
    shadowColor: "#000000",
    shadowOpacity: 0.28,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 20 },
    elevation: 8,
  },
  frameStroke: {
    flex: 1,
    borderRadius: 56,
    padding: 2,
  },
  innerScreen: {
    flex: 1,
    borderRadius: 54,
    backgroundColor: "#20207B",
    paddingHorizontal: 28,
    paddingTop: 48,
    paddingBottom: 28,
    overflow: "hidden",
  },
  logoMark: {
    color: "rgba(255,255,255,0.86)",
    fontSize: 19,
    fontWeight: "900",
    letterSpacing: 0,
  },
  illustrationWrap: {
    height: 310,
    justifyContent: "center",
    alignItems: "center",
  },
  floatingCard: {
    position: "absolute",
    borderRadius: 18,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 14 },
  },
  cardLarge: {
    width: 150,
    height: 86,
    left: 38,
    top: 84,
    transform: [{ rotate: "-25deg" }],
  },
  cardMid: {
    width: 124,
    height: 52,
    left: 112,
    top: 164,
    transform: [{ rotate: "-12deg" }],
  },
  cardFace: {
    flex: 1,
    borderRadius: 18,
    opacity: 0.9,
  },
  serverStack: {
    width: 214,
    gap: 10,
    alignSelf: "center",
    marginTop: 42,
  },
  serverRow: {
    height: 58,
    borderRadius: 8,
    backgroundColor: "rgba(8, 8, 45, 0.62)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.12)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
  },
  serverBadge: {
    width: 54,
    height: 38,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  serverLights: {
    flexDirection: "row",
    gap: 8,
  },
  lightOff: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.45)",
  },
  lightOn: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  gear: {
    position: "absolute",
  },
  gearLeft: {
    left: 24,
    bottom: 12,
  },
  gearRight: {
    right: 4,
    bottom: -10,
  },
  copyBlock: {
    marginTop: "auto",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "600",
  },
  message: {
    color: "rgba(255,255,255,0.84)",
    fontSize: 15,
    lineHeight: 23,
    marginTop: 18,
  },
  primaryBtn: {
    marginTop: 34,
    borderRadius: 999,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  primaryFill: {
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 22,
  },
  primaryText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  secondaryBtn: {
    marginTop: 14,
    minHeight: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryText: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 14,
    fontWeight: "800",
  },
  pressed: {
    opacity: 0.82,
  },
});
