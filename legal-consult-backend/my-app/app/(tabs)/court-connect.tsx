import { useMemo } from "react";
import { Pressable, StyleSheet, View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { COURT_CATALOG } from "../../constants/courtLinks";

const BG = "#F5F6F8";
const INK = "#0B1220";
const SOFT_INK = "#172033";
const MUTED = "#6B7280";
const GOLD = "#C59B48";

const SERVICE_META: Record<
  string,
  {
    icon: keyof typeof Feather.glyphMap;
    subtitle: string;
    accent: string;
    glow: string;
  }
> = {
  "CNR Number": {
    icon: "hash",
    subtitle: "Trace matters by 16-digit case identity",
    accent: "#0B1220",
    glow: "#D9C79B",
  },
  "Case Status": {
    icon: "activity",
    subtitle: "Stage, parties, listing, and next date",
    accent: "#2563EB",
    glow: "#BFD7FF",
  },
  "Court Orders": {
    icon: "file-text",
    subtitle: "Orders and judgments from official records",
    accent: "#6D28D9",
    glow: "#D9C8FF",
  },
  "Cause List": {
    icon: "calendar",
    subtitle: "Daily boards and court-wise listings",
    accent: "#0F766E",
    glow: "#BFE9E4",
  },
  "Caveat Search": {
    icon: "shield",
    subtitle: "Search caveats before the matter moves",
    accent: "#B45309",
    glow: "#F6D5A5",
  },
};

export default function CourtConnectHome() {
  const router = useRouter();
  const { highCourt, lowerCourt } = COURT_CATALOG;

  const highCourtRows = useMemo(() => highCourt.courts, [highCourt]);
  const lowerCourtRows = useMemo(() => lowerCourt.courts, [lowerCourt]);

  const openPortal = (title: string, url: string) => {
    router.push({
      pathname: "/court-connect/view",
      params: { title, url },
    });
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.accessHeader}>
          <View style={styles.accessSeal}>
            <Feather name="shield" size={16} color={GOLD} />
            <View style={styles.accessSealDot} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.accessTitle}>Official Portal Access</Text>
            {/* <Text style={styles.accessSubtitle}>Verified court links, opened inside caseFit</Text> */}
          </View>
          <View style={styles.accessStatus}>
            <View style={styles.accessStatusDot} />
            <Text style={styles.accessStatusText}>Live</Text>
          </View>
        </View>

        <SectionCard title={highCourt.title} icon="award" caption="Allahabad High Court" court>
          {highCourtRows.map((court) => (
            <View key={court.name}>
              {(court.benches ?? []).map((bench) => (
                <BenchRow
                  key={bench.name}
                  label={bench.name}
                  url={bench.url}
                  onPressUrl={(nextUrl) => openPortal(bench.name, nextUrl)}
                />
              ))}
            </View>
          ))}
        </SectionCard>

        <SectionCard title={lowerCourt.title} icon="layers" caption="District court gateway" premium>
          {lowerCourtRows.map((service) => (
            <ServiceRow
              key={service.name}
              label={service.name}
              url={service.url ?? null}
              onPressUrl={(nextUrl) => openPortal(service.name, nextUrl)}
            />
          ))}
        </SectionCard>

        <View style={styles.disclaimer}>
          <Feather name="info" size={14} color={MUTED} />
          <Text style={styles.disclaimerText}>
            Links open official eCourts portals. caseFit only provides quick access and does not
            control court data.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionCard({
  title,
  icon,
  caption,
  premium,
  court,
  children,
}: {
  title: string;
  icon: keyof typeof Feather.glyphMap;
  caption: string;
  premium?: boolean;
  court?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View style={[styles.section, premium && styles.sectionPremium]}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIcon, premium && styles.sectionIconPremium, court && styles.courtSectionIcon]}>
          <Feather name={icon} size={court ? 18 : 16} color={premium || court ? INK : "#FFFFFF"} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <Text style={styles.sectionCaption}>{caption}</Text>
        </View>
      </View>
      {children}
    </View>
  );
}

