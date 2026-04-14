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

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const meridiem = hours >= 12 ? "PM" : "AM";

  hours = hours % 12 || 12;

  return `${day}/${month}/${year}, ${hours}:${minutes} ${meridiem}`;
}

function formatAppointmentMode(value?: string | null) {
  if (!value) return "Consultation";

  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function initialsFromName(value?: string | null) {
  if (!value) return "CF";

  const parts = value.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "CF";
}

function appointmentSummary(
  hasAppointment: boolean,
  mode?: string | null,
  lawyerName?: string | null
) {
  if (hasAppointment) {
    return `${formatAppointmentMode(mode)} consultation confirmed`;
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
    return `${formatAppointmentMode(mode)} format with guided lawyer follow-up.`;
  }

  if (lawyerName) {
    return "Expect the confirmed date, time, and joining details shortly.";
  }

  return "Assignment and scheduling updates will be reflected automatically.";
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

function SummaryTile({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <View
      style={{
        minWidth: "47%",
        flexGrow: 1,
        borderRadius: 22,
        backgroundColor: "rgba(255,255,255,0.05)",
        borderWidth: 1,
        borderColor: "rgba(231,201,125,0.12)",
        padding: 18,
        shadowColor: "#000000",
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 2,
      }}
    >
      <Text
        style={{
          fontSize: 11,
          color: "#D4B46A",
          fontWeight: "800",
          textTransform: "uppercase",
          letterSpacing: 0.9,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          marginTop: 10,
          fontSize: 18,
          color: "#F8FAFC",
          lineHeight: 26,
          fontWeight: "800",
        }}
      >
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

        await load();

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
            "Could not verify payment",
            e?.message || "Something went wrong while checking payment status."
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
        e?.message || "Something went wrong while creating the payment link."
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
  const lawyerName =
    item.assigned_lawyer_name || (item.assigned_lawyer ? "CaseFit Legal Expert" : null);
  const lawyerSpecialties = item.assigned_lawyer_specialties?.filter(Boolean) || [];
  const hasAppointment = !!item.scheduled_for;
  const nextMilestone = hasAppointment
    ? `${formatAppointmentMode(item.appointment_mode)} scheduled`
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
                  alignItems: "center",
                  gap: 14,
                }}
              >
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    backgroundColor: "#E8EEF8",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ color: INK, fontSize: 18, fontWeight: "900" }}>
                    {initialsFromName(lawyerName)}
                  </Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={{ color: INK, fontSize: 16, fontWeight: "800" }}>
                    {lawyerName || "Assignment pending"}
                  </Text>
                  <Text style={{ marginTop: 4, color: MUTED }}>
                    {lawyerSpecialties.length
                      ? lawyerSpecialties.join(" • ")
                      : lawyerName
                        ? "Dedicated legal consultation"
                        : nextMilestone}
                  </Text>
                </View>
              </View>

              <View
                style={{
                  marginTop: 16,
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
                  <Text
                    style={{
                      marginTop: 8,
                      color: "#A9B8CC",
                      lineHeight: 22,
                      fontSize: 14,
                    }}
                  >
                    A premium overview of your matter, confirmed timeline, assigned counsel,
                    and live service progression.
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
                  <Feather name="briefcase" size={21} color="#E7C97D" />
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
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                <SummaryTile label="Category" value={item.category} />
                <SummaryTile label="Current Status" value={formatStatus(item.status)} />
                <SummaryTile label="Assigned Lawyer" value={lawyerName || item.assigned_lawyer} />
                <SummaryTile
                  label="Appointment"
                  value={item.scheduled_for ? formatDate(item.scheduled_for) : "Not scheduled yet"}
                />
                <SummaryTile label="Preferred Window" value={item.preferred_window} />
                <SummaryTile label="Created At" value={formatDate(item.created_at)} />
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
