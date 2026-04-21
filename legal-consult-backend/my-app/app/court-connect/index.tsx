import { useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { COURT_CATALOG } from "../../constants/courtLinks";

const BG = "#F7F8FA",
  INK = "#0B1220",
  MUTED = "#6B7280",
  BORDER = "#E5E7EB",
  CARD = "#FFFFFF";

export default function CourtConnectHome() {
  const router = useRouter();
  const { highCourt, lowerCourt } = COURT_CATALOG;

  const highCourtRows = useMemo(() => highCourt.courts, [highCourt]);
  const lowerCourtRows = useMemo(() => lowerCourt.courts, [lowerCourt]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
          {/* Header */}
          <View style={{ marginBottom: 10 }}>
            <Text style={{ fontSize: 24, fontWeight: "800", color: INK }}>Court Connect</Text>
            <Text style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>
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
                  <RowLink key={b.name} label={b.name} url={b.url} onPressUrl={(nextUrl) => {
                    router.push({
                      pathname: "/court-connect/view",
                      params: { title: b.name, url: nextUrl },
                    });
                  }} />
                ))}
              </View>
            ))}
          </SectionCard>

          {/* Lower Court card */}
          <SectionCard title={lowerCourt.title} icon="layers">
            {lowerCourtRows.map((c) => (
              <RowLink key={c.name} label={c.name} url={c.url ?? null} onPressUrl={(nextUrl) => {
                router.push({
                  pathname: "/court-connect/view",
                  params: { title: c.name, url: nextUrl },
                });
              }} />
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
      </SafeAreaView>
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

function RowLink({
  label,
  url,
  onPressUrl,
}: {
  label: string;
  url: string | null;
  onPressUrl: (url: string) => void;
}) {
  const disabled = !url;

  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={() => {
        if (url) onPressUrl(url);
      }}
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
      <Feather name="chevron-right" size={20} color={INK} />
    </TouchableOpacity>
  );
}
