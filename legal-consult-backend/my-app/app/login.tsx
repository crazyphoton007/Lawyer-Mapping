// app/login.tsx
import { useEffect, useRef, useState } from "react";
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
  BackHandler,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter, Link } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { LinearGradient } from "expo-linear-gradient";
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
const SOFT = "#EEF2FF";
const SOFT_GOLD = "#F9EBC8";
const GUEST_TOKEN_KEY = "guest_token";
const GUEST_USER_KEY = "guest_user";
const OTP_INVALID_MESSAGE = "That code did not match. Check the SMS and try again.";

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

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
    throw new ApiError(message, res.status);
  }

  return json ?? {};
}

async function readStoredGuestSession() {
  try {
    const [storedToken, storedUser] = await Promise.all([
      SecureStore.getItemAsync(GUEST_TOKEN_KEY),
      SecureStore.getItemAsync(GUEST_USER_KEY),
    ]);

    if (!storedToken || !storedUser) {
      return null;
    }

    const parsedUser = JSON.parse(storedUser);
    if (!parsedUser?.id) {
      throw new Error("Guest profile is incomplete");
    }

    return {
      token: storedToken,
      user: {
        ...parsedUser,
        role: parsedUser.role ?? "guest",
        is_guest: true,
      },
    };
  } catch {
    await Promise.all([
      SecureStore.deleteItemAsync(GUEST_TOKEN_KEY),
      SecureStore.deleteItemAsync(GUEST_USER_KEY),
    ]);
    return null;
  }
}

