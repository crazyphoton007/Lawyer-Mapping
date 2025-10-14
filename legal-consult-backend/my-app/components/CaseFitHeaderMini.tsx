import React from "react";
import { View } from "react-native";
import Logo from "../assets/images/casefit-wordmark.svg";

const WHITE = "#FFFFFF";
// your wordmark is ~805×227 (≈3.55:1)
const ASPECT = 805 / 227;

export default function CaseFitHeaderMini() {
  const width = 156;               // << tweak this to make the logo bigger/smaller
  const height = width / ASPECT;

  return (
    <View style={{ height: 56, justifyContent: "center", alignItems: "center" }}>
      <Logo width={width} height={height} fill={WHITE} />
    </View>
  );
}
