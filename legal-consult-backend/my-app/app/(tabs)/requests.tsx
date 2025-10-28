import { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Button,
  TouchableOpacity,
  Linking,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";
import { API_BASE } from "../../constants/config";
import { useAuth } from "../../context/auth";
import { useFocusEffect, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
// ★ NEW: Court Connect (animated sparkle card list)
import CourtConnectList from "../../components/ui/CourtConnectList";

type Req = {
  id: string | number;
  topic?: string;
  category?: string;
  details?: string;
  status?: string;
  created_at?: string;
} & Record<string, any>;

const BG = "#F7F8FA",
  INK = "#0B1220",
  CARD = "#FFFFFF",
  BORDER = "#E5E7EB",
  MUTED = "#6B7280";

const STATUS_COLOR: Record<string, string> = {
  pending: "#F59E0B",
  assigned: "#3B82F6",
  awaiting_payment: "#A855F7",
  paid: "#10B981",
  calling: "#06B6D4",
  completed: "#16A34A",
  cancelled: "#EF4444",
};

// --- Helpers ---
function deriveCaseNumber(id: string | number) {
  if (typeof id === "number") return String(id % 100000).padStart(5, "0");
  const s = String(id);
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return String(h % 100000).padStart(5, "0");
}
function stepFromStatus(status?: string) {
  const st = (status || "pending").toLowerCase();
  if (st === "paid" || st === "payment_confirmed") return 2;
  if (["calling", "scheduled", "booked", "completed"].includes(st)) return 3;
  if (st === "cancelled") return 0;
  return 1;
}
function normalizePhone(s?: string | null) {
  const n = (s ?? "").toString().replace(/\D/g, "");
  return n.slice(-12);
}

export default function RequestsScreen() {
  const { token } = useAuth();
  const router = useRouter();

  const [storedToken, setStoredToken] = useState<string | null>(null);
  const [items, setItems] = useState<Req[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [myPhone, setMyPhone] = useState<string>("");
  const [myIds, setMyIds] = useState<string[]>([]);
  const [localIds, setLocalIds] = useState<string[]>([]);

  // read token from SecureStore (fallback if context is empty)
  useEffect(() => {
    (async () => {
      const t = await SecureStore.getItemAsync("token");
      setStoredToken(t);
    })();
  }, []);

  // (re)load phone + id lists
  const reloadIds = useCallback(async () => {
    const rawPhone = await SecureStore.getItemAsync("user_mobile");
    const phone = normalizePhone(rawPhone);
    setMyPhone(phone);

    if (phone) {
      const raw = await SecureStore.getItemAsync(`my_requests_${phone}`);
      setMyIds(raw ? JSON.parse(raw) : []);
    } else {
      setMyIds([]);
    }
    const rawLocal = await SecureStore.getItemAsync("my_requests__local__");
    setLocalIds(rawLocal ? JSON.parse(rawLocal) : []);
  }, []);

  useEffect(() => {
    reloadIds();
  }, [reloadIds]);

  useFocusEffect(
    useCallback(() => {
      reloadIds();
    }, [reloadIds])
  );

  // load list from backend
  async function load() {
    const authToken = token || storedToken;
    if (!authToken) {
      setItems([]);
      setLoading(false);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/requests/`, {
        headers: { authorization: `Bearer ${authToken}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const list: Req[] = Array.isArray(json) ? json : json.items ?? [];
      setItems(list);
    } catch (e: any) {
      setError(e?.message || "Failed to load requests");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [token, storedToken]);

  useFocusEffect(
    useCallback(() => {
      load();
      return () => {};
    }, [token, storedToken])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    await reloadIds();
    setRefreshing(false);
  }, [token, storedToken, reloadIds]);

  // client-only filter to this user's IDs
  const displayIds = myPhone ? myIds : localIds;
  const mine = useMemo(() => {
    if (!displayIds.length) return [];
    const idSet = new Set(displayIds.map(String));
    return items.filter((r) => idSet.has(String(r.id)));
  }, [items, displayIds]);

  // UI states
  if (!(token || storedToken)) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
        <View style={{ flex: 1, padding: 24, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 8, color: INK }}>Please log in</Text>
          <Button title="Go to Profile" onPress={() => router.push("/profile")} />
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: BG, justifyContent: "center" }}>
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
        <View style={{ flex: 1, padding: 24, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontSize: 16, color: "#b00020", marginBottom: 12, textAlign: "center" }}>{error}</Text>
          <Button title="Retry" onPress={load} />
        </View>
      </SafeAreaView>
    );
  }

  // --- Empty State component ---
  const EmptyState = () => (
    <View
      style={{
        paddingHorizontal: 24,
        paddingVertical: 40,
        alignItems: "center",
        gap: 14,
      }}
    >
      <View
        style={{
          width: 88,
          height: 88,
          borderRadius: 44,
          backgroundColor: "#111",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Feather name="file-text" size={36} color="#fff" />
      </View>

      <Text style={{ fontSize: 20, fontWeight: "800", color: INK, marginTop: 4 }}>No requests yet</Text>
      <Text style={{ color: MUTED, textAlign: "center", lineHeight: 20 }}>
        Book a quick paid consult with a verified lawyer.{"\n"}
        Your requests will appear here.
      </Text>

      {/* Mini “how it works” */}
      <View style={{ marginTop: 6, width: "100%", gap: 8 }}>
        {[
          { icon: "phone", text: "Tell us your legal issue" },
          { icon: "credit-card", text: "Pay securely inside the app" },
          { icon: "calendar", text: "Get your appointment scheduled" },
        ].map((s, i) => (
          <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Feather name={s.icon as any} size={16} color={INK} />
            <Text style={{ color: INK, fontWeight: "600" }}>{s.text}</Text>
          </View>
        ))}
      </View>

      {/* Primary CTA */}
      <TouchableOpacity
        onPress={() => router.push("/consult")}
        style={{
          marginTop: 14,
          backgroundColor: INK,
          paddingVertical: 14,
          paddingHorizontal: 18,
          borderRadius: 14,
          alignItems: "center",
          alignSelf: "stretch",
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "800" }}>Start a consult</Text>
      </TouchableOpacity>

      {/* Secondary actions */}
      <View style={{ flexDirection: "row", gap: 10, marginTop: 6 }}>
        <TouchableOpacity
          onPress={() => router.push("/articles")}
          style={{
            paddingVertical: 12,
            paddingHorizontal: 14,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: BORDER,
            backgroundColor: "#fff",
          }}
        >
          <Text style={{ color: INK, fontWeight: "700" }}>Browse articles</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            Alert.alert("Contact caseFit", "Choose how you want to reach us.", [
              {
                text: "Email",
                onPress: () =>
                  Linking.openURL(
                    `mailto:support@casefit.com?subject=${encodeURIComponent(
                      "Help with my request"
                    )}&body=${encodeURIComponent("Hi caseFit team,\n\nI need help with ...")}`
                  ).catch(() => Alert.alert("Info", "support@casefit.com")),
              },
              {
                text: "WhatsApp",
                onPress: () => {
                  const phone = "919807863007";
                  const deep = `whatsapp://send?phone=${phone}&text=${encodeURIComponent(
                    "Hi caseFit support, I need help."
                  )}`;
                  const web = `https://wa.me/${phone}?text=${encodeURIComponent(
                    "Hi caseFit support, I need help."
                  )}`;
                  Linking.openURL(deep).catch(() => Linking.openURL(web));
                },
              },
              { text: "Cancel", style: "cancel" },
            ])
          }
          style={{
            paddingVertical: 12,
            paddingHorizontal: 14,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: BORDER,
            backgroundColor: "#fff",
          }}
        >
          <Text style={{ color: INK, fontWeight: "700" }}>Contact support</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 6, paddingBottom: 12 }}>
        <Text style={{ fontSize: 24, fontWeight: "700", color: INK }}>My Requests</Text>
        <Text style={{ fontSize: 12, color: MUTED }}>Linked to: {myPhone || "this device"}</Text>
      </View>

      {/* ★ Court Connect — animated black/white sparkle card(s). 
          Compact height; doesn’t disturb your layout. */}
      {/*<CourtConnectList compact style={{ paddingTop: 0, paddingBottom: 8 }} />*/}

        <CourtConnectList
      style={{
          paddingTop: 4,
          paddingBottom: 0,
          paddingHorizontal: 16,
          backgroundColor: "#fff",
          borderRadius: 12,
        }}
    />

      <FlatList
        data={mine}
        keyExtractor={(it, idx) => String(it.id ?? idx)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        contentContainerStyle={{ padding: 16, paddingBottom: 24, flexGrow: 1 }}
        ListEmptyComponent={<EmptyState />}
        renderItem={({ item, index }) => {
          const status = (item.status || "pending").toLowerCase();
          const step = stepFromStatus(status);
          const chip = STATUS_COLOR[status] ?? MUTED;
          const title = item.category || item.topic || `Request ${index + 1}`;
          const caseNo = deriveCaseNumber(item.id);
          const date = item.created_at ? new Date(item.created_at).toLocaleString() : "";
          const stepStyle = (n: number) => ({
            color: step >= n ? INK : MUTED,
            fontWeight: (step >= n ? "700" : "600") as "700" | "600",
          });

          return (
            <View
              style={{
                backgroundColor: CARD,
                borderRadius: 16,
                padding: 16,
                borderWidth: 1,
                borderColor: BORDER,
                shadowColor: "#000",
                shadowOpacity: 0.05,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 4 },
                elevation: 2,
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <View style={{ backgroundColor: chip, paddingVertical: 4, paddingHorizontal: 10, borderRadius: 999 }}>
                  <Text style={{ color: "#fff", fontWeight: "700", fontSize: 12 }}>{status}</Text>
                </View>
                <Text style={{ color: MUTED, fontSize: 12 }}>{date}</Text>
              </View>

              <Text style={{ marginTop: 10, fontSize: 16, fontWeight: "700", color: INK }}>
                {`Request ${index + 1}: Case #${caseNo}`}
              </Text>
              <Text style={{ marginTop: 2, color: "#374151" }}>{title}</Text>

              {status === "cancelled" ? (
                <Text style={{ marginTop: 10, color: "#EF4444", fontWeight: "700" }}>Cancelled</Text>
              ) : (
                <View style={{ marginTop: 10 }}>
                  <Text>
                    <Text style={stepStyle(1)}>Pending</Text>
                    <Text style={{ color: MUTED }}>  →  </Text>
                    <Text style={stepStyle(2)}>Payment Confirmed</Text>
                    <Text style={{ color: MUTED }}>  →  </Text>
                    <Text style={stepStyle(3)}>Appointment Scheduled</Text>
                  </Text>
                </View>
              )}

              {item.details ? (
                <Text numberOfLines={3} style={{ marginTop: 8, color: "#374151", lineHeight: 20 }}>
                  {item.details}
                </Text>
              ) : null}

              <TouchableOpacity
                style={{
                  marginTop: 12,
                  alignSelf: "flex-start",
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: BORDER,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                }}
                onPress={() => {
                  Alert.alert("Details", "Route to a details page when ready.");
                }}
              >
                <Feather name="arrow-right-circle" size={16} color={INK} />
                <Text style={{ color: INK, fontWeight: "600" }}>View details</Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}
