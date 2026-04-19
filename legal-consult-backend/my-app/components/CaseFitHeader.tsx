// my-app/components/CaseFitHeader.tsx
import React from "react";
import { View, Text, TouchableOpacity, Linking, Alert, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Logo from "../assets/images/casefit-wordmark.svg"; // your SVG

const INK = "#000000";
const WHITE = "#FFFFFF";

/** Tweak these to taste */
const HEADER_HEIGHT = 60;            // header bar height (excluding safe area)
const LOGO_SCREEN_FRACTION = 0.45;   // desired width fraction of screen
const LOGO_MAX_W = 520;              // absolute cap for very wide phones

/** Your SVG aspect (width / height): 805 × 227 → ~3.547 */
const LOGO_ASPECT = 805 / 227;

type Props = { showBack?: boolean; showHelp?: boolean };

export default function CaseFitHeader({ showBack, showHelp }: Props) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const screenW = Dimensions.get("window").width;

  // Size logo based on screen width, clamped by header height
  const desiredW = Math.min(screenW * LOGO_SCREEN_FRACTION, LOGO_MAX_W);
  const desiredH = desiredW / LOGO_ASPECT;

  const verticalPadding = 12; // breathing room inside the bar
  const maxLogoH = Math.max(HEADER_HEIGHT - verticalPadding, 24);
  const logoH = Math.min(desiredH, maxLogoH);
  const logoW = logoH * LOGO_ASPECT;

  const onHelp = () => {
    const url = "mailto:support@thecasefit.com?subject=" + encodeURIComponent("Help with caseFit");
    Linking.openURL(url).catch(() => Alert.alert("Error", "Could not open email app."));
  };

  return (
    <View style={{ backgroundColor: INK, paddingTop: insets.top }}>
      <View
        style={{
          height: HEADER_HEIGHT,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 8,
        }}
      >
        {/* Left gutter (optional back) */}
        <View style={{ width: 56, alignItems: "flex-start" }}>
          {showBack ? (
            <TouchableOpacity
              onPress={() => router.back()}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={{ width: 56, height: 56, alignItems: "flex-start", justifyContent: "center", paddingLeft: 6 }}
            >
              <Text style={{ color: WHITE, fontSize: 42, lineHeight: 40, fontWeight: "600" }}>‹</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Center: brand/logo (non-pressable) */}
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Logo width={logoW} height={logoH} color={WHITE} />
        </View>

        {/* Right gutter: (no language toggle in header) optional help only */}
        <View style={{ width: 56, alignItems: "flex-end" }}>
          {showHelp ? (
            <TouchableOpacity
              onPress={onHelp}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={{ width: 56, height: 56, alignItems: "center", justifyContent: "center" }}
            >
              <Text style={{ color: WHITE, fontSize: 20 }}>?</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </View>
  );
}
