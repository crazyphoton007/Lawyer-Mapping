import { useState } from "react";
import { View, Text, TextInput, Button, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { API_BASE } from "../constants/config";
import { useAuth } from "../context/auth";

export default function LoginScreen() {
  const router = useRouter();
  const { setAuth } = useAuth();

  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [loading, setLoading] = useState(false);

  async function requestCode() {
    if (!phone.trim()) return Alert.alert("Enter phone", "Please enter your phone number.");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/request-code`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const text = await res.text();
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${text}`);
      Alert.alert("Code sent", "Check your backend console for the OTP.");
      setStep("code");
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to send code");
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode() {
    if (!code.trim()) return Alert.alert("Enter code", "Please enter the 6-digit code.");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/verify`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ phone, code }),
      });
      const text = await res.text();
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${text}`);
      const data = JSON.parse(text);
      await setAuth(data.token, data.user);
      Alert.alert("Logged in!");
      // 🚀 Go somewhere useful after login (pick one)
      router.replace("/articles"); // or "/requests" or "/profile"
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to verify code");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ flex: 1, padding: 16, alignItems: "center", justifyContent: "center", gap: 12 }}>
      {step === "phone" ? (
        <>
          <Text style={{ fontSize: 20, fontWeight: "700" }}>Login</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="000-000-0000"
            keyboardType="phone-pad"
            autoComplete="tel"
            style={{ borderWidth: 1, borderColor: "#ccc", padding: 10, width: "85%", borderRadius: 8 }}
          />
          {loading ? <ActivityIndicator /> : <Button title="Send Code" onPress={requestCode} />}
        </>
      ) : (
        <>
          <Text style={{ fontSize: 18, fontWeight: "700" }}>Verify Code</Text>

          {/* Show phone + allow editing */}
          <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
            <Text style={{ opacity: 0.8 }}>{phone}</Text>
            <Button title="Edit number" onPress={() => setStep("phone")} />
          </View>

          <TextInput
            value={code}
            onChangeText={setCode}
            placeholder="123456"
            keyboardType="number-pad"
            style={{ borderWidth: 1, borderColor: "#ccc", padding: 10, width: "85%", borderRadius: 8 }}
          />
          {loading ? <ActivityIndicator /> : <Button title="Verify" onPress={verifyCode} />}
        </>
      )}
    </View>
  );
}
