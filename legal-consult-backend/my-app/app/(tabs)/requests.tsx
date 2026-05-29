import { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  RefreshControl,
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
import PremiumErrorState from "@/components/PremiumErrorState";
import { friendlyErrorMessage } from "@/utils/errorMessages";

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
const BLUE = "#2563EB";

const STATUS_COLOR: Record<string, string> = {
  pending: "#F59E0B",
  assigned: "#3B82F6",
  awaiting_payment: "#A855F7",
  paid: "#10B981",
  appointment_scheduled: "#EA580C",
  calling: "#06B6D4",
  completed: "#16A34A",
  cancelled: "#EF4444",
};

const STATUS_TINT: Record<string, string> = {
  pending: "#FEF3C7",
  assigned: "#DBEAFE",
  awaiting_payment: "#F3E8FF",
  paid: "#D1FAE5",
  appointment_scheduled: "#FFEDD5",
  calling: "#CFFAFE",
  completed: "#D1FAE5",
  cancelled: "#FEE2E2",
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
  if (["appointment_scheduled", "calling", "scheduled", "booked", "completed"].includes(st)) return 3;
  if (st === "cancelled") return 0;
  return 1;
}

function formatStatusLabel(status?: string | null) {
  if ((status || "").toLowerCase() === "appointment_scheduled") {
    return "Scheduled";
  }

  return (status || "pending")
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatRequestDate(value?: string | null) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hour24 = date.getHours();
  const period = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 || 12;
  const hours = String(hour12).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${day}/${month}/${year}, ${hours}:${minutes} ${period}`;
}

function normalizePhone(s?: string | null) {
  const n = (s ?? "").toString().replace(/\D/g, "");
  return n.slice(-12);
}

export default function RequestsScreen() {
  const { token, hydrated, logout } = useAuth();
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

      if (res.status === 401) {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
        hasLoadedOnce.current = false;
        setItems([]);
        setError(null);
        await logout();
        return;
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${text}`);
      }

      const json = text ? JSON.parse(text) : [];
      const list: Req[] = Array.isArray(json) ? json : [];
      setItems(list);
      hasLoadedOnce.current = true;
    } catch (e: any) {
      setError(friendlyErrorMessage(e, "We could not load your requests right now."));
      if (!hasLoadedOnce.current) {
        setItems([]);
      }
    } finally {
      if (mode === "initial") {
        setLoading(false);
      }
    }
  }, [authToken, hydrated, logout]);

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
        <PremiumErrorState
          compact
          tone="error"
          title="Requests could not refresh"
          message={error}
          actionLabel="Refresh"
          onAction={() => load("initial")}
        />
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
      <View style={{ paddingHorizontal: 18, paddingTop: 14, paddingBottom: 12 }}>
        <View>
          <Text style={{ fontSize: 34, fontWeight: "900", color: INK, letterSpacing: 0 }}>
            CaseBoard
          </Text>
          <View style={{ marginTop: 8, flexDirection: "row", alignItems: "center" }}>
            <Feather name="shield" size={17} color={BLUE} />
            <Text style={{ marginLeft: 10, fontSize: 15, color: "#667085", fontWeight: "600" }}>
              Synced With: {myPhone || "your account"}
            </Text>
          </View>
        </View>
      </View>

      <FlatList
        data={items}
        keyExtractor={(it) => String(it.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        contentContainerStyle={{ padding: 18, paddingTop: 22, paddingBottom: 24, flexGrow: 1 }}
        ListEmptyComponent={<EmptyState />}
        renderItem={({ item, index }) => {
          const status = (item.status || "pending").toLowerCase();
          const step = stepFromStatus(status);
          const chip = STATUS_COLOR[status] ?? MUTED;
          const chipTint = STATUS_TINT[status] ?? "#F3F4F6";
          const statusLabel = formatStatusLabel(status);
          const title = item.category || `Request ${index + 1}`;
          const caseNo = deriveCaseNumber(item.id);
          const date = formatRequestDate(item.created_at);
          const details = item.description || "";

          const stepStyle = (n: number) => ({
            color: step >= n ? INK : MUTED,
            fontWeight: (step >= n ? "700" : "600") as "700" | "600",
          });

          return (
            <View
              style={{
                backgroundColor: CARD,
                borderRadius: 26,
                padding: 20,
                borderWidth: 1,
                borderColor: "#E1E7F0",
                shadowColor: "#0B1220",
                shadowOpacity: 0.07,
                shadowRadius: 18,
                shadowOffset: { width: 0, height: 10 },
                elevation: 3,
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
                    backgroundColor: chipTint,
                    paddingVertical: 7,
                    paddingHorizontal: 12,
                    borderRadius: 999,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Feather
                    name={
                      status === "completed"
                        ? "check-circle"
                        : status === "cancelled"
                          ? "x-circle"
                          : status === "appointment_scheduled"
                            ? "calendar"
                            : "clock"
                    }
                    size={15}
                    color={chip}
                  />
                  <Text style={{ color: chip, fontWeight: "900", fontSize: 13, marginLeft: 7 }}>
                    {statusLabel}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", flexShrink: 1 }}>
                  <Text
                    numberOfLines={1}
                    style={{ color: "#667085", fontSize: 14, fontWeight: "600", maxWidth: 170 }}
                  >
                    {date}
                  </Text>
                  <TouchableOpacity activeOpacity={0.65} style={{ marginLeft: 10, padding: 4 }}>
                    <Feather name="more-vertical" size={20} color="#667085" />
                  </TouchableOpacity>
                </View>
              </View>

              <Text
                style={{
                  marginTop: 26,
                  fontSize: 22,
                  lineHeight: 28,
                  fontWeight: "900",
                  color: INK,
                }}
              >
                {`Request ${index + 1}: Case #${caseNo}`}
              </Text>

              <View style={{ marginTop: 20, flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 8,
                    backgroundColor: "#EFF6FF",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 10,
                  }}
                >
                  <Feather name="briefcase" size={16} color={BLUE} />
                </View>
                <Text style={{ color: "#475467", fontSize: 17, fontWeight: "700" }}>{title}</Text>
              </View>

              {details ? (
                <Text
                  numberOfLines={3}
                  style={{ marginTop: 18, color: "#475467", fontSize: 16, lineHeight: 24 }}
                >
                  {details}
                </Text>
              ) : null}

              {item.preferred_city ? (
                <>
                  <View
                    style={{
                      width: "44%",
                      height: 1,
                      backgroundColor: "#E4E9F2",
                      marginTop: 22,
                      marginBottom: 18,
                    }}
                  />
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Feather name="map-pin" size={21} color="#667085" />
                    <Text style={{ marginLeft: 10, color: "#667085", fontSize: 16, fontWeight: "700" }}>
                      Preferred city:{" "}
                    </Text>
                    <Text style={{ color: BLUE, fontSize: 16, fontWeight: "900" }}>
                      {item.preferred_city}
                    </Text>
                  </View>
                </>
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
