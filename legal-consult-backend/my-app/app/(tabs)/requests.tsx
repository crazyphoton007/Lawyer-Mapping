import { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Button,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";
import { API_BASE } from "../../constants/config";
import { useAuth } from "../../context/auth";
import { useFocusEffect, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

type Req = {
  id: string;
  category?: string | null;
  description?: string | null;
  preferred_window?: string | null;
  preferred_city?: string | null;
  status?: string | null;
  created_at?: string | null;
  user_id?: string | null;
  assigned_lawyer?: string | null;
};

const BG = "#F7F8FA";
const INK = "#0B1220";
const CARD = "#FFFFFF";
const BORDER = "#E5E7EB";
const MUTED = "#6B7280";

const STATUS_COLOR: Record<string, string> = {
  pending: "#F59E0B",
  assigned: "#3B82F6",
  awaiting_payment: "#A855F7",
  paid: "#10B981",
  calling: "#06B6D4",
  completed: "#16A34A",
  cancelled: "#EF4444",
};

function deriveCaseNumber(id: string) {
  const s = String(id);
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return String(h % 100000).padStart(5, "0");
}

function FlashingNeonButton({
  onPress,
  children,
}: {
  onPress: () => void;
  children: React.ReactNode;
}) {
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 950,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 950,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  const borderColor = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#93C5FD", "#2563EB"],
  });

  const backgroundColor = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#FFFFFF", "#EFF6FF"],
  });

  const textColor = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#1D4ED8", "#0F3FB8"],
  });

  const scale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1.09],
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        marginTop: 12,
        alignSelf: "flex-start",
      }}
    >
      <Animated.View
        style={{
          transform: [{ scale }],
          borderColor: borderColor,
          borderWidth: 1.5,
          borderRadius: 12,
          paddingVertical: 10,
          paddingHorizontal: 14,
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          backgroundColor: backgroundColor,
        }}
      >
        <Feather name="arrow-right-circle" size={16} color="#2563EB" />
        <Animated.Text
          style={[
            { fontWeight: "600", fontSize: 14 },
            { color: textColor },
          ]}
        >
          {children}
        </Animated.Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

