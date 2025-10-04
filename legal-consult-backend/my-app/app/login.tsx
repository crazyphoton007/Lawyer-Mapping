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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { API_BASE } from "../constants/config";
import { useAuth } from "../context/auth";

export default function LoginScreen() {
  const router = useRouter();
  const { setAuth } = useAuth(); // << use context setter

  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"request" | "verify">("request");
  const [loading, setLoading] = useState(false);

  const normalizePhone = (s: string) => s.replace(/\D/g, "").slice(-12);

  async function requestCode() {
    const ph = normalizePhone(phone);
    if (ph.length < 10) {
      Alert.alert("Invalid number", "Enter a valid mobile number.");
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

    await setAuth(jwt, userPayload);                 // update context + persist
    await SecureStore.setItemAsync("user_mobile", ph); // remember phone

    // ✅ add this block
    try { await SecureStore.deleteItemAsync("my_requests__local__"); } catch {}

    Alert.alert("Logged in", "You’re signed in.");
    router.replace("/(tabs)/requests");
  } catch (e: any) {
    Alert.alert("Error", e?.message || "Failed to verify code");
  } finally {
    setLoading(false);
  }
}

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F7F8FA" }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
          <Text style={{ fontSize: 24, fontWeight: "700", marginBottom: 12 }}>Login</Text>

          {/* PHONE */}
          <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 16, gap: 12,
                         shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 2 }}>
            <Text style={{ fontSize: 14, fontWeight: "600" }}>Mobile Number</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="Enter mobile number"
              style={{ borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 12, padding: 12, backgroundColor: "#FAFAFA" }}
            />

            {step === "request" ? (
              <TouchableOpacity
                onPress={requestCode}
                disabled={loading}
                style={{ backgroundColor: loading ? "#93C5FD" : "#2563EB", paddingVertical: 14, borderRadius: 12, alignItems: "center" }}
              >
                <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
                  {loading ? "Sending…" : "Send OTP"}
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {/* CODE */}
          {step === "verify" ? (
            <View style={{ marginTop: 14, backgroundColor: "#fff", borderRadius: 16, padding: 16, gap: 12,
                           shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 2 }}>
              <Text style={{ fontSize: 14, fontWeight: "600" }}>OTP Code</Text>
              <TextInput
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                placeholder="Enter OTP"
                style={{ borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 12, padding: 12, backgroundColor: "#FAFAFA" }}
              />
              <TouchableOpacity
                onPress={verifyCode}
                disabled={loading}
                style={{ backgroundColor: loading ? "#93C5FD" : "#2563EB", paddingVertical: 14, borderRadius: 12, alignItems: "center" }}
              >
                <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
                  {loading ? "Verifying…" : "Verify & Continue"}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
