import React from "react";
import { View, Image, StyleSheet, type ViewStyle } from "react-native";

type Props = {
  // If true => show a circular chip behind the logo (PhonePe-style)
  useCircle?: boolean;
  // Size (diameter) of the circle chip (only used when useCircle=true)
  circleSize?: number;
  // Pixel size of the LOGO itself (always used)
  logoSize?: number;
  // "left" to align with the title, "center" to center on the screen
  align?: "left" | "center";
  // Background color for the circle chip (ignored when useCircle=false)
  circleBg?: string;
  // Image source (so you can swap between png/svg-as-png easily)
  src?: any;
};

export default function BrandHeader({
  useCircle = false,
  circleSize = 112,
  logoSize = 80,         // <-- controls the actual logo size
  align = "left",        // <-- default place it on the left
  circleBg = "#000",
  src = require("@/assets/images/fit.png"), // put your file here
}: Props) {
  const containerStyle: ViewStyle[] = [
    styles.container,
    { alignItems: align === "center" ? "center" : "flex-start" },
  ];

  if (useCircle) {
    const S = circleSize;
    return (
      <View style={containerStyle}>
        <View
          style={[
            styles.circle,
            { width: S, height: S, borderRadius: S / 2, backgroundColor: circleBg },
          ]}
        >
          <Image source={src} style={{ width: logoSize, height: logoSize }} resizeMode="contain" />
        </View>
      </View>
    );
  }

  // Image-only (no chip behind) — good when your PNG has transparent bg
  return (
    <View style={containerStyle}>
      <Image source={src} style={{ width: logoSize, height: logoSize }} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8, // keeps it close to the title
  },
  circle: {
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
});