function stepFromStatus(status?: string | null) {
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
  const { token, hydrated } = useAuth();
  const router = useRouter();

  const [items, setItems] = useState<Req[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [myPhone, setMyPhone] = useState<string>("");
  const hasLoadedOnce = useRef(false);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const reloadPhone = useCallback(async () => {
    const rawPhone = await SecureStore.getItemAsync("user_mobile");
    setMyPhone(normalizePhone(rawPhone));
  }, []);

  useEffect(() => {
    reloadPhone();
  }, [reloadPhone]);

  useFocusEffect(
    useCallback(() => {
      reloadPhone();
    }, [reloadPhone])
  );

  const authToken = token;

  const load = useCallback(async (mode: "initial" | "refresh" | "silent" = "initial") => {
    if (!hydrated) {
      return;
    }

    if (!authToken) {
      setItems([]);
      setLoading(false);
      setError(null);
      return;
    }

    setError(null);
    if (mode === "initial" && !hasLoadedOnce.current) {
      setLoading(true);
    }

    try {
      const res = await fetch(`${API_BASE}/requests/`, {
        headers: {
          authorization: `Bearer ${authToken}`,
        },
      });

      const text = await res.text();

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${text}`);
      }

      const json = text ? JSON.parse(text) : [];
      const list: Req[] = Array.isArray(json) ? json : [];
      setItems(list);
      hasLoadedOnce.current = true;
    } catch (e: any) {
      setError(e?.message || "Failed to load requests");
      if (!hasLoadedOnce.current) {
        setItems([]);
      }
    } finally {
      if (mode === "initial") {
        setLoading(false);
      }
    }
  }, [authToken, hydrated]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    load("initial");
  }, [hydrated, load]);

  useFocusEffect(
    useCallback(() => {
      if (!hydrated || !authToken) {
        return () => {};
      }

      if (hasLoadedOnce.current) {
        load("silent");
      }

      pollIntervalRef.current = setInterval(() => {
        load("silent");
      }, 10000);

      return () => {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
      };
    }, [authToken, hydrated, load])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await reloadPhone();
    await load("refresh");
    setRefreshing(false);
  }, [reloadPhone, load]);

  if (!authToken) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
        <View
          style={{
            flex: 1,
            padding: 24,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View
            style={{
              width: "100%",
              backgroundColor: CARD,
              borderRadius: 22,
              borderWidth: 1,
              borderColor: BORDER,
              padding: 22,
              alignItems: "center",
              gap: 10,
            }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "800",
                  color: INK,
                }}
              >
                Your requests live here
              </Text>
              <Text style={{ color: MUTED, textAlign: "center", lineHeight: 20 }}>
                Log in once to view your timeline, payment status, and assigned counsel.
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/login")}
                style={{
                  marginTop: 6,
                  backgroundColor: INK,
                  paddingHorizontal: 18,
                  paddingVertical: 12,
                  borderRadius: 999,
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "700" }}>Log in</Text>
              </TouchableOpacity>
            </View>
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
        <View
          style={{
            flex: 1,
            padding: 24,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              fontSize: 16,
              color: "#b00020",
              marginBottom: 12,
              textAlign: "center",
            }}
          >
            {error}
          </Text>
          <Button title="Retry" onPress={() => load("initial")} />
        </View>
      </SafeAreaView>
    );
  }

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

      <Text style={{ fontSize: 20, fontWeight: "800", color: INK, marginTop: 4 }}>
        No requests yet
      </Text>
      <Text style={{ color: MUTED, textAlign: "center", lineHeight: 20 }}>
        Book a quick paid consult with a verified lawyer.{"\n"}
        Your requests will appear here.
      </Text>

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

    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 6, paddingBottom: 12 }}>
        <Text style={{ fontSize: 24, fontWeight: "700", color: INK }}>CaseBoard</Text>
        <Text style={{ fontSize: 12, color: MUTED }}>
          Synced With: {myPhone || "your account"}
        </Text>
      </View>

      <TouchableOpacity
        onPress={() => router.push("/(tabs)/court-connect")}
        activeOpacity={0.9}
        style={{
          marginHorizontal: 16,
          marginTop: 0,
          marginBottom: 6,
          backgroundColor: "#fff",
          borderRadius: 14,
          borderWidth: 1,
          borderColor: BORDER,
          paddingVertical: 14,
          paddingHorizontal: 14,
          shadowColor: "#000",
          shadowOpacity: 0.05,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
        }}
      >
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: INK,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View
            style={{
              position: "absolute",
              width: 36,
              height: 36,
              borderRadius: 18,
              borderWidth: 2,
              borderColor: "#60A5FA",
              opacity: 0.6,
            }}
          />
          <View
            style={{
              position: "absolute",
              width: 48,
              height: 48,
              borderRadius: 24,
              borderWidth: 2,
              borderColor: "#93C5FD",
              opacity: 0.25,
            }}
          />
          <Feather name="grid" size={18} color="#fff" />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: "800", color: INK }}>
            Court Connect
          </Text>
          <Text style={{ fontSize: 12, color: MUTED }}>
            High Court and Lower Court status links
          </Text>
        </View>

        <Feather name="chevron-right" size={22} color={INK} />
      </TouchableOpacity>

      <FlatList
        data={items}
        keyExtractor={(it) => String(it.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        contentContainerStyle={{ padding: 16, paddingBottom: 24, flexGrow: 1 }}
        ListEmptyComponent={<EmptyState />}
        renderItem={({ item, index }) => {
          const status = (item.status || "pending").toLowerCase();
          const step = stepFromStatus(status);
          const chip = STATUS_COLOR[status] ?? MUTED;
          const title = item.category || `Request ${index + 1}`;
          const caseNo = deriveCaseNumber(item.id);
          const date = item.created_at ? new Date(item.created_at).toLocaleString() : "";
          const details = item.description || "";

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
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    backgroundColor: chip,
                    paddingVertical: 4,
                    paddingHorizontal: 10,
                    borderRadius: 999,
                  }}
                >
                  <Text style={{ color: "#fff", fontWeight: "700", fontSize: 12 }}>
                    {status}
                  </Text>
                </View>
                <Text style={{ color: MUTED, fontSize: 12 }}>{date}</Text>
              </View>

              <Text
                style={{
                  marginTop: 10,
                  fontSize: 16,
                  fontWeight: "700",
                  color: INK,
                }}
              >
                {`Request ${index + 1}: Case #${caseNo}`}
              </Text>

              <Text style={{ marginTop: 2, color: "#374151" }}>{title}</Text>
              {details ? (
                <Text
                  numberOfLines={3}
                  style={{ marginTop: 8, color: "#374151", lineHeight: 20 }}
                >
                  {details}
                </Text>
              ) : null}

              {item.preferred_city ? (
                <Text style={{ marginTop: details ? 8 : 4, color: MUTED, fontWeight: "700" }}>
                  Preferred city: {item.preferred_city}
                </Text>
              ) : null}

              {status === "cancelled" ? (
                <Text style={{ marginTop: 10, color: "#EF4444", fontWeight: "700" }}>
                  Cancelled
                </Text>
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

              <FlashingNeonButton
                onPress={() => {
                  router.push(`/request/${item.id}`);
                }}
              >
                View details
              </FlashingNeonButton>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}
