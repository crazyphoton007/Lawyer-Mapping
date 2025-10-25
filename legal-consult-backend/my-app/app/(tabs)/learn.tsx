import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { INFO_TOPICS } from "../../constants/legal_tips";

const INK = "#0B1220";
const BG = "#F5F7FB";

export default function LearnScreen() {
  const [tipIndex, setTipIndex] = useState(0);
  const [infoLoading, setInfoLoading] = useState(false);
  const [language, setLanguage] = useState<"en" | "hi">("en");

  const content = INFO_TOPICS[tipIndex][language];

  function pickRandomTip() {
    return Math.floor(Math.random() * INFO_TOPICS.length);
  }

  function handleNext() {
    setInfoLoading(true);
    setTimeout(() => {
      let i = pickRandomTip();
      while (i === tipIndex && INFO_TOPICS.length > 1) i = pickRandomTip();
      setTipIndex(i);
      setInfoLoading(false);
    }, 800);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={{ alignItems: "center", marginBottom: 20 }}>
          <Ionicons name="school-outline" size={50} color={INK} />
          <Text style={{ fontSize: 24, fontWeight: "800", color: INK, marginTop: 8 }}>
            {language === "en" ? "Learn Law" : "कानून सीखें"}
          </Text>
          <Text style={{ color: "#6B7280", marginTop: 4, textAlign: "center" }}>
            {language === "en"
              ? "Quick daily legal knowledge for you."
              : "हर बार नया कानूनी ज्ञान जानिए।"}
          </Text>
        </View>

        {infoLoading ? (
          <View style={{ alignItems: "center", marginTop: 100 }}>
            <ActivityIndicator size="large" />
          </View>
        ) : (
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: "#E5E7EB",
              shadowColor: "#000",
              shadowOpacity: 0.06,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 4 },
              elevation: 2,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "800", color: INK }}>
              {content.title}
            </Text>
            <Text style={{ marginTop: 8, color: INK, lineHeight: 20 }}>
              {content.body}
            </Text>

            <View
              style={{
                marginTop: 10,
                paddingTop: 8,
                borderTopWidth: 1,
                borderColor: "#EAEAEA",
              }}
            >
              <Text style={{ fontWeight: "700", color: INK }}>
                {language === "en" ? "Things to consider" : "ध्यान रखने योग्य बातें"}
              </Text>
              {content.consider.map((c, i) => (
                <Text key={i} style={{ marginTop: 4, color: "#374151" }}>
                  • {c}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* Buttons */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 24,
          }}
        >
          <TouchableOpacity
            onPress={() => setLanguage(language === "en" ? "hi" : "en")}
            style={{
              paddingVertical: 12,
              paddingHorizontal: 20,
              borderRadius: 10,
              backgroundColor: "#E5E7EB",
            }}
          >
            <Text style={{ fontWeight: "700", color: "#111827" }}>
              {language === "en" ? "हिन्दी" : "English"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleNext}
            style={{
              paddingVertical: 12,
              paddingHorizontal: 20,
              borderRadius: 10,
              backgroundColor: "#0B1220",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>
              {language === "en" ? "Next Topic" : "अगला विषय"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
