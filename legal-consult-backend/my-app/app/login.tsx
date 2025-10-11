import { Ionicons } from "@expo/vector-icons";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { API_BASE } from "../constants/config";
import { useAuth } from "../context/auth";
import HeaderBack from "../components/HeaderBack";

const BG = "#F5F7FB";
const CARD = "#FFFFFF";
const INK = "#0B1220";
const MUTED = "#6B7280";
const BORDER = "#E5E7EB";

export default function LoginScreen() {
  const router = useRouter();
  const { setAuth } = useAuth();

  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"request" | "verify">("request");
  const [loading, setLoading] = useState(false);

  // India-only: accept any input, strip non-digits
  const normalizePhone = (s: string) => s.replace(/\D/g, "").slice(-12);
  const digits = normalizePhone(phone);
  const isValidIndian = digits.length === 10; // enable CTA when 10 digits

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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
      {/* Header (brand + custom back + help) */}
      <Stack.Screen
        options={{
          title: "caseFit",
          headerTitleStyle: { color: INK, fontWeight: "800", fontSize: 20 },
          headerStyle: { backgroundColor: BG },
          headerShadowVisible: false,
          headerTitleAlign: "center",
          // Amazon-style chevron back
          headerLeft: ({ canGoBack }) =>
              canGoBack ? (
                <TouchableOpacity
                  onPress={() => router.back()}
                  style={{
                    width: 46,
                    height: 46,
                    alignItems: "center",
                    justifyContent: "center",
                    marginLeft: -20,  // ← pushes arrow to the extreme left
                  }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="chevron-back" size={22} color={INK} />
                </TouchableOpacity>
              ) : null,
          headerRight: () => (
            <TouchableOpacity
              onPress={openHelp}
              style={{
                width: 36,
                height: 36,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: BORDER,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: CARD,
                marginRight: 8,
              }}
            >
              <Text style={{ color: INK, fontWeight: "800" }}>?</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
          {/* Logo above heading */}
          <View style={{ alignItems: "center", marginTop: 4, marginBottom: 10 }}>
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 999,
                backgroundColor: CARD,
                borderWidth: 1,
                borderColor: BORDER,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 28, color: INK }}>⚖️</Text>
            </View>
          </View>

          {/* Hero copy */}
          <Text
            style={{
              fontSize: 22,
              lineHeight: 28,
              fontWeight: "800",
              color: INK,
              textAlign: "center",
            }}
          >
            Log in with your caseFit Account
          </Text>
          <Text style={{ fontSize: 14, color: MUTED, marginTop: 4, textAlign: "center" }}>
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
                placeholder="Enter mobile number"
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
                  backgroundColor: !isValidIndian ? "#9CA3AF" : loading ? "#11182799" : INK,
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
          <Text style={{ fontSize: 12, color: MUTED, marginTop: 16, textAlign: "center" }}>
            By proceeding, you agree to caseFit’s Privacy Policy and Terms & Conditions.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
