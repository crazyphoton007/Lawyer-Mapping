import { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";
import { API_BASE } from "../../constants/config";
import { useAuth } from "../../context/auth";
import { Feather } from "@expo/vector-icons";

const CATEGORIES = ["Family", "Criminal", "Property", "Business", "Immigration", "Other"] as const;

// Brand palette
const BG = "#F7F8FA";
const CARD = "#FFFFFF";
const INK = "#000000";
const BORDER = "#E5E7EB";
const MUTED = "#6B7280";

function normalizePhone(s?: string | null) {
  const n = (s ?? "").toString().replace(/\D/g, "");
  return n.slice(-12);
}

export default function ConsultScreen() {
  const router = useRouter();
  const { token, user } = useAuth();

  const [category, setCategory] = useState<string>("");
  const [details, setDetails] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // success sheet
  const [okOpen, setOkOpen] = useState(false);
  const [newId, setNewId] = useState<string>("");

  const charCount = useMemo(() => details.trim().length, [details]);
  const minChars = 10;
  const valid = useMemo(() => Boolean(category.trim()) && charCount >= minChars && !!token, [category, charCount, token]);

  async function rememberMyRequestId(id: string | number) {
    try {
      const rawPhone = await SecureStore.getItemAsync("user_mobile");
      const myPhone = normalizePhone(rawPhone);
      const idStr = String(id);

      // device-local list (works even if phone is unknown)
      const localKey = "my_requests__local__";
      const localRaw = await SecureStore.getItemAsync(localKey);
      const localList: string[] = localRaw ? JSON.parse(localRaw) : [];
      if (!localList.includes(idStr)) {
        localList.unshift(idStr);
        await SecureStore.setItemAsync(localKey, JSON.stringify(localList.slice(0, 100)));
      }

      // phone-specific list (only if phone exists)
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
      Alert.alert("Login required", "Go to Profile → Log in first.");
      return;
    }
    if (!valid) {
      Alert.alert("Missing fields", "Pick a category and write at least 10 characters.");
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

      const idStr: string =
        String(
          json?.id ?? json?.request_id ?? json?.data?.id ?? json?.result?.id ?? json?.request?.id ?? ""
        );

      if (idStr) {
        await rememberMyRequestId(idStr);
        setNewId(idStr);
      } else {
        setNewId("");
      }

      // reset form
      setCategory("");
      setDetails("");

      // show success sheet
      setOkOpen(true);
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to submit");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }} keyboardShouldPersistTaps="handled">
          {/* Title */}
          <Text style={{ fontSize: 24, fontWeight: "800", color: INK, marginBottom: 12 }}>
            Request a Consultation
          </Text>

          {!user && (
            <View
              style={{
                backgroundColor: "#FFFCEB",
                borderColor: "#FDE68A",
                borderWidth: 1,
                borderRadius: 12,
                padding: 10,
                marginBottom: 10,
                flexDirection: "row",
                gap: 8,
                alignItems: "center",
              }}
            >
              <Feather name="alert-triangle" size={18} color="#92400E" />
              <Text style={{ color: "#92400E" }}>You’re not logged in. Go to Profile → Login to submit.</Text>
            </View>
          )}

          {/* Card */}
          <View
            style={{
              backgroundColor: CARD,
              borderRadius: 20,
              padding: 16,
              gap: 16,
              borderWidth: 1,
              borderColor: BORDER,
              shadowColor: "#000",
              shadowOpacity: 0.06,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 4 },
              elevation: 2,
            }}
          >
            {/* Category */}
            <View>
              <Text style={{ fontSize: 14, fontWeight: "700", color: INK, marginBottom: 8 }}>Category</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {CATEGORIES.map((c) => {
                  const selected = c === category;
                  return (
                    <TouchableOpacity
                      key={c}
                      onPress={() => setCategory(c)}
                      style={{
                        paddingVertical: 8,
                        paddingHorizontal: 14,
                        borderRadius: 999,
                        borderWidth: selected ? 0 : 1,
                        borderColor: BORDER,
                        backgroundColor: selected ? INK : "#fff",
                      }}
                    >
                      <Text style={{ fontSize: 13, fontWeight: "700", color: selected ? "#fff" : INK }}>
                        {c}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Details */}
            <View>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
                <Text style={{ fontSize: 14, fontWeight: "700", color: INK }}>Details</Text>
                <Text style={{ fontSize: 12, color: MUTED }}>
                  {charCount < minChars
                    ? `${minChars - charCount} more ${minChars - charCount === 1 ? "char" : "chars"}`
                    : "Looks good"}
                </Text>
              </View>

              <TextInput
                value={details}
                onChangeText={setDetails}
                placeholder="Briefly describe your situation…"
                multiline
                numberOfLines={6}
                style={{
                  borderWidth: 1,
                  borderColor: BORDER,
                  borderRadius: 12,
                  padding: 12,
                  minHeight: 120,
                  textAlignVertical: "top",
                  fontSize: 15,
                  backgroundColor: "#FAFAFA",
                  marginTop: 8,
                }}
              />

              {/* How it works strip */}
              <View style={{ flexDirection: "row", gap: 12, marginTop: 10, flexWrap: "wrap" }}>
                {[
                  { icon: "phone", text: "Describe issue" },
                  { icon: "credit-card", text: "Pay securely" },
                  { icon: "calendar", text: "Get scheduled" },
                ].map((s, i) => (
                  <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Feather name={s.icon as any} size={14} color={INK} />
                    <Text style={{ color: INK, fontWeight: "600" }}>{s.text}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Submit */}
            <TouchableOpacity
              onPress={submit}
              disabled={!valid || loading}
              style={{
                backgroundColor: !valid || loading ? "#9CA3AF" : INK,
                paddingVertical: 14,
                borderRadius: 14,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "800" }}>
                {loading ? "Submitting…" : "Submit"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success sheet */}
      <Modal visible={okOpen} transparent animationType="slide" onRequestClose={() => setOkOpen(false)}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" }}>
          <View
            style={{
              backgroundColor: "#fff",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 18,
              gap: 12,
            }}
          >
            <View style={{ alignItems: "center", gap: 8, marginTop: 4 }}>
              <View
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 36,
                  backgroundColor: INK,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Feather name="check" size={36} color="#fff" />
              </View>
              <Text style={{ fontSize: 20, fontWeight: "800", color: INK }}>Request submitted</Text>
              <Text style={{ color: MUTED, textAlign: "center" }}>
                {newId ? `Your Case ID: ${newId}` : "Your request has been received."}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => {
                setOkOpen(false);
                router.replace("/(tabs)/requests");
              }}
              style={{
                marginTop: 6,
                backgroundColor: INK,
                paddingVertical: 14,
                borderRadius: 14,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "800" }}>Go to My Requests</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
