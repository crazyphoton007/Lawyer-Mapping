import { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Animated,
  Easing,
  Pressable,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { Feather } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";

import { API_BASE } from "../../constants/config";
import { useAuth } from "../../context/auth";
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
  assigned_lawyer_name?: string | null;
  assigned_lawyer_phone?: string | null;
  shared_lawyer_email?: string | null;
  shared_lawyer_note?: string | null;
  assigned_lawyer_specialties?: string[] | null;
  scheduled_for?: string | null;
  appointment_mode?: string | null;
  appointment_notes?: string | null;
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

function BackIconButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel="Go back"
      onPress={onPress}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      style={{
        width: 44,
        height: 44,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Feather name="arrow-left" size={24} color={INK} />
    </TouchableOpacity>
  );
}

const STATUS_COLOR: Record<string, string> = {
  pending: "#F59E0B",
  assigned: "#3B82F6",
  awaiting_payment: "#A855F7",
  paid: "#10B981",
  appointment_scheduled: "#0EA5E9",
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
  if (
    [
      "assigned",
      "appointment_scheduled",
      "calling",
      "scheduled",
      "booked",
      "completed",
    ].includes(st)
  ) {
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
  try {
    const formatter = new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    return formatter.format(date).replace(",", ", ");
  } catch {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const meridiem = hours >= 12 ? "PM" : "AM";

    hours = hours % 12 || 12;

    return `${day}/${month}/${year}, ${hours}:${minutes} ${meridiem}`;
  }
}

function formatAppointmentMode(value?: string | null) {
  if (!value) return "Consultation";

  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function appointmentSummary(
  hasAppointment: boolean,
  mode?: string | null,
  lawyerName?: string | null
) {
  if (hasAppointment) {
    return `${formatAppointmentMode(mode)} session confirmed`;
  }

  if (lawyerName) {
    return "Your scheduling desk is finalizing the session window.";
  }

  return "Your consultation slot will appear here once it is confirmed.";
}

function appointmentSupportingCopy(
  hasAppointment: boolean,
  mode?: string | null,
  lawyerName?: string | null
) {
  if (hasAppointment) {
    return `Your ${formatAppointmentMode(mode).toLowerCase()} with counsel is locked in and ready.`;
  }

  if (lawyerName) {
    return "Expect the confirmed date, time, and joining details shortly.";
  }

  return "";
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

function SummaryRow({
  label,
  value,
  muted,
}: {
  label: string;
  value?: string | null;
  muted?: boolean;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 18,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(231,201,125,0.08)",
      }}
    >
      <Text
        style={{
          color: "#D4B46A",
          fontSize: 11,
          fontWeight: "900",
          letterSpacing: 0.9,
          textTransform: "uppercase",
          width: "36%",
          lineHeight: 16,
          paddingTop: 2,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          width: "58%",
          textAlign: "right",
          color: muted ? "#9FB1C9" : "#FCF8EE",
          fontSize: 15,
          lineHeight: 22,
          fontWeight: "700",
        }}
      >
        {value && value.trim() ? value : "Not provided"}
      </Text>
    </View>
  );
}

export default function RequestDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token, hydrated } = useAuth();
  const router = useRouter();

  const [item, setItem] = useState<Req | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [latestPaymentLinkId, setLatestPaymentLinkId] = useState<string | null>(null);
  const [assignmentCountdown, setAssignmentCountdown] = useState(10);
  const hasLoadedOnce = useRef(false);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hourglassSpin = useRef(new Animated.Value(0)).current;

  const authToken = token;
  const assignmentWaitingForEffect =
    (item?.status || "").toLowerCase() === "paid" &&
    !item?.assigned_lawyer &&
    !item?.assigned_lawyer_name;

  const load = useCallback(async (mode: "initial" | "refresh" | "silent" = "initial") => {
    if (!hydrated) {
      return;
    }

    if (!authToken) {
      setError("Please log in first.");
      setItem(null);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    if (!id || Array.isArray(id)) {
      setError("Invalid request id.");
      setItem(null);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    if (mode === "initial") {
      setLoading(true);
      setError(null);
    } else if (mode === "refresh") {
      setRefreshing(true);
    }

    try {
      const res = await fetch(`${API_BASE}/requests/${id}`, {
        headers: {
          authorization: `Bearer ${authToken}`,
        },
      });

      const text = await res.text();

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${text}`);
      }

      const json = text ? JSON.parse(text) : null;
      const found: Req | null =
        json && typeof json === "object" && !Array.isArray(json) ? (json as Req) : null;

      if (!found) {
        setItem(null);
        setError("Request not found.");
        return;
      }

      setItem(found);
      hasLoadedOnce.current = true;
      setError(null);
    } catch (e: any) {
      if (mode === "initial") {
        setItem(null);
      }
      setError(friendlyErrorMessage(e, "We could not load this request right now."));
    } finally {
      if (mode === "initial") {
        setLoading(false);
      } else if (mode === "refresh") {
        setRefreshing(false);
      }
    }
  }, [authToken, hydrated, id]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    load("initial");
  }, [hydrated, load]);

  useFocusEffect(
    useCallback(() => {
      if (!hydrated || !authToken || !id || Array.isArray(id)) {
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
    }, [authToken, hydrated, id, load])
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

  useEffect(() => {
    if (!assignmentWaitingForEffect) {
      setAssignmentCountdown(10);
      hourglassSpin.stopAnimation();
      hourglassSpin.setValue(0);
      return;
    }

    hourglassSpin.setValue(0);
    const animation = Animated.loop(
      Animated.timing(hourglassSpin, {
        toValue: 1,
        duration: 1800,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      })
    );
    animation.start();

    return () => {
      animation.stop();
    };
  }, [assignmentWaitingForEffect, hourglassSpin]);

  useEffect(() => {
    if (!assignmentWaitingForEffect) {
      return;
    }

    const timer = setInterval(() => {
      setAssignmentCountdown((current) => (current <= 1 ? 10 : current - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [assignmentWaitingForEffect]);

  const verifyPaymentStatus = useCallback(
    async ({
      paymentLinkId,
      showAlerts,
    }: {
      paymentLinkId?: string | null;
      showAlerts: boolean;
    }) => {
      if (!authToken) {
        if (showAlerts) {
          Alert.alert("Login required", "Please log in first.");
        }
        return false;
      }

      if (!item) {
        if (showAlerts) {
          Alert.alert("Error", "Request details are not available.");
        }
        return false;
      }

      const targetPaymentLinkId = paymentLinkId || latestPaymentLinkId;
      if (!targetPaymentLinkId) {
        if (showAlerts) {
          Alert.alert(
            "No payment found",
            "Start payment first, then come back and check payment status."
          );
        }
        return false;
      }

      setCheckingPayment(true);

      try {
        const res = await fetch(`${API_BASE}/payments/verify-link`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            request_id: item.id,
            payment_link_id: targetPaymentLinkId,
          }),
        });

        const text = await res.text();

        if (!res.ok) {
          throw new Error(text || `HTTP ${res.status}`);
        }

        const data: VerifyPaymentResponse = text ? JSON.parse(text) : {};

        await load("silent");

        const isPaid =
          data.request_status === "paid" ||
          data.request_status === "assigned" ||
          data.payment_status === "paid";

        if (showAlerts) {
          if (isPaid) {
            Alert.alert(
              "Payment confirmed",
              "Your payment has been confirmed and your request has been updated."
            );
          } else {
            Alert.alert(
              "Payment still pending",
              "We could not confirm a completed payment yet. If you just paid, wait a few seconds and check again."
            );
          }
        }

        return isPaid;
      } catch (e: any) {
        if (showAlerts) {
          Alert.alert(
            "Payment check paused",
            friendlyErrorMessage(e, "We could not confirm the payment right now. Please try again in a moment.")
          );
        }
        return false;
      } finally {
        setCheckingPayment(false);
      }
    },
    [authToken, item, latestPaymentLinkId, load]
  );

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
        let message = text || `HTTP ${res.status}`;

        try {
          const errorBody = text ? JSON.parse(text) : null;
          if (typeof errorBody?.detail === "string") {
            message = errorBody.detail;
          }
        } catch {
          // Keep the original response text if it is not JSON.
        }

        throw new Error(message);
      }

      const data: PaymentLinkResponse = text ? JSON.parse(text) : {};

      if (!data.payment_link_url || !data.payment_link_id) {
        throw new Error("Payment link data was incomplete.");
      }

      const storageKey = `payment_link_id_${item.id}`;
      await SecureStore.setItemAsync(storageKey, data.payment_link_id);
      setLatestPaymentLinkId(data.payment_link_id);

      await load("silent");
      await WebBrowser.openBrowserAsync(data.payment_link_url);

      for (let attempt = 0; attempt < 3; attempt++) {
        const confirmed = await verifyPaymentStatus({
          paymentLinkId: data.payment_link_id,
          showAlerts: attempt === 2,
        });

        if (confirmed) {
          break;
        }

        if (attempt < 2) {
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }
      }
    } catch (e: any) {
      Alert.alert(
        "Payment could not start",
        friendlyErrorMessage(e, "We could not create the payment link right now. Please try again in a moment.")
      );
    } finally {
      setPaying(false);
    }
  }, [authToken, item, load, verifyPaymentStatus]);

  const handleCheckPaymentStatus = useCallback(async () => {
    await verifyPaymentStatus({ showAlerts: true });
  }, [verifyPaymentStatus]);

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
          <BackIconButton onPress={() => router.back()} />
        </View>

        <PremiumErrorState
          compact
          tone="error"
          title="Could not open this case"
          message={error || "Something went wrong."}
          actionLabel="Retry"
          onAction={() => load("initial")}
        />
      </SafeAreaView>
    );
  }

  const status = (item.status || "pending").toLowerCase();
  const chip = STATUS_COLOR[status] ?? MUTED;
  const step = stepFromStatus(status);
  const caseNo = deriveCaseNumber(item.id);
  const showPaymentBox = status === "pending" || status === "awaiting_payment";
  const showCheckStatusButton = status === "awaiting_payment" && !!latestPaymentLinkId;
  const lawyerName =
    item.assigned_lawyer_name || (item.assigned_lawyer ? "CaseFit Legal Expert" : null);
  const showAssignmentWaiting = status === "paid" && !lawyerName;
  const hourglassRotation = hourglassSpin.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ["0deg", "180deg", "360deg"],
  });
  const hasAppointment = !!item.scheduled_for;
  const nextMilestone = hasAppointment
    ? `${formatAppointmentMode(item.appointment_mode)} confirmed`
    : status === "assigned"
      ? "Scheduling in progress"
      : "Awaiting lawyer assignment";
  const appointmentHeadline = appointmentSummary(
    hasAppointment,
    item.appointment_mode,
    lawyerName
  );
  const appointmentSubcopy = appointmentSupportingCopy(
    hasAppointment,
    item.appointment_mode,
    lawyerName
  );

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
        <BackIconButton onPress={() => router.back()} />

        <Text style={{ fontSize: 18, fontWeight: "800", color: INK }}>
          Request Details
        </Text>

        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => load("refresh")} />
        }
        contentContainerStyle={{ padding: 16, paddingBottom: 28 }}
      >
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
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "900",
                  color: MUTED,
                  textTransform: "uppercase",
                  letterSpacing: 1.2,
                  marginBottom: 6,
                }}
              >
                Case Reference
              </Text>
              <Text style={{ fontSize: 26, fontWeight: "900", color: INK, letterSpacing: 0.4 }}>
                CF-{caseNo}
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
              <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap" }}>
                <Text style={[{ lineHeight: 22 }, stepStyle(1)]}>Pending</Text>
                <Feather
                  name="arrow-right"
                  size={17}
                  color={MUTED}
                  style={{ marginHorizontal: 8, marginTop: 1 }}
                />
                <Text style={[{ lineHeight: 22 }, stepStyle(2)]}>Payment Confirmed</Text>
                <Feather
                  name="arrow-right"
                  size={17}
                  color={MUTED}
                  style={{ marginHorizontal: 8, marginTop: 1 }}
                />
                <Text style={[{ lineHeight: 22 }, stepStyle(3)]}>Appointment Scheduled</Text>
              </View>
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

        {showAssignmentWaiting ? (
          <View
            style={{
              marginTop: 14,
              borderRadius: 24,
              padding: 1.5,
              backgroundColor: "rgba(200,155,60,0.32)",
              shadowColor: "#0B1220",
              shadowOpacity: 0.1,
              shadowRadius: 14,
              shadowOffset: { width: 0, height: 7 },
              elevation: 4,
            }}
          >
            <View
              style={{
                borderRadius: 22,
                backgroundColor: "#0F172A",
                padding: 18,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 14,
                }}
              >
                <Animated.View
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius: 29,
                    backgroundColor: "rgba(246,231,193,0.13)",
                    borderWidth: 1,
                    borderColor: "rgba(246,231,193,0.28)",
                    alignItems: "center",
                    justifyContent: "center",
                    transform: [{ rotate: hourglassRotation }],
                  }}
                >
                  <Feather name="clock" size={28} color={GOLD_LIGHT} />
                </Animated.View>

                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontSize: 20,
                      fontWeight: "900",
                      marginTop: 6,
                    }}
                  >
                    Payment confirmed
                  </Text>
                  <Text
                    style={{
                      color: "#CBD5E1",
                      marginTop: 6,
                      lineHeight: 20,
                    }}
                  >
                    caseFit AI is matching the right lawyer!
                  </Text>
                </View>
              </View>

              <View
                style={{
                  marginTop: 16,
                  borderRadius: 16,
                  backgroundColor: "rgba(255,255,255,0.06)",
                  borderWidth: 1,
                  borderColor: "rgba(246,231,193,0.16)",
                  padding: 14,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontSize: 16,
                      fontWeight: "900",
                    }}
                  >
                    Refreshing in {assignmentCountdown}s
                  </Text>
                </View>

                <Pressable
                  onPress={() => load("silent")}
                  style={({ pressed }) => ({
                    backgroundColor: pressed ? "#F4C75D" : GOLD,
                    borderRadius: 14,
                    paddingVertical: 11,
                    paddingHorizontal: 14,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    borderWidth: 1,
                    borderColor: pressed ? "#F8E0A0" : "rgba(255,255,255,0.22)",
                    shadowColor: "#F4C75D",
                    shadowOpacity: pressed ? 0.16 : 0.28,
                    shadowRadius: pressed ? 6 : 12,
                    shadowOffset: { width: 0, height: pressed ? 2 : 6 },
                    elevation: pressed ? 1 : 4,
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                  })}
                >
                  {({ pressed }) => (
                    <>
                      <Feather
                        name="refresh-cw"
                        size={16}
                        color="#111111"
                        style={{ opacity: pressed ? 0.78 : 1 }}
                      />
                      <Text style={{ color: "#111111", fontWeight: "900" }}>
                        Check
                      </Text>
                    </>
                  )}
                </Pressable>
              </View>
            </View>
          </View>
        ) : null}

        <View
          style={{
            marginTop: 14,
            borderRadius: 24,
            padding: 1.5,
            backgroundColor: "rgba(11,18,32,0.08)",
          }}
        >
          <View
            style={{
              borderRadius: 22,
              backgroundColor: "#FFFFFF",
              overflow: "hidden",
              borderWidth: 1,
              borderColor: BORDER,
            }}
          >
            <View
              style={{
                padding: 18,
                backgroundColor: "#101827",
              }}
            >
              <Text
                style={{
                  color: "#F8FAFC",
                  fontSize: 12,
                  fontWeight: "800",
                  letterSpacing: 1.1,
                  textTransform: "uppercase",
                }}
              >
                Concierge Assignment
              </Text>
              <Text
                style={{
                  marginTop: 8,
                  color: "#FFFFFF",
                  fontSize: 22,
                  fontWeight: "900",
                }}
              >
                {lawyerName || "Lawyer matching underway"}
              </Text>
              <Text
                style={{
                  marginTop: 6,
                  color: "#CBD5E1",
                  lineHeight: 20,
                }}
              >
                {hasAppointment
                  ? "Your consultation slot is reserved and ready for the next touchpoint."
                  : lawyerName
                    ? "Your case has been matched with a lawyer and scheduling can move forward."
                    : "We are pairing this request with the right legal expert for your matter."}
              </Text>
            </View>

            <View style={{ padding: 18 }}>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 10,
                }}
              >
                <View
                  style={{
                    minWidth: "47%",
                    flexGrow: 1,
                    borderRadius: 16,
                    backgroundColor: "#F8FAFC",
                    borderWidth: 1,
                    borderColor: BORDER,
                    padding: 14,
                  }}
                >
                  <Text
                    style={{
                      color: MUTED,
                      fontSize: 11,
                      fontWeight: "800",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    Next Milestone
                  </Text>
                  <Text style={{ marginTop: 6, color: INK, fontSize: 15, fontWeight: "800" }}>
                    {nextMilestone}
                  </Text>
                </View>

                <View
                  style={{
                    minWidth: "47%",
                    flexGrow: 1,
                    borderRadius: 16,
                    backgroundColor: "#F8FAFC",
                    borderWidth: 1,
                    borderColor: BORDER,
                    padding: 14,
                  }}
                >
                  <Text
                    style={{
                      color: MUTED,
                      fontSize: 11,
                      fontWeight: "800",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    Contact
                  </Text>
                  <Text style={{ marginTop: 6, color: INK, fontSize: 15, fontWeight: "800" }}>
                    {item.assigned_lawyer_phone || "Shared after confirmation"}
                  </Text>
                </View>
              </View>

              <View
                style={{
                  marginTop: 16,
                  borderRadius: 18,
                  backgroundColor: "#FCFBF7",
                  borderWidth: 1,
                  borderColor: "#EFE4C8",
                  padding: 18,
                  shadowColor: "#B78A22",
                  shadowOpacity: 0.08,
                  shadowRadius: 10,
                  shadowOffset: { width: 0, height: 5 },
                  elevation: 2,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: "#8A6A1F",
                        fontSize: 11,
                        fontWeight: "800",
                        textTransform: "uppercase",
                        letterSpacing: 0.6,
                      }}
                    >
                      Appointment
                    </Text>
                    <Text
                      style={{
                        marginTop: 6,
                        color: INK,
                        fontSize: 17,
                        fontWeight: "900",
                        lineHeight: 24,
                      }}
                    >
                      {hasAppointment ? formatDate(item.scheduled_for) : "Being scheduled"}
                    </Text>
                    <Text
                      style={{
                        marginTop: 8,
                        color: "#8A6A1F",
                        lineHeight: 20,
                        fontWeight: "800",
                      }}
                    >
                      {appointmentHeadline}
                    </Text>
                    <Text style={{ marginTop: 6, color: MUTED, lineHeight: 20 }}>
                      {appointmentSubcopy}
                    </Text>
                  </View>

                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      backgroundColor: "#F5E9C7",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Feather name="calendar" size={20} color="#8A6A1F" />
                  </View>
                </View>

                {item.appointment_notes ? (
                  <Text
                    style={{
                      marginTop: 14,
                      color: INK,
                      lineHeight: 22,
                      fontWeight: "600",
                    }}
                  >
                    {item.appointment_notes}
                  </Text>
                ) : null}

                {item.shared_lawyer_email ? (
                  <Text style={{ marginTop: 10, color: INK, lineHeight: 20 }}>
                    Email: {item.shared_lawyer_email}
                  </Text>
                ) : null}

                {item.shared_lawyer_note ? (
                  <Text style={{ marginTop: 10, color: MUTED, lineHeight: 20 }}>
                    {item.shared_lawyer_note}
                  </Text>
                ) : null}
              </View>
            </View>
          </View>
        </View>

        <View
          style={{
            marginTop: 14,
            borderRadius: 30,
            padding: 1,
            backgroundColor: "rgba(212,180,106,0.18)",
            shadowColor: "#0B1220",
            shadowOpacity: 0.16,
            shadowRadius: 24,
            shadowOffset: { width: 0, height: 10 },
            elevation: 6,
          }}
        >
          <View
            style={{
              borderRadius: 28,
              overflow: "hidden",
              backgroundColor: "#0A111F",
              borderWidth: 1,
              borderColor: "rgba(231,201,125,0.14)",
            }}
          >
            <View
              style={{
                padding: 22,
                backgroundColor: "rgba(255,255,255,0.015)",
                borderBottomWidth: 1,
                borderBottomColor: "rgba(231,201,125,0.08)",
              }}
            >
              <View
                style={{
                  alignSelf: "flex-start",
                  backgroundColor: "rgba(231,201,125,0.12)",
                  borderRadius: 999,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  marginBottom: 12,
                }}
              >
                <Text
                  style={{
                    color: "#F1D692",
                    fontSize: 11,
                    fontWeight: "900",
                    letterSpacing: 1,
                    textTransform: "uppercase",
                  }}
                >
                  Private Client Brief
                </Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ flex: 1, paddingRight: 12 }}>
                  <Text
                    style={{
                      color: "#FCF8EE",
                      fontSize: 25,
                      fontWeight: "900",
                      letterSpacing: 0.2,
                    }}
                  >
                    Case Snapshot
                  </Text>
                </View>

                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    backgroundColor: "rgba(231,201,125,0.12)",
                    borderWidth: 1,
                    borderColor: "rgba(231,201,125,0.18)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Image
                    source={require("../../assets/images/court_connect.png")}
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 25,
                    }}
                    resizeMode="cover"
                  />
                </View>
              </View>
            </View>

            <View
              style={{
                padding: 20,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 8,
                  marginBottom: 16,
                }}
              >
                {[
                  lawyerName ? "Counsel Assigned" : "Matching in Progress",
                  hasAppointment ? "Schedule Confirmed" : "Timeline Pending",
                  status === "appointment_scheduled" ? "Priority Handling" : "Live Case",
                ].map((pill) => (
                  <View
                    key={pill}
                    style={{
                      borderRadius: 999,
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      backgroundColor: "rgba(255,255,255,0.05)",
                      borderWidth: 1,
                      borderColor: "rgba(231,201,125,0.12)",
                    }}
                  >
                    <Text
                      style={{
                        color: "#D8E1EE",
                        fontSize: 11,
                        fontWeight: "800",
                        letterSpacing: 0.4,
                      }}
                    >
                      {pill}
                    </Text>
                  </View>
                ))}
              </View>

              <View
                style={{
                  borderRadius: 24,
                  backgroundColor: "rgba(255,255,255,0.035)",
                  borderWidth: 1,
                  borderColor: "rgba(231,201,125,0.12)",
                  paddingHorizontal: 18,
                  paddingVertical: 6,
                }}
              >
                <SummaryRow label="Category" value={item.category} />
                <SummaryRow label="Preferred City" value={item.preferred_city} />
                <SummaryRow label="Current Status" value={formatStatus(item.status)} />
                <SummaryRow label="Assigned Lawyer" value={lawyerName || item.assigned_lawyer} />
                <SummaryRow
                  label="Appointment"
                  value={item.scheduled_for ? formatDate(item.scheduled_for) : "Not scheduled yet"}
                />
                <SummaryRow label="Preferred Window" value={item.preferred_window} />
                <SummaryRow label="Created" value={formatDate(item.created_at)} muted />
              </View>

              <View
                style={{
                  marginTop: 14,
                  borderRadius: 24,
                  backgroundColor: "rgba(255,255,255,0.035)",
                  borderWidth: 1,
                  borderColor: "rgba(231,201,125,0.12)",
                  padding: 20,
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    color: "#F1D692",
                    fontWeight: "900",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  Matter Notes
                </Text>
                <Text
                  style={{
                    marginTop: 12,
                    color: "#FCF8EE",
                    fontSize: 18,
                    lineHeight: 30,
                    fontWeight: "600",
                  }}
                >
                  {item.description && item.description.trim()
                    ? item.description
                    : "Your matter summary will appear here once it has been provided."}
                </Text>
              </View>
            </View>
          </View>
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
