// app/login.tsx
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
  Modal,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter, Link } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { API_BASE } from "../constants/config";
import { useAuth } from "../context/auth";

// Top brand bar
import CaseFitHero from "../components/CaseFitHero";
// Bilingual topics (50 items)
import { INFO_TOPICS } from "../constants/legal_tips";

const BG = "#F5F7FB";
const CARD = "#FFFFFF";
const INK = "#0B1220";
const MUTED = "#6B7280";
const BORDER = "#E5E7EB";

// Visual tweaks
const LOGO_SIZE = 38;
const HERO_PULLUP = 0;
const LOGO_TOP_MARGIN = 65;
const LOGO_BOTTOM_MARGIN = 3;

/** Use identical typography for +91 and the phone digits */
const DIGIT_TEXT = {
  fontSize: 20 as const,
  fontWeight: "800" as const,
  letterSpacing: 0.5,
  // Tabular numerals keep widths consistent across digits on iOS
  fontVariant: ["tabular-nums"] as any,
  lineHeight: 24 as const,
};

// ---------- small helper: POST with default headers ----------
async function apiPost(path: string, body: unknown) {
  const url = `${API_BASE}${path}`;
  console.log("[apiPost] POST", url, "body =", body);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  // Try to get some useful text for error/debugging
  const text = await res.text();
  let json: any = null;

  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    // not JSON, ignore
  }

  if (!res.ok) {
    const message =
      (json && (json.detail || json.error || json.message)) ||
      `HTTP ${res.status}: ${text.slice(0, 200)}`;
    throw new Error(message);
  }

  return json ?? {};
}

export default function LoginScreen() {
  const router = useRouter();
  const { setAuth } = useAuth();

  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"request" | "verify">("request");
  const [loading, setLoading] = useState(false);

  // Info modal state
  const [showInfo, setShowInfo] = useState(false);
  const [infoLoading, setInfoLoading] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);
  const [language, setLanguage] = useState<"en" | "hi">("en");

  // India-only: keep only digits and hard-cap at 10
  const normalizePhone = (s: string) => s.replace(/\D/g, "").slice(0, 10);
  const digits = normalizePhone(phone);
  const isValidIndian = digits.length === 10;

  function pickRandomTip() {
    return Math.floor(Math.random() * INFO_TOPICS.length);
  }

  async function requestCode() {
    const ph = normalizePhone(phone);
    if (ph.length < 10) {
      Alert.alert("Invalid number", "Enter a valid Indian mobile number (10 digits).");
      return;
    }

    setLoading(true);
    try {
      const e164 = `+91${ph}`;
      const data = await apiPost("/auth/request-code", { phone: e164 });
      console.log("[requestCode] response:", data);

      setStep("verify");
      // Alert.alert("OTP sent", "Enter the code you received.");
    } catch (e: any) {
      console.error("[requestCode] error:", e);
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
      const e164 = `+91${ph}`;
      const data = await apiPost("/auth/verify", {
        phone: e164,
        code: code.trim(),
      });
      console.log("[verifyCode] response:", data);

      const jwt = data.token || data.access_token || data.jwt;
      if (!jwt) throw new Error("No token returned from server");

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

      // Alert.alert("Logged in", "You’re signed in.");
      router.replace("/(tabs)/requests");
    } catch (e: any) {
      console.error("[verifyCode] error:", e);
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

  // current topic content (selected language) — used only inside the modal
  const content = INFO_TOPICS[tipIndex][language];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
      {/* Hide the native header on this screen */}
      <Stack.Screen options={{ headerShown: false }} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ padding: 0, paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Brand bar */}
          <CaseFitHero tagline="Legal help, done right." />

          {/* Main content wrapper */}
          <View style={{ paddingHorizontal: 16, marginTop: HERO_PULLUP }}>
            {/* LOGO area */}
            <View
              style={{
                alignItems: "flex-start",
                marginTop: LOGO_TOP_MARGIN,
                marginBottom: LOGO_BOTTOM_MARGIN,
                marginLeft: 10,
              }}
            />
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
              No passwords — just a quick OTP!
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
                  <Text style={{ fontSize: 20, transform: [{ translateY: 1 }] }}>🇮🇳</Text>
                  <Text style={[{ color: INK }, DIGIT_TEXT]}>+91</Text>
                </View>

                <TextInput
                  value={digits}
                  onChangeText={(t) => setPhone(normalizePhone(t))}
                  maxLength={10}
                  keyboardType="number-pad"
                  inputMode="numeric"
                  placeholder="mobile number"
                  placeholderTextColor="#9CA3AF"
                  style={[
                    {
                      flex: 1,
                      color: INK,
                      paddingVertical: 8,
                    },
                    DIGIT_TEXT, // same typography as +91
                  ]}
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
                    {!isValidIndian
                      ? "Enter 10-digit number"
                      : loading
                      ? "Sending…"
                      : "PROCEED"}
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
                  onChangeText={(t) => setCode(t.replace(/\D/g, "").slice(0, 6))}
                  maxLength={6}
                  keyboardType="number-pad"
                  inputMode="numeric"
                  textContentType="oneTimeCode"
                  placeholder="Enter OTP"
                  placeholderTextColor="#9CA3AF"
                  style={{
                    borderWidth: 1,
                    borderColor: BORDER,
                    borderRadius: 12,
                    padding: 12,
                    backgroundColor: "#FAFAFA",
                    fontSize: 18,
                    color: INK,
                    fontWeight: "700", // BOLD OTP
                    letterSpacing: 2, // subtle spacing to look like code boxes
                    textAlign: "center",
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

            {/* AGREEMENTS + SUPPORT (must be inside <Text>) */}
            <Text
              style={{
                marginTop: 16,
                color: "#6b7280",
                lineHeight: 20,
                textAlign: "center",
              }}
            >
              By proceeding, you agree to caseFit’s{" "}
              <Link href="/legal/privacy" asChild>
                <Text style={{ textDecorationLine: "underline" }}>Privacy Policy</Text>
              </Link>{" "}
              &{" "}
              <Link href="/legal/terms" asChild>
                <Text style={{ textDecorationLine: "underline" }}>
                  Terms &amp; Conditions
                </Text>
              </Link>
              .
              {"\n\n"}
              Need help?{" "}
              <Link href="mailto:support@thecasefit.com" asChild>
                <Text style={{ textDecorationLine: "underline" }}>Tap here</Text>
              </Link>{" "}
              to email support.
            </Text>
          </View>
          {/* END: main content wrapper */}

          {/* RANDOM INFO MODAL */}
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
                <View
                  style={{ backgroundColor: "#fff", borderRadius: 16, padding: 16 }}
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
                      {language === "en"
                        ? "Things to consider"
                        : "ध्यान रखने योग्य बातें"}
                    </Text>
                    {content.consider.map((c: string, i: number) => (
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
                    {/* Inline language toggle inside modal */}
                    <TouchableOpacity
                      onPress={() =>
                        setLanguage(language === "en" ? "hi" : "en")
                      }
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
                            while (
                              i === tipIndex &&
                              INFO_TOPICS.length > 1
                            )
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