function ServiceRow({
  label,
  url,
  onPressUrl,
}: {
  label: string;
  url: string | null;
  onPressUrl: (url: string) => void;
}) {
  const meta = SERVICE_META[label] ?? {
    icon: "external-link" as keyof typeof Feather.glyphMap,
    subtitle: "Open official eCourts portal",
    accent: INK,
    glow: "#D8DEE9",
  };

  return (
    <Pressable
      disabled={!url}
      onPress={() => {
        if (url) onPressUrl(url);
      }}
      style={({ pressed }) => [styles.serviceRow, pressed && styles.rowPressed]}
    >
      {({ pressed }) => (
        <>
          <View style={[styles.pressGlow, pressed && styles.pressGlowActive]} />
          <View style={[styles.serviceAccent, { backgroundColor: meta.accent }]} />
          <View style={[styles.serviceIcon, { backgroundColor: meta.glow }]}>
            <Feather name={meta.icon} size={17} color={meta.accent} />
          </View>

          <View style={styles.serviceText}>
            <View style={styles.serviceTitleLine}>
              <Text style={styles.serviceTitle}>{label}</Text>
            </View>
            <Text style={styles.serviceSubtitle}>{meta.subtitle}</Text>
          </View>

          <View style={styles.serviceArrow}>
            <Feather name="chevron-right" size={20} color={INK} />
          </View>
        </>
      )}
    </Pressable>
  );
}

function BenchRow({
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
    <Pressable
      disabled={disabled}
      onPress={() => {
        if (url) onPressUrl(url);
      }}
      style={({ pressed }) => [styles.benchRow, pressed && styles.rowPressed, disabled && styles.disabledRow]}
    >
      {({ pressed }) => (
        <>
          <View style={[styles.pressGlow, pressed && styles.pressGlowActive]} />
          <View style={styles.benchIcon}>
            <Feather name="briefcase" size={16} color={INK} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.benchTitle}>{label.trim()}</Text>
            <Text style={styles.benchSubtitle}>{disabled ? "Coming soon" : "Open status portal"}</Text>
          </View>
          <View style={styles.benchArrow}>
            <Feather name="chevron-right" size={20} color={INK} />
          </View>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BG,
  },
  content: {
    padding: 16,
    paddingBottom: 34,
  },
  accessHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    marginBottom: 14,
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(229,231,235,0.9)",
    backgroundColor: "rgba(255,255,255,0.94)",
    shadowColor: "#0B1220",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  accessSeal: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: INK,
    alignItems: "center",
    justifyContent: "center",
  },
  accessSealDot: {
    position: "absolute",
    right: 8,
    top: 8,
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#22C55E",
  },
  accessTitle: {
    color: SOFT_INK,
    fontSize: 14,
    fontWeight: "900",
  },
  accessSubtitle: {
    color: MUTED,
    fontSize: 11,
    marginTop: 2,
  },
  accessStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  accessStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#16A34A",
  },
  accessStatusText: {
    color: "#166534",
    fontSize: 10,
    fontWeight: "900",
  },
  section: {
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(229,231,235,0.9)",
    padding: 15,
    marginBottom: 14,
    shadowColor: "#0B1220",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  sectionPremium: {
    borderColor: "rgba(197,155,72,0.38)",
    shadowOpacity: 0.11,
    shadowRadius: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 13,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF0F4",
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 16,
    backgroundColor: INK,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  sectionIconPremium: {
    backgroundColor: "#FAF1D9",
    borderWidth: 1,
    borderColor: "#E6CF91",
  },
  courtSectionIcon: {
    backgroundColor: "#EEF1F6",
    borderWidth: 1,
    borderColor: "#D9DEE8",
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: INK,
  },
  sectionCaption: {
    fontSize: 11,
    color: MUTED,
    marginTop: 1,
  },
  benchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 11,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(212,216,225,0.82)",
    marginBottom: 10,
    backgroundColor: "#FCFCFD",
    overflow: "hidden",
    shadowColor: "#0B1220",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  disabledRow: {
    opacity: 0.55,
  },
  benchIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: "#EEF1F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },
  benchTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: INK,
  },
  benchSubtitle: {
    fontSize: 11,
    color: MUTED,
    marginTop: 2,
  },
  benchArrow: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F5F8",
  },
  serviceRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 11,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(212,216,225,0.82)",
    marginBottom: 10,
    backgroundColor: "#FCFCFD",
    overflow: "hidden",
    shadowColor: "#0B1220",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  serviceAccent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  serviceIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
    marginLeft: 2,
  },
  serviceText: {
    flex: 1,
  },
  serviceTitleLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  serviceTitle: {
    color: INK,
    fontSize: 14,
    fontWeight: "900",
  },
  serviceSubtitle: {
    color: MUTED,
    fontSize: 11,
    marginTop: 2,
  },
  serviceArrow: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F5F8",
  },
  rowPressed: {
    borderColor: "rgba(197,155,72,0.75)",
    transform: [{ scale: 0.985 }],
  },
  pressGlow: {
    position: "absolute",
    left: -70,
    top: -26,
    width: 78,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(197,155,72,0)",
    transform: [{ rotate: "-18deg" }],
  },
  pressGlowActive: {
    left: 12,
    backgroundColor: "rgba(197,155,72,0.18)",
  },
  disclaimer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingHorizontal: 2,
    marginTop: 2,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    color: MUTED,
  },
});
