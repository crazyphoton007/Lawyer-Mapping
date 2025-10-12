// my-app/components/CaseFitHeader.tsx
import React from "react";
import { View, Text, TouchableOpacity, Linking, Alert, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Logo from "../assets/images/casefit-wordmark.svg"; // your SVG

const INK = "#000000";
const WHITE = "#FFFFFF";

/** Tweak these three to taste */
const HEADER_HEIGHT = 72;            // was 64 → taller header
const LOGO_SCREEN_FRACTION = 0.78;   // was 0.42/0.45 → use 60% of screen width
const LOGO_MAX_W = 380;              // was ~200–220 → allow bigger logo

/** Your Figma frame was 805 × 227 → aspect ~3.547 */
const LOGO_ASPECT = 805 / 227;

type Props = { showBack?: boolean; showHelp?: boolean };

export default function CaseFitHeader({ showBack, showHelp }: Props) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const screenW = Dimensions.get("window").width;
  const logoW = Math.min(screenW * LOGO_SCREEN_FRACTION, LOGO_MAX_W);

//   const logoW = 400;
  const logoH = logoW / LOGO_ASPECT;

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
        {/* Left gutter (bigger so the center truly centers) */}
        <View style={{ width: 56, alignItems: "flex-start" }}>
          {showBack ? (
            <TouchableOpacity
              onPress={() => router.back()}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={{ width: 56, height: 56, alignItems: "center", justifyContent: "center" }}
            >
              <Text style={{ color: WHITE, fontSize: 24, lineHeight: 24 }}>‹</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Center: logo */}
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Logo width={logoW} height={logoH} fill={WHITE} />
        </View>

        {/* Right gutter */}
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
