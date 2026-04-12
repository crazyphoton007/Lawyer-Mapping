import { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { Feather } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";

import { API_BASE } from "../../constants/config";
import { useAuth } from "../../context/auth";

type Req = {
  id: string;
  category?: string | null;
  description?: string | null;
  preferred_window?: string | null;
  status?: string | null;
  created_at?: string | null;
  user_id?: string | null;
  assigned_lawyer?: string | null;
};

type PaymentLinkResponse = {
  success?: boolean;
  payment_link_id?: string;
  payment_link_url?: string;
  amount?: number;
  currency?: string;
  status?: string;
};

type VerifyPaymentResponse = {
  success?: boolean;
  request_id?: string;
  request_status?: string;
  payment_link_id?: string;
  payment_status?: string;
  amount?: number;
  currency?: string;
};

const BG = "#F7F8FA";
const INK = "#0B1220";
const CARD = "#FFFFFF";
const BORDER = "#E5E7EB";
const MUTED = "#6B7280";
const GOLD = "#C89B3C";
const GOLD_LIGHT = "#F6E7C1";

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

function stepFromStatus(status?: string | null) {
  const st = (status || "pending").toLowerCase();

  if (st === "cancelled") return 0;
  if (st === "paid" || st === "payment_confirmed") return 2;
  if (["assigned", "calling", "scheduled", "booked", "completed"].includes(st)) {
    return 3;
  }
  return 1;
}

function formatStatus(status?: string | null) {
  const st = (status || "pending").toLowerCase();
  return st
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDate(value?: string | null) {
  if (!value) return "Not available";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <View
      style={{
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: BORDER,
      }}
    >
      <Text
        style={{
          fontSize: 12,
          color: MUTED,
          fontWeight: "700",
          textTransform: "uppercase",
          letterSpacing: 0.4,
          marginBottom: 4,
        }}
      >
        {label}
      </Text>
      <Text style={{ fontSize: 15, color: INK, lineHeight: 22 }}>
        {value && value.trim() ? value : "Not provided"}
      </Text>
    </View>
  );
}

export default function RequestDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();
  const router = useRouter();

  const [storedToken, setStoredToken] = useState<string | null>(null);
  const [item, setItem] = useState<Req | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [latestPaymentLinkId, setLatestPaymentLinkId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const t = await SecureStore.getItemAsync("token");
      setStoredToken(t);
    })();
  }, []);

  const authToken = useMemo(() => token || storedToken, [token, storedToken]);

  const load = useCallback(async () => {
    if (!authToken) {
      setError("Please log in first.");
      setItem(null);
      setLoading(false);
      return;
    }

    if (!id || Array.isArray(id)) {
      setError("Invalid request id.");
      setItem(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

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

      const found = list.find((req) => String(req.id) === String(id));

      if (!found) {
        setItem(null);
        setError("Request not found.");
        return;
      }

      setItem(found);
    } catch (e: any) {
      setItem(null);
      setError(e?.message || "Failed to load request details.");
    } finally {
      setLoading(false);
    }
  }, [authToken, id]);

  useEffect(() => {
    load();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      load();
      return () => {};
    }, [load])
  );

  useEffect(() => {
    if (!id || Array.isArray(id)) return;

    const key = `payment_link_id_${id}`;

    (async () => {
      const saved = await SecureStore.getItemAsync(key);
      if (saved) {
        setLatestPaymentLinkId(saved);
      }
    })();
  }, [id]);

  const handlePayNow = useCallback(async () => {
    if (!authToken) {
      Alert.alert("Login required", "Please log in first.");
      return;
    }

    if (!item) {
      Alert.alert("Error", "Request details are not available.");
      return;
    }

    try {
      setPaying(true);

      const res = await fetch(`${API_BASE}/payments/create-link`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          request_id: item.id,
          category: item.category || "Legal Consultation",
          description: item.description || "caseFit legal consultation",
          amount_rupees: 199,
        }),
      });

      const text = await res.text();

      if (!res.ok) {
        throw new Error(text || `HTTP ${res.status}`);
      }

      const data: PaymentLinkResponse = text ? JSON.parse(text) : {};

      if (!data.payment_link_url || !data.payment_link_id) {
        throw new Error("Payment link data was incomplete.");
      }

      const storageKey = `payment_link_id_${item.id}`;
      await SecureStore.setItemAsync(storageKey, data.payment_link_id);
      setLatestPaymentLinkId(data.payment_link_id);

      await load();
      await WebBrowser.openBrowserAsync(data.payment_link_url);
    } catch (e: any) {
      Alert.alert(
        "Payment could not start",
        e?.message || "Something went wrong while creating the payment link."
      );
    } finally {
      setPaying(false);
    }
  }, [authToken, item, load]);

  const handleCheckPaymentStatus = useCallback(async () => {
    if (!authToken) {
      Alert.alert("Login required", "Please log in first.");
      return;
    }

    if (!item) {
      Alert.alert("Error", "Request details are not available.");
      return;
    }

    if (!latestPaymentLinkId) {
      Alert.alert(
        "No payment found",
        "Start payment first, then come back and check payment status."
      );
      return;
    }

    try {
      setCheckingPayment(true);

      const res = await fetch(`${API_BASE}/payments/verify-link`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          request_id: item.id,
          payment_link_id: latestPaymentLinkId,
        }),
      });

      const text = await res.text();

      if (!res.ok) {
        throw new Error(text || `HTTP ${res.status}`);
      }

      const data: VerifyPaymentResponse = text ? JSON.parse(text) : {};

      await load();

      if (data.request_status === "paid" || data.payment_status === "paid") {
        Alert.alert(
          "Payment confirmed",
          "Your payment has been confirmed and your request is now marked as paid."
        );
        return;
      }

      Alert.alert(
        "Payment still pending",
        "We could not confirm a completed payment yet. If you just paid, wait a few seconds and check again."
      );
    } catch (e: any) {
      Alert.alert(
        "Could not verify payment",
        e?.message || "Something went wrong while checking payment status."
      );
    } finally {
      setCheckingPayment(false);
    }
  }, [authToken, item, latestPaymentLinkId, load]);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !item) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
        <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              alignSelf: "flex-start",
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              paddingVertical: 8,
            }}
          >
            <Feather name="arrow-left" size={18} color={INK} />
            <Text style={{ color: INK, fontWeight: "700" }}>Back</Text>
          </TouchableOpacity>
        </View>

        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <Feather name="alert-circle" size={34} color="#DC2626" />
          <Text
            style={{
              marginTop: 12,
              fontSize: 18,
              fontWeight: "700",
              color: INK,
              textAlign: "center",
            }}
          >
            Could not load request
          </Text>
          <Text
            style={{
              marginTop: 8,
              color: MUTED,
              textAlign: "center",
              lineHeight: 20,
            }}
          >
            {error || "Something went wrong."}
          </Text>

          <TouchableOpacity
            onPress={load}
            style={{
              marginTop: 16,
              backgroundColor: INK,
              paddingVertical: 12,
              paddingHorizontal: 18,
              borderRadius: 12,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const status = (item.status || "pending").toLowerCase();
  const chip = STATUS_COLOR[status] ?? MUTED;
  const step = stepFromStatus(status);
  const caseNo = deriveCaseNumber(item.id);
  const showPaymentBox = status === "pending" || status === "awaiting_payment";
  const showCheckStatusButton = status === "awaiting_payment" && !!latestPaymentLinkId;

  const stepStyle = (n: number) => ({
    color: step >= n ? INK : MUTED,
    fontWeight: (step >= n ? "700" : "600") as "700" | "600",
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 12,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            paddingVertical: 8,
          }}
        >
          <Feather name="arrow-left" size={18} color={INK} />
          <Text style={{ color: INK, fontWeight: "700" }}>Back</Text>
        </TouchableOpacity>

        <Text style={{ fontSize: 18, fontWeight: "800", color: INK }}>
          Request Details
        </Text>

        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 28 }}>
        <View
          style={{
            backgroundColor: CARD,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: BORDER,
            padding: 16,
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
              alignItems: "flex-start",
            }}
          >
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={{ fontSize: 22, fontWeight: "800", color: INK }}>
                Case #{caseNo}
              </Text>
              <Text style={{ marginTop: 4, color: MUTED }}>
                Request ID: {item.id}
              </Text>
            </View>

            <View
              style={{
                backgroundColor: chip,
                paddingVertical: 6,
                paddingHorizontal: 10,
                borderRadius: 999,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 12 }}>
                {formatStatus(item.status)}
              </Text>
            </View>
          </View>

          <View
            style={{
              marginTop: 16,
              padding: 14,
              borderRadius: 14,
              backgroundColor: "#F9FAFB",
              borderWidth: 1,
              borderColor: BORDER,
            }}
          >
            {status === "cancelled" ? (
              <Text style={{ color: "#EF4444", fontWeight: "700" }}>
                This request has been cancelled.
              </Text>
            ) : (
              <Text style={{ lineHeight: 22 }}>
                <Text style={stepStyle(1)}>Pending</Text>
                <Text style={{ color: MUTED }}>  →  </Text>
                <Text style={stepStyle(2)}>Payment Confirmed</Text>
                <Text style={{ color: MUTED }}>  →  </Text>
                <Text style={stepStyle(3)}>Appointment Scheduled</Text>
              </Text>
            )}
          </View>
        </View>

        {showPaymentBox ? (
          <View
            style={{
              marginTop: 14,
              borderRadius: 22,
              padding: 1.5,
              backgroundColor: GOLD,
              shadowColor: "#000",
              shadowOpacity: 0.12,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 6 },
              elevation: 4,
            }}
          >
            <View
              style={{
                borderRadius: 20,
                backgroundColor: "#111111",
                padding: 16,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ flex: 1, paddingRight: 12 }}>
                  <View
                    style={{
                      alignSelf: "flex-start",
                      backgroundColor: GOLD_LIGHT,
                      borderRadius: 999,
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                      marginBottom: 10,
                    }}
                  >
                    <Text
                      style={{
                        color: "#6A4B00",
                        fontWeight: "800",
                        fontSize: 11,
                        letterSpacing: 0.4,
                      }}
                    >
                      PRIORITY CHECKOUT
                    </Text>
                  </View>

                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontSize: 20,
                      fontWeight: "900",
                    }}
                  >
                    Secure your consult
                  </Text>

                  <Text
                    style={{
                      color: "#D1D5DB",
                      marginTop: 6,
                      lineHeight: 20,
                    }}
                  >
                    Complete payment to move this request toward lawyer scheduling.
                  </Text>

                  <View
                    style={{
                      marginTop: 12,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Feather name="shield" size={16} color={GOLD} />
                    <Text style={{ color: "#F3F4F6", fontWeight: "700" }}>
                      ₹199 fixed consultation fee
                    </Text>
                  </View>

                  {latestPaymentLinkId ? (
                    <Text
                      style={{
                        marginTop: 8,
                        color: "#D1D5DB",
                        fontSize: 12,
                      }}
                    >
                      Payment session ready
                    </Text>
                  ) : null}
                </View>

                <View
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: 27,
                    backgroundColor: "rgba(200,155,60,0.18)",
                    borderWidth: 1,
                    borderColor: "rgba(246,231,193,0.25)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Feather name="credit-card" size={24} color={GOLD} />
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={0.9}
                disabled={paying}
                onPress={handlePayNow}
                style={{
                  marginTop: 16,
                  backgroundColor: GOLD,
                  borderRadius: 16,
                  paddingVertical: 15,
                  paddingHorizontal: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                }}
              >
                {paying ? (
                  <ActivityIndicator color="#111111" />
                ) : (
                  <>
                    <Feather name="lock" size={18} color="#111111" />
                    <Text
                      style={{
                        color: "#111111",
                        fontWeight: "900",
                        fontSize: 16,
                        letterSpacing: 0.2,
                      }}
                    >
                      Pay Securely
                    </Text>
                    <Feather name="arrow-up-right" size={18} color="#111111" />
                  </>
                )}
              </TouchableOpacity>

              {showCheckStatusButton ? (
                <TouchableOpacity
                  activeOpacity={0.9}
                  disabled={checkingPayment}
                  onPress={handleCheckPaymentStatus}
                  style={{
                    marginTop: 12,
                    backgroundColor: "#1F2937",
                    borderRadius: 16,
                    paddingVertical: 14,
                    paddingHorizontal: 16,
                    borderWidth: 1,
                    borderColor: "rgba(246,231,193,0.25)",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                  }}
                >
                  {checkingPayment ? (
                    <ActivityIndicator color="#F6E7C1" />
                  ) : (
                    <>
                      <Feather name="refresh-cw" size={18} color="#F6E7C1" />
                      <Text
                        style={{
                          color: "#F6E7C1",
                          fontWeight: "800",
                          fontSize: 15,
                        }}
                      >
                        Check Payment Status
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        ) : null}

        <View
          style={{
            marginTop: 14,
            backgroundColor: CARD,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: BORDER,
            paddingHorizontal: 16,
            paddingVertical: 6,
          }}
        >
          <DetailRow label="Category" value={item.category} />
          <DetailRow label="Description" value={item.description} />
          <DetailRow label="Preferred Window" value={item.preferred_window} />
          <DetailRow label="Assigned Lawyer" value={item.assigned_lawyer} />
          <DetailRow label="Created At" value={formatDate(item.created_at)} />
          <DetailRow label="Current Status" value={formatStatus(item.status)} />
        </View>

        <View
          style={{
            marginTop: 14,
            backgroundColor: "#111827",
            borderRadius: 18,
            padding: 16,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "800" }}>
            What happens next
          </Text>

          <View style={{ marginTop: 12, gap: 10 }}>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <Feather name="check-circle" size={18} color="#fff" />
              <Text style={{ color: "#E5E7EB", flex: 1, lineHeight: 20 }}>
                Your request has been recorded in the system.
              </Text>
            </View>

            <View style={{ flexDirection: "row", gap: 10 }}>
              <Feather name="credit-card" size={18} color="#fff" />
              <Text style={{ color: "#E5E7EB", flex: 1, lineHeight: 20 }}>
                Once payment is confirmed, the request can move to scheduling.
              </Text>
            </View>

            <View style={{ flexDirection: "row", gap: 10 }}>
              <Feather name="phone-call" size={18} color="#fff" />
              <Text style={{ color: "#E5E7EB", flex: 1, lineHeight: 20 }}>
                A lawyer or team member will connect based on the current status.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}