// my-app/app/court-connect/index.tsx

import { useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { Stack, useRouter } from "expo-router"; // ← add useRouter
import { COURT_CATALOG } from "../../constants/courtLinks";
import CaseFitHeader from "../../components/CaseFitHeader";

const BG = "#F7F8FA",
  INK = "#0B1220",
  MUTED = "#6B7280",
  BORDER = "#E5E7EB",
  CARD = "#FFFFFF";

export default function CourtConnectHome() {
  const router = useRouter(); // ← for custom back
  const { highCourt, lowerCourt } = COURT_CATALOG;

  const highCourtRows = useMemo(() => highCourt.courts, [highCourt]);
  const lowerCourtRows = useMemo(() => lowerCourt.courts, [lowerCourt]);

  return (
    <>
      {/* Use consistent CaseFit header with back button */}
      <CaseFitHeader showBack={true} />

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32, backgroundColor: BG }}>
        {/* Header */}
        <View style={{ marginBottom: 10 }}>
          <Text style={{ fontSize: 24, fontWeight: "800", color: INK }}>Court Connect</Text>
          <Text style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>
            Access court websites and legal resources instantly
          </Text>
        </View>
              Quick access to court case status portals
            </Text>
          </View>

          {/* High Court card */}
          <SectionCard title={highCourt.title} icon="columns">
            {highCourtRows.map((court) => (
              <View key={court.name} style={{ marginBottom: 10 }}>
                <Text style={{ fontSize: 14, fontWeight: "800", color: INK, marginBottom: 8 }}>
                  {court.name}
                </Text>
                {(court.benches ?? []).map((b) => (
                  <RowLink key={b.name} label={b.name} url={b.url} />
                ))}
              </View>
            ))}
          </SectionCard>

          {/* Lower Court card */}
          <SectionCard title={lowerCourt.title} icon="layers">
            {lowerCourtRows.map((c) => (
              <RowLink key={c.name} label={c.name} url={c.url ?? null} />
            ))}
          </SectionCard>

          {/* Tip / disclaimer */}
          <View style={{ marginTop: 8 }}>
            <Text style={{ fontSize: 11, color: MUTED }}>
              Links open official court portals. Availability may vary. We will add more benches and
              districts as they become officially available.
            </Text>
          </View>
        </ScrollView>
    </>
  );
}

function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
}) {
  return (
    <View
      style={{
        backgroundColor: CARD,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: BORDER,
        padding: 14,
        marginBottom: 14,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: INK,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 10,
          }}
        >
          <Feather name={icon} size={16} color="#fff" />
        </View>
        <Text style={{ fontSize: 16, fontWeight: "800", color: INK }}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function RowLink({ label, url }: { label: string; url: string | null }) {
  const disabled = !url;

  const openInAppBrowser = async () => {
    if (!url) return;
    try {
      await WebBrowser.openBrowserAsync(url, {
        enableBarCollapsing: true,
        showTitle: true,
        // iOS
        dismissButtonStyle: "done",
        presentationStyle: "pageSheet",
        // Android Custom Tabs hints
        toolbarColor: "#ffffff",
        controlsColor: "#0B1220",
        secondaryToolbarColor: "#f2f3f5",
      });
    } catch (e) {
      Alert.alert("Couldn’t open link", "Please try again or use another network.");
    }
  };

  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={openInAppBrowser}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: BORDER,
        marginBottom: 8,
        opacity: disabled ? 0.55 : 1,
        backgroundColor: "#fff",
      }}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: "700", color: INK }}>{label}</Text>
        <Text style={{ fontSize: 11, color: MUTED }}>
          {disabled ? "Coming soon" : "Open status portal"}
        </Text>
      </View>
      <Feather
        name={Platform.OS === "ios" ? "external-link" : "chevron-right"}
        size={20}
        color={INK}
      />
    </TouchableOpacity>
  );
}
