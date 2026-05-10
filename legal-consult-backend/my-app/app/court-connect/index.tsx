import { useEffect, useRef } from "react";
import { Animated, Easing, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { COURT_CATALOG } from "../../constants/courtLinks";

const BG = "#06111F";
const INK = "#F8FAFC";
const MUTED = "#AEB7C5";
const GOLD = "#D7AE61";
const LINE = "rgba(215,174,97,0.34)";

const SERVICE_META: Record<
  string,
  {
    icon: keyof typeof Feather.glyphMap;
    subtitle: string;
    color: string;
  }
> = {
  "CNR Number": {
    icon: "hash",
    subtitle: "Trace matters by 16-digit case identity",
    color: "#B794FF",
  },
  "Case Status": {
    icon: "activity",
    subtitle: "Stage, parties, listing, and next date",
    color: "#6BB7FF",
  },
  "Court Orders": {
    icon: "file-text",
    subtitle: "Orders and judgments from official records",
    color: "#8FE7CA",
  },
  "Cause List": {
    icon: "calendar",
    subtitle: "Daily boards and court-wise listings",
    color: "#F4C76D",
  },
  "Caveat Search": {
    icon: "shield",
    subtitle: "Search caveats before the matter moves",
    color: "#82E7A5",
  },
};

export default function CourtConnectHome() {
  const router = useRouter();
  const livePulse = useRef(new Animated.Value(0)).current;
  const { highCourt, lowerCourt } = COURT_CATALOG;
  const primaryHighCourt = highCourt.courts[0];

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(livePulse, {
          toValue: 1,
          duration: 820,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(livePulse, {
          toValue: 0,
          duration: 820,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();
    return () => loop.stop();
  }, [livePulse]);

  const liveDotScale = livePulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.7],
  });
  const liveDotOpacity = livePulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.62, 1],
  });

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
        <LinearGradient colors={["#10213A", "#071322"]} style={styles.heroCard}>
          <View style={styles.heroBadge}>
            <View style={styles.heroBadgeMiddle}>
              <View style={styles.heroBadgeCore}>
                <Feather name="shield" size={34} color={GOLD} />
              </View>
            </View>
          </View>
          <View style={styles.heroCopy}>
            <Text style={styles.eyebrow}>OFFICIAL PORTAL ACCESS</Text>
            {/* <Text style={styles.heroTitle}>Verified court links inside CaseFit</Text> */}
          </View>
          <View style={styles.livePill}>
            <Text style={styles.liveText}>LIVE</Text>
            <View style={styles.liveDotWrap}>
              <Animated.View
                style={[
                  styles.liveDotAura,
                  {
                    opacity: liveDotOpacity,
                    transform: [{ scale: liveDotScale }],
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.liveDot,
                  {
                    opacity: liveDotOpacity,
                    transform: [{ scale: liveDotScale }],
                  },
                ]}
              />
            </View>
          </View>
        </LinearGradient>

        <View style={styles.highCourtHeader}>
          <Text style={styles.eyebrow}>HIGH COURT</Text>
          <Text style={styles.highCourtTitle}>{primaryHighCourt?.name ?? "Allahabad High Court"}</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.highCourtRail}
        >
          {(primaryHighCourt?.benches ?? []).map((bench) => {
            const label = bench.name.trim();
            return (
              <HighCourtTile
                key={label}
                icon={label === "Judgment & Orders" ? "file-text" : label === "Lucknow Bench" ? "briefcase" : "columns"}
                title={label}
                subtitle={label === "Judgment & Orders" ? "Search judgments and court orders" : "Open status portal"}
                onPress={() => bench.url && openPortal(label, bench.url)}
                disabled={!bench.url}
              />
            );
          })}
        </ScrollView>

        <View style={styles.sectionDivider} />

        <View style={styles.serviceHeader}>
          <View style={styles.serviceHeaderIcon}>
            <Feather name="layers" size={22} color={GOLD} />
          </View>
          <View>
            <Text style={styles.eyebrow}>ECOURTS SERVICES</Text>
            <Text style={styles.serviceHeaderSubtitle}>District court gateway</Text>
          </View>
        </View>

        {lowerCourt.courts.map((service) => {
          const meta = SERVICE_META[service.name] ?? {
            icon: "external-link" as keyof typeof Feather.glyphMap,
            subtitle: "Open official court portal",
            color: GOLD,
          };

          return (
            <ServiceRow
              key={service.name}
              icon={meta.icon}
              title={service.name}
              subtitle={meta.subtitle}
              color={meta.color}
              disabled={!service.url}
              onPress={() => service.url && openPortal(service.name, service.url)}
            />
          );
        })}

        <LinearGradient colors={["#0D1C30", "#0A1626"]} style={styles.trustCard}>
          <View style={styles.trustIcon}>
            <Feather name="lock" size={18} color="#8FE7CA" />
          </View>
          <View style={styles.trustCopy}>
            <Text style={styles.trustTitle}>Secure. Verified. Trusted.</Text>
            <Text style={styles.trustText}>Always connect through official sources</Text>
          </View>
          <Feather name="shield" size={46} color="rgba(215,174,97,0.2)" />
        </LinearGradient>

        <View style={styles.disclaimer}>
          <Feather name="info" size={14} color={MUTED} />
          <Text style={styles.disclaimerText}>
            Links open official eCourts portals. caseFit only provides quick access and does not
            control court data.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function HighCourtTile({
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
      activeOpacity={0.76}
      disabled={disabled}
      onPress={onPress}
      style={[styles.highCourtTile, disabled && styles.disabled]}
    >
      <LinearGradient colors={["#13223B", "#071424"]} style={styles.highCourtTileFill}>
        <View style={styles.tileIcon}>
          <Feather name={icon} size={27} color={GOLD} />
        </View>
        <Text style={styles.tileTitle}>{title}</Text>
        <Text style={styles.tileSubtitle}>{subtitle}</Text>
        <View style={styles.tileArrow}>
          <Feather name="chevron-right" size={18} color={GOLD} />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

function ServiceRow({
  icon,
  title,
  subtitle,
  color,
  disabled,
  onPress,
}: {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle: string;
  color: string;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.76}
      disabled={disabled}
      onPress={onPress}
      style={[styles.serviceRow, disabled && styles.disabled]}
    >
      <LinearGradient colors={["#0E1C30", "#091524"]} style={styles.serviceRowFill}>
        <View style={[styles.serviceIcon, { borderColor: color, backgroundColor: `${color}1A` }]}>
          <Feather name={icon} size={25} color={color} />
        </View>
        <View style={styles.serviceCopy}>
          <Text style={styles.serviceTitle}>{title}</Text>
          <Text style={styles.serviceSubtitle}>{subtitle}</Text>
        </View>
        <View style={styles.serviceArrow}>
          <Feather name="chevron-right" size={22} color={GOLD} />
        </View>
      </LinearGradient>
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
  heroCard: {
    minHeight: 138,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: LINE,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
  },
  heroBadge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1,
    borderColor: "rgba(215,174,97,0.28)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  heroBadgeMiddle: {
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 1,
    borderColor: "rgba(215,174,97,0.48)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroBadgeCore: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "rgba(215,174,97,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroCopy: {
    flex: 1,
  },
  eyebrow: {
    color: GOLD,
    fontSize: 12,
    letterSpacing: 3,
    fontWeight: "800",
  },
  heroTitle: {
    color: INK,
    fontSize: 25,
    lineHeight: 31,
    fontWeight: "800",
    marginTop: 10,
  },
  livePill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(132,204,22,0.35)",
    backgroundColor: "rgba(74,111,39,0.28)",
  },
  liveText: {
    color: "#A7F074",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
  },
  liveDot: {
    position: "absolute",
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#A7F074",
    shadowColor: "#A7F074",
    shadowOpacity: 0.9,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 0 },
  },
  liveDotAura: {
    position: "absolute",
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "rgba(167,240,116,0.25)",
  },
  liveDotWrap: {
    width: 14,
    height: 14,
    marginLeft: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  highCourtHeader: {
    marginBottom: 14,
  },
  highCourtTitle: {
    color: INK,
    fontSize: 28,
    fontWeight: "800",
    marginTop: 12,
  },
  highCourtRail: {
    paddingRight: 16,
    paddingBottom: 8,
  },
  highCourtTile: {
    width: 156,
    marginRight: 12,
  },
  highCourtTileFill: {
    minHeight: 190,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: LINE,
    padding: 16,
  },
  tileIcon: {
    width: 66,
    height: 66,
    borderRadius: 33,
    borderWidth: 1,
    borderColor: "rgba(215,174,97,0.4)",
    backgroundColor: "rgba(123,92,255,0.13)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
  },
  tileTitle: {
    color: INK,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "800",
  },
  tileSubtitle: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 8,
  },
  tileArrow: {
    alignSelf: "flex-end",
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: "rgba(215,174,97,0.22)",
    marginVertical: 22,
  },
  serviceHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  serviceHeaderIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  serviceHeaderSubtitle: {
    color: MUTED,
    fontSize: 16,
    marginTop: 4,
  },
  serviceRow: {
    marginBottom: 12,
  },
  serviceRowFill: {
    minHeight: 86,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(215,174,97,0.24)",
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  serviceIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  serviceCopy: {
    flex: 1,
  },
  serviceTitle: {
    color: INK,
    fontSize: 18,
    fontWeight: "800",
  },
  serviceSubtitle: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 5,
  },
  serviceArrow: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(215,174,97,0.12)",
  },
  trustCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(215,174,97,0.25)",
    padding: 16,
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  trustIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "rgba(143,231,202,0.4)",
    backgroundColor: "rgba(143,231,202,0.09)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },
  trustCopy: {
    flex: 1,
  },
  trustTitle: {
    color: INK,
    fontSize: 17,
    fontWeight: "800",
  },
  trustText: {
    color: MUTED,
    fontSize: 12,
    marginTop: 5,
  },
  disabled: {
    opacity: 0.55,
  },
  disclaimer: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 2,
    marginTop: 16,
  },
  disclaimerText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 11,
    lineHeight: 16,
    color: MUTED,
  },
});
