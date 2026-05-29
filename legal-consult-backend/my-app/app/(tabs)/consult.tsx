import { useEffect, useMemo, useRef, useState } from "react";
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
  Animated,
  Easing,
  LayoutChangeEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { API_BASE } from "../../constants/config";
import { useAuth } from "../../context/auth";
import { friendlyErrorMessage } from "@/utils/errorMessages";
import { Feather } from "@expo/vector-icons";

const CATEGORIES = ["Family", "Criminal", "Property", "Business", "Other"] as const;

// Brand palette
const BG = "#EEF2F7";
const CARD = "#FFFFFF";
const INK = "#000000";
const BORDER = "#E5E7EB";
const MUTED = "#6B7280";
const ACCENT = "#D4A63D";
const DEEP = "#111827";
const PANEL = "#F8FAFC";
const PANEL_BORDER = "#D8E1F0";
const SOFT_ACCENT = "#F8E8BE";
const SECTION_ORDER: SectionKey[] = ["category", "details", "city", "time"];

type SectionKey = "category" | "details" | "city" | "time";

function normalizePhone(s?: string | null) {
  const n = (s ?? "").toString().replace(/\D/g, "");
  return n.slice(-12);
}

function deriveCaseNumber(id: string) {
  const s = String(id);
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return String(h % 100000).padStart(5, "0");
}

function PerimeterGlowCard({
  active,
  onLayout,
  style,
  children,
}: {
  active: boolean;
  onLayout?: (event: LayoutChangeEvent) => void;
  style: any;
  children: React.ReactNode;
}) {
  const progress = useRef(new Animated.Value(0)).current;
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!active || !size.width || !size.height) return;
    progress.setValue(0);
    const loop = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: 3200,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [active, progress, size.height, size.width]);

  const inset = 10;
  const trackWidth = Math.max(size.width - inset * 2, 1);
  const trackHeight = Math.max(size.height - inset * 2, 1);
  const perimeter = Math.max(trackWidth * 2 + trackHeight * 2, 1);
  const edge1 = trackWidth / perimeter;
  const edge2 = (trackWidth + trackHeight) / perimeter;
  const edge3 = (trackWidth * 2 + trackHeight) / perimeter;

  const left = progress.interpolate({
    inputRange: [0, edge1, edge2, edge3, 1],
    outputRange: [0, trackWidth, trackWidth, 0, 0],
  });

  const top = progress.interpolate({
    inputRange: [0, edge1, edge2, edge3, 1],
    outputRange: [0, 0, trackHeight, trackHeight, 0],
  });

  const rotate = progress.interpolate({
    inputRange: [0, edge1, edge2, edge3, 1],
    outputRange: ["0deg", "90deg", "180deg", "270deg", "360deg"],
  });

  return (
    <View
      onLayout={(event) => {
        setSize({
          width: event.nativeEvent.layout.width,
          height: event.nativeEvent.layout.height,
        });
        onLayout?.(event);
      }}
      style={[style, { position: "relative", overflow: "hidden" }]}
    >
      {children}
      {size.width > 0 && size.height > 0 ? (
        <>
          <Animated.View
            pointerEvents="none"
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 22,
              borderWidth: 1.5,
              borderColor: active ? "rgba(212,166,61,0.45)" : "rgba(216,225,240,0.9)",
              opacity: active ? 1 : 0.78,
            }}
          />
          <Animated.View
            pointerEvents="none"
            style={{
              position: "absolute",
              left: inset,
              top: inset,
              transform: [{ translateX: left }, { translateY: top }, { rotate }],
              opacity: active ? 1 : 0,
            }}
          >
            <LinearGradient
              colors={["rgba(248,232,190,0)", "rgba(248,232,190,0.95)", "rgba(248,232,190,0)"]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={{
                width: 76,
                height: 5,
                borderRadius: 999,
                shadowColor: "#F8E8BE",
                shadowOpacity: 0.55,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 0 },
                elevation: 6,
              }}
            />
          </Animated.View>
        </>
      ) : null}
    </View>
  );
}

