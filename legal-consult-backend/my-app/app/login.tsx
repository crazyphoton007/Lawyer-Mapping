import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Linking,
  Image,
  Pressable,
  Modal,
  ActivityIndicator,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { API_BASE } from "../constants/config";
import { useAuth } from "../context/auth";

// 🔥 Top brand bar (black header)
import CaseFitHero from "../components/CaseFitHero";

// 📚 Bilingual topics (50 items)
import { INFO_TOPICS } from "../constants/legal_tips";

const BG = "#F5F7FB";
const CARD = "#FFFFFF";
const INK = "#0B1220";
const MUTED = "#6B7280";
const BORDER = "#E5E7EB";

// ✅ Adjust these for look & spacing
const LOGO_SIZE = 38; // logo image size
const HERO_PULLUP = 0; // keep zero so we don’t touch the header
const LOGO_TOP_MARGIN = 65; // space below the black header before logo
const LOGO_BOTTOM_MARGIN = 3; // tighter gap below logo

export default function LoginScreen() {
  const router = useRouter();
  const { setAuth } = useAuth();

  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"request" | "verify">("request");
  const [loading, setLoading] = useState(false);

  // 👉 Info modal state
  const [showInfo, setShowInfo] = useState(false);
  const [infoLoading, setInfoLoading] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);
  const [language, setLanguage] = useState<"en" | "hi">("en"); // default English

  // India-only: accept any input, strip non-digits
  const normalizePhone = (s: string) => s.replace(/\D/g, "").slice(-12);
  const digits = normalizePhone(phone);
  const isValidIndian = digits.length === 10;

  function pickRandomTip() {
    return Math.floor(Math.random() * INFO_TOPICS.length);
  }

  function handleLogoPress() {
    setShowInfo(true);
    setInfoLoading(true);
    setTimeout(() => {
      let i = pickRandomTip();
      while (i === tipIndex && INFO_TOPICS.length > 1) i = pickRandomTip();
      setTipIndex(i);
      setInfoLoading(false);
    }, 2200); // 2.2s spinner
  }

  async function requestCode() {
    const ph = normalizePhone(phone);
    if (ph.length < 10) {
      Alert.alert("Invalid number", "Enter a valid Indian mobile number (10 digits).");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/request-code`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ phone: ph }),
      });
      const txt = await res.text();
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${txt}`);
      setStep("verify");
      Alert.alert("OTP sent", "Enter the code you received.");
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to request code");
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode() {
    const ph = normalizePhone(phone);
    if (ph.length < 10 || code.trim().length === 0) {
      Alert.alert("Missing info", "Enter your mobile and the OTP code.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/verify`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ phone: ph, code: code.trim() }),
      });
      const txt = await res.text();
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${txt}`);
      const data = JSON.parse(txt);

      const jwt = data.token || data.access_token || data.jwt;
      if (!jwt) throw new Error("No token returned");

      const userFromApi = data.user ?? {};
      const userPayload = {
        id: String(userFromApi.id ?? ph),
        phone: String(userFromApi.phone ?? ph),
      };

      await setAuth(jwt, userPayload);
      await SecureStore.setItemAsync("user_mobile", ph);
      try {
        await SecureStore.deleteItemAsync("my_requests__local__");
      } catch {}

      Alert.alert("Logged in", "You’re signed in.");
      router.replace("/(tabs)/requests");
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to verify code");
    } finally {
      setLoading(false);
    }
  }

  function openHelp() {
    const mailto =
      "mailto:support@thecasefit.com?subject=" +
      encodeURIComponent("Help with caseFit login");
    Linking.openURL(mailto).catch(() => {
      Alert.alert("Error", "Could not open email app.");
    });
  }

  // current topic content (selected language)
  const content = INFO_TOPICS[tipIndex][language];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
      {/* ⬇️ Hide the native header on this screen */}
      <Stack.Screen options={{ headerShown: false }} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ padding: 0, paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* 🔥 Top brand bar */}
          <CaseFitHero tagline="Legal help, done right." />

          {/* Optional language toggle (top-right of content) */}
          <View style={{ paddingHorizontal: 16, marginTop: 8, alignItems: "flex-end" }}>
            <TouchableOpacity
              onPress={() => setLanguage(language === "en" ? "hi" : "en")}
              style={{
                paddingHorizontal: 10,
                paddingVertical: 6,
                backgroundColor: "#E5E7EB",
                borderRadius: 8,
              }}
            >
              <Text style={{ color: "#111827", fontWeight: "600" }}>
                {language === "en" ? "हिन्दी" : "English"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Main content wrapper */}
          <View style={{ paddingHorizontal: 16, marginTop: HERO_PULLUP }}>
            {/* LOGO: left-aligned, placed closer to the login title */}
            <View
              style={{
                alignItems: "flex-start",
                marginTop: LOGO_TOP_MARGIN,
                marginBottom: LOGO_BOTTOM_MARGIN,
                marginLeft: 10,
              }}
            >
            </View>
             
            <View pointerEvents="none">
            <Image
                source={require("../assets/images/only_logoo.png")}
                style={{ width: LOGO_SIZE, height: LOGO_SIZE }}
                resizeMode="contain"
            />
            </View>

            {/* Title + subtitle */}
            <Text
              style={{
                fontSize: 22,
                lineHeight: 28,
                fontWeight: "800",
                color: INK,
                textAlign: "left",
              }}
            >
              Log in with your caseFit Account
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: MUTED,
                marginTop: 4,
                textAlign: "left",
              }}
            >
              No passwords - just a quick OTP!
            </Text>

            {/* PHONE card */}
            <View
              style={{
                backgroundColor: CARD,
                borderRadius: 20,
                padding: 16,
                gap: 12,
                marginTop: 16,
                borderWidth: 1,
                borderColor: BORDER,
                shadowColor: "#000",
                shadowOpacity: 0.06,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 4 },
                elevation: 2,
              }}
            >
              <Text style={{ fontSize: 13, color: MUTED }}>Enter mobile number</Text>

              {/* Input row with 🇮🇳 +91 pill */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                  borderWidth: 1,
                  borderColor: BORDER,
                  borderRadius: 12,
                  backgroundColor: "#FFFFFF",
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    borderWidth: 1,
                    borderColor: BORDER,
                    borderRadius: 999,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    backgroundColor: "#FFFFFF",
                  }}
                >
                  <Text style={{ fontSize: 18 }}>🇮🇳</Text>
                  <Text style={{ color: INK, fontWeight: "700" }}>+91</Text>
                </View>

                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  placeholder="mobile number"
                  placeholderTextColor="#9CA3AF"
                  style={{
                    flex: 1,
                    fontSize: 16,
                    color: INK,
                    paddingVertical: 8,
                  }}
                />
              </View>

              {step === "request" && (
                <TouchableOpacity
                  onPress={requestCode}
                  disabled={loading || !isValidIndian}
                  style={{
                    backgroundColor:
                      !isValidIndian ? "#9CA3AF" : loading ? "#11182799" : INK,
                    paddingVertical: 14,
                    borderRadius: 12,
                    alignItems: "center",
                    marginTop: 4,
                  }}
                >
                  <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
                    {!isValidIndian ? "Enter 10-digit number" : loading ? "Sending…" : "PROCEED"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* CODE card */}
            {step === "verify" && (
              <View
                style={{
                  backgroundColor: CARD,
                  borderRadius: 20,
                  padding: 16,
                  gap: 12,
                  marginTop: 14,
                  borderWidth: 1,
                  borderColor: BORDER,
                  shadowColor: "#000",
                  shadowOpacity: 0.06,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 4 },
                  elevation: 2,
                }}
              >
                <Text style={{ fontSize: 13, color: MUTED }}>OTP Code</Text>

                <TextInput
                  value={code}
                  onChangeText={setCode}
                  keyboardType="number-pad"
                  placeholder="Enter OTP"
                  placeholderTextColor="#9CA3AF"
                  style={{
                    borderWidth: 1,
                    borderColor: BORDER,
                    borderRadius: 12,
                    padding: 12,
                    backgroundColor: "#FAFAFA",
                    fontSize: 16,
                    color: INK,
                  }}
                />

                <TouchableOpacity
                  onPress={verifyCode}
                  disabled={loading || code.trim().length === 0}
                  style={{
                    backgroundColor:
                      code.trim().length === 0 ? "#9CA3AF" : loading ? "#11182799" : INK,
                    paddingVertical: 14,
                    borderRadius: 12,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
                    {loading ? "Verifying…" : "Verify & Continue"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Footer note */}
            <Text
              style={{ fontSize: 12, color: MUTED, marginTop: 16, textAlign: "center" }}
              onPress={openHelp}
            >
              By proceeding, you agree to caseFit’s Privacy Policy and Terms & Conditions.
            </Text>
          </View>

          {/* ℹ️ RANDOM INFO MODAL */}
          <Modal
            visible={showInfo}
            transparent
            animationType="fade"
            onRequestClose={() => setShowInfo(false)}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: "rgba(0,0,0,0.45)",
                justifyContent: "center",
                padding: 20,
              }}
            >
              {infoLoading ? (
                <View
                  style={{
                    alignSelf: "center",
                    width: 120,
                    height: 120,
                    borderRadius: 60,
                    backgroundColor: "#fff",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ActivityIndicator size="large" />
                </View>
              ) : (
                <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 16 }}>
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

                  <View
                    style={{
                      flexDirection: "row",
                      gap: 10,
                      marginTop: 16,
                      justifyContent: "space-between",
                    }}
                  >
                    {/* Inline language toggle inside modal as well */}
                    <TouchableOpacity
                      onPress={() => setLanguage(language === "en" ? "hi" : "en")}
                      style={{
                        paddingVertical: 10,
                        paddingHorizontal: 14,
                        borderRadius: 10,
                        backgroundColor: "#E5E7EB",
                      }}
                    >
                      <Text style={{ color: "#111827", fontWeight: "700" }}>
                        {language === "en" ? "हिन्दी" : "English"}
                      </Text>
                    </TouchableOpacity>

                    <View style={{ flexDirection: "row", gap: 10 }}>
                      <TouchableOpacity
                        onPress={() => {
                          setInfoLoading(true);
                          setTimeout(() => {
                            let i = pickRandomTip();
                            while (i === tipIndex && INFO_TOPICS.length > 1)
                              i = pickRandomTip();
                            setTipIndex(i);
                            setInfoLoading(false);
                          }, 900);
                        }}
                        style={{
                          paddingVertical: 10,
                          paddingHorizontal: 14,
                          borderRadius: 10,
                          backgroundColor: "#0B1220",
                        }}
                      >
                        <Text style={{ color: "#fff", fontWeight: "700" }}>
                          {language === "en" ? "Another" : "और एक"}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => setShowInfo(false)}
                        style={{
                          paddingVertical: 10,
                          paddingHorizontal: 14,
                          borderRadius: 10,
                          backgroundColor: "#E5E7EB",
                        }}
                      >
                        <Text style={{ color: "#111827", fontWeight: "700" }}>
                          {language === "en" ? "Close" : "बंद करें"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </Modal>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
