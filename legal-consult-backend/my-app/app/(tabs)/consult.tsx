import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, Alert,
  KeyboardAvoidingView, Platform, ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";
import { API_BASE } from "../../constants/config";
import { useAuth } from "../../context/auth";

const CATEGORIES = ["Family", "Criminal", "Property", "Business", "Immigration", "Other"];

function normalizePhone(s?: string | null) {
  const n = (s ?? "").toString().replace(/\D/g, "");
  return n.slice(-12);
}

export default function ConsultScreen() {
  const router = useRouter();
  const { token, user } = useAuth();

  const [category, setCategory] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);

  async function rememberMyRequestId(id: string | number) {
    try {
      const rawPhone = await SecureStore.getItemAsync("user_mobile");
      const myPhone = normalizePhone(rawPhone);
      const idStr = String(id);

      // ✅ device-local list (works even if phone is unknown)
      const localKey = "my_requests__local__";
      const localRaw = await SecureStore.getItemAsync(localKey);
      const localList: string[] = localRaw ? JSON.parse(localRaw) : [];
      if (!localList.includes(idStr)) {
        localList.unshift(idStr);
        await SecureStore.setItemAsync(localKey, JSON.stringify(localList.slice(0, 100)));
      }

      // ✅ phone-specific list (only if phone exists)
      if (myPhone) {
        const phoneKey = `my_requests_${myPhone}`;
        const phoneRaw = await SecureStore.getItemAsync(phoneKey);
        const phoneList: string[] = phoneRaw ? JSON.parse(phoneRaw) : [];
        if (!phoneList.includes(idStr)) {
          phoneList.unshift(idStr);
          await SecureStore.setItemAsync(phoneKey, JSON.stringify(phoneList.slice(0, 100)));
        }
      }
    } catch {
      // ignore local cache errors
    }
  }

  async function submit() {
  if (!token) {
    Alert.alert("Login required", "Go to Profile → Login first.");
    return;
  }
  if (!category.trim() || details.trim().length < 10) {
    Alert.alert("Missing fields", "Select a category and write at least 10 characters in Details.");
    return;
  }

  setLoading(true);
  try {
    const res = await fetch(`${API_BASE}/requests/`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ category: category.trim(), details: details.trim() }),
    });
    const txt = await res.text();
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${txt}`);
    const json = JSON.parse(txt);

    // ✅ Coerce to a safe string; if nothing found, becomes ""
    const newId: string =
      String(
        json?.id ??
          json?.request_id ??
          json?.data?.id ??
          json?.result?.id ??
          json?.request?.id ??
          ""
      );

    if (!newId) {
      Alert.alert("Submitted", "Request saved, but no ID returned. Pull to refresh My Requests.");
    } else {
      await rememberMyRequestId(newId); // now type-safe
      Alert.alert("Request submitted", `ID: ${newId}`);
    }

    setCategory("");
    setDetails("");
    // Go to Requests — IDs are reloaded on focus
    router.replace("/(tabs)/requests");
  } catch (e: any) {
    Alert.alert("Error", e?.message || "Failed to submit");
  } finally {
    setLoading(false);
  }
}


    



  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F7F8FA" }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }} keyboardShouldPersistTaps="handled">
          <Text style={{ fontSize: 24, fontWeight: "700", marginBottom: 12 }}>Request a Consultation</Text>

          {!user && (
            <Text style={{ fontSize: 12, opacity: 0.7, marginBottom: 8 }}>
              You’re not logged in. Go to Profile → Login to submit a request.
            </Text>
          )}

          <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 16, gap: 14,
                         shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 2 }}>
            <View>
              <Text style={{ fontSize: 14, fontWeight: "600", marginBottom: 8 }}>Category</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {CATEGORIES.map((c) => {
                  const selected = c === category;
                  return (
                    <TouchableOpacity
                      key={c}
                      onPress={() => setCategory(c)}
                      style={{
                        paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999,
                        borderWidth: selected ? 0 : 1, borderColor: "#E2E8F0",
                        backgroundColor: selected ? "#0B1220" : "#fff",
                      }}
                    >
                      <Text style={{ fontSize: 13, fontWeight: "600", color: selected ? "#fff" : "#0B1220" }}>
                        {c}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View>
              <Text style={{ fontSize: 14, fontWeight: "600", marginBottom: 8 }}>Details (min 10 chars)</Text>
              <TextInput
                value={details}
                onChangeText={setDetails}
                placeholder="Briefly describe your situation…"
                multiline numberOfLines={6}
                style={{
                  borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 12, padding: 12,
                  minHeight: 120, textAlignVertical: "top", fontSize: 15, backgroundColor: "#FAFAFA",
                }}
              />
            </View>

            <TouchableOpacity
              onPress={submit} disabled={loading}
              style={{ backgroundColor: loading ? "#93C5FD" : "#2563EB", paddingVertical: 14, borderRadius: 12, alignItems: "center" }}
            >
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
                {loading ? "Submitting…" : "Submit"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