export default function ConsultScreen() {
  const router = useRouter();
  const { token, user } = useAuth();
  const scrollRef = useRef<ScrollView>(null);
  const scrollYRef = useRef(0);

  const [category, setCategory] = useState<string>("");
  const [details, setDetails] = useState<string>("");
  const [preferredCity, setPreferredCity] = useState<string>("");
  const [preferredWindow, setPreferredWindow] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [activeSection, setActiveSection] = useState<SectionKey>("category");
  const [sectionLayouts, setSectionLayouts] = useState<Record<SectionKey, { y: number; height: number }>>({
    category: { y: 0, height: 0 },
    details: { y: 0, height: 0 },
    city: { y: 0, height: 0 },
    time: { y: 0, height: 0 },
  });

  // success sheet
  const [okOpen, setOkOpen] = useState(false);
  const [newId, setNewId] = useState<string>("");

  const matterLabel = useMemo(() => (category.trim() ? `${category.trim()} issue` : ""), [category]);
  const valid = useMemo(
    () => Boolean(category.trim()) && Boolean(preferredCity.trim()) && !!token,
    [category, preferredCity, token]
  );
  const caseReference = useMemo(() => (newId ? `CF-${deriveCaseNumber(newId)}` : null), [newId]);

  function rememberSectionLayout(section: SectionKey, event: LayoutChangeEvent) {
    const { y, height } = event.nativeEvent.layout;
    setSectionLayouts((current) => {
      const next = {
        ...current,
        [section]: {
          y,
          height,
        },
      };
      requestAnimationFrame(() => updateActiveSection(scrollYRef.current, next));
      return next;
    });
  }

  function updateActiveSection(
    scrollY: number,
    layouts: Record<SectionKey, { y: number; height: number }> = sectionLayouts
  ) {
    if (!viewportHeight) return;
    const viewportTop = scrollY;
    const viewportBottom = scrollY + viewportHeight;
    const focusLine = scrollY + viewportHeight * 0.28;
    let next: SectionKey | null = null;
    let fallback: SectionKey | null = null;

    SECTION_ORDER.forEach((key) => {
      const layout = layouts[key];
      if (!layout.height) return;
      const sectionTop = layout.y;
      const sectionBottom = layout.y + layout.height;
      const isVisible = sectionBottom > viewportTop + 20 && sectionTop < viewportBottom - 20;
      if (!isVisible) return;

      if (!fallback) {
        fallback = key;
      }

      if (sectionTop <= focusLine) {
        next = key;
      }
    });

    const resolved = next ?? fallback ?? activeSection;
    if (resolved !== activeSection) {
      setActiveSection(resolved);
    }
  }

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
      Alert.alert("Missing fields", "Pick a category and choose a city to continue.");
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
        body: JSON.stringify({
          category: category.trim(),
          details: details.trim(),
          preferred_city: preferredCity.trim(),
          preferred_window: preferredWindow.trim() || null,
        }),
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
      setPreferredCity("");
      setPreferredWindow("");

      // show success sheet
      setOkOpen(true);
    } catch (e: any) {
      Alert.alert(
        "Request could not be submitted",
        friendlyErrorMessage(e, "We could not submit your request right now. Please try again in a moment.")
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 8}
        style={{ flex: 1 }}
      >
        <ScrollView
          ref={scrollRef}
          onLayout={(event) => setViewportHeight(event.nativeEvent.layout.height)}
          onScroll={(event) => {
            const nextY = event.nativeEvent.contentOffset.y;
            scrollYRef.current = nextY;
            updateActiveSection(nextY);
          }}
          scrollEventThrottle={16}
          contentContainerStyle={{ padding: 16, paddingBottom: 140, flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
        >
          <LinearGradient
            colors={["#0F172A", "#162033", "#27324A"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: 28,
              padding: 20,
              marginBottom: 14,
              overflow: "hidden",
            }}
          >
            <View style={{ gap: 14 }}>
              <View
                style={{
                  alignSelf: "flex-start",
                  backgroundColor: "rgba(248,232,190,0.12)",
                  borderWidth: 1,
                  borderColor: "rgba(248,232,190,0.18)",
                  borderRadius: 999,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                }}
              >
                <Text style={{ color: "#F8E8BE", fontSize: 11, fontWeight: "900", letterSpacing: 1 }}>
                  PREMIUM MATCHING DESK
                </Text>
              </View>

              <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 16 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 28, lineHeight: 34, fontWeight: "900", color: "#FFFFFF" }}>
                    Expert Link
                  </Text>
                  <Text style={{ color: "rgba(255,255,255,0.72)", marginTop: 8, lineHeight: 21 }}>
                    Get a personalized lawyer recommendation for your unique situation
                  </Text>
                </View>

                <View
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius: 29,
                    backgroundColor: "rgba(255,255,255,0.08)",
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.12)",
                  }}
                >
                  <Feather name="briefcase" size={24} color="#F8E8BE" />
                </View>
              </View>

            </View>
          </LinearGradient>

          {!user && (
            <View
              style={{
                backgroundColor: "#FFFCEB",
                borderColor: "#FDE68A",
                borderWidth: 1,
                borderRadius: 16,
                padding: 14,
                marginBottom: 12,
                gap: 10,
              }}
            >
              <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                <Feather name="alert-triangle" size={18} color="#92400E" />
                <Text style={{ color: "#92400E", fontWeight: "700" }}>Login needed to continue</Text>
              </View>
              <Text style={{ color: "#92400E", lineHeight: 20 }}>
                You’re not logged in. Go to Profile → Login to submit.
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/login")}
                style={{
                  alignSelf: "flex-start",
                  backgroundColor: INK,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderRadius: 999,
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "700" }}>Go to login</Text>
              </TouchableOpacity>
            </View>
          )}

          <View
            style={{
              backgroundColor: CARD,
              borderRadius: 26,
              padding: 18,
              gap: 18,
              borderWidth: 1,
              borderColor: BORDER,
              shadowColor: "#000",
              shadowOpacity: 0.06,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 4 },
              elevation: 2,
            }}
          >
            <PerimeterGlowCard
              active={activeSection === "category"}
              onLayout={(event) => rememberSectionLayout("category", event)}
              style={{
                backgroundColor: PANEL,
                borderRadius: 22,
                padding: 16,
                borderWidth: 1,
                borderColor: PANEL_BORDER,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
                <View
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 19,
                    backgroundColor: DEEP,
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Feather name="layers" size={16} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1, flexShrink: 1, flexBasis: 0, minWidth: 0 }}>
                  <Text style={{ fontSize: 15, fontWeight: "800", color: INK }}>Legal category</Text>
                  <Text style={{ fontSize: 12, color: MUTED, flexShrink: 1, width: "100%" }}>
                    To pair you with right counsel
                  </Text>
                </View>
              </View>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {CATEGORIES.map((c) => {
                  const selected = c === category;
                  return (
                    <TouchableOpacity
                      key={c}
                      onPress={() => setCategory(c)}
                      style={{
                        paddingVertical: 10,
                        paddingHorizontal: 14,
                        borderRadius: 999,
                        borderWidth: 1,
                        borderColor: selected ? DEEP : BORDER,
                        backgroundColor: selected ? DEEP : "#fff",
                      }}
                    >
                      <Text style={{ fontSize: 13, fontWeight: "800", color: selected ? "#fff" : INK }}>
                        {c}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </PerimeterGlowCard>

            <PerimeterGlowCard
              active={activeSection === "details"}
              onLayout={(event) => rememberSectionLayout("details", event)}
              style={{
                backgroundColor: "#FCFCFD",
                borderRadius: 22,
                padding: 16,
                borderWidth: 1,
                borderColor: BORDER,
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", gap: 12 }}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={{ fontSize: 15, fontWeight: "800", color: INK }}>Matter summary</Text>
                  <Text style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>
                    We’ll use your issue type and notes to assign the right counsel faster.
                  </Text>
                </View>
              </View>

              {matterLabel ? (
                <View
                  style={{
                    marginTop: 10,
                    alignSelf: "flex-start",
                    backgroundColor: "#F4F7FB",
                    borderWidth: 1,
                    borderColor: "#D8E1EE",
                    borderRadius: 999,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                  }}
                >
                  <Text style={{ color: INK, fontSize: 12, fontWeight: "800", textTransform: "capitalize" }}>
                    {matterLabel}
                  </Text>
                </View>
              ) : null}

              <TextInput
                value={details}
                onChangeText={setDetails}
                placeholder="Write a few details about your situation (optional)..."
                placeholderTextColor="#6B7280"
                multiline
                numberOfLines={6}
                style={{
                  borderWidth: 1,
                  borderColor: details.trim() ? "#B8D8BF" : BORDER,
                  borderRadius: 16,
                  padding: 14,
                  minHeight: 132,
                  textAlignVertical: "top",
                  fontSize: 15,
                  backgroundColor: "#FFFFFF",
                  marginTop: 10,
                  color: INK,
                }}
              />

              <View style={{ flexDirection: "row", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                {[
                  { icon: "phone", text: "Describe issue" },
                  { icon: "shield", text: "Private intake" },
                  { icon: "calendar", text: "Get scheduled" },
                ].map((s, i) => (
                  <View
                    key={i}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                      backgroundColor: "#F6F8FB",
                      paddingHorizontal: 10,
                      paddingVertical: 8,
                      borderRadius: 999,
                    }}
                  >
                    <Feather name={s.icon as any} size={14} color={DEEP} />
                    <Text style={{ color: INK, fontWeight: "700" }}>{s.text}</Text>
                  </View>
                ))}
              </View>
            </PerimeterGlowCard>

            <PerimeterGlowCard
              active={activeSection === "city"}
              onLayout={(event) => rememberSectionLayout("city", event)}
              style={{
                backgroundColor: PANEL,
                borderRadius: 22,
                padding: 16,
                borderWidth: 1,
                borderColor: PANEL_BORDER,
                gap: 12,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
                <View
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 19,
                    backgroundColor: SOFT_ACCENT,
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Feather name="map-pin" size={16} color="#8A6410" />
                </View>
                <View style={{ flex: 1, flexShrink: 1, flexBasis: 0, minWidth: 0 }}>
                  <Text style={{ fontSize: 15, fontWeight: "800", color: INK }}>
                    Preferred lawyer city
                  </Text>
                  <Text style={{ fontSize: 12, color: MUTED, marginTop: 2, flexShrink: 1, width: "100%" }}>
                    Tell us where you want the assigned lawyer to be based
                  </Text>
                </View>
              </View>

              <TextInput
                value={preferredCity}
                onChangeText={setPreferredCity}
                placeholder="e.g. Lucknow, Delhi, Noida etc."
                placeholderTextColor="#6B7280"
                style={{
                  borderWidth: 1,
                  borderColor: preferredCity.trim() ? "#D6C18A" : BORDER,
                  borderRadius: 16,
                  padding: 12,
                  fontSize: 15,
                  backgroundColor: "#FFFFFF",
                }}
              />

            </PerimeterGlowCard>

            <PerimeterGlowCard
              active={activeSection === "time"}
              onLayout={(event) => rememberSectionLayout("time", event)}
              style={{
                backgroundColor: "#FCFCFD",
                borderRadius: 22,
                padding: 16,
                borderWidth: 1,
                borderColor: BORDER,
                gap: 12,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
                <View
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 19,
                    backgroundColor: "#EDF5FF",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Feather name="clock" size={16} color="#2456B5" />
                </View>
                <View style={{ flex: 1, flexShrink: 1, flexBasis: 0, minWidth: 0 }}>
                  <Text style={{ fontSize: 15, fontWeight: "800", color: INK }}>
                    Preferred time
                  </Text>
                  <Text style={{ fontSize: 12, color: MUTED, marginTop: 2, flexShrink: 1, width: "100%" }}>
                    Share your availability so our team can schedule more smoothly
                  </Text>
                </View>
              </View>

              <TextInput
                value={preferredWindow}
                onChangeText={setPreferredWindow}
                onFocus={() => {
                  requestAnimationFrame(() => {
                    scrollRef.current?.scrollToEnd({ animated: true });
                  });
                }}
                placeholder="e.g. weekdays or weekends after 6"
                placeholderTextColor="#6B7280"
                style={{
                  borderWidth: 1,
                  borderColor: BORDER,
                  borderRadius: 16,
                  padding: 12,
                  fontSize: 15,
                  backgroundColor: "#FFFFFF",
                }}
              />

            </PerimeterGlowCard>

            <LinearGradient
              colors={valid ? ["#101827", "#1C2740"] : ["#9CA3AF", "#9CA3AF"]}
              style={{
                borderRadius: 22,
                padding: 16,
                gap: 12,
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 14 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#FFFFFF", fontSize: 17, fontWeight: "900" }}>
                    Submit your case brief
                  </Text>
                  <Text style={{ color: "rgba(255,255,255,0.72)", marginTop: 4, lineHeight: 19 }}>
                    {valid
                      ? "Your intake is ready for review by the matching desk."
                      : "Choose a category and city to continue"}
                  </Text>
                </View>
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: valid ? "rgba(212,166,61,0.18)" : "rgba(255,255,255,0.1)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Feather name="send" size={18} color={valid ? "#F8E8BE" : "#FFFFFF"} />
                </View>
              </View>

              <TouchableOpacity
                onPress={submit}
                disabled={!valid || loading}
                style={{
                  backgroundColor: valid ? ACCENT : "rgba(255,255,255,0.14)",
                  paddingVertical: 16,
                  borderRadius: 16,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: valid ? "#1F1400" : "#FFFFFF", fontSize: 16, fontWeight: "900" }}>
                  {loading ? "Submitting…" : "Continue to Case Tracking"}
                </Text>
              </TouchableOpacity>
            </LinearGradient>
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
              paddingHorizontal: 20,
              paddingTop: 18,
              paddingBottom: 24,
              gap: 10,
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
              {caseReference ? (
                <View
                  style={{
                    marginTop: 2,
                    backgroundColor: "#F7F1E1",
                    borderColor: "#E8D5A3",
                    borderWidth: 1,
                    borderRadius: 999,
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                  }}
                >
                  <Text
                    style={{
                      color: "#8A6410",
                      fontSize: 13,
                      fontWeight: "800",
                      letterSpacing: 1.1,
                    }}
                  >
                    CASE REFERENCE {caseReference}
                  </Text>
                </View>
              ) : null}
              <Text style={{ color: MUTED, textAlign: "center", lineHeight: 20, marginTop: 4 }}>
                Your consultation request is in. Track updates and next steps from your requests timeline.
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => {
                setOkOpen(false);
                router.replace("/(tabs)/requests");
              }}
              style={{
                marginTop: 10,
                backgroundColor: ACCENT,
                paddingVertical: 16,
                borderRadius: 16,
                alignItems: "center",
                shadowColor: ACCENT,
                shadowOpacity: 0.28,
                shadowRadius: 14,
                shadowOffset: { width: 0, height: 8 },
                elevation: 6,
              }}
            >
              <Text style={{ color: "#1F1400", fontSize: 16, fontWeight: "900", letterSpacing: 0.4 }}>
                Open My Case Brief
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
