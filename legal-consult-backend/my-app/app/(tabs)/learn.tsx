import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { INFO_TOPICS } from "../../constants/legal_tips";
import { useArticles } from "../../hooks/useArticles";

const PAPER = "#F4F7FB";
const INK = "#081121";
const MUTED = "#667085";
const PANEL = "#FFFFFF";
const LINE = "#DCE6F3";
const ACCENT_DEEP = "#0F4C81";
const WARM = "#F59E0B";
type Language = "en" | "hi";

export default function LearnScreen() {
  const [tipIndex, setTipIndex] = useState(0);
  const [language, setLanguage] = useState<Language>("en");
  const [infoLoading, setInfoLoading] = useState(false);
  useArticles();
  const aiPulse = useRef(new Animated.Value(0)).current;

  const content = INFO_TOPICS[tipIndex][language];

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(aiPulse, {
          toValue: 1,
          duration: 1100,
          useNativeDriver: true,
        }),
        Animated.timing(aiPulse, {
          toValue: 0,
          duration: 1100,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [aiPulse]);

  const aiGlowOpacity = aiPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0.95],
  });
  const aiGlowScale = aiPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.14],
  });

  function handleNext() {
    setInfoLoading(true);
    setTimeout(() => {
      let next = Math.floor(Math.random() * INFO_TOPICS.length);
      while (next === tipIndex && INFO_TOPICS.length > 1) next = Math.floor(Math.random() * INFO_TOPICS.length);
      setTipIndex(next);
      setInfoLoading(false);
    }, 180);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.row}>
          <View style={[styles.card, styles.cardLarge]}>
            <View style={styles.sectionHeader}>
              <View style={styles.aiEyebrowWrap}>
                <Animated.View
                  style={[
                    styles.aiGlyphGlow,
                    {
                      opacity: aiGlowOpacity,
                      transform: [{ scale: aiGlowScale }],
                    },
                  ]}
                />
                <View style={styles.aiGlyphCore}>
                  <Ionicons name="sparkles" size={14} color="#EAF7FF" />
                </View>
                <Text style={styles.sectionEyebrow}>
                  {language === "en" ? "AI POWERED" : "AI POWERED"}
                </Text>
              </View>
              <Pressable
                onPress={() => setLanguage(language === "en" ? "hi" : "en")}
                style={styles.languageToggle}
              >
                <Text style={styles.languageToggleText}>
                  {language === "en" ? "हिन्दी" : "English"}
                </Text>
              </Pressable>
            </View>

            {infoLoading ? (
              <View style={styles.loadingWrap}>
                <ActivityIndicator color={ACCENT_DEEP} />
                <Text style={styles.loadingText}>
                  {language === "en"
                    ? "Refreshing the next brief..."
                    : "अगला ब्रीफ तैयार हो रहा है..."}
                </Text>
              </View>
            ) : (
              <>
                <Text style={styles.featuredTitle}>{content.title}</Text>
                <Text style={styles.featuredBody}>{content.body}</Text>

                <View style={styles.considerBox}>
                  <Text style={styles.considerTitle}>
                    {language === "en" ? "What to keep in mind" : "क्या याद रखें"}
                  </Text>
                  {content.consider.map((item, index) => (
                    <View key={`${item}-${index}`} style={styles.considerRow}>
                      <View style={styles.considerBullet} />
                      <Text style={styles.considerText}>{item}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}

            <Pressable onPress={handleNext} style={styles.nextAction}>
              <LinearGradient
                colors={["#0A2540", "#164B7A", "#2785B5"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.nextActionInner}
              >
                <Text style={styles.nextActionText}>
                  {language === "en" ? "Next" : "आगे बढ़ें"}
                </Text>
                <Ionicons name="arrow-forward" size={18} color="#F8FBFF" />
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: PAPER,
  },
  content: {
    padding: 18,
    paddingBottom: 32,
    gap: 18,
  },
  row: {
    gap: 18,
  },
  card: {
    backgroundColor: PANEL,
    borderRadius: 26,
    padding: 20,
    borderWidth: 1,
    borderColor: LINE,
    shadowColor: "#0A1730",
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
  },
  cardLarge: {
    gap: 14,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  sectionEyebrow: {
    fontSize: 11,
    fontWeight: "800",
    color: ACCENT_DEEP,
    letterSpacing: 1.2,
  },
  aiEyebrowWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  aiGlyphGlow: {
    position: "absolute",
    left: -4,
    width: 30,
    height: 30,
    borderRadius: 999,
    backgroundColor: "rgba(76, 201, 240, 0.24)",
  },
  aiGlyphCore: {
    width: 22,
    height: 22,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0F4C81",
    borderWidth: 1,
    borderColor: "#5AC8FA",
  },
  languageToggle: {
    backgroundColor: "#EEF4FF",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  languageToggleText: {
    color: ACCENT_DEEP,
    fontWeight: "800",
    fontSize: 13,
  },
  sectionMeta: {
    color: MUTED,
    fontSize: 12,
    fontWeight: "800",
  },
  featuredTitle: {
    color: INK,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "900",
  },
  featuredBody: {
    color: "#324054",
    fontSize: 15,
    lineHeight: 24,
  },
  considerBox: {
    borderRadius: 22,
    backgroundColor: "#F8FBFF",
    borderWidth: 1,
    borderColor: "#DDEAF7",
    padding: 16,
    gap: 10,
  },
  considerTitle: {
    color: INK,
    fontSize: 15,
    fontWeight: "800",
  },
  considerRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  considerBullet: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: WARM,
    marginTop: 7,
  },
  considerText: {
    flex: 1,
    color: "#405064",
    fontSize: 14,
    lineHeight: 21,
  },
  nextAction: {
    marginTop: 4,
  },
  nextActionInner: {
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  nextActionText: {
    color: "#F8FBFF",
    fontSize: 15,
    fontWeight: "800",
  },
  loadingWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 26,
    gap: 10,
  },
  loadingText: {
    color: MUTED,
    fontSize: 13,
    fontWeight: "700",
  },
  errorText: {
    color: "#B42318",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 10,
  },
});
