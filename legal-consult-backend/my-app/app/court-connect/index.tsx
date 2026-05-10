import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { COURT_CATALOG } from "../../constants/courtLinks";

const BG = "#F5F6F8";
const INK = "#0B1220";
const MUTED = "#6B7280";
const CARD = "#FFFFFF";
const BORDER = "#E5E7EB";
const GOLD = "#C59B48";

const SERVICE_META: Record<
  string,
  {
    icon: keyof typeof Feather.glyphMap;
    subtitle: string;
  }
> = {
  "CNR Number": {
    icon: "hash",
    subtitle: "Trace matters by 16-digit case identity",
  },
  "Case Status": {
    icon: "activity",
    subtitle: "Stage, parties, listing, and next date",
  },
  "Court Orders": {
    icon: "file-text",
    subtitle: "Orders and judgments from official records",
  },
  "Cause List": {
    icon: "calendar",
    subtitle: "Daily boards and court-wise listings",
  },
  "Caveat Search": {
    icon: "shield",
    subtitle: "Search caveats before the matter moves",
  },
};

export default function CourtConnectHome() {
  const router = useRouter();
  const { highCourt, lowerCourt } = COURT_CATALOG;

  const openPortal = (title: string, url: string) => {
    router.push({
      pathname: "/court-connect/view",
      params: { title, url },
    });
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scroller}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.accessHeader}>
          <View style={styles.accessSeal}>
            <Feather name="shield" size={16} color={GOLD} />
          </View>
          <View style={styles.accessCopy}>
            <Text style={styles.accessTitle}>Official Portal Access</Text>
            <Text style={styles.accessSubtitle}>Verified court links inside CaseFit</Text>
          </View>
          <View style={styles.livePill}>
            <Text style={styles.liveText}>Live</Text>
          </View>
        </View>

        <SectionCard title={highCourt.title} icon="award" caption="Allahabad High Court">
          {highCourt.courts.map((court) => (
            <View key={court.name}>
              {(court.benches ?? []).map((bench) => (
                <PortalRow
                  key={bench.name}
                  icon="briefcase"
                  title={bench.name.trim()}
                  subtitle={bench.url ? "Open status portal" : "Coming soon"}
                  disabled={!bench.url}
                  onPress={() => bench.url && openPortal(bench.name.trim(), bench.url)}
                />
              ))}
            </View>
          ))}
        </SectionCard>

        <SectionCard title={lowerCourt.title} icon="layers" caption="District court gateway">
          {lowerCourt.courts.map((service) => {
            const meta = SERVICE_META[service.name] ?? {
              icon: "external-link" as keyof typeof Feather.glyphMap,
              subtitle: "Open official court portal",
            };

            return (
              <PortalRow
                key={service.name}
                icon={meta.icon}
                title={service.name}
                subtitle={meta.subtitle}
                disabled={!service.url}
                onPress={() => service.url && openPortal(service.name, service.url)}
              />
            );
          })}
        </SectionCard>

        <View style={styles.disclaimer}>
          <Feather name="info" size={14} color={MUTED} />
          <Text style={styles.disclaimerText}>
            Links open official eCourts portals. CaseFit only provides quick access and does not
            control court data.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function SectionCard({
  title,
  icon,
  caption,
  children,
}: {
  title: string;
  icon: keyof typeof Feather.glyphMap;
  caption: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIcon}>
          <Feather name={icon} size={17} color={INK} />
        </View>
        <View style={styles.sectionCopy}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <Text style={styles.sectionCaption}>{caption}</Text>
        </View>
      </View>
      {children}
    </View>
  );
}

function PortalRow({
  icon,
  title,
  subtitle,
  disabled,
  onPress,
}: {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle: string;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      disabled={disabled}
      onPress={onPress}
      style={[styles.row, disabled && styles.disabledRow]}
    >
      <View style={styles.rowIcon}>
        <Feather name={icon} size={17} color={INK} />
      </View>
      <View style={styles.rowCopy}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowSubtitle}>{subtitle}</Text>
      </View>
      <View style={styles.rowArrow}>
        <Feather name="chevron-right" size={20} color={INK} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BG,
  },
  scroller: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 34,
  },
  accessHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: CARD,
  },
  accessSeal: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: INK,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },
  accessCopy: {
    flex: 1,
  },
  accessTitle: {
    color: INK,
    fontSize: 14,
    fontWeight: "900",
  },
  accessSubtitle: {
    color: MUTED,
    fontSize: 11,
    marginTop: 2,
  },
  livePill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  liveText: {
    color: "#166534",
    fontSize: 10,
    fontWeight: "900",
  },
  section: {
    backgroundColor: CARD,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    marginBottom: 14,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF0F4",
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 16,
    backgroundColor: "#FAF1D9",
    borderWidth: 1,
    borderColor: "#E6CF91",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  sectionCopy: {
    flex: 1,
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 11,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 10,
    backgroundColor: "#FCFCFD",
  },
  disabledRow: {
    opacity: 0.55,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "#EEF1F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },
  rowCopy: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: INK,
  },
  rowSubtitle: {
    fontSize: 11,
    color: MUTED,
    marginTop: 2,
  },
  rowArrow: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F5F8",
  },
  disclaimer: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 2,
    marginTop: 2,
  },
  disclaimerText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 11,
    lineHeight: 16,
    color: MUTED,
  },
});