export default function LoginScreen() {
  const router = useRouter();
  const { setAuth } = useAuth();

  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"request" | "verify">("request");
  const [loading, setLoading] = useState(false);
  const [deliveryMessage, setDeliveryMessage] = useState("");
  const [deliveryAccent, setDeliveryAccent] = useState<"dark" | "soft">("dark");
  const [otpError, setOtpError] = useState("");
  const verifyingCodeRef = useRef("");

  // Info modal state
  const [showInfo, setShowInfo] = useState(false);
  const [infoLoading, setInfoLoading] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);
  const [language, setLanguage] = useState<"en" | "hi">("en");

  // India-only: keep only digits and hard-cap at 10
  const normalizePhone = (s: string) => s.replace(/\D/g, "").slice(0, 10);
  const digits = normalizePhone(phone);
  const isValidIndian = digits.length === 10;

  useEffect(() => {
    if (Platform.OS !== "android") return;

    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (step === "verify") {
        setStep("request");
        setCode("");
        setDeliveryMessage("");
        setOtpError("");
        verifyingCodeRef.current = "";
        return true;
      }
      return false;
    });

    return () => sub.remove();
  }, [step]);

  function pickRandomTip() {
    return Math.floor(Math.random() * INFO_TOPICS.length);
  }

  function applyDeliveryState(channel?: string | null) {
    const normalized = (channel || "").toLowerCase();
    if (normalized === "whatsapp") {
      setDeliveryMessage("Code sent to WhatsApp");
      setDeliveryAccent("dark");
      return;
    }
    if (["sns", "msg91", "sms", "phone"].includes(normalized)) {
      setDeliveryMessage("Switching to phone OTP");
      setDeliveryAccent("soft");
      return;
    }
    if (normalized === "email") {
      setDeliveryMessage("Switching to email OTP");
      setDeliveryAccent("soft");
      return;
    }

    setDeliveryMessage("Code sent securely");
    setDeliveryAccent("dark");
  }

  async function continueAsGuest() {
    setLoading(true);
    setOtpError("");
    verifyingCodeRef.current = "";
    try {
      const savedGuest = await readStoredGuestSession();
      if (savedGuest) {
        await setAuth(savedGuest.token, savedGuest.user);
        try {
          await SecureStore.deleteItemAsync("user_mobile");
        } catch {}
        router.replace("/(tabs)/consult");
        return;
      }

      const data = await apiPost("/auth/guest", { name: "Guest User" });
      const jwt = data.token || data.access_token || data.jwt;
      if (!jwt) throw new Error("No token returned from server");

      const userFromApi = data.user ?? {};
      const userPayload = {
        id: String(userFromApi.id ?? `guest-${Date.now()}`),
        phone: userFromApi.phone ?? null,
        name: String(userFromApi.name ?? "Guest User"),
        role: String(userFromApi.role ?? "guest"),
        is_guest: true,
      };

      await setAuth(jwt, userPayload);
      try {
        await SecureStore.deleteItemAsync("user_mobile");
      } catch {}

      router.replace("/(tabs)/consult");
    } catch (e: any) {
      Alert.alert("Could not continue as guest", e?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function requestCode() {
    const ph = normalizePhone(phone);
    if (ph.length < 10) {
      Alert.alert("Invalid number", "Enter a valid Indian mobile number (10 digits).");
      return;
    }

    setLoading(true);
    setOtpError("");
    verifyingCodeRef.current = "";
    try {
      const e164 = `+91${ph}`;
      const data = await apiPost("/auth/request-code", { phone: e164 });

      applyDeliveryState(data?.delivery_channel);
      setCode("");
      setStep("verify");
    } catch (e: any) {
      console.error("[requestCode] error:", e);
      Alert.alert("Error", e?.message || "Failed to request code");
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode(codeOverride?: string) {
    const ph = normalizePhone(phone);
    const nextCode = (codeOverride ?? code).trim();
    if (ph.length < 10 || nextCode.length === 0) {
      Alert.alert("Missing info", "Enter your mobile and the OTP code.");
      return;
    }
    if (loading || verifyingCodeRef.current === nextCode) {
      return;
    }

    setLoading(true);
    setOtpError("");
    verifyingCodeRef.current = nextCode;
    try {
      const e164 = `+91${ph}`;
      const data = await apiPost("/auth/verify", {
        phone: e164,
        code: nextCode,
      });

      const jwt = data.token || data.access_token || data.jwt;
      if (!jwt) throw new Error("No token returned from server");

      const userFromApi = data.user ?? {};
      const userPayload = {
        id: String(userFromApi.id ?? ph),
        phone: String(userFromApi.phone ?? ph),
      };

      await setAuth(jwt, userPayload);
      setDeliveryMessage("");
      await SecureStore.setItemAsync("user_mobile", ph);
      try {
        await SecureStore.deleteItemAsync("my_requests__local__");
      } catch {}

      // Alert.alert("Logged in", "You’re signed in.");
      router.replace("/(tabs)/requests");
    } catch (e: any) {
      console.error("[verifyCode] error:", e);
      verifyingCodeRef.current = "";
      if (e?.status === 400) {
        setOtpError(OTP_INVALID_MESSAGE);
        return;
      }
      setOtpError(e?.message || "We could not verify that code. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleCodeChange(value: string) {
    const next = value.replace(/\D/g, "").slice(0, 6);
    setCode(next);
    setOtpError("");

    if (next.length === 6) {
      setTimeout(() => verifyCode(next), 80);
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
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 8}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ padding: 0, paddingBottom: 160, flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
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
              Choose the flow that feels right!
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
              <Text style={{ fontSize: 13, color: MUTED }}>
                Enter mobile number for your full caseFit account
              </Text>

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

              {deliveryMessage ? (
                <View
                  style={{
                    borderRadius: 14,
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    backgroundColor: deliveryAccent === "dark" ? INK : "#F3F4F6",
                  }}
                >
                  <Text
                    style={{
                      color: deliveryAccent === "dark" ? "#FFFFFF" : INK,
                      fontSize: 14,
                      fontWeight: "700",
                    }}
                  >
                    {deliveryMessage}
                  </Text>
                  <Text
                    style={{
                      color: deliveryAccent === "dark" ? "rgba(255,255,255,0.72)" : MUTED,
                      fontSize: 12,
                      marginTop: 4,
                    }}
                  >
                    Didn’t get the code?
                  </Text>
                </View>
              ) : null}
            </View>

            {step === "request" ? (
              <LinearGradient
                colors={[SOFT, "#F8FAFC", SOFT_GOLD]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  marginTop: 18,
                  borderRadius: 24,
                  padding: 18,
                  borderWidth: 1,
                  borderColor: "#D8E1F8",
                  overflow: "hidden",
                }}
              >
                <View style={{ gap: 14 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <View style={{ flex: 1, gap: 6 }}>
                      <View
                        style={{
                          alignSelf: "flex-start",
                          paddingHorizontal: 10,
                          paddingVertical: 6,
                          borderRadius: 999,
                          backgroundColor: "rgba(11,18,32,0.08)",
                        }}
                      >
                        <Text style={{ color: INK, fontSize: 11, fontWeight: "900", letterSpacing: 1 }}>
                          EXPRESS ENTRY
                        </Text>
                      </View>
                      <Text style={{ fontSize: 20, lineHeight: 26, fontWeight: "800", color: INK }}>
                        Continue as a guest and book in seconds
                      </Text>
                    </View>
                    <View
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 26,
                        backgroundColor: INK,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text style={{ color: "#fff", fontSize: 24 }}>✦</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={continueAsGuest}
                    disabled={loading}
                    style={{
                      backgroundColor: INK,
                      borderRadius: 16,
                      paddingVertical: 15,
                      paddingHorizontal: 16,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 10,
                    }}
                  >
                    <Text style={{ color: "#fff", fontSize: 16, fontWeight: "800" }}>
                      {loading ? "Preparing guest access…" : "Continue as Guest"}
                    </Text>
                    {!loading ? <Text style={{ color: "#fff", fontSize: 16, fontWeight: "800" }}>→</Text> : null}
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            ) : null}

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
                  onChangeText={handleCodeChange}
                  maxLength={6}
                  keyboardType="number-pad"
                  inputMode="numeric"
                  textContentType="oneTimeCode"
                  placeholder="Enter OTP"
                  placeholderTextColor="#9CA3AF"
                  style={{
                    borderWidth: 1,
                    borderColor: otpError ? "#DC2626" : BORDER,
                    borderRadius: 12,
                    padding: 12,
                    backgroundColor: otpError ? "#FEF2F2" : "#FAFAFA",
                    fontSize: 18,
                    color: otpError ? "#991B1B" : INK,
                    fontWeight: "700", // BOLD OTP
                    letterSpacing: 2, // subtle spacing to look like code boxes
                    textAlign: "center",
                  }}
                />

                {otpError ? (
                  <Text
                    style={{
                      color: "#B91C1C",
                      fontSize: 12,
                      lineHeight: 17,
                      textAlign: "center",
                      fontWeight: "700",
                    }}
                  >
                    {otpError}
                  </Text>
                ) : (
                  <Text
                    style={{
                      color: MUTED,
                      fontSize: 12,
                      textAlign: "center",
                    }}
                  >
                    Enter the 6-digit code. We’ll take you in automatically.
                  </Text>
                )}

                <TouchableOpacity
                  onPress={() => verifyCode()}
                  disabled={loading || code.trim().length < 6}
                  style={{
                    backgroundColor:
                      code.trim().length < 6 ? "#9CA3AF" : loading ? "#11182799" : INK,
                    paddingVertical: 14,
                    borderRadius: 12,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
                    {loading ? "Checking code…" : "Enter caseFit"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={requestCode}
                  disabled={loading}
                  style={{ alignSelf: "center", paddingVertical: 4, paddingHorizontal: 8 }}
                >
                  <Text
                    style={{
                      color: loading ? "#9CA3AF" : "#2563EB",
                      fontSize: 12,
                      textAlign: "center",
                      fontWeight: "800",
                    }}
                  >
                    Didn’t get it? Send a fresh code
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* AGREEMENTS + SUPPORT (must be inside <Text>) */}
            <View style={{ marginTop: 18, alignItems: "center", gap: 12 }}>
              <Text
                style={{
                  color: "#6b7280",
                  lineHeight: 20,
                  textAlign: "center",
                }}
              >
                By proceeding, you agree to caseFit&apos;s{" "}
                <Link href="/legal/privacy" asChild>
                  <Text style={{ textDecorationLine: "underline", color: "#4B5563" }}>
                    Privacy Policy
                  </Text>
                </Link>
                ,{" "}
                <Link href="/legal/terms" asChild>
                  <Text style={{ textDecorationLine: "underline", color: "#4B5563" }}>
                    Terms &amp; Conditions
                  </Text>
                </Link>
              </Text>

              <Text
                style={{
                  color: "#6b7280",
                  lineHeight: 20,
                  textAlign: "center",
                }}
              >
                Need help?{" "}
                <Link href="mailto:support@thecasefit.com" asChild>
                  <Text style={{ textDecorationLine: "underline", color: "#4B5563", fontWeight: "600" }}>
                    Tap here
                  </Text>
                </Link>
                {" "}to email support
              </Text>
            </View>
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
